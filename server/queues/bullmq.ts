import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { getPrismaClient } from '../db/client';
import { WhatsAppCarrier, EmailCarrier } from '../services/messageCarriers';

// Global symbol mapping to persist connections across hot reloads in development
const globalSymbols = globalThis as any;

export interface ReminderJobPayload {
  invoiceId: string;
  channel: 'WhatsApp' | 'Email';
  topic: 'polite' | 'first' | 'overdue' | 'final';
  attempt: number;
}

export interface RedisTelemetry {
  queueRedisConnected: boolean;
  workerRedisConnected: boolean;
  eventsRedisConnected: boolean;
  reconnectAttempts: number;
  lastError: string | null;
  lastHeartbeat: string | null;
  processedCount: number;
  failedCount: number;
  workerActive: boolean;
  queueStatus: 'operational' | 'offline' | 'degraded';
}

export const redisTelemetry: RedisTelemetry = {
  queueRedisConnected: false,
  workerRedisConnected: false,
  eventsRedisConnected: false,
  reconnectAttempts: 0,
  lastError: null,
  lastHeartbeat: null,
  processedCount: 0,
  failedCount: 0,
  workerActive: false,
  queueStatus: 'offline',
};

let heartbeatInterval: NodeJS.Timeout | null = null;

/**
 * Updates dynamic telemetry fields based on connection state
 */
function updateTelemetryState() {
  redisTelemetry.queueRedisConnected = !!(globalSymbols.__redisProducer && globalSymbols.__redisProducer.status === 'ready');
  redisTelemetry.workerRedisConnected = !!(globalSymbols.__redisWorker && globalSymbols.__redisWorker.status === 'ready');
  redisTelemetry.eventsRedisConnected = !!(globalSymbols.__redisEvents && globalSymbols.__redisEvents.status === 'ready');
  
  redisTelemetry.workerActive = !!(globalSymbols.__bullWorker && globalSymbols.__bullWorker.isRunning());
  
  if (redisTelemetry.queueRedisConnected && redisTelemetry.workerRedisConnected) {
    redisTelemetry.queueStatus = 'operational';
  } else if (redisTelemetry.queueRedisConnected || redisTelemetry.workerRedisConnected) {
    redisTelemetry.queueStatus = 'degraded';
  } else {
    redisTelemetry.queueStatus = 'offline';
  }
}

/**
 * Creates an ioredis client with production reliability settings tuned for Upstash
 */
function createRedisClient(role: 'Producer' | 'Worker' | 'Events'): IORedis {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    throw new Error('REDIS_URL environment variable is missing');
  }

  const client = new IORedis(redisUrl, {
    maxRetriesPerRequest: null, // Required for BullMQ workers and queues
    lazyConnect: true, // Lazy connect to prevent eager failures and reconnect loops
    enableReadyCheck: false,
    keepAlive: 30000, // 30s TCP keep-alive to survive Upstash idle resets
    retryStrategy(times: number) {
      redisTelemetry.reconnectAttempts++;
      // Exponential backoff with jitter: minimum 1s, maximum 10s
      const delay = Math.min(times * 500 + 1000 + Math.random() * 200, 10000);
      console.warn(`⚠️ [Redis-${role}] Connection lost. Reconnect attempt #${times} in ${Math.round(delay)}ms...`);
      return delay;
    },
    reconnectOnError(err: any) {
      const msg = err.message || '';
      if (msg.includes('ECONNRESET') || msg.includes('EPIPE') || msg.includes('ETIMEDOUT') || msg.includes('READONLY')) {
        console.warn(`⚠️ [Redis-${role}] Forcing reconnection due to socket reset: ${msg}`);
        return true;
      }
      return false;
    }
  });

  client.on('connect', () => {
    console.log(`🔌 [Redis-${role}] Socket connection initiated.`);
  });

  client.on('ready', () => {
    console.log(`✅ [Redis-${role}] Connection established and ready.`);
    updateTelemetryState();
  });

  client.on('error', (err: any) => {
    redisTelemetry.lastError = err.message || String(err);
    const msg = err.message || '';
    
    // Suppress noisy stack spam for transient ECONNRESET/EPIPE/ETIMEDOUT
    if (msg.includes('ECONNRESET') || msg.includes('EPIPE') || msg.includes('ETIMEDOUT')) {
      console.warn(`⚠️ [Redis-${role}] Swallowed transient network reset error: ${msg}`);
    } else {
      console.error(`❌ [Redis-${role}] Connection error:`, err);
    }
    updateTelemetryState();
  });

  client.on('close', () => {
    console.warn(`💤 [Redis-${role}] Connection closed.`);
    updateTelemetryState();
  });

  return client;
}

