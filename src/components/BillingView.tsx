import { useState } from 'react';
import { PlatformBillingReceipt, WebSaaSPlan } from '../types';
import { 
  CreditCard, 
  CheckCircle, 
  Download, 
  BarChart4, 
  Sparkles, 
  ShieldCheck, 
  DollarSign, 
  BadgeAlert, 
  Zap,
  Check
} from 'lucide-react';
import { INITIAL_BILL_RECEIPTS } from '../data';

interface BillingViewProps {
  currentPlan: WebSaaSPlan;
  onUpgradePlan: (plan: WebSaaSPlan) => void;
  activeCustomersCount: number;
  remindersSentCount: number;
}

export default function BillingView({
  currentPlan,
  onUpgradePlan,
  activeCustomersCount,
  remindersSentCount,
}: BillingViewProps) {
  const [receipts, setReceipts] = useState<PlatformBillingReceipt[]>(INITIAL_BILL_RECEIPTS);
  const [showInvoiceGeneratedToast, setShowInvoiceGeneratedToast] = useState(false);

  // Quota specifications limits
  const customerLimit = currentPlan === 'free' ? 5 : currentPlan === 'starter' ? 50 : 10000;
  const remindersQuota = currentPlan === 'free' ? 100 : currentPlan === 'starter' ? 1000 : 25000;

  const handleSimulateDownload = () => {
    setShowInvoiceGeneratedToast(true);
    setTimeout(() => setShowInvoiceGeneratedToast(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Toast alert indicator */}
      {showInvoiceGeneratedToast && (
        <div className="fixed top-6 right-6 z-50 bg-zinc-900 border border-zinc-800 text-white p-3.5 px-5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          Downloading SaaS platform invoice PDF receipt...
        </div>
      )}

      {/* Header section */}
      <div>
        <div className="flex items-center gap-1.5 bg-[#f5f2ff] text-[#3525cd] px-3 py-1 rounded-full text-[10px] font-bold w-fit mb-2 border border-indigo-150">
          <DollarSign className="w-3.5 h-3.5" />
          SAAS WORKSPACE BILLING SECTOR & QUOTA METERS
        </div>
        <h2 className="text-3xl font-black text-[#1b1b24] tracking-tight">Billing & Quota Settings</h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
          Track active subscription quotas, manage platform licenses, switch tier categories on demand, and review premium settlement statements easily.
        </p>
      </div>

      {/* Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Subscriptions Plans (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-xs space-y-5">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#3525cd]" /> Select SaaS Application Tier
                </h3>
                <p className="text-[11px] text-[#464555] mt-0.5">Change subscription plans instantly inside this interactive sandboxed launcher panel.</p>
              </div>
              <span className="p-1 px-2.5 bg-indigo-50 border border-indigo-150 text-[#3525cd] font-mono font-bold uppercase rounded text-[10px]">
                Active: {currentPlan.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Free Plan */}
              <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${currentPlan === 'free' ? 'border-[#3525cd] bg-[#fcf8ff] ring-1 ring-[#3525cd]/40' : 'border-zinc-150 bg-white hover:border-zinc-300'}`}>
                <div className="space-y-2">
                  <span className="font-extrabold uppercase text-[9px] text-zinc-400 font-mono">Micro Sandbox</span>
                  <h4 className="font-bold text-base text-zinc-900 leading-none">Free Base Core</h4>
                  <div className="text-xl font-black font-mono text-zinc-900 mt-1">₹0 <span className="text-[10px] font-sans font-medium text-zinc-400">/ forever</span></div>
                  <p className="text-[10.5px] text-zinc-500 leading-relaxed pt-1">Ideal for independent tuition tutors and local PG owners managing minimal clients list.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1.5 text-[11px] text-zinc-650">
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#3525cd]" /> Max 5 debtors limit</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#3525cd]" /> Direct custom UPI QR</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-[#3525cd]" /> 100 reminder counts</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpgradePlan('free')}
                  disabled={currentPlan === 'free'}
                  className="w-full mt-4 py-2 hover:bg-zinc-100 disabled:bg-[#f3f0fc] disabled:text-[#3525cd] text-zinc-700 hover:text-zinc-900 font-bold text-center text-xs border border-zinc-200 rounded-lg transition-all"
                >
                  {currentPlan === 'free' ? '✓ Registered Current Tier' : 'Downgrade to Free'}
                </button>
              </div>

              {/* Starter Plan */}
              <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${currentPlan === 'starter' ? 'border-[#3525cd] bg-[#fcf8ff] ring-1 ring-[#3525cd]/40' : 'border-zinc-150 bg-white hover:border-zinc-300'}`}>
                <div className="space-y-2">
                  <span className="font-extrabold uppercase text-[9px] text-[#3525cd] font-mono">Retail growth</span>
                  <h4 className="font-bold text-base text-zinc-900 leading-none">Starter Premium</h4>
                  <div className="text-xl font-black font-mono text-zinc-900 mt-1">₹999 <span className="text-[10px] font-sans font-medium text-zinc-400">/ month</span></div>
                  <p className="text-[10.5px] text-zinc-500 leading-relaxed pt-1">Best suited for small clinics, freelancers and growing regional firms.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1.5 text-[11px] text-zinc-650">
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-indigo-500" /> Max 50 debtors tracked</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-indigo-500" /> WhatsApp Cloud Gateway</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-indigo-500" /> 1,000 monthly nudges</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpgradePlan('starter')}
                  disabled={currentPlan === 'starter'}
                  className="w-full mt-4 py-2 bg-indigo-50 hover:bg-indigo-100 disabled:bg-[#f3f0fc] disabled:text-[#3525cd] text-indigo-700 hover:text-indigo-800 font-bold text-center text-xs border border-indigo-200 rounded-lg transition-all cursor-pointer"
                >
                  {currentPlan === 'starter' ? '✓ Activated Current Tier' : 'Upgrade to Starter'}
                </button>
              </div>

              {/* Growth Premium Plan */}
              <div className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${currentPlan === 'growth' ? 'border-[#3525cd] bg-[#fcf8ff] ring-1 ring-[#3525cd]/40' : 'border-zinc-150 bg-white hover:border-zinc-300'}`}>
                <div className="space-y-2">
                  <span className="font-extrabold uppercase text-[9px] text-amber-500 font-mono">B2B Enterprise Growth</span>
                  <h4 className="font-bold text-base text-zinc-900 leading-none">Enterprise Growth</h4>
                  <div className="text-xl font-black font-mono text-zinc-900 mt-1">₹2,999 <span className="text-[10px] font-sans font-medium text-zinc-400">/ month</span></div>
                  <p className="text-[10.5px] text-zinc-500 leading-relaxed pt-1">For corporate wholesale distributors, coaching clinics, and massive service agencies.</p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1.5 text-[11px] text-zinc-650">
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Ultimate custom roster loads</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Multilingual AI optimizer</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> 25,000 monthly nudges</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpgradePlan('growth')}
                  disabled={currentPlan === 'growth'}
                  className="w-full mt-4 py-2 bg-zinc-900 hover:bg-zinc-850 disabled:bg-[#f3f0fc] disabled:text-[#3525cd] text-white font-bold text-center text-xs rounded-lg transition-all cursor-pointer border border-zinc-800"
                >
                  {currentPlan === 'growth' ? '✓ Live Account Level' : 'Upgrade to Enterprise'}
                </button>
              </div>

            </div>
          </div>

          {/* Statement download receipt log */}
          <div className="bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wilder">
              SaaS Billing Invoices & Receipts history
            </h3>
            
            <div className="divide-y divide-zinc-150 border border-zinc-150 rounded-xl overflow-hidden font-mono text-xs">
              {receipts.map(rcpt => (
                <div key={rcpt.id} className="p-3 bg-white flex flex-wrap justify-between items-center gap-2 hover:bg-zinc-50/80">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-zinc-900">ID: {rcpt.id}</span>
                    <span className="text-zinc-500">{rcpt.date}</span>
                    <span className="p-0.5 px-2 bg-emerald-50 text-emerald-700 font-extrabold rounded text-[9px] uppercase border border-emerald-150">
                      {rcpt.paymentStatus}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-zinc-800 font-bold">₹{rcpt.amount.toLocaleString('en-IN')}</span>
                    <button
                      type="button"
                      onClick={handleSimulateDownload}
                      className="p-1 px-2.5 bg-zinc-100 hover:bg-[#3525cd] hover:text-white dark:bg-zinc-800 text-zinc-650 dark:text-zinc-350 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Meter Counters and caps (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-2xl border border-zinc-200/60 p-5 shadow-xs space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-650 flex items-center gap-1">
              <BarChart4 className="w-4 h-4 text-indigo-500" /> Active Usage Counters
            </h4>

            {/* Meter 1: Debtors checked */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-800">Tracked Debtors Roster</span>
                <span className="font-mono text-zinc-500 font-bold">{activeCustomersCount} / {customerLimit} entries</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${Math.min(100, (activeCustomersCount / customerLimit) * 100)}%` }}
                  className="h-full bg-[#3525cd] rounded-full transition-all"
                ></div>
              </div>
              {currentPlan === 'free' && activeCustomersCount >= customerLimit && (
                <span className="text-[10px] text-rose-600 font-extrabold flex items-center gap-1 pt-1 animate-pulse">
                  <BadgeAlert className="w-3 h-3" /> Max Capacity reached! Upgrade current plan to add more.
                </span>
              )}
            </div>

            {/* Meter 2: Reminders sent */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-800">Dispatch Reminders sent</span>
                <span className="font-mono text-zinc-500 font-bold">{remindersSentCount} / {remindersQuota} credits</span>
              </div>
              <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                <div 
                  style={{ width: `${Math.min(100, (remindersSentCount / remindersQuota) * 100)}%` }}
                  className="h-full bg-emerald-500 rounded-full transition-all"
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-xl p-4 text-xs font-mono border border-zinc-800/80">
              <span className="font-extrabold font-sans text-amber-300 uppercase text-[9px] block">PRO CONTEXT BENEFIT</span>
              <p className="text-[10.5px] leading-relaxed text-zinc-300 mt-1">Paid plans unlock high-performance automatic sequenced messaging queue logs, ensuring zero manual follow-up friction daily.</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
