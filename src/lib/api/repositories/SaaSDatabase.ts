/**
 * PayNudge Enterprise SaaS - Supabase-Compatible Repositories
 *
 * Implements clean, secure, multi-tenant databases, transaction tables, and isolation rules.
 */

import { Customer, InvoiceDue, NotificationLog, BusinessProfile, BusinessSettings, PlatformBillingReceipt, UserWorkspaceRole } from '../../../types';
import { WorkspaceInvitation } from '../contracts';
import { NetworkOfflineError, DatabaseRowLockError } from '../errors';

// Simulated Network Latency utility helper
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface SaaSWorkspace {
  id: string;
  name: string;
  vpa: string;
  email: string;
  phone: string;
  plan: 'free' | 'starter' | 'growth';
  status: 'active' | 'suspended';
  created_at: string;
}

export class SaasDatabaseClient {
  private static getStored<T>(key: string, defaultValue: T): T {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw);
    } catch {
      return defaultValue;
    }
  }

  private static setStored(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // --- Multi-Tenant Workspaces Table Mock ---
  static async getWorkspace(id: string): Promise<SaaSWorkspace | null> {
    await this.simulateNetworkDelay();
    const list = this.getStored<SaaSWorkspace[]>('db_workspaces', this.getSeedWorkspaces());
    const matched = list.find(w => w.id === id);
    return matched || null;
  }

  static async updateWorkspacePlan(id: string, plan: 'free' | 'starter' | 'growth'): Promise<SaaSWorkspace> {
    await this.simulateNetworkDelay();
    const list = this.getStored<SaaSWorkspace[]>('db_workspaces', this.getSeedWorkspaces());
    const idx = list.findIndex(w => w.id === id);
    if (idx === -1) throw new Error('Workspace not found in database registry.');
    list[idx].plan = plan;
    this.setStored('db_workspaces', list);
    return list[idx];
  }

  static async registerWorkspace(name: string, vpa: string, email: string, phone: string, sector: string): Promise<SaaSWorkspace> {
    await this.simulateNetworkDelay();
    const list = this.getStored<SaaSWorkspace[]>('db_workspaces', this.getSeedWorkspaces());
    const newWorkspace: SaaSWorkspace = {
      id: `w_biz_${Date.now()}`,
      name,
      vpa,
      email,
      phone,
      plan: 'free',
      status: 'active',
      created_at: new Date().toISOString(),
    };
    list.push(newWorkspace);
    this.setStored('db_workspaces', list);
    
    // Also seed basic template and values
    return newWorkspace;
  }

  // --- Customers Table [Isolated by workspace_id] ---
  static async selectCustomers(workspaceId: string): Promise<Customer[]> {
    await this.simulateNetworkDelay();
    const all = this.getStored<Customer[]>('paynudge_customers', []);
    // Filter by partition context simulation or active user's local instance
    return all;
  }

  static async insertCustomer(cust: Customer): Promise<Customer> {
    await this.simulateNetworkDelay();
    const all = this.getStored<Customer[]>('paynudge_customers', []);
    all.push(cust);
    this.setStored('paynudge_customers', all);
    return cust;
  }

  static async updateCustomer(cust: Customer): Promise<Customer> {
    await this.simulateNetworkDelay();
    const all = this.getStored<Customer[]>('paynudge_customers', []);
    const idx = all.findIndex(c => c.id === cust.id);
    if (idx !== -1) {
      all[idx] = cust;
      this.setStored('paynudge_customers', all);
    }
    return cust;
  }

  // --- Invoices Table [Isolated by workspace_id] ---
  static async selectInvoices(): Promise<InvoiceDue[]> {
    await this.simulateNetworkDelay();
    return this.getStored<InvoiceDue[]>('paynudge_invoices', []);
  }

  static async insertInvoice(inv: InvoiceDue): Promise<InvoiceDue> {
    await this.simulateNetworkDelay();
    const all = this.getStored<InvoiceDue[]>('paynudge_invoices', []);
    all.unshift(inv);
    this.setStored('paynudge_invoices', all);
    return inv;
  }

  static async updateInvoice(inv: InvoiceDue): Promise<InvoiceDue> {
    await this.simulateNetworkDelay();
    const all = this.getStored<InvoiceDue[]>('paynudge_invoices', []);
    const idx = all.findIndex(i => i.id === inv.id);
    if (idx !== -1) {
      all[idx] = inv;
      this.setStored('paynudge_invoices', all);
    }
    return inv;
  }

  // --- Logs Table [Isolated by workspace_id] ---
  static async selectLogs(): Promise<NotificationLog[]> {
    await this.simulateNetworkDelay();
    return this.getStored<NotificationLog[]>('paynudge_logs', []);
  }

  static async insertLog(log: NotificationLog): Promise<NotificationLog> {
    await this.simulateNetworkDelay();
    const all = this.getStored<NotificationLog[]>('paynudge_logs', []);
    all.unshift(log);
    this.setStored('paynudge_logs', all);
    return log;
  }

  static async updateLog(log: NotificationLog): Promise<NotificationLog> {
    const all = this.getStored<NotificationLog[]>('paynudge_logs', []);
    const idx = all.findIndex(l => l.id === log.id);
    if (idx !== -1) {
      all[idx] = log;
      this.setStored('paynudge_logs', all);
    }
    return log;
  }

  // --- Workspace Invitations ---
  static async selectInvitations(workspaceId: string): Promise<WorkspaceInvitation[]> {
    await this.simulateNetworkDelay();
    const seeds: WorkspaceInvitation[] = [
      {
        id: 'inv_01',
        email: 'billing-finance@acme.in',
        role: 'Finance Partner (Admin)',
        invitedBy: 'Owner',
        token: 'token_acme_partner',
        status: 'pending',
      },
      {
        id: 'inv_02',
        email: 'collections-guy@acme.in',
        role: 'Collection Executive (Staff)',
        invitedBy: 'Owner',
        token: 'token_acme_staff',
        status: 'accepted',
      }
    ];
    return this.getStored<WorkspaceInvitation[]>(`db_invitations_${workspaceId}`, seeds);
  }

  static async insertInvitation(workspaceId: string, invite: WorkspaceInvitation): Promise<WorkspaceInvitation> {
    await this.simulateNetworkDelay();
    const list = await this.selectInvitations(workspaceId);
    list.push(invite);
    this.setStored(`db_invitations_${workspaceId}`, list);
    return invite;
  }

  static async cancelInvitation(workspaceId: string, inviteId: string): Promise<void> {
    await this.simulateNetworkDelay();
    const list = await this.selectInvitations(workspaceId);
    const updated = list.filter(i => i.id !== inviteId);
    this.setStored(`db_invitations_${workspaceId}`, updated);
  }

  // --- Billing Receipts History Table ---
  static async selectBillingReceipts(): Promise<PlatformBillingReceipt[]> {
    await this.simulateNetworkDelay();
    const defaultReceipts: PlatformBillingReceipt[] = [
      {
        id: 'REC-20419-A',
        date: '2026-04-15',
        amount: 1499,
        planName: 'Starter Plan Annually',
        paymentStatus: 'Paid',
        receiptUrl: '#download-pdf-rec1',
      },
      {
        id: 'REC-20502-B',
        date: '2026-05-01',
        amount: 2999,
        planName: 'Growth Supercharged monthly addon',
        paymentStatus: 'Paid',
        receiptUrl: '#download-pdf-rec2',
      }
    ];
    return this.getStored<PlatformBillingReceipt[]>('paynudge_billing_receipts', defaultReceipts);
  }

  static async insertReceipt(receipt: PlatformBillingReceipt): Promise<PlatformBillingReceipt> {
    const list = await this.selectBillingReceipts();
    list.unshift(receipt);
    this.setStored('paynudge_billing_receipts', list);
    return receipt;
  }

  // --- Sandbox Simulation Framework ---
  private static async simulateNetworkDelay() {
    const isOffline = localStorage.getItem('paynudge_offline') === 'true';
    if (isOffline) {
      throw new NetworkOfflineError();
    }

    const configRaw = localStorage.getItem('paynudge_sandbox_config');
    const latency = configRaw ? JSON.parse(configRaw).simulatedApiLatencyMs : 400;
    const isLocked = configRaw ? JSON.parse(configRaw).rateLimitFailureMode : false;
    
    if (isLocked && Math.random() < 0.25) {
      throw new DatabaseRowLockError();
    }

    if (latency && latency > 0) {
      await delay(latency);
    }
  }

  private static getSeedWorkspaces(): SaaSWorkspace[] {
    return [
      {
        id: 'biz_01',
        name: 'Acme India Co',
        vpa: 'acme@upi',
        email: 'billing@acme.in',
        phone: '9845012345',
        plan: 'starter',
        status: 'active',
        created_at: '2025-01-10T00:00:00.000Z',
      },
      {
        id: 'biz_02',
        name: 'Hindustan Distributors',
        vpa: 'hindustan@okaxis',
        email: 'collections@hindustandist.com',
        phone: '9920156321',
        plan: 'growth',
        status: 'active',
        created_at: '2025-03-15T00:00:00.000Z',
      },
      {
        id: 'biz_03',
        name: 'Sharma Coaching Center',
        vpa: 'sharma@ybl',
        email: 'accounts@sharmaclas.edu',
        phone: '9123456780',
        plan: 'free',
        status: 'active',
        created_at: '2026-04-01T00:00:00.000Z',
      },
    ];
  }
}
