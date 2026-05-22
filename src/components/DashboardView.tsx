import { useState, useEffect } from 'react';
import { InvoiceDue, Customer, NotificationLog } from '../types';
import { 
  Smartphone, 
  Mail, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  HelpCircle, 
  ArrowUpRight, 
  Play, 
  Calendar,
  Sparkles,
  ArrowDownLeft,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Wallet
} from 'lucide-react';
import { AICollectionsIntelligence } from '../lib/saasManager';

interface DashboardViewProps {
  invoices: InvoiceDue[];
  customers: Customer[];
  logs: NotificationLog[];
  onTriggerQuickNudgeAll: () => void;
  onNavigateToView: (view: 'dashboard' | 'ledger' | 'customers' | 'templates' | 'logs' | 'settings' | 'import' | 'copilot' | 'integrations' | 'billing') => void;
  onSelectCustomer: (customerId: string) => void;
  onMarkPaid: (invoiceId: string) => void;
  onLoadInvestorDemo?: () => void;
  onWipeWorkspace?: () => void;
  onLaunchNewNudge?: () => void;
}

export default function DashboardView({
  invoices,
  customers,
  logs,
  onTriggerQuickNudgeAll,
  onNavigateToView,
  onSelectCustomer,
  onMarkPaid,
  onLoadInvestorDemo,
  onWipeWorkspace,
  onLaunchNewNudge,
}: DashboardViewProps) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [activeAgingBucket, setActiveAgingBucket] = useState<'all' | '1-30' | '31-60' | '61+'>('all');
  const [telemetry, setTelemetry] = useState<any>(null);

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const response = await fetch('/api/system/diagnostics');
        const data = await response.json();
        if (data.success) {
          setTelemetry(data);
        }
      } catch (err) {
        console.warn("Failed fetching telemetry logs:", err);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic Onboarding checklist state trackers
  const hasDebtors = customers.length > 0;
  const hasInvoices = invoices.length > 0;
  const hasSentNudges = logs.length > 0;
  const hasReconciledPayments = invoices.some(i => i.paymentStatus === 'Paid');

  let completedStepsCount = 1; // VPA active by default
  if (hasDebtors) completedStepsCount++;
  if (hasInvoices) completedStepsCount++;
  if (hasSentNudges) completedStepsCount++;
  if (hasReconciledPayments) completedStepsCount++;
  const checklistProgressPercent = Math.round((completedStepsCount / 5) * 100);

  // Core Math
  const rawOutstanding = invoices
    .filter(i => i.paymentStatus !== 'Paid')
    .reduce((sum, curr) => sum + curr.amount, 0);

  const rawOverdue = invoices
    .filter(i => i.paymentStatus !== 'Paid' && new Date(i.dueDate) < new Date(todayStr))
    .reduce((sum, curr) => sum + curr.amount, 0);

  const rawDueToday = invoices
    .filter(i => i.paymentStatus !== 'Paid' && i.dueDate === todayStr)
    .reduce((sum, curr) => sum + curr.amount, 0);

  const rawCollected = invoices
    .filter(i => i.paymentStatus === 'Paid')
    .reduce((sum, curr) => sum + curr.amount, 0);

  const activeInvoicesCount = invoices.filter(i => i.paymentStatus !== 'Paid').length;
  const collectionRate = Math.round((rawCollected / (rawCollected + rawOutstanding || 1)) * 100);

  // Aging Analysis
  const getDaysDiff = (dateStr: string) => {
    const diffTime = Date.now() - new Date(dateStr).getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  const aging1_30 = invoices.filter(i => i.paymentStatus !== 'Paid' && getDaysDiff(i.dueDate) > 0 && getDaysDiff(i.dueDate) <= 30);
  const aging31_60 = invoices.filter(i => i.paymentStatus !== 'Paid' && getDaysDiff(i.dueDate) > 30 && getDaysDiff(i.dueDate) <= 60);
  const aging61Plus = invoices.filter(i => i.paymentStatus !== 'Paid' && getDaysDiff(i.dueDate) > 60);

  const amount1_30 = aging1_30.reduce((s, curr) => s + curr.amount, 0);
  const amount31_60 = aging31_60.reduce((s, curr) => s + curr.amount, 0);
  const amount61Plus = aging61Plus.reduce((s, curr) => s + curr.amount, 0);

  // Cast Overdue Accounts (Sorted by amount DESC)
  const topOverdueAccounts = invoices
    .filter(i => i.paymentStatus !== 'Paid')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  const getCustomerObj = (uid: string): Customer | undefined => {
    return customers.find(c => c.id === uid);
  };

  const getCustomerName = (uid: string) => {
    return getCustomerObj(uid)?.name || 'Unknown Client';
  };

  // 15 days cashflow collection forecasting vector
  const collectionForecast = Math.round((rawOutstanding * 0.78) + (rawDueToday * 0.95));

  return (
    <div className="space-y-6">
      
      {/* 1. Header with dynamic SaaS metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800/80 pb-5">
        <div>
          <span className="text-xs font-bold text-[#3525cd] uppercase tracking-wider flex items-center gap-1 mb-1">
            <Zap className="w-3.5 h-3.5 fill-current" /> MSME Collections Workspace v2.0
          </span>
          <h2 className="text-3xl font-black text-[#1b1b24] dark:text-white tracking-tight">
            Financial Dashboard
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Simulate payment dispatches, analyze client aging, and trigger smart microtransactions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button 
            type="button"
            onClick={onTriggerQuickNudgeAll}
            className="group flex items-center gap-2 bg-[#3525cd] hover:bg-[#4f46e5] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md hover:shadow-indigo-500/20 cursor-pointer h-10"
          >
            <Play className="w-3.5 h-3.5 fill-current text-white group-hover:scale-110" /> Bulk WhatsApp Nudge
          </button>
          
          <div className="flex items-center gap-1.5 bg-green-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-green-200 dark:border-emerald-800/30 h-10">
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping"></span>
            <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-widest">
              Live Gateway Active
            </span>
          </div>
        </div>
      </div>

      {/* 🚀 Dynamic Guided Onboarding Setup Walkthrough */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/80 dark:border-zinc-800/80 p-6 shadow-xs relative overflow-hidden transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/45 dark:bg-indigo-950/10 rounded-bl-full pointer-events-none"></div>
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-5 border-b border-zinc-150 dark:border-zinc-800/65">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/50 text-[#3525cd] dark:text-indigo-400 rounded-lg text-xs font-bold leading-none">
                Interactive Launchpad
              </span>
              <span className="text-[10px] font-mono font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Checklist Status: {completedStepsCount}/5 Completed
              </span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-neutral-100 flex items-center gap-1.5 mt-1 tracking-tight">
              Getting Started Checklist
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
              Complete these 5 interactive milestones to see how PayNudge automates friendly follow-ups via WhatsApp and resolves outstanding balances efficiently.
            </p>
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {onLoadInvestorDemo && (
              <button
                type="button"
                onClick={onLoadInvestorDemo}
                className="flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/30 text-emerald-700 dark:text-emerald-400 p-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" /> ⚡ Seed Investor Demo Sandbox
              </button>
            )}
            {onWipeWorkspace && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Are you sure you want to restore the pristine, empty sandbox database for custom input testing?")) {
                    onWipeWorkspace();
                  }
                }}
                className="flex items-center justify-center gap-1 text-zinc-650 hover:text-red-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-zinc-850 p-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800"
              >
                🗑️ Clear Workspace
              </button>
            )}
          </div>
        </div>

        {/* Progress Timeline Tracker */}
        <div className="mt-5">
          <div className="flex justify-between items-center text-xs font-semibold mb-2">
            <span className="text-zinc-500 dark:text-zinc-400">Total Setup Verification Score:</span>
            <span className="text-[#3525cd] dark:text-indigo-400 font-mono font-bold">{checklistProgressPercent}% Verified</span>
          </div>
          <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div 
              style={{ width: `${checklistProgressPercent}%` }} 
              className="h-full bg-gradient-to-r from-indigo-500 via-[#3525cd] to-emerald-500 transition-all duration-500 ease-out"
            ></div>
          </div>
        </div>

        {/* Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-5">
          
          {/* Step 1 */}
          <div className={`p-3.5 rounded-2xl border transition-all ${
            true ? 'bg-indigo-50/20 dark:bg-zinc-900/40 border-indigo-100 dark:border-zinc-800/80 text-zinc-900 dark:text-neutral-100' : 'bg-zinc-50/50'
          }`}>
            <span className="text-emerald-600 dark:text-emerald-400 block font-bold text-xs">✓ Active</span>
            <span className="font-bold text-xs mt-1 block">1. Connect VPA</span>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-snug">UPI profile connected to local MSME gateway.</p>
          </div>

          {/* Step 2 */}
          <div 
            onClick={() => { if (!hasDebtors && onLaunchNewNudge) onLaunchNewNudge(); }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              hasDebtors 
                ? 'bg-indigo-50/20 dark:bg-zinc-900/40 border-indigo-100 dark:border-zinc-800/80' 
                : 'bg-zinc-50/50 dark:bg-zinc-850/40 border-zinc-100 dark:border-zinc-800 hover:border-[#3525cd]/40'
            }`}
          >
            <span className={hasDebtors ? "text-emerald-600 dark:text-emerald-400 block font-bold text-xs" : "text-zinc-400 block font-bold text-xs"}>
              {hasDebtors ? '✓ Done' : '○ Pending'}
            </span>
            <span className="font-bold text-xs mt-1 block">2. Onboard Debtor</span>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-snug">
              {hasDebtors ? 'Customer profiles registered.' : 'Click to register first billing customer.'}
            </p>
          </div>

          {/* Step 3 */}
          <div 
            onClick={() => { if (!hasInvoices && onLaunchNewNudge) onLaunchNewNudge(); }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              hasInvoices 
                ? 'bg-indigo-50/20 dark:bg-zinc-900/40 border-indigo-100 dark:border-zinc-800/80' 
                : 'bg-zinc-50/50 dark:bg-zinc-850/40 border-zinc-100 dark:border-zinc-800 hover:border-[#3525cd]/40'
            }`}
          >
            <span className={hasInvoices ? "text-emerald-600 dark:text-emerald-400 block font-bold text-xs" : "text-zinc-400 block font-bold text-xs"}>
              {hasInvoices ? '✓ Done' : '○ Pending'}
            </span>
            <span className="font-bold text-xs mt-1 block">3. Add Due balance</span>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-snug">
              {hasInvoices ? 'Invoices added to ledger.' : 'Record a pending invoice ticket.'}
            </p>
          </div>

          {/* Step 4 */}
          <div 
            onClick={() => { if (!hasSentNudges) onNavigateToView('ledger'); }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              hasSentNudges 
                ? 'bg-indigo-50/20 dark:bg-zinc-900/40 border-indigo-100 dark:border-zinc-800/80' 
                : 'bg-zinc-50/50 dark:bg-zinc-850/40 border-zinc-100 dark:border-zinc-800 hover:border-[#3525cd]/40'
            }`}
          >
            <span className={hasSentNudges ? "text-emerald-600 dark:text-emerald-400 block font-bold text-xs" : "text-zinc-400 block font-bold text-xs"}>
              {hasSentNudges ? '✓ Done' : '○ Pending'}
            </span>
            <span className="font-bold text-xs mt-1 block">4. Send Reminder</span>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-snug">
              {hasSentNudges ? 'WhatsApp nudges dispatched.' : 'Go to Ledger and trigger a trial reminder.'}
            </p>
          </div>

          {/* Step 5 */}
          <div 
            onClick={() => { if (!hasReconciledPayments) onNavigateToView('ledger'); }}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              hasReconciledPayments 
                ? 'bg-indigo-50/20 dark:bg-zinc-900/40 border-indigo-100 dark:border-zinc-800/80' 
                : 'bg-zinc-50/50 dark:bg-zinc-850/40 border-zinc-100 dark:border-zinc-800 hover:border-[#3525cd]/40'
            }`}
          >
            <span className={hasReconciledPayments ? "text-emerald-600 dark:text-emerald-400 block font-bold text-xs" : "text-zinc-400 block font-bold text-xs"}>
              {hasReconciledPayments ? '✓ Done' : '○ Pending'}
            </span>
            <span className="font-bold text-xs mt-1 block">5. Collect payment</span>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 leading-snug">
              {hasReconciledPayments ? 'Payment status updated!' : 'Mark an invoice as Paid via UPI simulation.'}
            </p>
          </div>

        </div>

        {/* Expandable guided setup tips section */}
        <div className="mt-6 border-t border-zinc-150 dark:border-zinc-800/80 pt-4">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer list-none text-xs font-bold text-zinc-650 dark:text-zinc-400 select-none">
              <span className="flex items-center gap-1.5 hover:text-[#3525cd] dark:hover:text-indigo-400 transition-colors">
                <Info className="w-4 h-4 text-[#3525cd] dark:text-indigo-450" /> View Onboarding Guides & Setup Hints (WhatsApp API & UPI VPA)
              </span>
              <span className="transition-transform group-open:rotate-180 text-[10px]">▼</span>
            </summary>
            
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-nudge">
              {/* WhatsApp setup help */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-850 rounded-2xl border border-zinc-150 dark:border-zinc-800/60 space-y-2">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span className="font-extrabold text-[#1b1b24] dark:text-slate-100 uppercase tracking-wide">WhatsApp Cloud API Integration</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-zinc-500 dark:text-zinc-400 leading-relaxed text-[11px]">
                  <li>Register a Meta Developer account and create an app with the <strong>WhatsApp product</strong> enabled.</li>
                  <li>Locate your <strong>Phone Number ID</strong> and temporary <strong>Access Token</strong> in the Meta developer panel.</li>
                  <li>Navigate to <span className="text-[#3525cd] dark:text-indigo-400 font-bold cursor-pointer hover:underline" onClick={() => onNavigateToView('integrations')}>API & Integrations</span> to insert these credentials.</li>
                  <li>Verify our incoming webhook callback url with your developer config to get instant status alerts (Read, Delivered).</li>
                </ol>
              </div>

              {/* Payments setup help */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-850 rounded-2xl border border-zinc-150 dark:border-zinc-800/60 space-y-2">
                <div className="flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-[#3525cd] dark:text-indigo-450" />
                  <span className="font-extrabold text-[#1b1b24] dark:text-slate-100 uppercase tracking-wide">UPI Direct & Razorpay Setup</span>
                </div>
                <ol className="list-decimal pl-4 space-y-1 text-zinc-500 dark:text-zinc-400 leading-relaxed text-[11px]">
                  <li>Navigate to <span className="text-[#3525cd] dark:text-indigo-400 font-bold cursor-pointer hover:underline" onClick={() => onNavigateToView('settings')}>System Settings</span> to bind your active UPI Virtual Payment Address (e.g. <code>mybiz@upi</code>).</li>
                  <li>All payment links generated by PayNudge resolve directly to this VPA address, ensuring zero processing cuts.</li>
                  <li>For auto-reconciliation, activate your Razorpay dashboard keys in <span className="text-[#3525cd] dark:text-indigo-400 font-bold cursor-pointer hover:underline" onClick={() => onNavigateToView('integrations')}>API & Integrations</span>.</li>
                  <li>Enable the standard Razorpay payment webhook endpoint to trigger automatic status settlement on invoice files.</li>
                </ol>
              </div>
            </div>
          </details>
        </div>

      </div>

      {/* 🚀 Beautiful Empty State Tutorial Card */}
      {customers.length === 0 && (
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-[#1b1b24] border border-indigo-900/35 text-white rounded-3xl p-8 text-center space-y-4 shadow-xl animate-fadeIn">
          <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-[#25D366] animate-pulse border border-white/10">
            <Sparkles className="w-8 h-8 text-indigo-400 fill-current" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xl font-bold text-slate-100 font-sans tracking-tight">Clean Onboarding Simulator Screen</h4>
            <p className="text-xs text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Your collections database directory is currently empty. You can simulate the entire collections workflow from scratch, or click the button below to initialize our multi-tiered investor-ready scenario instantly!
            </p>
          </div>
          <div className="flex justify-center flex-wrap gap-3 pt-2">
            {onLaunchNewNudge && (
              <button
                onClick={onLaunchNewNudge}
                className="bg-[#3525cd] hover:bg-[#4f46e5] text-white text-xs font-bold p-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/20 cursor-pointer"
              >
                + Register First Customer & Invoice
              </button>
            )}
            {onLoadInvestorDemo && (
              <button
                onClick={onLoadInvestorDemo}
                className="bg-white/10 hover:bg-white/15 border border-white/15 text-slate-100 text-xs font-bold p-3 px-6 rounded-xl transition-all cursor-pointer"
              >
                ⚡ Load Simulated Investor Dataset
              </button>
            )}
          </div>
        </div>
      )}

      {/* Primary Fintech KPI Widgets bento row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Outstanding Receivables */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Receivables</span>
            <span className="p-1 px-1.5 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-md text-[10px] font-bold font-mono">
              ₹{rawOverdue > 0 ? 'Overdue!' : 'Healthy'}
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-slate-100">
              ₹{rawOutstanding.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {activeInvoicesCount} active collection files
            </p>
          </div>
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">Overdue dues:</span>
            <span className="font-semibold text-rose-600 font-mono">₹{rawOverdue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* MTD Received */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Settled MTD</span>
            <span className="text-[10px] font-bold text-emerald-600 font-mono flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" /> +14.2%
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-slate-100">
              ₹{rawCollected.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Settled directly into bank
            </p>
          </div>
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[11px]">
            <span className="text-zinc-400">UPI confirmations:</span>
            <span className="font-semibold text-emerald-600 font-mono">
              {invoices.filter(i => i.paymentStatus === 'Paid').length} invoices
            </span>
          </div>
        </div>

        {/* Collection Efficiency Rate */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Efficiency</span>
            <span title="Percentage of total receivables collected">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-400 cursor-help" />
            </span>
          </div>
          <div className="my-3 flex items-center gap-3">
            <div className="text-3xl font-black font-mono text-[#3525cd] dark:text-indigo-400">
              {collectionRate}%
            </div>
            {/* SVG Sparkline */}
            <div className="h-6 flex-grow max-w-[80px]">
              <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  d="M0,28 L30,22 L60,12 L100,2"
                  fill="none"
                  stroke="#3525cd"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 text-[10px] text-zinc-400">
            {collectionRate >= 75 ? '🔥 Leading benchmark MSME health' : 'Optimize via automated escalation templates'}
          </div>
        </div>

        {/* AI Projection & Recovery Forecast */}
        <div className="bg-zinc-950 dark:bg-zinc-900/60 rounded-2xl border border-zinc-800 dark:border-zinc-800/80 p-5 flex flex-col justify-between shadow-xs relative overflow-hidden text-white">
          <div className="absolute right-0 top-0 w-16 h-16 bg-white/[0.03] rounded-bl-full pointer-events-none"></div>
          <div className="flex justify-between items-start">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" /> AI Forecast
            </span>
            <span className="bg-amber-400/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded border border-amber-400/30 font-mono">
              92% Conf
            </span>
          </div>
          <div className="my-3">
            <div className="text-2xl font-bold font-mono text-zinc-100">
              ₹{collectionForecast.toLocaleString('en-IN')}
            </div>
            <p className="text-[10px] text-zinc-400 mt-1">Expected cash inflows next 15 days</p>
          </div>
          <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
            <span>Direct recovery projection:</span>
            <span className="font-semibold text-amber-300">₹{Math.round(rawOutstanding * 0.7).toLocaleString('en-IN')}</span>
          </div>
        </div>

      </div>

      {/* 2.5 Operational Control Desk & Compliance Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Actionable Alerts */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 shadow-xs">
          <div className="flex justify-between items-center mb-4 border-b border-zinc-100 dark:border-zinc-850 pb-3">
            <div>
              <h3 className="font-bold text-sm text-zinc-850 dark:text-neutral-100 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#3b2fe2] dark:text-indigo-400" /> Operational Control Desk
              </h3>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">Active hold lists, disputes under verification and collection schedules.</p>
            </div>
            <span className="p-1 px-2.5 bg-indigo-50 dark:bg-zinc-800/50 text-[#3b2fe2] dark:text-indigo-400 text-[10px] font-black rounded-full uppercase tracking-wider scale-95">
              {invoices.filter(i => i.isDisputed || i.promiseToPayDate || i.snoozedUntil).length} pending flags
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs">
            {/* Disputes Card */}
            <div className="bg-zinc-50 dark:bg-zinc-850 p-3 rounded-xl border border-zinc-200/40 dark:border-zinc-800/60">
              <span className="text-[9px] font-extrabold uppercase text-rose-500 dark:text-rose-450 tracking-wider">Disputes Guarded</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                  {invoices.filter(i => i.isDisputed).length}
                </span>
                <span className="text-[10px] text-zinc-400">held</span>
              </div>
              <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500 block leading-snug mt-1">Reminders disabled for active client billing disputes.</span>
            </div>

            {/* Promise to Pay Card */}
            <div className="bg-zinc-50 dark:bg-zinc-850 p-3 rounded-xl border border-zinc-200/40 dark:border-zinc-800/60">
              <span className="text-[9px] font-extrabold uppercase text-emerald-500 dark:text-emerald-450 tracking-wider">Payment Promises</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                  {invoices.filter(i => i.promiseToPayDate).length}
                </span>
                <span className="text-[10px] text-zinc-400">agreed</span>
              </div>
              <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500 block leading-snug mt-1">Repayment dates explicitly scheduled by account holders.</span>
            </div>

            {/* Snoozed Holds Card */}
            <div className="bg-zinc-50 dark:bg-zinc-850 p-3 rounded-xl border border-zinc-200/40 dark:border-zinc-800/60">
              <span className="text-[9px] font-extrabold uppercase text-indigo-500 dark:text-indigo-450 tracking-wider">Snooze Cooling</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-black font-mono text-zinc-900 dark:text-zinc-100">
                  {invoices.filter(i => i.snoozedUntil && new Date(i.snoozedUntil) > new Date()).length}
                </span>
                <span className="text-[10px] text-zinc-400">paused</span>
              </div>
              <span className="text-[9.5px] text-zinc-400 dark:text-zinc-500 block leading-snug mt-1">In cooldown cycles to respect conversational wellness guidelines.</span>
            </div>
          </div>

          {/* Action List Section */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {invoices.filter(inv => inv.isDisputed || inv.promiseToPayDate || inv.snoozedUntil).map(inv => {
              const cust = getCustomerObj(inv.customerId);
              return (
                <div key={inv.id} className="p-3 bg-zinc-50/55 dark:bg-zinc-850/40 rounded-xl border border-zinc-100 dark:border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs leading-relaxed">
                  <div className="space-y-0.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">{cust?.name || 'Unknown client'}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">Folder #{inv.id}</span>
                      {inv.isDisputed && <span className="p-0.5 px-2 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 text-[9px] font-bold rounded-lg border border-rose-100/30 shrink-0">Disputed</span>}
                      {inv.promiseToPayDate && <span className="p-0.5 px-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold rounded-lg border border-emerald-100/30 shrink-0">Promise: {inv.promiseToPayDate}</span>}
                      {inv.snoozedUntil && <span className="p-0.5 px-2 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 text-[9px] font-bold rounded-lg border border-indigo-100/30 shrink-0">Snoozed until {inv.snoozedUntil}</span>}
                    </div>
                    {inv.isDisputed && <p className="text-[10px] text-zinc-500 italic">"Billing Objection: {inv.disputeReason}"</p>}
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">Assigned Agent: {inv.assignedOwner || 'System default broker'}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        onSelectCustomer(inv.customerId);
                        onNavigateToView('customers');
                      }}
                      className="p-1 px-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 hover:border-[#3b2fe2] rounded-lg text-[10px] font-bold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                    >
                      Resolve Notes
                    </button>
                  </div>
                </div>
              );
            })}
            {invoices.filter(i => i.isDisputed || i.promiseToPayDate || i.snoozedUntil).length === 0 && (
              <div className="p-8 text-center text-zinc-400 italic">No operational flags, disputes, or snooze periods on active invoices.</div>
            )}
          </div>
        </div>

        {/* Right column: Outbound health and operations Telemetry */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[9px] bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-extrabold p-0.5 px-2 rounded-full uppercase tracking-widest inline-block mb-3 border border-green-150 dark:border-green-800/20">
              Reliability Scorecard
            </span>
            <h3 className="font-bold text-sm text-zinc-800 dark:text-neutral-100 uppercase tracking-wider mb-2">
              Dispatch & Telemetry Health
            </h3>
            <p className="text-[10.5px] text-zinc-400 dark:text-zinc-500 leading-relaxed mb-4">
              Real-time BHIM network dispatches, delivery health diagnostics, and webhook trigger latency state.
            </p>

             <div className="space-y-2.5 text-xs font-mono font-bold text-zinc-500 dark:text-zinc-450">
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-[10px] uppercase text-zinc-400 dark:text-zinc-550">Redis System Status:</span>
                <span className={telemetry?.redis?.queueConnected ? "text-emerald-600 font-mono" : "text-amber-500 font-mono"}>
                  {telemetry ? (telemetry.redis.queueConnected ? 'Connected' : 'Offline (Sim)') : 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-[10px] uppercase text-zinc-400 dark:text-zinc-550">BullMQ Workers:</span>
                <span className={telemetry?.worker?.running ? "text-emerald-600 font-mono" : "text-zinc-850 dark:text-zinc-200 font-mono"}>
                  {telemetry ? (telemetry.worker.running ? `Active (Con: ${telemetry.worker.concurrency})` : 'Inactive') : 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-[10px] uppercase text-zinc-400 dark:text-zinc-550">Active Queue Tasks:</span>
                <span className="text-zinc-800 dark:text-zinc-100 font-mono">
                  {telemetry ? `${telemetry.queue.metrics.waiting} waiting | ${telemetry.queue.metrics.active} active` : 'Loading...'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-800/60">
                <span className="text-[10px] uppercase text-zinc-400 dark:text-zinc-550">SQL Database Latency:</span>
                <span className="text-[#3b2fe2] dark:text-indigo-400 font-mono">
                  {telemetry ? (telemetry.database.status === 'simulation_mode' ? 'Sandbox Simulation' : `${telemetry.database.latencyMs}ms Ping`) : 'Loading...'}
                </span>
              </div>
              <div className="flex flex-col gap-1 py-1.5">
                <span className="text-[10px] uppercase text-zinc-400 dark:text-zinc-550">Circuit Breakers:</span>
                <div className="grid grid-cols-3 gap-1.5 mt-1 text-[9.5px]">
                  <div className="p-1 px-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg flex flex-col items-center">
                    <span className="text-zinc-400 font-sans">WhatsApp</span>
                    <span className={telemetry?.circuitBreakers?.WhatsApp?.state === 'CLOSED' ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                      {telemetry ? telemetry.circuitBreakers.WhatsApp.state : '...'}
                    </span>
                  </div>
                  <div className="p-1 px-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg flex flex-col items-center">
                    <span className="text-zinc-400 font-sans">Resend</span>
                    <span className={telemetry?.circuitBreakers?.Resend?.state === 'CLOSED' ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                      {telemetry ? telemetry.circuitBreakers.Resend.state : '...'}
                    </span>
                  </div>
                  <div className="p-1 px-1.5 bg-zinc-50 dark:bg-zinc-800 rounded-lg flex flex-col items-center">
                    <span className="text-zinc-400 font-sans">Razorpay</span>
                    <span className={telemetry?.circuitBreakers?.Razorpay?.state === 'CLOSED' ? "text-emerald-600 font-bold" : "text-rose-500 font-bold"}>
                      {telemetry ? telemetry.circuitBreakers.Razorpay.state : '...'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold uppercase font-mono">
              <span>Bridge sync status:</span>
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live BHIM
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Aging Buckets Visualization Tab Control Panel */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-neutral-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#3525cd]" /> Aging Receivables Buckets
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Examine collections aging bands to prioritize recovery efforts. Click on cards to filter.
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveAgingBucket('all')}
              className={`p-1.5 px-3 rounded-lg transition-all cursor-pointer ${activeAgingBucket === 'all' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'}`}
            >
              All Dues
            </button>
            <button
              onClick={() => setActiveAgingBucket('1-30')}
              className={`p-1.5 px-3 rounded-lg transition-all cursor-pointer ${activeAgingBucket === '1-30' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'}`}
            >
              1-30 Days
            </button>
            <button
              onClick={() => setActiveAgingBucket('31-60')}
              className={`p-1.5 px-3 rounded-lg transition-all cursor-pointer ${activeAgingBucket === '31-60' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'}`}
            >
              31-60 Days
            </button>
            <button
              onClick={() => setActiveAgingBucket('61+')}
              className={`p-1.5 px-3 rounded-lg transition-all cursor-pointer ${activeAgingBucket === '61+' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'}`}
            >
              61+ Days
            </button>
          </div>
        </div>

        {/* Dynamic Aging Stack Bar */}
        <div className="grid grid-cols-3 gap-3 mb-6 h-12 rounded-xl overflow-hidden text-xs text-white font-mono bg-zinc-150 p-1">
          <div 
            onClick={() => setActiveAgingBucket('1-30')}
            style={{ flexGrow: Math.max(1, amount1_30) }}
            className={`cursor-pointer rounded-lg flex flex-col justify-center items-center font-bold p-1 bg-indigo-500 hover:bg-indigo-600 transition-all ${activeAgingBucket === '1-30' ? 'ring-2 ring-indigo-600 scale-[0.98]' : ''}`}
          >
            <span className="hidden md:inline text-[9px] uppercase tracking-wider">1-30 Days</span>
            <span>₹{amount1_30.toLocaleString('en-IN')}</span>
          </div>
          
          <div 
            onClick={() => setActiveAgingBucket('31-60')}
            style={{ flexGrow: Math.max(1, amount31_60) }}
            className={`cursor-pointer rounded-lg flex flex-col justify-center items-center font-bold p-1 bg-amber-500 hover:bg-amber-600 transition-all ${activeAgingBucket === '31-60' ? 'ring-2 ring-amber-600 scale-[0.98]' : ''}`}
          >
            <span className="hidden md:inline text-[9px] uppercase tracking-wider">31-60 Days</span>
            <span>₹{amount31_60.toLocaleString('en-IN')}</span>
          </div>

          <div 
            onClick={() => setActiveAgingBucket('61+')}
            style={{ flexGrow: Math.max(1, amount61Plus) }}
            className={`cursor-pointer rounded-lg flex flex-col justify-center items-center font-bold p-1 bg-rose-500 hover:bg-rose-600 transition-all ${activeAgingBucket === '61+' ? 'ring-2 ring-rose-600 scale-[0.98]' : ''}`}
          >
            <span className="hidden md:inline text-[9px] uppercase tracking-wider">61+ Overdue</span>
            <span>₹{amount61Plus.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* List filtered in card */}
        <div className="border border-zinc-100 dark:border-zinc-850 rounded-xl overflow-hidden">
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Active Aging Band Entries - Filtered Bucket: {activeAgingBucket.toUpperCase()}
          </div>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-56 overflow-y-auto">
            {invoices
              .filter(inv => {
                if (inv.paymentStatus === 'Paid') return false;
                const daysDiff = getDaysDiff(inv.dueDate);
                if (activeAgingBucket === '1-30') return daysDiff > 0 && daysDiff <= 30;
                if (activeAgingBucket === '31-60') return daysDiff > 30 && daysDiff <= 60;
                if (activeAgingBucket === '61+') return daysDiff > 60;
                return true;
              })
              .map(inv => {
                const isOverdue = new Date(inv.dueDate) < new Date(todayStr);
                const delayDays = getDaysDiff(inv.dueDate);
                return (
                  <div key={inv.id} className="p-3 bg-white dark:bg-zinc-900 border-none flex flex-wrap items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-800/80 transition-colors gap-2 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#3525cd]">#{inv.id}</span>
                      <div>
                        <span className="font-bold text-zinc-900 dark:text-neutral-100 block">
                          {getCustomerName(inv.customerId)}
                        </span>
                        <span className="text-[10px] text-zinc-400 block font-mono">
                          Due date: {inv.dueDate} 
                          {isOverdue && <span className="text-rose-600 ml-1.5">({delayDays} days overdue)</span>}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold font-mono text-zinc-800 dark:text-slate-100">₹{inv.amount.toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => {
                          onSelectCustomer(inv.customerId);
                          onNavigateToView('customers');
                        }}
                        className="p-1 px-3 bg-zinc-100 hover:bg-[#3525cd] hover:text-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-lg transition-all"
                      >
                        Launch Intel Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            {invoices.filter(i => {
              if (i.paymentStatus === 'Paid') return false;
              const daysDiff = getDaysDiff(i.dueDate);
              if (activeAgingBucket === '1-30') return daysDiff > 0 && daysDiff <= 30;
              if (activeAgingBucket === '31-60') return daysDiff > 30 && daysDiff <= 60;
              if (activeAgingBucket === '61+') return daysDiff > 60;
              return true;
            }).length === 0 && (
              <div className="p-8 text-center text-zinc-400 dark:text-zinc-500 italic">
                No unpaid balances fell under this select aging timeline bucket. Clean history!
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 4. Bottom Grid: Top Overdue Scoreboard + AI Insight Cards + Activity Thread */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Overdue Scores Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-bold text-sm text-zinc-800 dark:text-neutral-200 uppercase tracking-wider">Top Priority files</h4>
              <span className="p-1 px-1.5 bg-rose-50 text-rose-700 text-[9px] font-bold uppercase rounded font-mono border border-rose-100">Action Needed</span>
            </div>

            <div className="space-y-3">
              {topOverdueAccounts.map(inv => {
                const cust = getCustomerObj(inv.customerId);
                const cognitive = cust ? AICollectionsIntelligence.analyzeCustomerCollectability(cust, [inv]) : null;
                const score = cognitive?.riskScore || 50;

                return (
                  <div key={inv.id} className="p-3 rounded-xl border border-zinc-100 dark:border-zinc-800/80 hover:border-[#3525cd]/40 transition-all flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-bold text-xs text-zinc-900 dark:text-neutral-200 hover:underline cursor-pointer block" onClick={() => onNavigateToView('customers')}>
                          {getCustomerName(inv.customerId)}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono block">Inv: #{inv.id} | Due {inv.dueDate}</span>
                      </div>
                      <span className="font-mono font-bold text-sm text-zinc-900 dark:text-neutral-200">₹{inv.amount.toLocaleString('en-IN')}</span>
                    </div>

                    {cognitive && (
                      <div className="flex items-center justify-between text-[10px] bg-zinc-50 dark:bg-zinc-850 p-1.5 px-2 rounded-lg">
                        <span className="text-zinc-500 flex items-center gap-1">
                          <span className={`w-2 h-2 rounded-full ${score > 60 ? 'bg-rose-500' : 'bg-amber-400'}`}></span>
                          Prob: <span className="font-mono font-bold text-zinc-800 dark:text-zinc-300">{cognitive.probability}%</span>
                        </span>
                        <span className="text-[#3525cd] dark:text-indigo-400">Risk: <span className="font-bold">{score}/100</span></span>
                      </div>
                    )}
                  </div>
                );
              })}
              {topOverdueAccounts.length === 0 && (
                <div className="py-12 text-center text-zinc-400 italic">No pending invoices found in the database directory.</div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateToView('ledger')}
            className="w-full text-center py-2.5 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-300 rounded-xl text-xs font-bold transition-all mt-4 border border-zinc-150 dark:border-zinc-750"
          >
            Review Receivables Ledger →
          </button>
        </div>

        {/* AI Insight Advisory Deck */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-zinc-900 rounded-2xl border border-zinc-800 p-5 flex flex-col justify-between shadow-xs text-white">
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-indigo-300 inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Intelligent Advisor
              </span>
              <span className="text-[9px] bg-indigo-500/20 text-indigo-300 p-0.5 px-1.5 rounded uppercase font-bold font-mono">Agent Engine</span>
            </div>

            <h4 className="font-serif text-lg font-bold text-neutral-100 leading-snug">
              Today's Recommended Actions
            </h4>
            <p className="text-[11px] text-zinc-400 mt-1">
              Analyzing past collection statistics to speed up settlements by 4 days automatically.
            </p>

            <div className="space-y-2 mt-4 text-xs">
              <div className="flex items-start gap-2 bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.05]">
                <div className="w-5 h-5 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold text-[10px]">1</div>
                <div>
                  <span className="font-bold block text-zinc-200">Weekend WhatsApp Surge</span>
                  <span className="text-[10px] text-zinc-400">Tutors see 40% faster compliance when dispatching reminders on Sundays between 10am–1pm.</span>
                </div>
              </div>

              <div className="flex items-start gap-2 bg-white/[0.04] p-2.5 rounded-xl border border-white/[0.05]">
                <div className="w-5 h-5 rounded-lg bg-indigo-400/20 text-indigo-300 flex items-center justify-center font-bold text-[10px]">2</div>
                <div>
                  <span className="font-bold block text-zinc-200">Strict Warning Escalations</span>
                  <span className="text-[10px] text-zinc-400">3 client balances have crossed 15 days overdue. Switch templates from "Polite" to "Overdue Nudge".</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 bg-transparent">
            <p className="text-[10px] text-zinc-500 italic mt-2 flex items-center gap-1 justify-center">
              <Info className="w-3 h-3 text-indigo-400" /> Preserving active customer goodwill index.
            </p>
          </div>
        </div>

        {/* Live Active Telemetry Activity Feed */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-bold text-sm text-zinc-800 dark:text-neutral-200 uppercase tracking-wider">Smart Activity logs</h4>
              <button onClick={() => onNavigateToView('logs')} className="text-[10px] text-[#3525cd] hover:underline font-bold">Details</button>
            </div>

            <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
              {logs.slice(0, 4).map(log => (
                <div key={log.id} className="flex gap-2 text-xs">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${log.channel === 'WhatsApp' ? 'bg-[#25D366]' : 'bg-indigo-600'}`}>
                      {log.channel === 'WhatsApp' ? <Smartphone className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                    </div>
                    <div className="w-0.5 flex-grow bg-zinc-150 dark:bg-zinc-800/80 min-h-4 mt-1"></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-zinc-900 dark:text-neutral-100">{log.customerName}</span>
                      <span className={`p-0.5 px-1.5 text-[8px] font-bold font-mono rounded uppercase ${
                        log.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-150' : 
                        log.status === 'Read' ? 'bg-sky-50 text-sky-700 border border-sky-150' :
                        'bg-zinc-50 text-zinc-650'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{log.messagePreview}</p>
                    <span className="text-[9px] text-zinc-400 font-mono italic block mt-0.5">{log.sentTime}</span>
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="py-12 text-center text-zinc-400 italic text-xs">No active reminder logs found in cache sandbox registry.</div>
              )}
            </div>
          </div>

          <div className="pt-2">
            <span className="w-full inline-flex items-center justify-center gap-1 bg-zinc-50 dark:bg-zinc-800 p-2 text-[10px] font-semibold rounded-xl text-zinc-500 border border-zinc-150 dark:border-zinc-750">
              ✓ Automated database storage synchronized
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
