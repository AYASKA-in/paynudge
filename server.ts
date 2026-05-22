import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

// Global resilience handlers for sandboxed proxy container runtimes
process.on('uncaughtException', (err: any) => {
  if (err?.code === 'ECONNRESET' || err?.code === 'EPIPE' || err?.message?.includes('ECONNRESET')) {
    console.warn('⚠️ [Safe-Recover] Swallowed network socket reset (ECONNRESET/EPIPE) gracefully.');
    return;
  }
  console.error('❌ Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason: any) => {
  if (reason?.code === 'ECONNRESET' || reason?.code === 'EPIPE' || reason?.message?.includes('ECONNRESET')) {
    console.warn('⚠️ [Safe-Recover] Swallowed asynchronous rejection network socket reset (ECONNRESET/EPIPE).');
    return;
  }
  console.error('❌ Unhandled Promise Rejection:', reason);
});

import { createServer as createViteServer } from 'vite';
import { createApp } from './server/app';
import { getPrismaClient } from './server/db/client';
import { 
  startQueueWorkers, 
  closeRedisConnections, 
  getQueueRedisConnection 
} from './server/queues/bullmq';

async function bootstrapFullStackApp() {
  const PORT = 3000;
  const prisma = getPrismaClient();

  // 0. Pre-flight connection verification checks
  console.log("🔍 Running system pre-flight checks...");
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
      console.log("ℹ️ Pre-flight: Running background queues in local simulation mode.");
    }
  } catch (err: any) {
    console.error("❌ Pre-flight: Redis connection check failed:", err.message);
  }

  // 1. Initialize modular Express routes and middlewares
  const app = createApp();

  // 1.5 Boot background BullMQ/Redis worker threads if connected
  startQueueWorkers();

  // 4. Vite Frontend Build Server & SPA Asset Router Configuration
  if (process.env.NODE_ENV !== 'production') {
    console.log("⚡ Bootstrapping local dev pipeline with active Vite Asset Middleware...");
    const viteInstance = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(viteInstance.middlewares);
  } else {
    console.log("🚀 Production Node distribution: Serving bundled static assets from /dist...");
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Fallback everything else to SPA HTML bundle
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // 5. Ingress binding on Port 3000 and Host 0.0.0.0
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` 💎 PayNudge Full-Stack Collections SaaS Engine Running`);
    console.log(` ➡️ Address URL: http://0.0.0.0:${PORT}`);
    console.log(` ➡️ Environment Target: ${process.env.NODE_ENV || 'development'}`);
    console.log(`=======================================================`);
  });

  // Handle client-aborted connection socket errors to avoid uncaught ECONNRESET leakage
  server.on('connection', (socket) => {
    socket.on('error', (err: any) => {
      if (err?.code === 'ECONNRESET' || err?.code === 'EPIPE' || err?.message?.includes('ECONNRESET')) {
        // Quietly absorb client disconnect socket events
        return;
      }
      console.warn('⚠️ [Safe-Recover] Swallowed unexpected socket error:', err.message || err);
    });
  });

  // Graceful Shutdown Logic
  const shutdown = async (signal: string) => {
    console.log(`\n🛑 [${signal}] Initiating graceful shutdown sequence...`);

    // 1. Close Express Ingress Server
    server.close(() => {
      console.log("🚪 Ingress server closed. Blocked new HTTP incoming traffic.");
    });

    // 2. Shut down BullMQ and Redis connection pools cleanly
    console.log("⏳ Closing active Redis and BullMQ connection pools...");
    try {
      await closeRedisConnections();
      console.log("✅ Redis and BullMQ resources disconnected cleanly.");
    } catch (err: any) {
      console.error("❌ Error disconnecting Redis and BullMQ pools:", err.message);
    }

    // 4. Close database socket handles
    console.log("⏳ Disconnecting Database Client...");
    try {
      await prisma.$disconnect();
      console.log("✅ Database client disconnected.");
    } catch (err: any) {
      console.error("❌ Error disconnecting database client:", err.message);
    }

    console.log("👋 Graceful shutdown finalized. Exiting Node process.");
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrapFullStackApp().catch((err) => {
  console.error("❌ Fatal application bootstrap critical limit exceeded error:", err);
  process.exit(1);
});
