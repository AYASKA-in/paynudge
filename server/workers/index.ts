import dotenv from 'dotenv';
dotenv.config();

import { getPrismaClient } from '../db/client';
import { 
  startQueueWorkers, 
  closeRedisConnections, 
  getQueueRedisConnection 
} from '../queues/bullmq';

// Global resilience handlers for sandboxed proxy container runtimes
process.on('uncaughtException', (err: any) => {
  if (err?.code === 'ECONNRESET' || err?.code === 'EPIPE' || err?.message?.includes('ECONNRESET')) {
    console.warn('⚠️ [Worker-Safe-Recover] Swallowed network socket reset (ECONNRESET/EPIPE) gracefully.');
    return;
  }
  console.error('❌ Worker Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason: any) => {
  if (reason?.code === 'ECONNRESET' || reason?.code === 'EPIPE' || reason?.message?.includes('ECONNRESET')) {
    console.warn('⚠️ [Worker-Safe-Recover] Swallowed asynchronous rejection network socket reset (ECONNRESET/EPIPE).');
    return;
  }
  console.error('❌ Worker Unhandled Promise Rejection:', reason);
});

async function bootstrapWorker() {
  console.log("🚀 Bootstrapping PayNudge Standalone BullMQ Worker...");
  const prisma = getPrismaClient();

  // 1. Run Pre-flight Connectivity Verification Checks
  console.log("🔍 Running background worker pre-flight checks...");
  try {
    if (process.env.DATABASE_URL) {
      await prisma.$connect();
      console.log("✅ Pre-flight: Database connectivity verified.");
    } else {
      console.log("ℹ️ Pre-flight: Running database in sandbox/simulation mode.");
    }
  } catch (err: any) {
    console.error("❌ Pre-flight: Database connection check failed:", err.message);
  }

  try {
    const queueConnection = getQueueRedisConnection();
    if (queueConnection) {
      await queueConnection.ping();
      console.log("✅ Pre-flight: Redis connectivity verified.");
    } else {
      console.warn("⚠️ Pre-flight: Redis connection not available. Background worker cannot run in production mode.");
    }
  } catch (err: any) {
    console.error("❌ Pre-flight: Redis connection check failed:", err.message);
  }

  // 2. Boot background BullMQ/Redis worker threads
  console.log("⚡ Starting queue workers...");
  startQueueWorkers();

  console.log(`=======================================================`);
  console.log(` 💎 PayNudge Background Queue Worker Engine Active`);
  console.log(` ➡️ Environment Target: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);

  // Graceful Shutdown Logic
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 [${signal}] Initiating graceful worker shutdown sequence...`);

    // Shut down BullMQ and Redis connection pools cleanly
    console.log("⏳ Closing active Redis and BullMQ connection pools...");
    try {
      await closeRedisConnections();
      console.log("✅ Redis and BullMQ resources disconnected cleanly.");
    } catch (err: any) {
      console.error("❌ Error disconnecting Redis and BullMQ pools:", err.message);
    }

    // Close database socket handles
    console.log("⏳ Disconnecting Database Client...");
    try {
      await prisma.$disconnect();
      console.log("✅ Database client disconnected.");
    } catch (err: any) {
      console.error("❌ Error disconnecting database client:", err.message);
    }

    console.log("👋 Graceful shutdown finalized. Exiting worker process.");
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrapWorker().catch((err) => {
  console.error("❌ Fatal worker bootstrap critical error:", err);
  process.exit(1);
});
