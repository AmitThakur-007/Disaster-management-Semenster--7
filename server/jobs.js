import { prisma } from './db.js';
import { getWeather, assessReport } from './analysis.js';

// PostgreSQL owns the queue; each claim is atomic, even with more than one worker.
export async function processNextJob(db = prisma, services = { getWeather, assessReport }) {
  const stale = new Date(Date.now() - 5 * 60000);
  await db.analysisJob.updateMany({ where: { status: 'Processing', lockedAt: { lt: stale } },
    data: { status: 'Pending', lockedAt: null, availableAt: new Date() } });
  const claimed = await db.$queryRaw`
    UPDATE "AnalysisJob" SET status = 'Processing', "lockedAt" = NOW(), attempts = attempts + 1
    WHERE id = (SELECT id FROM "AnalysisJob"
      WHERE status = 'Pending' AND "availableAt" <= NOW()
      ORDER BY "availableAt" FOR UPDATE SKIP LOCKED LIMIT 1)
    RETURNING id`;
  if (!claimed.length) return false;
  const job = await db.analysisJob.findUnique({ where: { id: claimed[0].id }, include: { report: { include: { area: true } } } });
  if (!job || !job.report) return false;
  try {
    const weather = await services.getWeather(job.report.area);
    await db.analysisJob.update({ where: { id: job.id }, data: { weather } });
    const result = await services.assessReport(job.report, weather);
    await db.analysisJob.update({ where: { id: job.id }, data: { status: 'Completed', result, model: result.model,
      completedAt: new Date(), lockedAt: null, error: null } });
  } catch (error) {
    const failed = job.attempts >= 3;
    await db.analysisJob.update({ where: { id: job.id }, data: { status: failed ? 'Failed' : 'Pending',
      error: error.message.slice(0, 500), lockedAt: null, availableAt: new Date(Date.now() + job.attempts * 30000) } });
    console.error(`Analysis attempt ${job.attempts}: ${error.message}`);
  }
  return true;
}
