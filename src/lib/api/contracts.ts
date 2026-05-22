/**
 * PayNudge Enterprise - API Request/Response Typed Contracts & Schema Validations
 *
 * Essential schemas for secure and strict data transactions matching Supabase requirements.
 */

import { Customer, InvoiceDue, WebSaaSPlan, UserWorkspaceRole } from '../../types';

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    statusCode: number;
    details?: any;
  };
  timestamp: string;
  latencyMs?: number;
}

// 1. Auth Contract Types
export interface SignUpRequest {
  businessName: string;
  email: string;
  phone: string;
  vpa: string;
  sector: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
  magicToken?: string;
}

export interface WorkspaceInvitation {
  id: string;
  email: string;
  role: UserWorkspaceRole;
  invitedBy: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
}

// 2. Data Entry Validation Controllers
export class APIValidator {
  static validateEmail(email: string): boolean {
    const rx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return rx.test(email);
  }

  static validateIndianPhone(phone: string): boolean {
    // Matches standard 10 digit numbers optionally starting with +91 or 91
    const rx = /^(?:\+?91)?[6-9]\d{9}$/;
    return rx.test(phone.replace(/[\s-]/g, ''));
  }

  static validateVPA(vpa: string): boolean {
    // Ensures basic UPI ID format like merchant@upi or user@okaxis
    const rx = /^[\w.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return rx.test(vpa);
  }

  static validateCustomer(cust: Partial<Customer>): string | null {
    if (!cust.name || cust.name.trim().length < 2) {
      return 'Client name is required and should be at least 2 characters long.';
    }
    if (!cust.phone || !this.validateIndianPhone(cust.phone)) {
      return 'Please specify a valid 10-digit Indian mobile number starting with 6-9.';
    }
    if (cust.email && !this.validateEmail(cust.email)) {
      return 'Please specify a valid email address style (e.g. contact@domain.com).';
    }
    return null;
  }

  static validateInvoice(inv: Partial<InvoiceDue>): string | null {
    if (!inv.id || inv.id.trim().length === 0) {
      return 'Invoice identification index is required.';
    }
    if (!inv.customerId) {
      return 'Client reference profile must be selected.';
    }
    if (inv.amount === undefined || isNaN(inv.amount) || inv.amount <= 0) {
      return 'The due ledger amount value must be a positive integer.';
    }
    if (!inv.dueDate || isNaN(Date.parse(inv.dueDate))) {
      return 'Please select a valid future date calendar target.';
    }
    return null;
  }
}
