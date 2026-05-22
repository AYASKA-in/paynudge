import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Database Seeding...");

  // 1. Create Business Profile
  const business = await prisma.businessProfile.upsert({
    where: { id: 'biz-bhomia-tuitions' },
    update: {},
    create: {
      id: 'biz-bhomia-tuitions',
      name: 'Bhomia Tuitions',
      vpa: 'bhomia@okaxis',
      phone: '9876543210',
      email: 'billing@bhomiatuitions.in',
      razorpayKeyId: 'rzp_test_mockKey123',
      metaToken: 'mock_meta_token',
      resendKey: 'mock_resend_key'
    }
  });
  console.log(`✅ Business Profile created: ${business.name}`);

  // 2. Create Owner User
  const user = await prisma.user.upsert({
    where: { email: 'rohitmoningi125@gmail.com' },
    update: {},
    create: {
      name: 'Rohit Moningi',
      email: 'rohitmoningi125@gmail.com',
      role: 'OWNER',
      businessId: business.id
    }
  });
  console.log(`✅ Owner User created: ${user.name} (${user.email})`);

  // 3. Create Customers
  const customer1 = await prisma.customer.upsert({
    where: { businessId_phone: { businessId: business.id, phone: '9876543210' } },
    update: {},
    create: {
      id: 'CUST-001',
      businessId: business.id,
      name: 'Ayush Sharma',
      phone: '9876543210',
      email: 'ayush@sharma-physics.com',
      notes: 'Monthly Physics XII fee'
    }
  });

  const customer2 = await prisma.customer.upsert({
    where: { businessId_phone: { businessId: business.id, phone: '9988776655' } },
    update: {},
    create: {
      id: 'CUST-002',
      businessId: business.id,
      name: 'Pooja Hegde',
      phone: '9988776655',
      email: 'pooja@hegde-designs.in',
      notes: 'Design retainer accounts'
    }
  });
  console.log("✅ Customers created.");

  // 4. Create Invoices
  const datePast = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const dateFuture = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const invoice1 = await prisma.invoiceDue.upsert({
    where: { id: 'INV-8951' },
    update: {},
    create: {
      id: 'INV-8951',
      businessId: business.id,
      customerId: customer1.id,
      amount: 8500,
      dueDate: datePast,
      paymentStatus: 'Critical',
      lastContactDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      lastContactChannel: 'WhatsApp',
      notes: 'Physics Class XII monthly fee - Batch A',
      assignedOwner: 'Arun Kumar (Senior Executive)',
      promiseToPayDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      escalationState: 'First_warning'
    }
  });

  const invoice2 = await prisma.invoiceDue.upsert({
    where: { id: 'INV-8923' },
    update: {},
    create: {
      id: 'INV-8923',
      businessId: business.id,
      customerId: customer2.id,
      amount: 12500,
      dueDate: dateFuture,
      paymentStatus: 'Partially_Paid',
      lastContactDate: new Date().toISOString().split('T')[0],
      lastContactChannel: 'WhatsApp',
      notes: 'Landing page retainer and brand style assets retainer',
      partialAmountPaid: 5000,
      assignedOwner: 'Kiran Patel (Finance Partner)'
    }
  });
  console.log("✅ Invoice records created.");

  // 5. Create Payment Record for partially paid invoice
  await prisma.paymentRecord.upsert({
    where: { utrCode: 'UTR9938472' },
    update: {},
    create: {
      id: 'pay_rzp_seed_1',
      invoiceId: invoice2.id,
      amount: 5000,
      utrCode: 'UTR9938472',
      method: 'RAZORPAY',
      status: 'Settled'
    }
  });
  console.log("✅ Payment records logged.");

  // 6. Log activity audit trails
  await prisma.activityHistory.createMany({
    data: [
      {
        id: 'act_seed_1',
        businessId: business.id,
        action: 'DATABASE_INITIALIZATION',
        actor: 'Seed Daemon',
        details: 'Populated fresh database structures with demo collections data.'
      },
      {
        id: 'act_seed_2',
        businessId: business.id,
        action: 'TRIGGER_NUDGE',
        actor: 'Seed Daemon',
        details: 'Sent polite payment reminder alerts on outstanding invoices.'
      }
    ]
  });
  console.log("✅ Activity audit history logged.");

  console.log("\n🌱 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding crashed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
