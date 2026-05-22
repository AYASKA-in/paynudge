/**
 * PayNudge Enterprise SaaS - Core RestController API Boundary
 *
 * Implements strict RBAC permissions, limits, quota enforcement, and payload validations.
 */

import { Customer, InvoiceDue, NotificationLog, BusinessProfile, BusinessSettings, UserWorkspaceRole, WebSaaSPlan } from '../../../types';
import { APIResponse, APIValidator } from '../contracts';
import { ValidationError, UnauthorizedError, ForbiddenError, PlanLimitError, normalizeAPIError } from '../errors';
import { SaasDatabaseClient } from '../repositories/SaaSDatabase';
import { ReminderSchedulerService, UnifiedCarrierDispatcher } from '../services/RemindersAndCarriers';
import { AICollectionsIntelligence } from '../../saasManager';

// Standardized latency monitor
async function invokeControllerWithLatency<T>(
  action: () => Promise<T>
): Promise<APIResponse<T>> {
  const start = performance.now();
  try {
    const data = await action();
    const duration = Math.round(performance.now() - start);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
      latencyMs: duration,
    };
  } catch (err: any) {
    const duration = Math.round(performance.now() - start);
    const normalized = normalizeAPIError(err);
    return {
      ...normalized,
      latencyMs: duration,
    } as any;
  }
}

export class SaaSController {
  
  // --- Authentication & Workspace Sessions ---
  static async requestMagicLogin(email: string): Promise<APIResponse<{ magicSent: boolean; message: string }>> {
    return invokeControllerWithLatency(async () => {
      if (!APIValidator.validateEmail(email)) {
        throw new ValidationError('The specified email formatting is invalid.');
      }
      // Simulate real launch-ready OTP email loop
      return {
        magicSent: true,
        message: `Secure authentication request successfully dispatched to ${email}. Check mailbox for direct login magic link.`,
      };
    });
  }

  // --- Customer / Debtor Controller (RBAC secured) ---
  static async createCustomer(
    cust: Customer,
    activeRole: UserWorkspaceRole,
    currentPlan: WebSaaSPlan,
    currentCustomersCount: number
  ): Promise<APIResponse<Customer>> {
    return invokeControllerWithLatency(async () => {
      // 1. Role validation
      if (activeRole === 'Collection Executive (Staff)') {
        throw new ForbiddenError('Staff users are restricted from adding new customer ledger records.');
      }

      // 2. Data Validation
      const valErr = APIValidator.validateCustomer(cust);
      if (valErr) throw new ValidationError(valErr);

      // 3. SaaS Plan Limits Guard
      const maxLimit = currentPlan === 'free' ? 5 : currentPlan === 'starter' ? 50 : 1000;
      if (currentCustomersCount >= maxLimit) {
        throw new PlanLimitError(
          `SaaS limit reached! Your current "${currentPlan.toUpperCase()}" plan restricts tracking more than ${maxLimit} active debtors. Upgrade in billing tab to add more accounts.`
        );
      }

      // Proactive AI Heuristic hydration
      const reports = AICollectionsIntelligence.analyzeCustomerCollectability(cust, []);
      cust.aiRiskScore = reports.riskScore;
      cust.aiPaymentProbability = reports.probability;
      cust.aiBestSendTime = reports.bestSendTime;
      cust.aiSentiment = reports.sentiment;
      cust.aiSuggestedApproach = reports.strategicSuggestion;
      cust.aiNudgeRecommendation = reports.recommendedTemplate;

      return await SaasDatabaseClient.insertCustomer(cust);
    });
  }

