export type PaymentStatus = 'Paid' | 'Critical' | 'Upcoming' | 'Active' | 'Partially Paid' | 'Awaiting Settlement' | 'Payment under Verification' | 'Disputed' | 'Escalated' | 'Settled';

export interface BusinessProfile {
  id: string;
  name: string;
  vpa: string; // e.g. merchant@upi
  mobile: string;
  sector: string;
  verified: boolean;
  onboardingPhase?: 'completed' | 'pending';
}

export type WebSaaSPlan = 'free' | 'starter' | 'growth';
export type UserWorkspaceRole = 'Owner' | 'Finance Partner (Admin)' | 'Collection Executive (Staff)';

export interface UserSession {
  userId: string;
  email: string;
  name: string;
  activeRole: UserWorkspaceRole;
  currentBusinessId: string;
  workspaceMembersCount: number;
}

export interface PlatformBillingReceipt {
  id: string;
  date: string;
  amount: number;
  planName: string;
  paymentStatus: 'Paid' | 'Failed' | 'Pending';
  receiptUrl: string;
}

export interface ProviderDiagnostic {
  id: 'whatsapp' | 'resend' | 'razorpay' | 'bhim_upi';
  name: string;
  type: 'WhatsApp Outbound' | 'Email SMTP' | 'UPI Escrow Provider' | 'Core BHIM Gateway';
  status: 'operational' | 'degraded' | 'offline';
  uptimePercentage: number;
  latencyMs: number;
  providerType: 'Twilio' | 'Meta Cloud' | 'Resend' | 'SendGrid' | 'Razorpay CLI' | 'Standard NPCI';
}

export interface WebhookDeliveryLog {
  id: string;
  targetUrl: string;
  event: 'payment.settled' | 'reminder.failed' | 'nudge.delivered' | 'rate_limit.exceeded';
  status: 'success' | 'failed' | 'retrying';
  responseCode: number;
  timestamp: string;
  payloadSnippet: string;
  retryCount: number;
}

export interface AICopilotDraft {
  id: string;
  tone: 'Polite / Warm' | 'Firm / Professional' | 'Strict Ledger Notice' | 'Immediate Settlement Demand';
  language: 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada';
  originalText: string;
  optimizedText: string;
  confidenceScore: number;
  suggestedAction: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  sectorOptional?: string;
  tier: 'VIP' | 'Regular' | 'New';
  notes: string;
  avgCollectionDays: number;
  reminderFrequency?: 'Standard' | 'Aggressive' | 'Gentle';
  preferredChannel?: 'WhatsApp' | 'Email' | 'Both';
  
  // AI Collections Intelligence Metrics
  aiRiskScore?: number; // 0 (Low) to 100 (Critical)
  aiPaymentProbability?: number; // 0% to 100%
  aiBestSendTime?: string; // e.g. "Saturdays 11:30 AM", "Tuesdays 6:00 PM"
  aiSentiment?: 'Cooperative' | 'Evasive' | 'Forgetful' | 'Disgruntled';
  aiSuggestedApproach?: string; // Custom tactical suggestion
  aiNudgeRecommendation?: string; // Template to use next
  
  // Relationship tracking
  relationshipHealthScore?: number; // 0-100
  recoverySuccessRate?: number; // % of overdue invoices recovered
  currentStage?: 'Onboarding' | 'Active' | 'Gentle Nudge' | 'Firm escalation' | 'Settled';
}

export interface InvoiceDue {
  id: string; // e.g. INV-2041
  customerId: string;
  amount: number;
  dueDate: string;
  paymentStatus: PaymentStatus;
  lastContactDate?: string;
  lastContactChannel?: 'WhatsApp' | 'Email' | 'None';
  createdDate: string;
  notes?: string;
  refCode?: string;
  
  // Automation lifecycle states
  automationSequenceStage?: 'None' | 'Polite' | 'First' | 'Overdue' | 'Final';
  lastReminderTimestamp?: number; // Epoch mills for sequence cooldowns
  reminderAttemptsCount?: number;
  stopAutomatedReminders?: boolean;

  // Real-world operational workflow extensions
  isDisputed?: boolean;
  disputeReason?: string;
  promiseToPayDate?: string; // YYYY-MM-DD
  snoozedUntil?: string; // YYYY-MM-DD
  assignedOwner?: string; // Collection executive name
  partialAmountPaid?: number; // Amount collected so far
  utrCodes?: string[]; // Verification reference codes
  reconciliationStatus?: 'Awaiting' | 'Verified' | 'Manual_Unverified' | 'None';
  escalationState?: 'None' | 'Polite' | 'First warning' | 'Legal Threat' | 'LGD Dispute';
}

export interface ReminderTemplate {
  id: string;
  type: 'polite' | 'first' | 'overdue' | 'final' | 'received';
  title: string;
  subject: string;
  body: string;
  channel?: 'WhatsApp' | 'Email' | 'Both';
  language?: 'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada' | 'Marathi';
  tonePreset?: 'Polite' | 'Professional' | 'Strict' | 'Urgent' | 'Grateful';
}

export interface NotificationLog {
  id: string;
  invoiceId: string;
  customerName: string;
  channel: 'WhatsApp' | 'Email';
  sentTime: string;
  status: 'Sent' | 'Delivered' | 'Read' | 'Paid' | 'Failed';
  messagePreview: string;
  upiLinkUsed?: string;
  
  // Communication detail telemetry
  subject?: string;
  retryAttempts?: number;
  sentTimestamp?: number;
  deliveryErrorReason?: string;
}

export interface BusinessSettings {
  autoSendBefore: boolean;
  daysBefore: number;
  autoSendOnDue: boolean;
  autoSendOverdue: boolean;
  preferredChannel: 'WhatsApp' | 'Email' | 'Both';
  
  // Multi-tenant & Security Settings
  workspaceName?: string;
  workspaceId?: string;
  teamRole?: 'Owner' | 'Finance Partner' | 'Collection Executive';
  dataRetentionMonths?: number;
  restrictToBusinessHours?: boolean; // 9 AM to 8 PM check
  preventDuplicatesHours?: number; // Avoid messaging same debtor within X hrs
  apiKeySandbox?: string; // Simulated webhook API Key
  apiKeyProduction?: string;
  emailFromIdentity?: string;
}

// Sandbox Operational Simulation Control Parameters
export interface SandboxSimulationConfig {
  offlineMode: boolean;
  simulatedApiLatencyMs: number;
  rateLimitFailureMode: boolean;
  staleDataSimulation: boolean;
}