/**
 * Singleton getter for Queue Producer Redis client connection
 */
export function getProducerRedis(): IORedis | null {
  if (!process.env.REDIS_URL) return null;
  if (!globalSymbols.__redisProducer) {
    try {
      globalSymbols.__redisProducer = createRedisClient('Producer');
      globalSymbols.__redisProducer.connect().catch(() => {});
    } catch (err) {
      console.error("❌ Failed to initialize Producer Redis client:", err);
      return null;
    }
  }
  return globalSymbols.__redisProducer;
}

/**
 * Singleton getter for Queue Worker Redis client connection
 */
export function getWorkerRedis(): IORedis | null {
  if (!process.env.REDIS_URL) return null;
  if (!globalSymbols.__redisWorker) {
    try {
      globalSymbols.__redisWorker = createRedisClient('Worker');
      globalSymbols.__redisWorker.connect().catch(() => {});
    } catch (err) {
      console.error("❌ Failed to initialize Worker Redis client:", err);
      return null;
    }
  }
  return globalSymbols.__redisWorker;
}

/**
 * Singleton getter for Queue Events Redis client connection
 */
export function getEventsRedis(): IORedis | null {
  if (!process.env.REDIS_URL) return null;
  if (!globalSymbols.__redisEvents) {
    try {
      globalSymbols.__redisEvents = createRedisClient('Events');
      globalSymbols.__redisEvents.connect().catch(() => {});
    } catch (err) {
      console.error("❌ Failed to initialize Events Redis client:", err);
      return null;
    }
  }
  return globalSymbols.__redisEvents;
}

/**
 * Compatibility wrapper to retrieve the Queue client
 */
export function getQueueRedisConnection(): IORedis | null {
  return getProducerRedis();
}

/**
 * Starts periodic heartbeat pings to keep Redis connections alive
 */
export function startHeartbeatPings(): void {
  if (heartbeatInterval) {
    return;
  }
  heartbeatInterval = setInterval(async () => {
    const nowStr = new Date().toISOString();
    let pingSuccess = true;

    const clients = [
      { name: 'Producer', client: globalSymbols.__redisProducer },
      { name: 'Worker', client: globalSymbols.__redisWorker },
      { name: 'Events', client: globalSymbols.__redisEvents }
    ];

    for (const { name, client } of clients) {
      if (client && client.status === 'ready') {
        try {
          await client.ping();
        } catch (err: any) {
          console.warn(`⚠️ [Heartbeat] Redis ${name} ping failed: ${err.message}`);
          pingSuccess = false;
        }
      }
    }

    if (pingSuccess && (globalSymbols.__redisProducer || globalSymbols.__redisWorker)) {
      redisTelemetry.lastHeartbeat = nowStr;
    }
    updateTelemetryState();
  }, 30000); // Every 30 seconds
}

/**
 * Closes all Redis connections and BullMQ resources cleanly
 */