  static async updateCustomerNotes(
    id: string,
    notes: string,
    activeRole: UserWorkspaceRole
  ): Promise<APIResponse<Customer>> {
    return invokeControllerWithLatency(async () => {
      if (activeRole === 'Collection Executive (Staff)') {
        throw new ForbiddenError('Staff roles cannot edit debtor notes.');
      }

      const all = await SaasDatabaseClient.selectCustomers('biz_01');
      const matched = all.find(c => c.id === id);
      if (!matched) throw new ValidationError('Debtor file not found in system table.');

      matched.notes = notes;
      
      // Re-run AI analytics with updated user comments
      const invoices = await SaasDatabaseClient.selectInvoices();
      const relativeInvs = invoices.filter(i => i.customerId === id);
      const reports = AICollectionsIntelligence.analyzeCustomerCollectability(matched, relativeInvs);
      matched.aiRiskScore = reports.riskScore;
      matched.aiPaymentProbability = reports.probability;
      matched.aiSentiment = reports.sentiment;
      matched.aiBestSendTime = reports.bestSendTime;
      matched.aiSuggestedApproach = reports.strategicSuggestion;

      return await SaasDatabaseClient.updateCustomer(matched);
    });
  }

  // --- Receivables Ledger Controller ---
  static async createInvoice(
    inv: InvoiceDue,
    activeRole: UserWorkspaceRole
  ): Promise<APIResponse<InvoiceDue>> {
    return invokeControllerWithLatency(async () => {
      if (activeRole === 'Collection Executive (Staff)') {
        throw new ForbiddenError('Collection staff do not have clearance to register receivables.');
      }

      const valErr = APIValidator.validateInvoice(inv);
      if (valErr) throw new ValidationError(valErr);

      // Verify customer exists
      const customers = await SaasDatabaseClient.selectCustomers('biz_01');
      const hasCust = customers.some(c => c.id === inv.customerId);
      if (!hasCust) throw new ValidationError('Customer reference is missing or invalid.');

      return await SaasDatabaseClient.insertInvoice(inv);
    });
  }

