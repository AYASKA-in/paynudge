const { PrismaClient } = require('@prisma/client');
const Redis = require('ioredis');

async function runPreFlightCheck() {
  console.log("🚀 Starting Production Deployment Pre-Flight Check...\n");

  const requiredProductionEnv = [
    'DATABASE_URL',
    'REDIS_URL',
    'META_WA_ACCESS_TOKEN',
    'META_WA_PHONE_NUMBER_ID',
    'RESEND_API_KEY',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'META_WA_VERIFY_TOKEN'
  ];

  const isProduction = process.env.NODE_ENV === 'production';
  let hasFailed = false;

  console.log("📋 Checking Environment Variables:");
  for (const envVar of requiredProductionEnv) {
    if (!process.env[envVar]) {
      if (isProduction) {
        console.error(`❌ CRITICAL ERROR: Environment variable "${envVar}" is missing in production configuration.`);
        hasFailed = true;
      } else {
        console.warn(`⚠️ WARNING: Environment variable "${envVar}" is missing. System will fallback to Simulation Mode.`);
      }
    } else {
      console.log(`✅ Environment variable "${envVar}" is defined.`);
    }
  }

  if (hasFailed) {
    console.error("\n❌ Pre-flight check failed due to missing critical configurations. Exiting deployment process.");
    process.exit(1);
  }

  // Verify DB connection if URL is set
  if (process.env.DATABASE_URL) {
    console.log("\n🐘 Testing Supabase PostgreSQL Database connectivity...");
    const prisma = new PrismaClient();
    try {
      await prisma.$connect();
      console.log("✅ Database connectivity verified successfully.");
      await prisma.$disconnect();
    } catch (err) {
      console.error(`❌ Database connection failed: ${err.message}`);
      process.exit(1);
    }
  }

  // Verify Redis connection if URL is set
  if (process.env.REDIS_URL) {
    console.log("\n📦 Testing Redis connectivity...");
    try {
      const redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 5000
      });
      await redis.ping();
      console.log("✅ Redis connectivity verified successfully.");
      redis.disconnect();
    } catch (err) {
      console.error(`❌ Redis connection failed: ${err.message}`);
      process.exit(1);
    }
  }

  console.log("\n💎 Pre-flight check completed. All checks passed successfully.");
  process.exit(0);
}

runPreFlightCheck().catch(err => {
  console.error("❌ Pre-flight check crashed:", err);
  process.exit(1);
});