export async function closeRedisConnections(): Promise<void> {
  console.log("⏳ [Shutdown] Closing Redis and BullMQ connection resources...");
  
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }

  // 1. Close Worker
  if (globalSymbols.__bullWorker) {
    try {
      await globalSymbols.__bullWorker.close();
      console.log("✅ [Shutdown] BullMQ Worker closed.");
    } catch (err: any) {
      console.error("❌ [Shutdown] Error closing BullMQ Worker:", err.message);
    }
    globalSymbols.__bullWorker = null;
  }

  // 2. Close Queue
  if (globalSymbols.__bullQueue) {
    try {
      await globalSymbols.__bullQueue.close();
      console.log("✅ [Shutdown] BullMQ Queue closed.");
    } catch (err: any) {
      console.error("❌ [Shutdown] Error closing BullMQ Queue:", err.message);
    }
    globalSymbols.__bullQueue = null;
  }

  // 3. Disconnect Redis Clients
  const clients = [
    { name: 'Producer', client: globalSymbols.__redisProducer },
    { name: 'Worker', client: globalSymbols.__redisWorker },
    { name: 'Events', client: globalSymbols.__redisEvents }
  ];

  for (const { name, client } of clients) {
    if (client) {
      try {
        await client.quit();
        console.log(`✅ [Shutdown] Redis ${name} client quit successfully.`);
      } catch {
        try {
          client.disconnect();
          console.log(`✅ [Shutdown] Redis ${name} client disconnected.`);
        } catch {}
      }
    }
  }

  globalSymbols.__redisProducer = null;
  globalSymbols.__redisWorker = null;
  globalSymbols.__redisEvents = null;

  updateTelemetryState();
}

/**
 * Registers the main reminder scheduler sequence queue
 */
export function getReminderQueue(): Queue | { add: (name: string, data: any, opts?: any) => Promise<any> } {
  const connection = getProducerRedis();

  if (!connection) {
    console.warn("⚠️ REDIS_URL not set. Routing collections background job queue to in-memory system event emitter.");
    return {
      add: async (name: string, data: any, opts?: any) => {
        console.log(`[Queue-Simulation] Job "${name}" registered in local thread.`, data);
        // Simulate immediate background worker thread execution in 500ms
        setTimeout(async () => {
          await handleReminderJobProcessing(data);
        }, 500);
        return { id: `sim_${Date.now()}` };
      }
    };
  }

  if (!globalSymbols.__bullQueue) {
    globalSymbols.__bullQueue = new Queue('NudgeReminderQueue', {
      connection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      }
    });
  }

  return globalSymbols.__bullQueue;
}

/**
 * Real job dispatch pipeline containing Meta WhatsApp Cloud API templates
 * and routing rules for Resend.
 */
export async function handleReminderJobProcessing(payload: ReminderJobPayload): Promise<{ success: boolean; logId: string; error?: string }> {
  console.log(`🚀 [Worker Dispatcher] Processing Job for invoice #${payload.invoiceId} on channel [${payload.channel}] (Attempt ${payload.attempt})`);
  
  const prisma = getPrismaClient();
  let invoice: any = null;
  let customer: any = null;
  let business: any = null;

  try {
    invoice = await prisma.invoiceDue.findUnique({
      where: { id: payload.invoiceId },
      include: {
        customer: true,
        business: true
      }
    });

    if (invoice) {
      customer = invoice.customer;
      business = invoice.business;
    }
  } catch (err: any) {
    console.warn("⚠️ [Worker DB Read] Failed joining related relational entities, proceeding with dynamic defaults:", err.message);
  }

  const resolvedPhone = customer?.phone || '9876543210';
  const resolvedEmail = customer?.email || 'client@paynudge.in';
  const recipient = payload.channel === 'WhatsApp' ? resolvedPhone : resolvedEmail;
  const payerName = customer?.name || 'Acme Client';
  const merchantName = business?.name || 'PayNudge Partner';
  const amount = invoice?.amount || 5000;
  const dueDate = invoice?.dueDate || new Date().toISOString().split('T')[0];

  const vpa = business?.vpa || 'paynudge@upi';
  const paymentLink = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(merchantName)}&tr=${payload.invoiceId}&am=${amount}&cu=INR&tn=PayNudge_Ledger_${payload.invoiceId}`;

  const messagePayload = {
    recipientPhoneOrEmail: recipient,
    clientName: payerName,
    invoiceId: payload.invoiceId,
    amountDue: amount,
    dueDate,
    paymentLink,
    topic: payload.topic
  };

  let dispatchResult;
  if (payload.channel === 'WhatsApp') {
    dispatchResult = await WhatsAppCarrier.sendReminder(messagePayload);
  } else {
    dispatchResult = await EmailCarrier.sendReminder(messagePayload, merchantName);
  }

  const generatedLogId = `log_prod_${Math.floor(Math.random() * 10000000)}`;

  if (invoice) {
    try {
      await prisma.$transaction(async (tx: any) => {
        // 1. Create notification log
        await tx.notificationLog.create({
          data: {
            id: generatedLogId,
            invoiceId: invoice.id,
            channel: payload.channel,
            status: dispatchResult.success ? 'Sent' : 'Failed',
            errorMessage: dispatchResult.error || null,
            attemptNum: payload.attempt || 1,
          }
        });

        // 2. Update invoice last contact information
        await tx.invoiceDue.update({
          where: { id: invoice.id },
          data: {
            lastContactDate: new Date().toISOString().split('T')[0],
            lastContactChannel: payload.channel,
          }
        });

        // 3. Create activity history entry
        await tx.activityHistory.create({
          data: {
            businessId: invoice.businessId,
            action: 'NUDGE_COMPLETED',
            actor: 'PayNudge Queue Engine',
            details: `Scheduled ${payload.topic} alert successfully dispatched over ${payload.channel}. Carrier Identifier: ${dispatchResult.providerId || 'none'}`
          }
        });
      });

      console.log(`✅ [Worker Persistence] Successfully archived carrier transaction records for invoice #${invoice.id}.`);
    } catch (saveError: any) {
      console.warn("⚠️ Failed executing Post-dispatch database schema writes:", saveError.message);
    }
  } else {
    console.log(`[Queue-Simulation] Swallowed persistent writing since Invoice #${payload.invoiceId} was calculated offline or is missing.`);
  }

  return {
    success: dispatchResult.success,
    logId: generatedLogId,
    error: dispatchResult.error
  };
}

