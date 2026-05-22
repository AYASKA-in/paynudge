import { Customer, InvoiceDue, ReminderTemplate, NotificationLog, BusinessProfile, ProviderDiagnostic, PlatformBillingReceipt, WebhookDeliveryLog } from './types';

export const INITIAL_BUSINESS: BusinessProfile = {
  id: 'biz_01',
  name: 'Acme Corp',
  vpa: 'merchant@upi',
  mobile: '9876543210',
  sector: 'Professional Services',
  verified: true,
};

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust_01',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@gmail.com',
    phone: '+91 98765 01010',
    tier: 'Regular',
    notes: 'Tuition center student. Prefers reminders via WhatsApp on weekends.',
    avgCollectionDays: 5,
  },
  {
    id: 'cust_02',
    name: 'Globex Inc',
    email: 'accounts@globex.in',
    phone: '+91 91234 56789',
    tier: 'Regular',
    notes: 'Local medical supply vendor. Standard 30 days credit cycle.',
    avgCollectionDays: 14,
  },
  {
    id: 'cust_03',
    name: 'Stark Foods',
    email: 'billing@starkfoods.co.in',
    phone: '+91 94440 12345',
    tier: 'New',
    notes: 'Small wholesale distributor for local departmental stores.',
    avgCollectionDays: 8,
  },
  {
    id: 'cust_04',
    name: 'Oscorp Ltd',
    email: 'finance@oscorp.in',
    phone: '+91 98888 77777',
    tier: 'New',
    notes: 'Engineering lab. Always requires formal email with scanned invoice copy.',
    avgCollectionDays: 3,
  },
  {
    id: 'cust_05',
    name: 'Alexandria Mercer',
    email: 'a.mercer@nexuscorp.io',
    phone: '+91 98765 43210',
    tier: 'VIP',
    notes: 'Alexandria prefers communications regarding invoices over ₹5k to be sent directly via WhatsApp. Standard terms apply, but occasional extensions granted based on Q3 agreement.',
    avgCollectionDays: 12,
  },
];

export const INITIAL_INVOICES: InvoiceDue[] = [
  {
    id: 'INV-2041',
    customerId: 'cust_01',
    amount: 4500,
    dueDate: new Date().toISOString().split('T')[0], // Due Today
    paymentStatus: 'Critical',
    lastContactDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lastContactChannel: 'WhatsApp',
    createdDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Physics Class XII monthly fee - Batch A',
    assignedOwner: 'Arun Kumar (Senior Executive)',
    promiseToPayDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    escalationState: 'First warning',
  },
  {
    id: 'INV-8923',
    customerId: 'cust_02',
    amount: 12500,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Due in 2 days
    paymentStatus: 'Partially Paid',
    lastContactDate: new Date().toISOString().split('T')[0],
    lastContactChannel: 'WhatsApp',
    createdDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Supply of clinical gloves and sanitizers',
    partialAmountPaid: 5000,
    assignedOwner: 'Kiran Patel (Finance Partner)',
    reconciliationStatus: 'Verified',
    utrCodes: ['UTR9938472'],
  },
  {
    id: 'INV-8895',
    customerId: 'cust_03',
    amount: 8900,
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // In 15 Days
    paymentStatus: 'Active',
    lastContactChannel: 'None',
    createdDate: new Date().toISOString().split('T')[0],
    notes: 'Wholesale organic grain pack supply',
    assignedOwner: 'Arun Kumar (Senior Executive)',
  },
  {
    id: 'INV-8750',
    customerId: 'cust_04',
    amount: 15000,
    dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    paymentStatus: 'Disputed',
    lastContactDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lastContactChannel: 'Email',
    createdDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Monthly website technical optimization retainer',
    isDisputed: true,
    disputeReason: 'Client claims the server hosting credit was not accounted in the billing summary',
    assignedOwner: 'Kiran Patel (Finance Partner)',
    snoozedUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  {
    id: 'INV-2023-089',
    customerId: 'cust_05',
    amount: 4200,
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 15).toISOString().split('T')[0], // 3 days overdue
    paymentStatus: 'Escalated',
    lastContactDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lastContactChannel: 'WhatsApp',
    createdDate: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: 'Consolidated consultancy on design assets',
    assignedOwner: 'Arun Kumar (Senior Executive)',
    escalationState: 'Legal Threat',
  },
];

