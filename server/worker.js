import './env.js';
import { prisma } from './db.js';
import { processNextJob } from './jobs.js';

let stopping = false;
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { stopping = true; });
await prisma.$connect();
console.log('Analysis worker started.');
while (!stopping) {
  try { await processNextJob(); }
  catch (error) { console.error('Worker:', error.message); }
  if (!stopping) await new Promise(resolve => setTimeout(resolve, 3000));
}
await prisma.$disconnect();
