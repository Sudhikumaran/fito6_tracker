import app from './app';
import { config } from './config';
import prisma from './lib/prisma';

async function start() {
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (err) {
    console.error('Database warmup failed:', (err as Error).message);
  }

  app.listen(config.port, () => {
    console.log(`Fito6 API running on port ${config.port} [${config.nodeEnv}]`);
  });
}

start();

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down...`);
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