export const INITIAL_TEMPLATES: ReminderTemplate[] = [
  {
    id: 'temp_polite',
    type: 'polite',
    title: 'Polite Reminder (Gentle nudge regular days)',
    subject: 'Friendly update: Pending outstanding due at {{business_name}}',
    body: 'Dear {{customer_name}}, code of payment for Invoice {{invoice_id}} of ₹{{amount}} will reach its timeline on {{due_date}}. Tap here to quickly settle via secure UPI link: {{upi_link}}. Warm regards, {{business_name}}.',
    channel: 'Both',
  },
  {
    id: 'temp_first',
    type: 'first',
    title: 'First Reminder (On due date)',
    subject: 'Action Required: Payment of {{invoice_id}} is due today',
    body: 'Hi {{customer_name}}, this is a friendly reminder that Invoice {{invoice_id}} from {{business_name}} for ₹{{amount}} is due today. Request you to kindly clear this outstanding balance. You can pay instantly using UPI: {{upi_link}}. Thank you!',
    channel: 'WhatsApp',
  },
  {
    id: 'temp_overdue',
    type: 'overdue',
    title: 'Overdue Nudge (Urgent sequence)',
    subject: 'Immediate Action: Invoice {{invoice_id}} is OVERDUE',
    body: 'Dear {{customer_name}}, this is a reminder that Invoice {{invoice_id}} for ₹{{amount}} is currently past due. We kindly request you to clear the outstanding dues immediately to avoid any interruption in services. Tap below to pay via UPI: {{upi_link}}',
    channel: 'Both',
  },
  {
    id: 'temp_final',
    type: 'final',
    title: 'Final Reminder (Strict timeline)',
    subject: 'FINAL WARNING: Outstanding collections due for Invoice {{invoice_id}}',
    body: 'ATTN: {{customer_name}}, Invoice {{invoice_id}} for ₹{{amount}} is significantly past due. Despite multiple follow-ups, payment remains outstanding. Please settle immediately via secure link: {{upi_link}} to prevent legal escalation.',
    channel: 'Email',
  },
  {
    id: 'temp_received',
    type: 'received',
    title: 'Payment Received Confirmation',
    subject: 'Receipt: Payment received successfully!',
    body: 'Thank you {{customer_name}}! We have successfully received payment of ₹{{amount}} against Invoice {{invoice_id}}. Your transaction reference ID is {{ref_code}}. Safe credentials provided, and your record is marked as PAID.',
    channel: 'Both',
  },
];

export const INITIAL_LOGS: NotificationLog[] = [
  {
    id: 'log_01',
    invoiceId: 'INV-2041',
    customerName: 'Rahul Sharma',
    channel: 'WhatsApp',
    sentTime: 'Today, 11:20 AM IST',
    status: 'Read',
    messagePreview: 'Hi Rahul Sharma, your invoice #INV-2041 for ₹4,500 is due today. Pay securely here...',
    upiLinkUsed: 'upi://pay?pa=merchant@upi&pn=Acme%20Corp&am=4500&tr=INV-2041&cu=INR',
  },
  {
    id: 'log_02',
    invoiceId: 'INV-8923',
    customerName: 'Globex Inc',
    channel: 'WhatsApp',
    sentTime: 'Today, 09:41 AM IST',
    status: 'Delivered',
    messagePreview: 'Dear Globex Inc, code of payment for Invoice INV-8923 of ₹1,250 is scheduled...',
  },
  {
    id: 'log_03',
    invoiceId: 'INV-8750',
    customerName: 'Oscorp Ltd',
    channel: 'Email',
    sentTime: '2 days ago, 04:30 PM IST',
    status: 'Paid',
    messagePreview: 'Friendly update: Pending outstanding due at Acme Corp against INV-8750...',
  },
];

// Compile UPI deep-link
export function getUPILink(vpa: string, payeeName: string, amount: number, invoiceId: string): string {
  const cleanPayee = encodeURIComponent(payeeName);
  return `upi://pay?pa=${vpa}&pn=${cleanPayee}&am=${amount}&tr=${invoiceId}&cu=INR&tn=Invoice%20${invoiceId}`;
}