/**
 * Boots the background queue workers (BullMQ) if Redis configuration permits
 */
export function startQueueWorkers(): void {
  const connection = getWorkerRedis();
  if (!connection) {
    console.log("ℹ️ No active Redis configuration. Disabling physical BullMQ container worker threads.");
    return;
  }

  // Prevent duplicate workers during hot reload or multiple calls
  if (globalSymbols.__bullWorker) {
    console.log("⚡ [BullMQ] Worker already initialized and active. Reusing singleton.");
    updateTelemetryState();
    return;
  }

  console.log("⚡ Starting production BullMQ Worker threads [NudgeReminderQueue]");
  globalSymbols.__bullWorker = new Worker('NudgeReminderQueue', async (job: Job<ReminderJobPayload>) => {
    redisTelemetry.processedCount++;
    const result = await handleReminderJobProcessing(job.data);
    return result;
  }, {
    connection,
    concurrency: 5,
    lockDuration: 30000,     // 30s lock duration
    stalledInterval: 15000,  // check every 15s for stalled jobs
  });

  globalSymbols.__bullWorker.on('completed', (job) => {
    console.log(`✅ Job #${job.id} finalized work with status SUCCESS.`);
  });

  globalSymbols.__bullWorker.on('failed', (job, err) => {
    redisTelemetry.failedCount++;
    console.error(`❌ Job #${job?.id} failed work with error:`, err);
  });

  globalSymbols.__bullWorker.on('error', (err) => {
    const msg = err.message || '';
    if (msg.includes('ECONNRESET') || msg.includes('EPIPE') || msg.includes('ETIMEDOUT')) {
      console.warn(`⚠️ [BullMQ-Worker] Swallowed transient network error: ${msg}`);
    } else {
      console.error(`❌ BullMQ Worker generic error:`, err);
    }
  });

  startHeartbeatPings();
  updateTelemetryState();
}

/**
 * Retrieves the active Worker instance
 */
export function getQueueWorkerInstance(): Worker | null {
  return globalSymbols.__bullWorker || null;
}

// Hook into Vite's HMR disposal to clean up active resources cleanly
if (import.meta.hot) {
  import.meta.hot.dispose(async () => {
    console.log("🔥 [HMR] Disposing BullMQ connection resources on hot reload...");
    await closeRedisConnections();
  });
}