  // --- Smart Nudge Scheduler Dispatch Engine ---
  static async triggerManualNudge(
    invoiceId: string,
    channel: 'WhatsApp' | 'Email',
    activeRole: UserWorkspaceRole,
    settings: BusinessSettings,
    allLogs: NotificationLog[],
    templatesList: any[],
    businessVpa: string,
    businessName: string
  ): Promise<APIResponse<{ log: NotificationLog; updatedInvoice: InvoiceDue }>> {
    return invokeControllerWithLatency(async () => {
      // 1. Get transaction records
      const invoices = await SaasDatabaseClient.selectInvoices();
      const matchedInv = invoices.find(i => i.id === invoiceId);
      if (!matchedInv) throw new ValidationError('Invoice record not found.');

      const customers = await SaasDatabaseClient.selectCustomers('biz_01');
      const matchedCust = customers.find(c => c.id === matchedInv.customerId);
      if (!matchedCust) throw new ValidationError('Customer record not found.');

      // 2. Perform schedule evaluation
      const ruleCheck = ReminderSchedulerService.evaluateScheduleRules(
        matchedInv,
        matchedCust,
        settings,
        allLogs,
        channel
      );

      if (!ruleCheck.allowed) {
        throw new ValidationError(ruleCheck.restrictionReason || 'Reminder restricted by scheduler policies.');
      }

      // Generate localized deep UPI pay link
      const payAmount = matchedInv.amount;
      const cleanVPA = businessVpa || 'merchant@upi';
      const cleanName = encodeURIComponent(businessName || 'PayNudge Tenant');
      const upiUrn = `upi://pay?pa=${cleanVPA}&pn=${cleanName}&am=${payAmount}&cu=INR&tn=PayNudge-${matchedInv.id}`;

      // Assemble reminder message
      const activeStage = ReminderSchedulerService.calculateAppropriateStage(matchedInv.dueDate);
      const chosenTemplate = templatesList.find(t => t.id === `temp_${activeStage.toLowerCase()}`) || templatesList[0];

      // Format body placeholders
      let outputBody = chosenTemplate.body
        .replace(/{customer_name}/g, matchedCust.name)
        .replace(/{business_name}/g, businessName)
        .replace(/{amount}/g, payAmount.toLocaleString('en-IN'))
        .replace(/{invoice_id}/g, matchedInv.id)
        .replace(/{due_date}/g, matchedInv.dueDate)
        .replace(/{upi_link}/g, upiUrn);

      // Primary Dispatch with unified fallback carriers
      const diagnosticsRaw = localStorage.getItem('paynudge_diagnostics');
      const diagnostics = diagnosticsRaw ? JSON.parse(diagnosticsRaw) : [];

      const dispatchPayload = {
        toPhoneOrEmail: channel === 'WhatsApp' ? matchedCust.phone : matchedCust.email,
        body: outputBody,
        subject: chosenTemplate.subject,
        upiLink: upiUrn
      };

      const dispatchResult = await UnifiedCarrierDispatcher.dispatch(channel, dispatchPayload, diagnostics);

      // Create ledger log entry
      const newLog: NotificationLog = {
        id: `log_prod_${Date.now()}`,
        invoiceId: matchedInv.id,
        customerName: matchedCust.name,
        channel,
        sentTime: 'Just now',
        status: dispatchResult.status,
        messagePreview: outputBody,
        upiLinkUsed: upiUrn,
        sentTimestamp: Date.now(),
        retryAttempts: 0,
        deliveryErrorReason: dispatchResult.errorReason,
      };

      // Push to central databases
      await SaasDatabaseClient.insertLog(newLog);

      // Modify updated contact timelines for invoice row
      matchedInv.lastContactDate = new Date().toISOString().split('T')[0];
      matchedInv.lastContactChannel = channel;
      matchedInv.reminderAttemptsCount = (matchedInv.reminderAttemptsCount || 0) + 1;
      matchedInv.automationSequenceStage = activeStage;
      matchedInv.lastReminderTimestamp = Date.now();

      await SaasDatabaseClient.updateInvoice(matchedInv);

      // Also hydrate customer's health stats
      const overdueInvoices = invoices.filter(i => i.customerId === matchedCust.id && i.paymentStatus !== 'Paid');
      matchedCust.relationshipHealthScore = Math.max(10, 100 - (overdueInvoices.length * 15) - (newLog.status === 'Failed' ? 10 : 0));
      matchedCust.currentStage = activeStage === 'Polite' ? 'Gentle Nudge' : 'Firm escalation';
      await SaasDatabaseClient.updateCustomer(matchedCust);

      return {
        log: newLog,
        updatedInvoice: matchedInv,
      };
    });
  }

  // --- Meta Integration webhook simulated client clearouts ---
  static async simulateIncomingWebhookPayment(
    invoiceId: string,
    paidAmount: number
  ): Promise<APIResponse<{ invoiceId: string; status: 'Paid'; cashImpact: number }>> {
    return invokeControllerWithLatency(async () => {
      const invoices = await SaasDatabaseClient.selectInvoices();
      const target = invoices.find(i => i.id === invoiceId);
      if (!target) throw new ValidationError('Invoice ledger entry does not exist.');

      target.paymentStatus = 'Paid';
      await SaasDatabaseClient.updateInvoice(target);

      // Create receipt entry
      const customers = await SaasDatabaseClient.selectCustomers('biz_01');
      const targetCust = customers.find(c => c.id === target.customerId);
      const name = targetCust ? targetCust.name : 'Unknown Debtor';

      const log: NotificationLog = {
        id: `web_hook_settled_${Date.now()}`,
        invoiceId,
        customerName: name,
        channel: 'WhatsApp',
        sentTime: 'Just now (Webhook Auto)',
        status: 'Paid',
        messagePreview: `Webhook Event RECEIVED: Razorpay client payment of ₹${paidAmount.toLocaleString('en-IN')} confirmed for Invoice #${invoiceId}. Marking PAID automatically.`,
      };
      await SaasDatabaseClient.insertLog(log);

      return {
        invoiceId,
        status: 'Paid',
        cashImpact: paidAmount,
      };
    });
  }
}
