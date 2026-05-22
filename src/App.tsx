import { useState, useEffect } from 'react';
import { 
  INITIAL_BUSINESS, 
  INITIAL_CUSTOMERS, 
  INITIAL_INVOICES, 
  INITIAL_TEMPLATES, 
  INITIAL_LOGS, 
  INITIAL_BUSINESS_WORKSPACE_LIST,
  getUPILink, 
  formatTemplate 
} from './data';
import { 
  BusinessProfile, 
  Customer, 
  InvoiceDue, 
  ReminderTemplate, 
  NotificationLog, 
  BusinessSettings,
  WebSaaSPlan,
  UserWorkspaceRole
} from './types';

// Icons represent Lucide
import { 
  LayoutDashboard, 
  Receipt, 
  Users, 
  FileCode, 
  History, 
  Settings, 
  Upload, 
  Plus, 
  LogOut, 
  Smartphone, 
  CheckCircle,
  HelpCircle,
  Bell,
  Menu,
  X,
  Sparkles,
  Terminal,
  DollarSign,
  ShieldAlert,
  AlertCircle,
  Search,
  Globe,
  Database,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

import LoginView from './components/LoginView';
import LandingPageView from './components/LandingPageView';
import DashboardView from './components/DashboardView';
import LedgerView from './components/LedgerView';
import RelationshipView from './components/RelationshipView';
import TemplatesView from './components/TemplatesView';
import AuditLogsView from './components/AuditLogsView';
import SettingsView from './components/SettingsView';
import ImportExportView from './components/ImportExportView';
import NewNudgeModal from './components/NewNudgeModal';
import SupportModal from './components/SupportModal';
import LegalPolicyModal from './components/LegalPolicyModal';
import FounderPortalView from './components/FounderPortalView';

// SaaS Core Modular Additions
import CommandPalette from './components/CommandPalette';
import AICopilotView from './components/AICopilotView';
import IntegrationsView from './components/IntegrationsView';
import BillingView from './components/BillingView';
import { SaaSController } from './lib/api/controllers/SaaSController';

export default function App() {
  const [apiRunning, setApiRunning] = useState(false);
  
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    const cached = localStorage.getItem('paynudge_theme');
    return (cached as 'light' | 'dark' | 'system') || 'system';
  });

  useEffect(() => {
    localStorage.setItem('paynudge_theme', theme);
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    const handleThemeUpdate = () => {
      let activeTheme = theme;
      if (theme === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        activeTheme = systemTheme;
      }
      root.classList.add(activeTheme);
    };

    handleThemeUpdate();

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  // Local storage persistence hydrated status checks
  const [profile, setProfile] = useState<BusinessProfile | null>(() => {
    const cached = localStorage.getItem('paynudge_profile');
    return cached ? JSON.parse(cached) : null;
  });

  const [showLanding, setShowLanding] = useState(() => {
    return !localStorage.getItem('paynudge_profile');
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const cached = localStorage.getItem('paynudge_customers');
    return cached ? JSON.parse(cached) : INITIAL_CUSTOMERS;
  });

  const [invoices, setInvoices] = useState<InvoiceDue[]>(() => {
    const cached = localStorage.getItem('paynudge_invoices');
    return cached ? JSON.parse(cached) : INITIAL_INVOICES;
  });

  const [templates, setTemplates] = useState<ReminderTemplate[]>(() => {
    const cached = localStorage.getItem('paynudge_templates');
    return cached ? JSON.parse(cached) : INITIAL_TEMPLATES;
  });

  const [logs, setLogs] = useState<NotificationLog[]>(() => {
    const cached = localStorage.getItem('paynudge_logs');
    return cached ? JSON.parse(cached) : INITIAL_LOGS;
  });

  const [settings, setSettings] = useState<BusinessSettings>(() => {
    const cached = localStorage.getItem('paynudge_settings');
    return cached ? JSON.parse(cached) : {
      autoSendBefore: true,
      daysBefore: 3,
      autoSendOnDue: true,
      autoSendOverdue: true,
      preferredChannel: 'WhatsApp',
    };
  });

  // Multi-Tenant RBAC & Simulation metrics
  const [currentPlan, setCurrentPlan] = useState<WebSaaSPlan>(() => {
    const cached = localStorage.getItem('paynudge_current_plan');
    return cached ? (cached as WebSaaSPlan) : 'free';
  });

  const [workspaceRole, setWorkspaceRole] = useState<UserWorkspaceRole>(() => {
    const cached = localStorage.getItem('paynudge_active_role');
    return cached ? (cached as UserWorkspaceRole) : 'Owner';
  });

  const [isOffline, setIsOffline] = useState(() => {
    const cached = localStorage.getItem('paynudge_offline');
    return cached ? cached === 'true' : false;
  });

  // Navigation panel controllers
  const [activeView, setActiveView] = useState<
    'dashboard' | 'ledger' | 'customers' | 'templates' | 'logs' | 'settings' | 'import' | 'copilot' | 'integrations' | 'billing' | 'founder'
  >('dashboard');
  
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust_01');
  const [isNewNudgeOpen, setIsNewNudgeOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [legalModalMode, setLegalModalMode] = useState<'none' | 'terms' | 'privacy'>('none');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [systemAnnouncement, setSystemAnnouncement] = useState(() => {
    return localStorage.getItem('paynudge_announcement') || '';
  });

  const handleUpdateAnnouncement = (text: string) => {
    setSystemAnnouncement(text);
    localStorage.setItem('paynudge_announcement', text);
    showToast(text ? '📢 System alert announcement updated.' : '📢 System alert announcement cleared.');
  };

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{
    invoiceId: string;
    amount: number;
    customerName: string;
  } | null>(null);

  // Settle local persistence registers
  useEffect(() => {
    if (profile) localStorage.setItem('paynudge_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('paynudge_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('paynudge_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('paynudge_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('paynudge_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('paynudge_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('paynudge_current_plan', currentPlan);
  }, [currentPlan]);

  useEffect(() => {
    localStorage.setItem('paynudge_active_role', workspaceRole);
  }, [workspaceRole]);

  useEffect(() => {
    localStorage.setItem('paynudge_offline', String(isOffline));
  }, [isOffline]);

  // Toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Auth logins handlers
  const handleLoginSuccess = (bizName: string, bizVpa: string, sector: string) => {
    const newProfile: BusinessProfile = {
      id: `biz_${Date.now()}`,
      name: bizName,
      vpa: bizVpa,
      mobile: '9876543210',
      sector: sector,
      verified: true,
    };
    setProfile(newProfile);
    setShowLanding(false);
    showToast(`Successfully logged into ${bizName} Sandbox!`);
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to log out of current workspace sandbox records?')) {
      localStorage.removeItem('paynudge_profile');
      setProfile(null);
      setShowLanding(true);
    }
  };

  // State Mutators with plan limit capabilities checks
  const handleAddInvoice = async (newInv: InvoiceDue) => {
    setApiRunning(true);
    const res = await SaaSController.createInvoice(newInv, workspaceRole);
    setApiRunning(false);

    if (res.success && res.data) {
      setInvoices(prev => [res.data!, ...prev]);
      showToast(`Registered due Invoice #${res.data.id} successfully (Latency: ${res.latencyMs}ms)!`);
    } else {
      showToast(`⚠️ API Error: ${res.error || 'Invoice registration failed.'}`);
    }
  };

  const handleAddCustomer = async (newCust: Customer) => {
    setApiRunning(true);
    const res = await SaaSController.createCustomer(newCust, workspaceRole, currentPlan, customers.length);
    setApiRunning(false);

    if (res.success && res.data) {
      setCustomers(prev => [...prev, res.data!]);
      setSelectedCustomerId(res.data.id);
      showToast(`Onboarded debtor: Risk ${res.data.aiRiskScore}/100 | Send Time: ${res.data.aiBestSendTime}`);
    } else {
      showToast(`⚠️ Core SaaS Guard: ${res.error}`);
    }
  };

  const handleAddLog = (newLog: NotificationLog) => {
    setLogs(prev => [newLog, ...prev]);
  };

  const handleUpdateCustomerNotes = async (cId: string, notes: string) => {
    setApiRunning(true);
    const res = await SaaSController.updateCustomerNotes(cId, notes, workspaceRole);
    setApiRunning(false);

    if (res.success && res.data) {
      setCustomers(prev => prev.map(c => c.id === cId ? res.data! : c));
      showToast('Client notes written. Intelligence re-evaluated!');
    } else {
      showToast(`⚠️ Notes update blocked: ${res.error}`);
    }
  };

  const handleSaveTemplate = (tId: string, subject: string, body: string, channel?: 'WhatsApp' | 'Email' | 'Both') => {
    setTemplates(prev => prev.map(t => t.id === tId ? { ...t, subject, body, channel } : t));
  };

  const handleCreateTemplate = (newTemplate: ReminderTemplate) => {
    setTemplates(prev => [...prev, newTemplate]);
  };

  const handleDeleteTemplate = (tId: string) => {
    setTemplates(prev => prev.filter(t => t.id !== tId));
  };

  const handleSaveProfile = (updatedProfile: BusinessProfile) => {
    setProfile(updatedProfile);
  };

  const handleSaveSettings = (updatedSettings: BusinessSettings) => {
    setSettings(updatedSettings);
  };

  const handleBulkImport = (newCusts: Customer[], newInvs: InvoiceDue[]) => {
    const limit = currentPlan === 'free' ? 5 : currentPlan === 'starter' ? 50 : 1000;
    if (customers.length + newCusts.length > limit) {
      showToast(`⚠️ Ingest Rejected! Sliced files exceed the remaining maximum capacity bounds of ${limit} debtors.`);
      return;
    }
    setCustomers(prev => [...prev, ...newCusts]);
    setInvoices(prev => [...newInvs, ...prev]);

    // Create automatic alert logs for imports
    const todayStr = new Date().toISOString().split('T')[0];
    const importLogs: NotificationLog[] = newInvs.map((inv, idx) => {
      const matchCust = newCusts[idx] || { name: 'Bulk Client' };
      const link = getUPILink(profile?.vpa || 'merchant@upi', profile?.name || 'PayNudge', inv.amount, inv.id);
      return {
        id: `import_log_${Date.now()}_${idx}`,
        invoiceId: inv.id,
        customerName: matchCust.name,
        channel: 'WhatsApp',
        sentTime: 'Just now (Imported)',
        status: 'Sent',
        messagePreview: `Greeting, invoice #${inv.id} for ₹${inv.amount.toLocaleString('en-IN')} outstanding is due on ${inv.dueDate}. Please clear at: ${link}`,
        upiLinkUsed: link,
      };
    });
    setLogs(prev => [...importLogs, ...prev]);
    showToast(`Bulk imported ${newCusts.length} client files seamlessly.`);
  };

  const handleMarkPaid = async (invoiceId: string) => {
    setApiRunning(true);
    const match = invoices.find(i => i.id === invoiceId);
    const targetAmt = match ? match.amount : 0;
    const res = await SaaSController.simulateIncomingWebhookPayment(invoiceId, targetAmt);
    setApiRunning(false);

    if (res.success) {
      setInvoices(prev => prev.map(inv => {
        if (inv.id === invoiceId) {
          return {
            ...inv,
            paymentStatus: 'Paid',
          };
        }
        return inv;
      }));

      const customer = customers.find(c => c.id === match?.customerId);
      const customerName = customer ? customer.name : 'Unknown Client';
      setCelebrationData({
        invoiceId,
        amount: targetAmt,
        customerName
      });
      setShowCelebration(true);
      showToast(`✓ Settled dynamically! Webhook acknowledged payment allocation of ₹${targetAmt.toLocaleString('en-IN')}.`);
    } else {
      showToast(`⚠️ Internal Webhook error: ${res.error}`);
    }
  };

  const handlePartialPayment = (invoiceId: string, paidAmount: number) => {
    let remaining = 0;
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        remaining = Math.max(0, inv.amount - paidAmount);
        return {
          ...inv,
          amount: remaining,
          paymentStatus: remaining === 0 ? 'Paid' : inv.paymentStatus,
          notes: remaining === 0 
            ? 'Installments settled in full!' 
            : `${inv.notes || ''} (Paid installment ₹${paidAmount.toLocaleString('en-IN')} via UPI, remaining ₹${remaining.toLocaleString('en-IN')})`
        };
      }
      return inv;
    }));

    // Generate notification log to represent that partial payment happened
    const targetInvoice = invoices.find(i => i.id === invoiceId);
    if (targetInvoice) {
      const customer = customers.find(c => c.id === targetInvoice.customerId);
      const customerName = customer ? customer.name : 'Client';
      const logId = `partial_payment_log_${Date.now()}`;
      setLogs(prev => [
        {
          id: logId,
          invoiceId: invoiceId,
          customerName: customerName,
          channel: 'WhatsApp',
          sentTime: 'Just now',
          status: 'Paid',
          messagePreview: `Payment Confirmed! Recorded partial payment tranche of ₹${paidAmount.toLocaleString('en-IN')} for INV #${invoiceId}. Remaining balance is ₹${(targetInvoice.amount - paidAmount).toLocaleString('en-IN')}. Recalculation reconciled!`,
          upiLinkUsed: 'bhim-upi-gateway'
        },
        ...prev
      ]);
    }

    showToast(`✓ Received partial installment payment of ₹${paidAmount.toLocaleString('en-IN')}! Balance recalculated.`);
  };

  const handleUpdateInvoice = (invoiceId: string, updates: Partial<InvoiceDue>) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === invoiceId) {
        return {
          ...inv,
          ...updates
        };
      }
      return inv;
    }));
    showToast(`✓ Ledger operational states synchronized successfully for invoice #${invoiceId}.`);
  };

  const handleTriggerSingleNudge = async (invoiceId: string, channel: 'WhatsApp' | 'Email') => {
    if (isOffline) {
      showToast(`⚠️ Connection Offline: Failed to dispatch ${channel} reminder to Invoice #${invoiceId}.`);
      return;
    }

    setApiRunning(true);
    const res = await SaaSController.triggerManualNudge(
      invoiceId,
      channel,
      workspaceRole,
      settings,
      logs,
      templates,
      profile?.vpa || 'merchant@upi',
      profile?.name || 'PayNudge'
    );
    setApiRunning(false);

    if (res.success && res.data) {
      setLogs(prev => [res.data!.log, ...prev]);
      setInvoices(prev => prev.map(i => i.id === invoiceId ? res.data!.updatedInvoice : i));
      showToast(`✓ Outbound message processed matching ${res.data.log.channel} credentials!`);
    } else {
      showToast(`❌ Restricted: ${res.error || 'Dispatch rules failed.'}`);
    }
  };

  // Interactive customer receipt simulator
  const handleTriggerCustomerActionSimulate = (logId: string) => {
    const targetLog = logs.find(l => l.id === logId);
    if (!targetLog) return;

    if (targetLog.status === 'Sent') {
      setLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'Delivered', sentTime: 'Just now (Delivered)' } : l));
      showToast(`Simulated Carrier: Message marked DELIVERED on ${targetLog.customerName}'s handset!`);
    } else if (targetLog.status === 'Delivered') {
      setLogs(prev => prev.map(l => l.id === logId ? { ...l, status: 'Read', sentTime: 'Just now (Read receipt)' } : l));
      showToast(`Simulated Handset: Double blue checkmark! ${targetLog.customerName} read reminder.`);
    } else if (targetLog.status === 'Read') {
      handleMarkPaid(targetLog.invoiceId);
    }
  };

  // Bulk process trigger for Dashboard KPI CTA
  const handleTriggerQuickNudgeAll = () => {
    const outstandingInvoices = invoices.filter(inv => inv.paymentStatus !== 'Paid');
    if (outstandingInvoices.length === 0) {
      showToast('All transaction accounts are settled! No reminders needed.');
      return;
    }

    if (confirm(`Do you want to dispatch simulated WhatsApp collection alerts to all ${outstandingInvoices.length} outstanding accounts?`)) {
      outstandingInvoices.forEach(inv => {
        handleTriggerSingleNudge(inv.id, 'WhatsApp');
      });
      showToast(`Broadcasted ${outstandingInvoices.length} automated alerts via WhatsApp.`);
    }
  };

  const handleSwitchWorkspaceRole = (role: UserWorkspaceRole) => {
    setWorkspaceRole(role);
    showToast(`Active RBAC Level transitioned to: ${role.toUpperCase()}`);
  };

  const handleLoadInvestorDemoDataset = () => {
    const demoCustomers: Customer[] = [
      {
        id: 'cust_demo_01',
        name: 'Sharma Goods Distributors (Delhi)',
        email: 'accounts@sharmadistributors.in',
        phone: '+91 98100 12345',
        tier: 'VIP',
        notes: 'Major B2B distributor of organic produce. Credit cycle can slip, prefers polite notices via WhatsApp.',
        avgCollectionDays: 18,
      },
      {
        id: 'cust_demo_02',
        name: 'Tiwari Sweets & Bakers (Jaipur)',
        email: 'info@tiwarisweets.com',
        phone: '+91 94140 22345',
        tier: 'Regular',
        notes: 'Local bakery chain. Settlement typically done within 7 days of delivery reminder.',
        avgCollectionDays: 6,
      },
      {
        id: 'cust_demo_03',
        name: 'Excel IIT Coaching Academy (Bangalore)',
        email: 'fees@excelacademy.edu.in',
        phone: '+91 80234 56780',
        tier: 'Regular',
        notes: 'Coaching center. Receives monthly reminders for student infrastructure contributions.',
        avgCollectionDays: 9,
      },
      {
        id: 'cust_demo_04',
        name: 'Vaidyan Clinic & Wellness (Kochi)',
        email: 'billing@vaidyanwellness.com',
        phone: '+91 48430 11223',
        tier: 'New',
        notes: 'Medical consulting and wellness hub. High consistency rate once payment links are generated.',
        avgCollectionDays: 4,
      },
      {
        id: 'cust_demo_05',
        name: 'Gupta Steel Fabrication (Ludhiana)',
        email: 'supplies@guptasteels.co.in',
        phone: '+91 98760 99990',
        tier: 'New',
        notes: 'Small engineering contractor. Requires legal language on reminders if overdue by more than 15 days.',
        avgCollectionDays: 20,
      },
      {
        id: 'cust_demo_06',
        name: 'Aditi Roy Freelance Studio (Kolkata)',
        email: 'aditi@roycreative.in',
        phone: '+91 33456 70100',
        tier: 'VIP',
        notes: 'Premium UI/UX and web consultancy. Settles via UPI instantly.',
        avgCollectionDays: 12,
      },
    ];

    const today = new Date().toISOString().split('T')[0];
    const prevDate10 = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const prevDate5 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const prevDate20 = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nextDate3 = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const nextDate8 = new Date(Date.now() + 8 * 24 * 60 * 60 * 1050).toISOString().split('T')[0];

    const demoInvoices: InvoiceDue[] = [
      {
        id: 'INV-DEMO-901',
        customerId: 'cust_demo_01',
        amount: 45000,
        dueDate: prevDate10,
        paymentStatus: 'Critical',
        createdDate: prevDate20,
        notes: 'Supply of organic flour and grain shipments (Batch #43)',
      },
      {
        id: 'INV-DEMO-902',
        customerId: 'cust_demo_02',
        amount: 8500,
        dueDate: today,
        paymentStatus: 'Active',
        createdDate: prevDate5,
        notes: 'Bulk confectionery orders (Deepavali Special Pre-sales)',
      },
      {
        id: 'INV-DEMO-903',
        customerId: 'cust_demo_03',
        amount: 14200,
        dueDate: nextDate3,
        paymentStatus: 'Upcoming',
        createdDate: prevDate5,
        notes: 'Syllabus textbooks printing and dispatch ledger accounts',
      },
      {
        id: 'INV-DEMO-904',
        customerId: 'cust_demo_04',
        amount: 6000,
        dueDate: prevDate5,
        paymentStatus: 'Paid',
        createdDate: prevDate20,
        notes: 'Maintenance & calibration of diagnostic labs equipment',
      },
      {
        id: 'INV-DEMO-905',
        customerId: 'cust_demo_05',
        amount: 120000,
        dueDate: prevDate20,
        paymentStatus: 'Critical',
        createdDate: prevDate20,
        notes: 'Contract payment for structural steel reinforcements',
      },
      {
        id: 'INV-DEMO-006',
        customerId: 'cust_demo_06',
        amount: 25000,
        dueDate: nextDate8,
        paymentStatus: 'Paid',
        createdDate: prevDate10,
        notes: 'Interactive mobile app screen animations handoff commission',
      }
    ];

    const demoLogs: NotificationLog[] = [
      {
        id: 'log_demo_1',
        invoiceId: 'INV-DEMO-901',
        customerName: 'Sharma Goods Distributors (Delhi)',
        channel: 'WhatsApp',
        sentTime: '2 hours ago',
        status: 'Read',
        messagePreview: 'Hi Sharma Goods Distributors, payment for INV-DEMO-901 of ₹45,000 is due. Pls settle.',
        upiLinkUsed: 'merchant@upi'
      },
      {
        id: 'log_demo_2',
        invoiceId: 'INV-DEMO-905',
        customerName: 'Gupta Steel Fabrication (Ludhiana)',
        channel: 'Email',
        sentTime: '1 day ago',
        status: 'Delivered',
        messagePreview: 'Official notice regarding severe overdue billing balance: INV-DEMO-905 amount ₹1,20,000.',
        upiLinkUsed: 'merchant@upi'
      },
      {
        id: 'log_demo_3',
        invoiceId: 'INV-DEMO-904',
        customerName: 'Vaidyan Clinic & Wellness (Kochi)',
        channel: 'WhatsApp',
        sentTime: '3 days ago',
        status: 'Paid',
        messagePreview: 'Thank you Vaidyan Clinic! Payment of ₹6,000 successfully recorded via BHIM-UPI.',
        upiLinkUsed: 'merchant@upi'
      }
    ];

    setCustomers(demoCustomers);
    setInvoices(demoInvoices);
    setLogs(demoLogs);
    showToast('⚡ Dynamic Investor Demo Workspace generated successfully! Welcome to PayNudge.');
  };

  const handleWipeRestorePristine = () => {
    setCustomers([]);
    setInvoices([]);
    setLogs([]);
    showToast('🗑️ Active workspace reset to Pristine empty onboarding mode. Click "Add" or "Demo" to begin!');
  };

  const handleResetWorkspaceData = (scenario: 'fresh' | 'crisis' | 'scale') => {
    if (scenario === 'fresh') {
      setCustomers([]);
      setInvoices([]);
      setLogs([]);
      localStorage.setItem('paynudge_customers', JSON.stringify([]));
      localStorage.setItem('paynudge_invoices', JSON.stringify([]));
      localStorage.setItem('paynudge_logs', JSON.stringify([]));
      setCurrentPlan('free');
      localStorage.setItem('paynudge_current_plan', 'free');
      showToast('🗑️ Active workspace reset to Pristine empty onboarding mode.');
    } else if (scenario === 'crisis') {
      const crisisCustomers: Customer[] = [
        {
          id: 'cust_crisis_1',
          name: 'Sharma Goods Distributors (Delhi)',
          email: 'accounts@sharmadistributors.in',
          phone: '+91 98100 12345',
          tier: 'VIP',
          notes: 'High aging receivables. Slip-ups require urgent follow-ups.',
          avgCollectionDays: 28,
        },
        {
          id: 'cust_crisis_2',
          name: 'Gupta Steel Fabrication (Ludhiana)',
          email: 'supplies@guptasteels.co.in',
          phone: '+91 98760 99990',
          tier: 'New',
          notes: 'Major backlog supplier. Legally strict template language suggested.',
          avgCollectionDays: 24,
        },
        {
          id: 'cust_crisis_3',
          name: 'Tiwari Sweets & Bakers (Jaipur)',
          email: 'info@tiwarisweets.com',
          phone: '+91 94140 22345',
          tier: 'Regular',
          notes: 'Consistent, just needs polite invoice notice.',
          avgCollectionDays: 7,
        }
      ];

      const today = new Date().toISOString().split('T')[0];
      const prevDate30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const prevDate20 = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const prevDate5 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const crisisInvoices: InvoiceDue[] = [
        {
          id: 'INV-CRISIS-001',
          customerId: 'cust_crisis_1',
          amount: 85000,
          dueDate: prevDate30,
          paymentStatus: 'Critical',
          createdDate: prevDate30,
          notes: 'Severe overdue batch shipping receivables.',
        },
        {
          id: 'INV-CRISIS-002',
          customerId: 'cust_crisis_2',
          amount: 140000,
          dueDate: prevDate20,
          paymentStatus: 'Critical',
          createdDate: prevDate20,
          notes: 'Structural steel support fabrication milestone.',
        },
        {
          id: 'INV-CRISIS-003',
          customerId: 'cust_crisis_3',
          amount: 15000,
          dueDate: prevDate5,
          paymentStatus: 'Critical',
          createdDate: prevDate5,
          notes: 'Confectionery supplies & butter deliveries.',
        }
      ];

      const crisisLogs: NotificationLog[] = [
        {
          id: 'log_crisis_1',
          invoiceId: 'INV-CRISIS-001',
          customerName: 'Sharma Goods Distributors (Delhi)',
          channel: 'WhatsApp',
          sentTime: '3 days ago',
          status: 'Read',
          messagePreview: 'Hi Sharma Goods Distributors, payment for INV-CRISIS-001 of ₹85,000 is 30 days overdue.',
          upiLinkUsed: 'merchant@upi'
        },
        {
          id: 'log_crisis_2',
          invoiceId: 'INV-CRISIS-002',
          customerName: 'Gupta Steel Fabrication (Ludhiana)',
          channel: 'Email',
          sentTime: '1 day ago',
          status: 'Delivered',
          messagePreview: 'URGENT NOTICE: Overdue invoice INV-CRISIS-002 of ₹1,40,000.',
          upiLinkUsed: 'merchant@upi'
        }
      ];

      setCustomers(crisisCustomers);
      setInvoices(crisisInvoices);
      setLogs(crisisLogs);
      localStorage.setItem('paynudge_customers', JSON.stringify(crisisCustomers));
      localStorage.setItem('paynudge_invoices', JSON.stringify(crisisInvoices));
      localStorage.setItem('paynudge_logs', JSON.stringify(crisisLogs));
      setCurrentPlan('starter');
      localStorage.setItem('paynudge_current_plan', 'starter');
      showToast('⚠️ Overdue Crisis demo environment seeded successfully.');
    } else if (scenario === 'scale') {
      const scaleCustomers: Customer[] = [
        {
          id: 'cust_scale_1',
          name: 'Sharma Goods Distributors (Delhi)',
          email: 'accounts@sharmadistributors.in',
          phone: '+91 98100 12345',
          tier: 'VIP',
          notes: 'High volume wholesale distributor.',
          avgCollectionDays: 14,
        },
        {
          id: 'cust_scale_2',
          name: 'Gupta Steel Fabrication (Ludhiana)',
          email: 'supplies@guptasteels.co.in',
          phone: '+91 98760 99990',
          tier: 'Regular',
          notes: 'Standard fabrication shop.',
          avgCollectionDays: 10,
        },
        {
          id: 'cust_scale_3',
          name: 'Tiwari Sweets & Bakers (Jaipur)',
          email: 'info@tiwarisweets.com',
          phone: '+91 94140 22345',
          tier: 'Regular',
          notes: 'Regional sweets manufacturer.',
          avgCollectionDays: 6,
        },
        {
          id: 'cust_scale_4',
          name: 'Vaidyan Clinic & Wellness (Kochi)',
          email: 'billing@vaidyanwellness.com',
          phone: '+91 48430 11223',
          tier: 'Regular',
          notes: 'Kochi branch accounts.',
          avgCollectionDays: 4,
        }
      ];

      const today = new Date().toISOString().split('T')[0];
      const prevDate15 = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const prevDate5 = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const scaleInvoices: InvoiceDue[] = [
        {
          id: 'INV-SCALE-001',
          customerId: 'cust_scale_1',
          amount: 150000,
          dueDate: prevDate15,
          paymentStatus: 'Paid',
          createdDate: prevDate15,
          notes: 'Steel rebar supplies batch B4.',
        },
        {
          id: 'INV-SCALE-002',
          customerId: 'cust_scale_2',
          amount: 85000,
          dueDate: prevDate15,
          paymentStatus: 'Paid',
          createdDate: prevDate15,
          notes: 'Welding fixtures calibration contract.',
        },
        {
          id: 'INV-SCALE-003',
          customerId: 'cust_scale_3',
          amount: 45000,
          dueDate: prevDate15,
          paymentStatus: 'Paid',
          createdDate: prevDate15,
          notes: 'Bakery flour delivery.',
        },
        {
          id: 'INV-SCALE-004',
          customerId: 'cust_scale_4',
          amount: 60000,
          dueDate: prevDate5,
          paymentStatus: 'Paid',
          createdDate: prevDate5,
          notes: 'Clinical lab automation license.',
        },
        {
          id: 'INV-SCALE-005',
          customerId: 'cust_scale_1',
          amount: 110000,
          dueDate: prevDate5,
          paymentStatus: 'Paid',
          createdDate: prevDate5,
          notes: 'Logistics cargo invoice.',
        },
        {
          id: 'INV-SCALE-006',
          customerId: 'cust_scale_3',
          amount: 25000,
          dueDate: today,
          paymentStatus: 'Active',
          createdDate: prevDate5,
          notes: 'Milk dairy products supplies.',
        }
      ];

      const scaleLogs: NotificationLog[] = [
        {
          id: 'log_scale_1',
          invoiceId: 'INV-SCALE-001',
          customerName: 'Sharma Goods Distributors (Delhi)',
          channel: 'WhatsApp',
          sentTime: '10 days ago',
          status: 'Paid',
          messagePreview: 'Thank you! Payment of ₹1,50,000 recorded via BHIM-UPI.',
          upiLinkUsed: 'merchant@upi'
        },
        {
          id: 'log_scale_2',
          invoiceId: 'INV-SCALE-004',
          customerName: 'Vaidyan Clinic & Wellness (Kochi)',
          channel: 'WhatsApp',
          sentTime: '3 days ago',
          status: 'Paid',
          messagePreview: 'Thank you! Payment of ₹60,000 successfully settled.',
          upiLinkUsed: 'merchant@upi'
        }
      ];

      setCustomers(scaleCustomers);
      setInvoices(scaleInvoices);
      setLogs(scaleLogs);
      localStorage.setItem('paynudge_customers', JSON.stringify(scaleCustomers));
      localStorage.setItem('paynudge_invoices', JSON.stringify(scaleInvoices));
      localStorage.setItem('paynudge_logs', JSON.stringify(scaleLogs));
      setCurrentPlan('starter');
      localStorage.setItem('paynudge_current_plan', 'starter');
      showToast('🚀 Scale Success demo environment seeded successfully.');
    }
  };

  // Dynamic Cash collected calculation for sidebar visual ticker code
  const cashCollectedTotal = invoices
    .filter(i => i.paymentStatus === 'Paid')
    .reduce((sum, curr) => sum + curr.amount, 0);

  const notificationsCount = logs.length;

  if (showLanding) {
    return (
      <LandingPageView 
        onStartOnboarding={() => setShowLanding(false)} 
        onLaunchDemo={() => handleLoginSuccess('Acme Corp', 'merchant@upi', 'Tuition & Coaching')} 
        onOpenTerms={() => setLegalModalMode('terms')}
        onOpenPrivacy={() => setLegalModalMode('privacy')}
      />
    );
  }

  if (!profile) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="bg-canvas text-text-primary min-h-screen font-sans flex flex-col lg:flex-row relative transition-colors duration-350 select-none">
      
      {/* Keyboard global spotlights setup */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigateToView={(view) => {
          setActiveView(view);
          setIsMobileMenuOpen(false);
        }}
        onSwitchRole={handleSwitchWorkspaceRole}
        onToggleOffline={() => {
          setIsOffline(!isOffline);
          showToast(`Gateway simulator toggled! Internet Online: ${String(!isOffline).toUpperCase()}`);
        }}
        isOffline={isOffline}
        businessName={profile.name}
      />

      {/* LEFT SideNavBar Sidebar panel */}
      <nav className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 bg-panel border-r border-border-subtle p-5 space-y-4 overflow-y-auto z-40 transition-colors duration-350">
        
        {/* Header branding logo */}
        <div className="flex items-center gap-2.5 px-2 pt-2">
          <div className="w-9 h-9 bg-accent rounded-xl flex items-center justify-center text-white shadow-xs">
            <span className="font-extrabold text-base leading-none">PN</span>
          </div>
          <div>
            <h1 className="font-sans text-xl font-black text-accent tracking-tight">PayNudge</h1>
            <p className="text-[10px] text-text-secondary font-mono leading-none font-bold">Collections Sandbox</p>
          </div>
        </div>

        {/* Dynamic Multi-workspace swapper dropdown */}
        <div className="space-y-1 bg-card p-3 rounded-2xl border border-border-subtle shadow-xs transition-colors duration-350">
          <span className="text-[9px] font-extrabold uppercase text-text-secondary block mb-1">Active business tenant</span>
          <select
            value={profile.id}
            onChange={(e) => {
              const found = INITIAL_BUSINESS_WORKSPACE_LIST.find(b => b.id === e.target.value);
              if (found) {
                setProfile(found);
                showToast(`Switched active workspace to: ${found.name}`);
              }
            }}
            className="w-full bg-input hover:bg-card-hover border border-border-medium text-xs font-bold font-sans rounded-lg outline-none cursor-pointer p-1.5 text-text-primary transition-colors"
          >
            {INITIAL_BUSINESS_WORKSPACE_LIST.map(b => (
              <option key={b.id} value={b.id} className="bg-card text-text-primary">{b.name}</option>
            ))}
          </select>
        </div>

        {/* Dynamic navigation links checklist menu */}
        <div className="flex-grow space-y-0.5 pt-1 overflow-y-auto">
          
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary/65 block px-3 py-1.5">Receiver ledger</span>

          {/* Tab 1: Dashboard overview */}
          <button
            type="button"
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeView === 'dashboard' ? 'bg-accent text-white shadow-xs' : 'text-text-secondary hover:bg-card hover:text-text-primary'}`}
          >
            <LayoutDashboard className="w-4 h-4" /> Overview Dashboard
          </button>

          {/* Tab 2: Ledger client dues database list */}
          <button
            type="button"
            onClick={() => setActiveView('ledger')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeView === 'ledger' ? 'bg-accent text-white shadow-xs' : 'text-text-secondary hover:bg-card hover:text-text-primary'}`}
          >
            <Receipt className="w-4 h-4" /> Receivables Ledger
          </button>

          {/* Tab 3: Customer profile detail files sheet */}
          <button
            type="button"
            onClick={() => setActiveView('customers')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeView === 'customers' ? 'bg-accent text-white shadow-xs' : 'text-text-secondary hover:bg-card hover:text-text-primary'}`}
          >
            <Users className="w-4 h-4" /> Debtors Directory
          </button>

          <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary/65 block px-3 py-1.5 mt-3">Intelligent sequence</span>

          {/* Tab 4: AI Collections Copilot */}
          <button
            type="button"
            onClick={() => setActiveView('copilot')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeView === 'copilot' ? 'bg-accent text-white shadow-xs' : 'text-text-secondary hover:bg-card hover:text-text-primary'}`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> AI Copilot Companion
          </button>

          {/* Tab 5: Customize polite alert templates system */}
          <button
            type="button"
            onClick={() => setActiveView('templates')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeView === 'templates' ? 'bg-accent text-white shadow-xs' : 'text-text-secondary hover:bg-card hover:text-text-primary'}`}
          >
            <FileCode className="w-4 h-4" /> Nudge Templates
          </button>

          {/* Tab 6: Audit logs */}
          <button
            type="button"
            onClick={() => setActiveView('logs')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeView === 'logs' ? 'bg-accent text-white shadow-xs' : 'text-text-secondary hover:bg-card hover:text-text-primary'}`}
          >
            <History className="w-4 h-4" /> Delivery Audit logs
          </button>

          <span className="text-[10px] font-extrabold uppercase tracking-widest text-text-secondary/65 block px-3 py-1.5 mt-3">Fintech settings</span>

          {/* Tab 7: Gateway API configuration */}
          <button
            type="button"
            onClick={() => setActiveView('integrations')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeView === 'integrations' ? 'bg-accent text-white shadow-xs' : 'text-text-secondary hover:bg-card hover:text-text-primary'}`}
          >
            <Terminal className="w-4 h-4" /> API & Integrations
          </button>

          {/* Tab 8: Billing plans and limits */}
          <button
            type="button"
            onClick={() => setActiveView('billing')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeView === 'billing' ? 'bg-accent text-white shadow-xs' : 'text-text-secondary hover:bg-card hover:text-text-primary'}`}
          >
            <DollarSign className="w-4 h-4" /> Billing & Quotas
          </button>

          {/* Tab 9: Configurations config keys */}
          <button
            type="button"
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeView === 'settings' ? 'bg-accent text-white shadow-xs' : 'text-text-secondary hover:bg-card hover:text-text-primary'}`}
          >
            <Settings className="w-4 h-4" /> System Settings
          </button>

          {/* Tab 10: Founder & GTM Console */}
          <button
            type="button"
            onClick={() => setActiveView('founder')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeView === 'founder' ? 'bg-amber-500 text-black shadow-xs' : 'text-text-secondary hover:bg-card hover:text-text-primary'}`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" /> Founder & GTM Console
          </button>

          {/* Landing page link */}
          <button
            type="button"
            onClick={() => setShowLanding(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-text-secondary hover:bg-card hover:text-text-primary transition-all cursor-pointer"
          >
            <Globe className="w-4 h-4" /> View Landing Page
          </button>

          {/* Support help center button */}
          <button
            type="button"
            onClick={() => setIsSupportOpen(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-text-secondary hover:bg-card hover:text-text-primary transition-all cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-[#3525cd]" /> Customer Support Desk
          </button>
        </div>

        {/* Sidebar ticker widgets */}
        <div className="bg-card p-3.5 rounded-2xl border border-border-subtle flex flex-col justify-between shadow-xs transition-colors duration-350">
          <span className="text-[10px] font-extrabold uppercase text-text-secondary">Sandbox Collections</span>
          <div className="text-xl font-black text-text-primary font-mono mt-0.5">₹{cashCollectedTotal.toLocaleString('en-IN')}</div>
          <span className="text-[9px] text-emerald-500 dark:text-emerald-450 font-bold mt-1 inline-flex items-center gap-1 leading-none">
            ✓ Gateway Online
          </span>
        </div>

        {/* Logouts */}
        <div className="pt-2 border-t border-border-subtle">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-text-secondary hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Clear active session
          </button>
        </div>
      </nav>

      {/* MOBILE Layout Header banner */}
      <header className="lg:hidden w-full bg-panel border-b border-border-subtle p-4 sticky top-0 z-50 flex items-center justify-between shadow-xs transition-colors duration-350">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white">
            <span className="font-extrabold text-sm leading-none">PN</span>
          </div>
          <span className="font-black text-lg text-accent">{profile.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsNewNudgeOpen(true)}
            className="p-1 px-3 bg-accent text-white rounded-lg text-xs font-bold leading-none cursor-pointer h-8 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Nudge
          </button>
          
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-text-primary bg-card rounded-lg border border-border-medium hover:text-accent hover:border-accent transition-colors h-8 w-8 flex items-center justify-center"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu Overlays */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-y-16 inset-x-0 bg-panel border-b border-border-subtle z-45 p-6 flex flex-col gap-3 justify-start overflow-y-auto max-h-[70vh] shadow-lg animate-nudge transition-colors duration-350">
          
          {/* Mobile Theme Selector */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-3 mb-2">
            <span className="text-[10px] font-extrabold uppercase text-text-secondary">App Appearance</span>
            <div className="flex items-center gap-0.5 bg-input p-1 rounded-xl border border-border-medium">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === 'light' ? 'bg-card text-accent border border-border-subtle shadow-xs' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <Sun className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === 'dark' ? 'bg-card text-accent border border-border-subtle shadow-xs' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <Moon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === 'system' ? 'bg-card text-text-primary border border-border-subtle shadow-xs' : 'text-text-secondary hover:text-text-primary'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { setActiveView('dashboard'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left py-2 font-bold focus:outline-hidden ${activeView === 'dashboard' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Collections Overview
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('ledger'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left py-2 font-bold focus:outline-hidden ${activeView === 'ledger' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Receivables Ledger
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('customers'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left py-2 font-bold focus:outline-hidden ${activeView === 'customers' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Relationship Overview
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('copilot'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left py-2 font-bold focus:outline-hidden ${activeView === 'copilot' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
          >
            AI Copilot Companion
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('templates'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left py-2 font-bold focus:outline-hidden ${activeView === 'templates' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Nudge Templates
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('logs'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left py-2 font-bold focus:outline-hidden ${activeView === 'logs' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Delivery Audit logs
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('integrations'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left py-2 font-bold focus:outline-hidden ${activeView === 'integrations' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
          >
            API & Integrations
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('billing'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left py-2 font-bold focus:outline-hidden ${activeView === 'billing' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Billing & Quotas
          </button>
          <button
            type="button"
            onClick={() => { setActiveView('founder'); setIsMobileMenuOpen(false); }}
            className={`w-full text-left py-2 font-bold focus:outline-hidden ${activeView === 'founder' ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}`}
          >
            Founder & GTM Console
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full text-left py-2 font-bold text-red-500 focus:outline-hidden border-t border-border-subtle mt-4"
          >
            Logout session
          </button>
        </div>
      )}

      {/* MAIN Content Area canvas */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        
        {/* Connection Offline Status Alert Ribbon */}
        {isOffline && (
          <div className="bg-amber-500 text-black font-semibold text-xs py-2 px-4 flex items-center justify-between shadow-md select-none">
            <span className="flex items-center gap-1.5 animate-pulse">
              <ShieldAlert className="w-4 h-4 text-black" /> OFFLINE MODE: Direct cellular carriers / messaging microservices simulation disconnected.
            </span>
            <button 
              onClick={() => {
                setIsOffline(false);
                showToast('SMS and Email carrier gateways online.');
              }}
              className="bg-black text-white hover:bg-zinc-900 rounded p-1 px-3 text-[10px] font-bold"
            >
              Go Online
            </button>
          </div>
        )}

        {/* Desktop header bar */}
        <header className="hidden lg:flex justify-between items-center px-8 py-4 w-full sticky top-0 z-30 bg-card border-b border-border-subtle shadow-xs transition-colors duration-350">
          {/* Global search launcher spot */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2 bg-input hover:bg-card-hover border border-border-medium text-xs text-text-secondary font-semibold p-2 px-5 rounded-2xl w-72 text-left transition-colors relative"
            >
              <Search className="w-4 h-4 text-accent" />
              <span>Search & Commands... (Ctrl+K)</span>
              <kbd className="absolute right-3 bg-card border border-border-medium p-0.5 px-1 rounded text-[9px] font-mono select-none text-text-secondary">Ctrl+K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-5">
            {/* Elegant Segmented Theme Control */}
            <div className="flex items-center gap-0.5 bg-input p-1 rounded-xl border border-border-medium">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === 'light' ? 'bg-card text-accent border border-border-subtle shadow-xs scale-105' : 'text-text-secondary hover:text-text-primary'}`}
                title="Light Theme Mode"
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === 'dark' ? 'bg-card text-accent border border-border-subtle shadow-xs scale-105' : 'text-text-secondary hover:text-text-primary'}`}
                title="Premium Graphite Dark Theme"
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${theme === 'system' ? 'bg-card text-text-primary border border-border-subtle shadow-xs scale-105' : 'text-text-secondary hover:text-text-primary'}`}
                title="Follow System Preferences"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* RBAC Role Swapper quick access badge */}
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-extrabold uppercase text-text-secondary">active role:</span>
              <select
                value={workspaceRole}
                onChange={(e) => handleSwitchWorkspaceRole(e.target.value as any)}
                className={`p-1 px-2.5 rounded-full text-[10px] font-black border transition-all cursor-pointer ${
                  workspaceRole === 'Owner' ? 'bg-indigo-50/50 dark:bg-indigo-950/40 text-accent border-accent/25' :
                  workspaceRole === 'Finance Partner (Admin)' ? 'bg-blue-50/50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-400/25' :
                  'bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 border-zinc-350/50'
                }`}
              >
                <option value="Owner" className="bg-card text-text-primary">👑 Owner (Full Access)</option>
                <option value="Finance Partner (Admin)" className="bg-card text-text-primary">💼 Finance Admin</option>
                <option value="Collection Executive (Staff)" className="bg-card text-text-primary">📄 Staff Executive</option>
              </select>
            </div>

            {/* Quick launcher action trigger button */}
            <button 
              type="button"
              onClick={() => setIsNewNudgeOpen(true)}
              className="px-4 py-2 bg-accent hover:bg-accent/85 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Due Invoice
            </button>

            {/* Micro Notifications badge alerts checks */}
            <button 
              type="button"
              onClick={() => setActiveView('logs')}
              className="text-text-primary hover:text-accent hover:bg-accent-light p-2 rounded-full transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full animate-bounce"></span>
            </button>

            <img
              alt="Merchant avatar"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2oRx1fD0ORv2hxXRVprFuw70Pd12INdwwEoBYPoajCRBxfwzgKIwrWSsMDApT4mFAqQafYr58yTiSYZYx2-Tu9AJCICAl4k3G_BY5JmppyJjtghkbx12G87ZPCAmzuyfWe2ZJrcWSn0HeubuN_cGp8_PzvGF7sA1CWD8ODw-SA4NbzulXUwnnu0vCZcfgchBRieND_T6zxaU3ebB5DhPlnIK4SZqj24W4UxfJw_Wft8zXrpprRETIKvCJOGhx5e2x-4SjtfftAPY"
              className="w-9 h-9 rounded-full border border-border-medium shadow-xs"
            />
          </div>
        </header>

        {/* Global floating toast feedback widget */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 bg-zinc-900 border border-zinc-800 text-white p-3.5 px-5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-6 duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Dynamic Inner Workspace Panel View Render */}
        <div className="p-4 lg:p-8 flex-grow max-w-7xl w-full mx-auto pb-24 relative">
          
          {/* Shimmer progress loading bar */}
          {apiRunning && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#3525cd] via-pink-400 to-[#25D366] animate-pulse z-50 rounded-full"></div>
          )}
          
          {/* Active System Announcement Banner */}
          {systemAnnouncement && (
            <div className="mb-6 bg-amber-500 text-black font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-between shadow-xs border border-amber-600/20">
              <span className="flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-black shrink-0 animate-pulse" />
                <span>{systemAnnouncement}</span>
              </span>
              <button 
                onClick={() => setSystemAnnouncement('')}
                className="text-black/60 hover:text-black font-bold text-[10px] bg-transparent border-0 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {/* Active view selectors */}
          {activeView === 'dashboard' && (
            <DashboardView
              invoices={invoices}
              customers={customers}
              logs={logs}
              onTriggerQuickNudgeAll={handleTriggerQuickNudgeAll}
              onNavigateToView={(v) => setActiveView(v as any)}
              onSelectCustomer={(id) => setSelectedCustomerId(id)}
              onMarkPaid={handleMarkPaid}
              onLoadInvestorDemo={handleLoadInvestorDemoDataset}
              onWipeWorkspace={handleWipeRestorePristine}
              onLaunchNewNudge={() => setIsNewNudgeOpen(true)}
            />
          )}

          {activeView === 'ledger' && (
            <LedgerView
              invoices={invoices}
              customers={customers}
              onTriggerSingleNudge={handleTriggerSingleNudge}
              onMarkPaid={handleMarkPaid}
              onPartialPayment={handlePartialPayment}
              onUpdateInvoice={handleUpdateInvoice}
              businessVpa={profile.vpa}
              businessName={profile.name}
            />
          )}

          {activeView === 'customers' && (
            <RelationshipView
              customers={customers}
              invoices={invoices}
              logs={logs}
              selectedCustomerId={selectedCustomerId}
              onSelectCustomerId={(id) => setSelectedCustomerId(id)}
              onUpdateCustomerNotes={handleUpdateCustomerNotes}
              onTriggerSingleNudge={handleTriggerSingleNudge}
              onPartialPayment={handlePartialPayment}
              onUpdateInvoice={handleUpdateInvoice}
              businessVpa={profile.vpa}
              businessName={profile.name}
            />
          )}

          {activeView === 'copilot' && (
            <AICopilotView
              customers={customers}
              invoices={invoices}
              businessVpa={profile.vpa}
              businessName={profile.name}
            />
          )}

          {activeView === 'templates' && (
            <TemplatesView
              templates={templates}
              onSaveTemplate={handleSaveTemplate}
              onCreateTemplate={handleCreateTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              businessVpa={profile.vpa}
              businessName={profile.name}
            />
          )}

          {activeView === 'logs' && (
            <AuditLogsView
              logs={logs}
              onTriggerCustomerActionSimulate={handleTriggerCustomerActionSimulate}
              invoices={invoices}
            />
          )}

          {activeView === 'integrations' && (
            <div className="relative">
              {/* If workspaceRole is Staff, render restriction shield layer */}
              {workspaceRole === 'Collection Executive (Staff)' && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-30 flex flex-col items-center justify-center text-center p-8 border border-rose-150 rounded-2xl h-[450px]">
                  <ShieldAlert className="w-12 h-12 text-[#3525cd] mb-2 animate-bounce" />
                  <h4 className="text-sm font-black text-zinc-900 uppercase">Gateway Configurations Locked</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mt-1">
                    Your account has active <strong>Collection Executive (Staff)</strong> permissions. Modifying live Meta API endpoints or carrier master keys is restricted to Owners.
                  </p>
                  <button 
                    onClick={() => handleSwitchWorkspaceRole('Owner')}
                    className="mt-4 p-2 px-5 bg-[#3525cd] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
                  >
                    Act as Owner
                  </button>
                </div>
              )}
              <IntegrationsView
                onTriggerWebhookSettle={handleMarkPaid}
                unpaidInvoiceIds={invoices.filter(i => i.paymentStatus !== 'Paid').map(i => i.id)}
              />
            </div>
          )}

          {activeView === 'billing' && (
            <BillingView
              currentPlan={currentPlan}
              onUpgradePlan={(plan) => {
                setCurrentPlan(plan);
                showToast(`SaaS Workspace subscription changed to: ${plan.toUpperCase()}`);
              }}
              activeCustomersCount={customers.length}
              remindersSentCount={logs.filter(l => l.status === 'Sent' || l.status === 'Delivered').length}
            />
          )}

          {activeView === 'import' && (
            <ImportExportView
              onBulkImport={handleBulkImport}
            />
          )}

          {activeView === 'settings' && (
            <SettingsView
              profile={profile}
              settings={settings}
              onSaveProfile={handleSaveProfile}
              onSaveSettings={handleSaveSettings}
            />
          )}

          {activeView === 'founder' && (
            <FounderPortalView
              onUpdateAnnouncement={handleUpdateAnnouncement}
              currentAnnouncement={systemAnnouncement}
              onResetWorkspaceData={handleResetWorkspaceData}
            />
          )}

        </div>
      </main>

      {/* MOBILE layout bottom bar shortcuts */}
      <nav className="fixed bottom-0 left-0 w-full z-45 flex lg:hidden justify-around items-center px-1.5 py-1 bg-white border-t border-[#e4e1ee]/60 rounded-t-xl h-14 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center justify-center text-[10px] w-12 focus:outline-hidden ${activeView === 'dashboard' ? 'text-[#3525cd] font-bold' : 'text-[#777587]'}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveView('ledger')}
          className={`flex flex-col items-center justify-center text-[10px] w-12 focus:outline-hidden ${activeView === 'ledger' ? 'text-[#3525cd] font-bold' : 'text-[#777587]'}`}
        >
          <Receipt className="w-4 h-4" />
          <span>Ledger</span>
        </button>

        <button
          onClick={() => setActiveView('copilot')}
          className={`flex flex-col items-center justify-center text-[10px] w-12 focus:outline-hidden ${activeView === 'copilot' ? 'text-[#3525cd] font-bold' : 'text-[#777587]'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Copilot</span>
        </button>

        <button
          onClick={() => setActiveView('logs')}
          className={`flex flex-col items-center justify-center text-[10px] w-12 focus:outline-hidden ${activeView === 'logs' ? 'text-[#3525cd] font-bold' : 'text-[#777587]'}`}
        >
          <History className="w-4 h-4" />
          <span>Logs</span>
        </button>

        <button
          onClick={() => setActiveView('settings')}
          className={`flex flex-col items-center justify-center text-[10px] w-12 focus:outline-hidden ${activeView === 'settings' ? 'text-[#3525cd] font-bold' : 'text-[#777587]'}`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </nav>

      {/* Onboarding Wizard creation dialog overlay */}
      <NewNudgeModal
        isOpen={isNewNudgeOpen}
        onClose={() => setIsNewNudgeOpen(false)}
        customers={customers}
        onAddInvoice={handleAddInvoice}
        onAddCustomer={handleAddCustomer}
        onAddLog={handleAddLog}
        businessVpa={profile.vpa}
        businessName={profile.name}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        userEmail={profile?.name ? `${profile.name.toLowerCase().replace(/\s+/g, '')}@example.com` : ''}
      />

      <LegalPolicyModal
        isOpen={legalModalMode !== 'none'}
        onClose={() => setLegalModalMode('none')}
        mode={legalModalMode === 'privacy' ? 'privacy' : 'terms'}
      />

      {/* Payment Celebration & Recovery Walkthrough Overlay */}
      {showCelebration && celebrationData && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-card border border-border-subtle p-6 rounded-3xl max-w-md w-full text-center space-y-5 shadow-2xl relative overflow-hidden">
            {/* Sparkles / Confetti simulation background */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-indigo-500 to-emerald-500 animate-pulse"></div>
            
            <div className="mx-auto w-12 h-12 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-500/30">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-450 uppercase tracking-widest block">Collection Success Achieved</span>
              <h3 className="text-lg font-black text-text-primary">Invoice Paid & Cleared</h3>
              <p className="text-xs text-text-secondary">Simulated direct bank ledger reconciliation completed.</p>
            </div>

            <div className="bg-input border border-border-medium rounded-2xl p-4 text-left space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary font-semibold">Payer Customer:</span>
                <span className="font-extrabold text-text-primary truncate max-w-[180px]">{celebrationData.customerName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-text-secondary font-semibold">Invoice Number:</span>
                <span className="font-mono text-text-primary font-bold">{celebrationData.invoiceId}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#888] dark:text-[#aaa] font-semibold">Settled Value:</span>
                <span className="font-mono font-black text-emerald-600">₹{celebrationData.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="border-t border-border-subtle pt-2.5 flex justify-between items-center text-[10px]">
                <span className="text-text-secondary font-semibold">Reconciliation Type:</span>
                <span className="p-0.5 px-2 bg-emerald-600/10 text-emerald-600 font-bold rounded-sm border border-emerald-600/20">Direct UPI Webhook</span>
              </div>
            </div>

            <div className="border border-indigo-200/20 bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-xl text-left space-y-1">
              <span className="text-[9px] font-black text-[#3525cd] dark:text-indigo-400 uppercase tracking-wider block">First Payment Collected Walkthrough</span>
              <p className="text-[11px] text-zinc-650 dark:text-zinc-300 leading-relaxed">
                PayNudge bypasses traditional credit card rails entirely. Customers pay directly from their bank apps (GPay, PhonePe, Paytm) into your merchant account, resulting in <strong>zero transaction fees (0% MDR)</strong> and instant clearance.
              </p>
            </div>

            <button
              onClick={() => {
                setShowCelebration(false);
                setCelebrationData(null);
              }}
              className="w-full py-2.5 bg-[#3525cd] hover:bg-[#3525cd]/95 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
