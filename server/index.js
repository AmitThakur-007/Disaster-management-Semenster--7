import './env.js';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { createApp } from './app.js';
import { prisma } from './db.js';
import { processNextJob } from './jobs.js';

await prisma.$connect();
const app = createApp(prisma);

const port = Number(process.env.PORT) || Number(process.env.DEFAULT_APP_PORT) || 3000;
const host = process.env.HOST || '0.0.0.0';

const isProduction = process.env.NODE_ENV === 'production';
const distPath = path.resolve('dist');

if (!isProduction && !fs.existsSync(path.join(distPath, 'index.html'))) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(distPath));
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = app.listen(port, host, () => {
  console.log(`Community Disaster Watch running at http://${host}:${port}`);
});

// Periodic background analysis worker
const jobInterval = setInterval(async () => {
  try {
    await processNextJob(prisma);
  } catch {
    // Suppress polling errors
  }
}, 3000);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    clearInterval(jobInterval);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  });
}