// Parse templates with dynamic variables
export function formatTemplate(body: string, variables: {
  customer_name: string;
  business_name: string;
  amount: number;
  invoice_id: string;
  due_date: string;
  upi_link: string;
  ref_code?: string;
}): string {
  return body
    .replace(/\{\{customer_name\}\}/g, variables.customer_name)
    .replace(/\{\{business_name\}\}/g, variables.business_name)
    .replace(/\{\{amount\}\}/g, variables.amount.toLocaleString('en-IN'))
    .replace(/\{\{invoice_id\}\}/g, variables.invoice_id)
    .replace(/\{\{due_date\}\}/g, variables.due_date)
    .replace(/\{\{upi_link\}\}/g, variables.upi_link)
    .replace(/\{\{ref_code\}\}/g, variables.ref_code || 'UTR8472910');
}

export const INITIAL_DIAGNOSTICS: ProviderDiagnostic[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Cloud Gateway',
    type: 'WhatsApp Outbound',
    status: 'operational',
    uptimePercentage: 99.98,
    latencyMs: 140,
    providerType: 'Meta Cloud',
  },
  {
    id: 'resend',
    name: 'Resend SMTP Engine',
    type: 'Email SMTP',
    status: 'operational',
    uptimePercentage: 100.0,
    latencyMs: 85,
    providerType: 'Resend',
  },
  {
    id: 'razorpay',
    name: 'Razorpay UPI API',
    type: 'UPI Escrow Provider',
    status: 'operational',
    uptimePercentage: 99.91,
    latencyMs: 250,
    providerType: 'Razorpay CLI',
  },
  {
    id: 'bhim_upi',
    name: 'BHIM-NPCI Network',
    type: 'Core BHIM Gateway',
    status: 'operational',
    uptimePercentage: 99.85,
    latencyMs: 310,
    providerType: 'Standard NPCI',
  },
];

export const INITIAL_BILL_RECEIPTS: PlatformBillingReceipt[] = [
  {
    id: 'RCPT_2026_05',
    date: '2026-05-01',
    amount: 1499,
    planName: 'Scale Pro Premium',
    paymentStatus: 'Paid',
    receiptUrl: '#',
  },
  {
    id: 'RCPT_2026_04',
    date: '2026-04-01',
    amount: 1499,
    planName: 'Scale Pro Premium',
    paymentStatus: 'Paid',
    receiptUrl: '#',
  },
  {
    id: 'RCPT_2026_03',
    date: '2026-03-01',
    amount: 1499,
    planName: 'Scale Pro Premium',
    paymentStatus: 'Paid',
    receiptUrl: '#',
  },
];

export const INITIAL_WEBHOOK_LOGS: WebhookDeliveryLog[] = [
  {
    id: 'WH_94710',
    targetUrl: 'https://api.acme.in/v1/paynudge-receiver',
    event: 'payment.settled',
    status: 'success',
    responseCode: 200,
    timestamp: 'Today, 11:22 AM',
    payloadSnippet: '{"invoice_id": "INV-2041", "amount": 4500, "status": "Paid", "utr": "UTR8472910"}',
    retryCount: 0,
  },
  {
    id: 'WH_94709',
    targetUrl: 'https://api.acme.in/v1/paynudge-receiver',
    event: 'nudge.delivered',
    status: 'success',
    responseCode: 201,
    timestamp: 'Today, 09:42 AM',
    payloadSnippet: '{"invoice_id": "INV-8923", "handset": "+919123456789", "delivered": true}',
    retryCount: 0,
  },
  {
    id: 'WH_94708',
    targetUrl: 'https://api.acme.in/v1/paynudge-receiver',
    event: 'payment.settled',
    status: 'failed',
    responseCode: 504,
    timestamp: 'Yesterday, 04:32 PM',
    payloadSnippet: '{"invoice_id": "INV-8750", "amount": 15000, "status": "Paid"}',
    retryCount: 3,
  },
];

export const INITIAL_BUSINESS_WORKSPACE_LIST: BusinessProfile[] = [
  {
    id: 'biz_01',
    name: 'Acme Corp',
    vpa: 'merchant@upi',
    mobile: '9876543210',
    sector: 'Professional Services',
    verified: true,
  },
  {
    id: 'biz_sec_02',
    name: 'Pioneer Tuition Clinic',
    vpa: 'pioneer.tuition@okaxis',
    mobile: '9123456780',
    sector: 'Tuition & Coaching',
    verified: true,
  },
  {
    id: 'biz_sec_03',
    name: 'Sardar Organic Wholesalers',
    vpa: 'sardar.woods@okicici',
    mobile: '9444012340',
    sector: 'Logistics & Supply',
    verified: true,
  },
];
