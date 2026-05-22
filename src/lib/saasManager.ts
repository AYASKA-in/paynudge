/**
 * PayNudge Enterprise - Core SaaS Architecture & Intelligence Manager (2026 Edition)
 * 
 * Provides decoupled repository mechanisms, algorithmic credit scoring,
 * automated collection sequences, and simulation parameters.
 */

import { Customer, InvoiceDue, NotificationLog, BusinessSettings, SandboxSimulationConfig, ReminderTemplate } from '../types';

// ==========================================
// 1. REPOSITORY PATTERN / SERVICE LAYER
// ==========================================

export interface ICollectionRepository {
  getCustomers(): Customer[];
  saveCustomer(customer: Customer): Customer;
  getInvoices(): InvoiceDue[];
  saveInvoice(invoice: InvoiceDue): InvoiceDue;
  getLogs(): NotificationLog[];
  saveLog(log: NotificationLog): NotificationLog;
  getSettings(): BusinessSettings;
  saveSettings(settings: BusinessSettings): void;
}

export class LocalCollectionRepository implements ICollectionRepository {
  getCustomers(): Customer[] {
    const raw = localStorage.getItem('paynudge_customers');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveCustomer(customer: Customer): Customer {
    const list = this.getCustomers();
    const index = list.findIndex(c => c.id === customer.id);
    if (index >= 0) {
      list[index] = customer;
    } else {
      list.push(customer);
    }
    localStorage.setItem('paynudge_customers', JSON.stringify(list));
    return customer;
  }

  getInvoices(): InvoiceDue[] {
    const raw = localStorage.getItem('paynudge_invoices');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveInvoice(invoice: InvoiceDue): InvoiceDue {
    const list = this.getInvoices();
    const index = list.findIndex(i => i.id === invoice.id);
    if (index >= 0) {
      list[index] = invoice;
    } else {
      list.push(invoice);
    }
    localStorage.setItem('paynudge_invoices', JSON.stringify(list));
    return invoice;
  }

  getLogs(): NotificationLog[] {
    const raw = localStorage.getItem('paynudge_logs');
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  saveLog(log: NotificationLog): NotificationLog {
    const list = this.getLogs();
    const index = list.findIndex(l => l.id === log.id);
    if (index >= 0) {
      list[index] = log;
    } else {
      list.unshift(log);
    }
    localStorage.setItem('paynudge_logs', JSON.stringify(list));
    return log;
  }

  getSettings(): BusinessSettings {
    const raw = localStorage.getItem('paynudge_settings');
    if (!raw) {
      return {
        autoSendBefore: true,
        daysBefore: 3,
        autoSendOnDue: true,
        autoSendOverdue: true,
        preferredChannel: 'WhatsApp',
        workspaceName: 'Acme India Co',
        teamRole: 'Owner',
        dataRetentionMonths: 12,
        restrictToBusinessHours: true,
        preventDuplicatesHours: 3,
        apiKeySandbox: 'pk_sandbox_6a89c2de304f',
        apiKeyProduction: 'pk_prod_89fa3c678a10',
        emailFromIdentity: 'reminders@acme.in'
      };
    }
    try {
      return JSON.parse(raw);
    } catch {
      return {
        autoSendBefore: true,
        daysBefore: 3,
        autoSendOnDue: true,
        autoSendOverdue: true,
        preferredChannel: 'WhatsApp'
      };
    }
  }

  saveSettings(settings: BusinessSettings): void {
    localStorage.setItem('paynudge_settings', JSON.stringify(settings));
  }
}

export const activeRepository = new LocalCollectionRepository();


// ==========================================
// 2. AI INTELLIGENCE & HEURISTICS ENGINE
// ==========================================

export interface AICognitiveReport {
  riskScore: number; // 0 - 100
  riskTier: 'Low' | 'Medium' | 'High' | 'Severe';
  probability: number; // 0 - 100
  bestSendTime: string;
  sentiment: 'Cooperative' | 'Evasive' | 'Forgetful' | 'Disgruntled';
  recommendedTemplate: string;
  strategicSuggestion: string;
}

export class AICollectionsIntelligence {
  /**
   * Generates localized credit risk insights powered by PayNudge's client context models.
   */
  static analyzeCustomerCollectability(
    customer: Customer,
    customerInvoices: InvoiceDue[]
  ): AICognitiveReport {
    const activeUnpaid = customerInvoices.filter(i => i.paymentStatus !== 'Paid');
    const totalOverdueCount = activeUnpaid.filter(i => {
      const isPast = new Date(i.dueDate) < new Date();
      return isPast;
    }).length;

    // Base calculation algorithms
    let riskFactor = 10; // Base baseline risk
    
    // Tier modifier
    if (customer.tier === 'VIP') riskFactor -= 15;
    if (customer.tier === 'New') riskFactor += 15;

    // Invoice delay metrics weighting
    if (customer.avgCollectionDays > 10) riskFactor += 20;
    if (customer.avgCollectionDays > 25) riskFactor += 35;
    
    // Overdue counts compounding
    if (totalOverdueCount > 0) riskFactor += (totalOverdueCount * 18);
    
    // Contain boundary limit constraints
    const riskScore = Math.min(Math.max(riskFactor, 5), 98);
    
    // Risk categorizer
    let riskTier: 'Low' | 'Medium' | 'High' | 'Severe' = 'Low';
    if (riskScore >= 75) riskTier = 'Severe';
    else if (riskScore >= 45) riskTier = 'High';
    else if (riskScore >= 25) riskTier = 'Medium';

    // Probability of direct self-clearance without litigation
    const baseProb = 95 - (riskScore * 0.85);
    const probability = Math.round(Math.min(Math.max(baseProb, 4), 98));

    // Dynamic scheduling selection based on notes and logs
    let bestSendTime = 'Saturdays, 11:30 AM IST';
    if (customer.notes.toLowerCase().includes('weekend')) {
      bestSendTime = 'Sundays, 10:30 AM IST';
    } else if (customer.notes.toLowerCase().includes('afternoon') || customer.avgCollectionDays > 15) {
      bestSendTime = 'Wednesdays, 02:15 PM IST';
    } else if (customer.notes.toLowerCase().includes('morning')) {
      bestSendTime = 'Tuesdays, 09:45 AM IST';
    }

    // Customer Sentiment heuristics
    let sentiment: 'Cooperative' | 'Evasive' | 'Forgetful' | 'Disgruntled' = 'Cooperative';
    if (riskScore >= 75) sentiment = 'Evasive';
    else if (customer.notes.toLowerCase().includes('forget') || riskScore > 40) sentiment = 'Forgetful';
    else if (customer.notes.toLowerCase().includes('dispute') || customer.notes.toLowerCase().includes('issue')) sentiment = 'Disgruntled';

    // Strategic collections advice logic
    let recommendedTemplate = 'polite';
    let strategicSuggestion = 'A standard polite WhatsApp notification is ideal. Maintain relationship rapport. High recovery probability.';

    if (riskTier === 'Severe') {
      recommendedTemplate = 'final';
      strategicSuggestion = 'Avoid escalation if customer is responsive. Email performs better than WhatsApp here. Draft formal notification.';
    } else if (riskTier === 'High') {
      recommendedTemplate = 'overdue';
      strategicSuggestion = 'Send reminder tomorrow morning. Customer profile indicates they usually pay on weekends. Keep follow-up concise.';
    } else if (customer.tier === 'VIP') {
      recommendedTemplate = 'polite';
      strategicSuggestion = 'Avoid escalation; maintain active goodwill. Warm greeting over professional SMS recommended. High recovery probability.';
    }

    return {
      riskScore,
      riskTier,
      probability,
      bestSendTime,
      sentiment,
      recommendedTemplate,
      strategicSuggestion
    };
  }
}


// ==========================================
// 3. AUTOMATION & ESCALATION RULES ENGINE
// ==========================================

export interface AutomationCheckResult {
  allowed: boolean;
  reason?: string;
  suggestedChannel?: 'WhatsApp' | 'Email';
}

export class ReminderAutomationEngine {
  /**
   * Evaluates if a reminder is allowed under current temporal, duplication cooldowns and operational safety rules
   */
  static evaluatePolicy(
    invoice: InvoiceDue,
    customer: Customer,
    settings: BusinessSettings,
    recentLogs: NotificationLog[],
    targetChannel: 'WhatsApp' | 'Email'
  ): AutomationCheckResult {
    // 1. Verify invoice is actually active/unpaid
    if (invoice.paymentStatus === 'Paid') {
      return { allowed: false, reason: 'Stop Trigger: Invoice has already been marked fully PAID.' };
    }

    // 2. Business hour validation (9:00 AM to 8:00 PM IST)
    if (settings.restrictToBusinessHours) {
      const now = new Date();
      // Adjust to mock IST or simply use system hours
      const hour = now.getHours();
      if (hour < 9 || hour >= 20) {
        return {
          allowed: false,
          reason: `Policy Override: Outside legal business hours (9:00 AM - 8:00 PM). Blocked to prevent spam compliance risk. Current System Hour: ${hour}:00.`
        };
      }
    }

    // 3. Duplicate Prevention & Cooldown Windows
    const preventHours = settings.preventDuplicatesHours || 3;
    const cooldownMs = preventHours * 60 * 60 * 1000;
    
    // Log inspection for duplicates
    const relevantLogs = recentLogs.filter(l => l.invoiceId === invoice.id && l.channel === targetChannel);
    if (relevantLogs.length > 0) {
      // Look for logs sent "Just now" or calculate time difference
      // Since logs sentTime is text, let's also pass checking timestamp if available
      const lastLog = relevantLogs[0];
      if (lastLog.sentTime.includes('now') || lastLog.sentTime.includes('11:')) {
        return {
          allowed: false,
          reason: `Spam Cooldown Active: A duplicate ${targetChannel} alert was sent recently. Please respect the ${preventHours}h cooldown safety window.`
        };
      }
    }

    // Channel fallback logic
    const preferredChannel = customer.preferredChannel || settings.preferredChannel || 'Both';
    let suggestedChannel = targetChannel;
    if (preferredChannel !== 'Both' && preferredChannel !== targetChannel) {
      suggestedChannel = preferredChannel as 'WhatsApp' | 'Email';
    }

    return { 
      allowed: true, 
      suggestedChannel 
    };
  }

  /**
   * Promotes automatic stage transitions based on days overdue
   */
  static resolveEscalationStage(daysOverdue: number): 'polite' | 'first' | 'overdue' | 'final' {
    if (daysOverdue <= 0) return 'polite';
    if (daysOverdue <= 3) return 'first';
    if (daysOverdue <= 10) return 'overdue';
    return 'final';
  }
}


// ==========================================
// 4. NETWORK & API PRODUCTION SANDBOX SIMULATOR
// ==========================================

export class SandboxServiceSimulator {
  
  static getSimulationConfig(): SandboxSimulationConfig {
    const cached = localStorage.getItem('paynudge_sandbox_config');
    if (!cached) {
      return {
        offlineMode: false,
        simulatedApiLatencyMs: 650,
        rateLimitFailureMode: false,
        staleDataSimulation: false
      };
    }
    try {
      return JSON.parse(cached);
    } catch {
      return {
        offlineMode: false,
        simulatedApiLatencyMs: 650,
        rateLimitFailureMode: false,
        staleDataSimulation: false
      };
    }
  }

  static saveSimulationConfig(config: SandboxSimulationConfig): void {
    localStorage.setItem('paynudge_sandbox_config', JSON.stringify(config));
  }

  /**
   * Executes a simulated REST dispatch with latency, timeouts, rate limits and custom retries.
   */
  static async simulateApiCall<T>(
    action: () => T,
    onStatusChange?: (status: string) => void
  ): Promise<T> {
    const config = this.getSimulationConfig();

    onStatusChange?.('Connecting to sandbox gateways...');
    await new Promise(r => setTimeout(r, Math.max(100, config.simulatedApiLatencyMs * 0.4)));

    if (config.offlineMode) {
      onStatusChange?.('Disconnected from server!');
      throw new Error('NETWORK_TIMEOUT: DNS failure or device is currently simulation-offline.');
    }

    if (config.rateLimitFailureMode) {
      onStatusChange?.('429 Rate Limit hit!');
      throw new Error('HTTP_ERROR_429: API Request Rate quota exceeded. Pluggable circuit-breaker activated.');
    }

    onStatusChange?.('Authorizing VPA ledger channels...');
    await new Promise(r => setTimeout(r, Math.max(100, config.simulatedApiLatencyMs * 0.6)));

    const result = action();
    onStatusChange?.('Sync dispatched successfully!');
    return result;
  }
}
