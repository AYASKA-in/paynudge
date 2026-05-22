import { useState } from 'react';
import { InvoiceDue, Customer } from '../types';
import { 
  Search, 
  Filter, 
  Download, 
  Smartphone, 
  Mail, 
  CheckCircle, 
  HelpCircle, 
  Briefcase, 
  ChevronRight, 
  Play, 
  TrendingUp, 
  QrCode, 
  X, 
  Clock, 
  AlertTriangle,
  FileSpreadsheet,
  Check,
  SlidersHorizontal,
  CreditCard
} from 'lucide-react';
import { getUPILink } from '../data';
import { triggerRazorpayCheckout } from '../lib/razorpay';

interface LedgerViewProps {
  invoices: InvoiceDue[];
  customers: Customer[];
  onTriggerSingleNudge: (invoiceId: string, channel: 'WhatsApp' | 'Email') => void;
  onMarkPaid: (invoiceId: string) => void;
  onPartialPayment?: (invoiceId: string, paidAmount: number) => void;
  onUpdateInvoice: (invoiceId: string, updates: Partial<InvoiceDue>) => void;
  businessVpa: string;
  businessName: string;
}

export default function LedgerView({
  invoices,
  customers,
  onTriggerSingleNudge,
  onMarkPaid,
  onPartialPayment,
  onUpdateInvoice,
  businessVpa,
  businessName,
}: LedgerViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'overdue' | 'critical' | 'paid'>('all');
  const [selectedQRInvoice, setSelectedQRInvoice] = useState<InvoiceDue | null>(null);
  const [qrSimulationCompleted, setQrSimulationCompleted] = useState(false);
  const [intentCopied, setIntentCopied] = useState(false);
  const [ledgerStatusMsg, setLedgerStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Operational Control Panel edit states
  const [expandedInvoiceOpsId, setExpandedInvoiceOpsId] = useState<string | null>(null);
  const [tempSnoozeDays, setTempSnoozeDays] = useState('0');
  const [tempPromiseDate, setTempPromiseDate] = useState('');
  const [tempDisputeReason, setTempDisputeReason] = useState('');
  const [tempIsDisputed, setTempIsDisputed] = useState(false);
  const [tempAssignedOwner, setTempAssignedOwner] = useState('');
  const [tempEscalation, setTempEscalation] = useState<'None' | 'Polite' | 'First warning' | 'Legal Threat' | 'LGD Dispute'>('None');
  const [tempPartialAmount, setTempPartialAmount] = useState('');
  const [razorpayLoading, setRazorpayLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleRazorpayCheckoutClick = async (inv: InvoiceDue) => {
    const cust = getCustomer(inv.customerId);
    setRazorpayLoading(true);
    try {
      await triggerRazorpayCheckout({
        amountInPaise: Math.round(inv.amount * 100),
        currency: 'INR',
        invoiceId: inv.id,
        customerName: cust?.name || 'Customer Name',
        customerPhone: cust?.phone || '9999999999',
        customerEmail: cust?.email || 'customer@paynudge.in',
        businessName: businessName,
        onSuccess: (details) => {
          setRazorpayLoading(false);
          onMarkPaid(inv.id);
          setQrSimulationCompleted(true);
          setLedgerStatusMsg({ 
            text: `✓ Razorpay Payment Cleared! ID: ${details.razorpay_payment_id}. Verified securely.`, 
            type: 'success' 
          });
          setTimeout(() => {
            setSelectedQRInvoice(null);
            setQrSimulationCompleted(false);
            setLedgerStatusMsg(null);
          }, 4000);
        },
        onFailure: (errorMessage) => {
          setRazorpayLoading(false);
          alert(`Razorpay Checkout notification: ${errorMessage}`);
        }
      });
    } catch (err: any) {
      setRazorpayLoading(false);
      alert(`Razorpay checkout initialization state error: ${err.message}`);
    }
  };

  const handleToggleInvoiceOps = (inv: InvoiceDue) => {
    if (expandedInvoiceOpsId === inv.id) {
      setExpandedInvoiceOpsId(null);
    } else {
      setExpandedInvoiceOpsId(inv.id);
      setTempSnoozeDays('0');
      setTempPromiseDate(inv.promiseToPayDate || '');
      setTempDisputeReason(inv.disputeReason || '');
      setTempIsDisputed(!!inv.isDisputed);
      setTempAssignedOwner(inv.assignedOwner || '');
      setTempEscalation(inv.escalationState || 'None');
      setTempPartialAmount('');
    }
  };

  const handleSaveInvoiceOps = (invId: string) => {
    const updates: Partial<InvoiceDue> = {
      isDisputed: tempIsDisputed,
      disputeReason: tempIsDisputed ? tempDisputeReason : '',
      promiseToPayDate: tempPromiseDate || undefined,
      assignedOwner: tempAssignedOwner || undefined,
      escalationState: tempEscalation,
    };

    if (tempSnoozeDays !== '0') {
      const days = parseInt(tempSnoozeDays, 10);
      const snoozeDate = new Date();
      snoozeDate.setDate(snoozeDate.getDate() + days);
      updates.snoozedUntil = snoozeDate.toISOString().split('T')[0];
    } else {
      updates.snoozedUntil = undefined;
    }

    onUpdateInvoice(invId, updates);
    setExpandedInvoiceOpsId(null);
    setLedgerStatusMsg({ text: `✓ Operational parameters saved for invoice #${invId}.`, type: 'success' });
    setTimeout(() => setLedgerStatusMsg(null), 4000);
  };

  const handleRecordPartialTranche = (inv: InvoiceDue) => {
    const amt = parseFloat(tempPartialAmount);
    if (isNaN(amt) || amt <= 0) {
      alert("Please enter a valid positive numerical amount for the partial payment.");
      return;
    }
    if (amt > inv.amount) {
      alert(`The partial amount cannot exceed the active balance of ₹${inv.amount.toLocaleString('en-IN')}`);
      return;
    }
    if (onPartialPayment) {
      onPartialPayment(inv.id, amt);
      setTempPartialAmount('');
      setExpandedInvoiceOpsId(null);
    }
  };

  const getCustomer = (customerId: string) => {
    return customers.find(c => c.id === customerId);
  };

  const getCustomerName = (customerId: string) => {
    return getCustomer(customerId)?.name || 'Unknown Debtor';
  };

  // Summary Metrics calculations
  const totalAmountDue = invoices
    .filter(i => i.paymentStatus !== 'Paid')
    .reduce((sum, curr) => sum + curr.amount, 0);

  const criticalOverdueOnly = invoices
    .filter(i => i.paymentStatus === 'Critical')
    .reduce((sum, curr) => sum + curr.amount, 0);

  const ratioCritical = Math.round((criticalOverdueOnly / (totalAmountDue || 1)) * 100);

  // Search filter pipeline
  const filteredInvoices = invoices.filter(inv => {
    const custName = getCustomerName(inv.customerId).toLowerCase();
    const invRef = inv.id.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = custName.includes(query) || invRef.includes(query);

    if (!matchesSearch) return false;

    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'paid') return inv.paymentStatus === 'Paid';
    if (selectedFilter === 'critical') return inv.paymentStatus === 'Critical';
    if (selectedFilter === 'overdue') {
      return inv.paymentStatus !== 'Paid' && new Date(inv.dueDate) < new Date(todayStr);
    }
    return true;
  });

  // Export current list to CSV
  const handleExportCSV = () => {
    try {
      const headers = ['Invoice ID', 'Customer Name', 'Due Amount (INR)', 'Due Date', 'Status', 'Last Contacted'];
      const rows = filteredInvoices.map(inv => [
        inv.id,
        getCustomerName(inv.customerId),
        inv.amount,
        inv.dueDate,
        inv.paymentStatus,
        inv.lastContactChannel || 'None',
      ]);

      const csvContent = [headers, ...rows].map(e => e.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${businessName.replace(/\s+/g, '_')}_receivables_ledger.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setLedgerStatusMsg({ text: '✓ Ledger compiled and spreadsheet download started successfully.', type: 'success' });
      setTimeout(() => setLedgerStatusMsg(null), 4000);
    } catch (e) {
      setLedgerStatusMsg({ text: 'Error exporting ledger to spreadsheet: ' + e, type: 'error' });
      setTimeout(() => setLedgerStatusMsg(null), 5000);
    }
  };

  // Trigger quick broadcast reminder action on visible entries
  const handleBulkNudgeShown = () => {
    const activeForReminders = filteredInvoices.filter(i => i.paymentStatus !== 'Paid');
    if (activeForReminders.length === 0) {
      setLedgerStatusMsg({ text: 'No outstanding balances matches current filtered metrics.', type: 'error' });
      setTimeout(() => setLedgerStatusMsg(null), 4000);
      return;
    }
    const confirmMessage = `Dispatch automated WhatsApp reminders to all ${activeForReminders.length} listed pending accounts?`;
    if (confirm(confirmMessage)) {
      activeForReminders.forEach(inv => {
        onTriggerSingleNudge(inv.id, 'WhatsApp');
      });
      setLedgerStatusMsg({ text: `✓ Sent simulated notifications thread updates successfully to ${activeForReminders.length} customers.`, type: 'success' });
      setTimeout(() => setLedgerStatusMsg(null), 5000);
    }
  };

  // Launch simulated payment modal
  const handleTriggerQRModal = (inv: InvoiceDue) => {
    setSelectedQRInvoice(inv);
    setQrSimulationCompleted(false);
  };

  const handleSimulatePaymentClearance = () => {
    if (!selectedQRInvoice) return;
    onMarkPaid(selectedQRInvoice.id);
    setQrSimulationCompleted(true);
    setTimeout(() => {
      setSelectedQRInvoice(null);
      setQrSimulationCompleted(false);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Layout */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80">
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Filter by customer name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 rounded-xl text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:border-[#3525cd]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 bg-zinc-200/60 dark:bg-zinc-800 p-1.5 rounded-xl text-[11px] font-bold overflow-x-auto w-full md:w-auto">
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${selectedFilter === 'all' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-500'}`}
          >
            All Ledger
          </button>
          <button
            onClick={() => setSelectedFilter('overdue')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${selectedFilter === 'overdue' ? 'bg-white dark:bg-zinc-700 text-rose-600 dark:text-rose-400 shadow-xs' : 'text-zinc-500'}`}
          >
            Overdue Dues
          </button>
          <button
            onClick={() => setSelectedFilter('critical')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${selectedFilter === 'critical' ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-xs' : 'text-zinc-500'}`}
          >
            Critical <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span>
          </button>
          <button
            onClick={() => setSelectedFilter('paid')}
            className={`px-3.5 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${selectedFilter === 'paid' ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-xs' : 'text-zinc-500'}`}
          >
            Settled Accounts
          </button>
        </div>
      </div>

      {/* Main Grid: Statistics sidebar & Ledger Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: High level summary metrics */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Outstanding Dues</span>
              <Briefcase className="w-4 h-4 text-zinc-400" />
            </div>

            <div className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-100">
              ₹{totalAmountDue.toLocaleString('en-IN')}
            </div>

            <span className="inline-flex items-center gap-1 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-[10px] uppercase font-bold px-2 py-0.5 mt-1 rounded-full border border-rose-100 dark:border-rose-900/10">
              <Clock className="w-3 h-3" /> Outstanding ledger
            </span>

            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-zinc-500 font-bold text-[10px] uppercase">Critical Overdue</span>
                <span className="font-mono font-bold text-rose-600 text-[11px]">₹{criticalOverdueOnly.toLocaleString('en-IN')}</span>
              </div>
              <div className="w-full bg-zinc-150 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-rose-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(ratioCritical, 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1.5 leading-normal">
                {ratioCritical || 0}% of outstanding receivables exceed basic cooldown limits. Outbound sequences are recommended.
              </p>
            </div>
          </div>

          <div className="bg-zinc-950 dark:bg-zinc-900/60 text-white rounded-2xl p-5 shadow-sm relative overflow-hidden">
            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 font-bold p-0.5 px-2 rounded-full uppercase tracking-widest inline-block mb-3 border border-indigo-400/20">
              Trigger sequence
            </span>
            <h4 className="font-serif text-lg font-bold text-zinc-100 leading-tight">Fast Nudge Broadcast</h4>
            <p className="text-xs text-zinc-400 mt-1 mb-4 leading-relaxed">
              Broadcast direct UPI alerts on WhatsApp to matching outstanding rows listed here.
            </p>
            <button
              onClick={handleBulkNudgeShown}
              className="w-full py-2.5 bg-white hover:bg-zinc-100 text-[#3525cd] font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Run Sequence <Play className="w-3.5 h-3.5 fill-current text-[#3525cd]" />
            </button>
          </div>
        </div>

        {/* Right Hand: Ledger Data Core Table */}
        <div className="lg:col-span-9 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 shadow-xs flex flex-col min-h-[480px]">
          
          {ledgerStatusMsg && (
            <div className={`p-3 px-4 border-b flex items-center gap-2 text-xs font-semibold animate-nudge ${
              ledgerStatusMsg.type === 'error' 
                ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-450' 
                : 'bg-[#ecfdf5] dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-450'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-ping shrink-0 ${ledgerStatusMsg.type === 'error' ? 'bg-rose-600' : 'bg-emerald-600'}`} />
              <span>{ledgerStatusMsg.text}</span>
            </div>
          )}
          
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800/85 flex justify-between items-center bg-white dark:bg-zinc-900 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm uppercase tracking-wider text-zinc-800 dark:text-neutral-100">Live Accounts ledger</h3>
              <span className="p-0.5 px-2 bg-indigo-50 dark:bg-zinc-800 text-[#3525cd] dark:text-indigo-400 font-bold font-mono text-[10px] rounded-full">
                {filteredInvoices.length} rows
              </span>
            </div>

            <button 
              onClick={handleExportCSV}
              className="p-1 px-3 border border-zinc-200 dark:border-zinc-800 hover:border-[#3525cd] bg-zinc-50 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 rounded-lg text-[10.5px] font-bold flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" /> Export CSV
            </button>
          </div>

          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-left whitespace-nowrap text-xs">
              <thead className="bg-zinc-550/5 dark:bg-zinc-850 p-2 font-bold uppercase text-[9.5px] text-zinc-400 tracking-wider">
                <tr>
                  <th className="py-3 px-5">Client Profile</th>
                  <th className="py-3 px-4">Due Targets</th>
                  <th className="py-3 px-4 text-right">Owed Balance</th>
                  <th className="py-3 px-4 text-center">Last contacted</th>
                  <th className="py-3 px-5 text-center">Payment Status</th>
                  <th className="py-3 px-5 text-right">Action Gateway Panel</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850 text-xs">
                {filteredInvoices.map((inv) => {
                  const cust = getCustomer(inv.customerId);
                  const short = cust ? cust.name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0, 2) : 'C';
                  const isPaid = inv.paymentStatus === 'Paid';

                  return (
                    <tr key={inv.id} className="contents">
                      <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/30 transition-colors">
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-zinc-850 border border-indigo-100/40 text-[#3525cd] dark:text-indigo-400 font-extrabold text-[10.5px] flex items-center justify-center">
                              {short}
                            </div>
                            <div>
                              <span className="font-bold text-zinc-900 dark:text-neutral-100 block">{cust?.name || 'Unknown'}</span>
                              <span className="text-[10px] text-zinc-400 font-mono block">Folder: #{inv.id}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-mono font-bold">
                          <span className={inv.paymentStatus === 'Critical' ? 'text-rose-600 font-bold' : 'text-zinc-650'}>
                            {inv.dueDate}
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right font-mono font-bold text-zinc-900 dark:text-slate-100 text-sm">
                          ₹{inv.amount.toLocaleString('en-IN')}
                        </td>

                        <td className="py-4 px-4 text-center">
                          {inv.lastContactChannel ? (
                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase p-0.5 px-2 rounded-full ${
                              inv.lastContactChannel === 'WhatsApp' ? 'bg-[#25D366]/10 text-[#075e54] border border-[#25D366]/20' : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}>
                              {inv.lastContactChannel} ({inv.lastContactDate})
                            </span>
                          ) : (
                            <span className="text-zinc-400 italic text-[10.5px]">Uncontacted yet</span>
                          )}
                        </td>

                        <td className="py-4 px-5 text-center">
                          <span className={`p-1 px-2.5 text-[9.5px] font-bold font-mono rounded-full ${
                            isPaid ? 'bg-green-50 text-green-700 border border-green-200' :
                            inv.paymentStatus === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-250 animate-pulse' :
                            inv.paymentStatus === 'Disputed' ? 'bg-red-50 text-red-700 border border-red-200' :
                            inv.paymentStatus === 'Partially Paid' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {inv.paymentStatus}
                          </span>
                        </td>

                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5 h-8">
                            {!isPaid ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleToggleInvoiceOps(inv)}
                                  className={`p-1 px-2.5 rounded-lg border text-[10.2px] font-bold transition-all cursor-pointer h-7 flex items-center gap-1 ${
                                    expandedInvoiceOpsId === inv.id
                                      ? 'bg-amber-50 dark:bg-zinc-850 text-amber-700 dark:text-amber-400 border-amber-200'
                                      : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-[#3525cd]'
                                  }`}
                                  title="Manage dispute tags, repayment plans, snooze, and owner manager assignments"
                                >
                                  <SlidersHorizontal className="w-3.5 h-3.5" /> Manage Ops
                                </button>
                                <button
                                  onClick={() => handleTriggerQRModal(inv)}
                                  title="Show simulated UPI QR scan and pay link code"
                                  className="p-1 px-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:border-[#3525cd] transition-all cursor-pointer h-7 flex items-center gap-1 text-[10.2px] font-bold"
                                >
                                  <QrCode className="w-3.5 h-3.5 text-[#3525cd]" /> PayQR
                                </button>
                                <button
                                  onClick={() => onTriggerSingleNudge(inv.id, 'WhatsApp')}
                                  className="p-1 px-2 bg-[#25D366]/15 hover:bg-[#25D366] hover:text-white text-[#075e54] rounded-lg transition-all cursor-pointer h-7"
                                  title="Direct WhatsApp client warning nudge"
                                >
                                  <Smartphone className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => onTriggerSingleNudge(inv.id, 'Email')}
                                  className="p-1 px-2 bg-indigo-50 hover:bg-[#3525cd] hover:text-white text-[#3525cd] rounded-lg transition-all cursor-pointer h-7"
                                  title="Direct Email sequence warn nudge"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Mark Invoice #${inv.id} as Paid?`)) {
                                      onMarkPaid(inv.id);
                                    }
                                  }}
                                  className="p-1 px-2 bg-emerald-50 hover:bg-emerald-600 hover:text-white text-emerald-600 rounded-lg transition-all cursor-pointer h-7"
                                  title="Mark manuals audit paid"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </button>
                              </>
                            ) : (
                              <span className="text-[10.5px] text-emerald-600 font-bold flex items-center gap-0.5">
                                ✓ Bank Cleared
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>

                      {expandedInvoiceOpsId === inv.id && (
                        <tr className="bg-zinc-50/50 dark:bg-zinc-850/15 animate-nudge">
                          <td colSpan={6} className="py-4 px-6 border-b border-zinc-150 dark:border-zinc-800">
                            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xs text-xs max-w-5xl">
                              <div className="flex items-center justify-between border-b pb-2">
                                <span className="font-bold text-[#3525cd] dark:text-indigo-400 flex items-center gap-1">
                                  <SlidersHorizontal className="w-3.5 h-3.5" /> Collections Operations Management Panel — Fold: #{inv.id}
                                </span>
                                <span className="text-[10px] font-mono text-zinc-400">Aging priority: {inv.paymentStatus}</span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Col 1: Repayment Schedules */}
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Repayment Promise Date</label>
                                    <input 
                                      type="date"
                                      value={tempPromiseDate}
                                      onChange={(e) => setTempPromiseDate(e.target.value)}
                                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Escalation State</label>
                                    <select
                                      value={tempEscalation}
                                      onChange={(e) => setTempEscalation(e.target.value as any)}
                                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-semibold"
                                    >
                                      <option value="None">None (Polite Reminder)</option>
                                      <option value="Polite">Polite Sequence</option>
                                      <option value="First warning">First official warning</option>
                                      <option value="Legal Threat">Formal Legal Notice (Draft)</option>
                                      <option value="LGD Dispute">LGD Escalation</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Col 2: Inactivity and assignment */}
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Cooldown / Snooze</label>
                                    <select
                                      value={tempSnoozeDays}
                                      onChange={(e) => setTempSnoozeDays(e.target.value)}
                                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                                    >
                                      <option value="0">Active Immediate</option>
                                      <option value="3">Snooze alerts for 3 Days</option>
                                      <option value="5">Snooze alerts for 5 Days</option>
                                      <option value="7">Snooze alerts for 7 Days</option>
                                      <option value="14">Snooze alerts for 14 Days</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Collection Owner</label>
                                    <select
                                      value={tempAssignedOwner}
                                      onChange={(e) => setTempAssignedOwner(e.target.value)}
                                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs"
                                    >
                                      <option value="">System Default Daemon</option>
                                      <option value="Arun Kumar (Senior Executive)">Arun Kumar (Senior Executive)</option>
                                      <option value="Kiran Patel (Finance Partner)">Kiran Patel (Finance Partner)</option>
                                    </select>
                                  </div>
                                </div>

                                {/* Col 3: Dispute Hold Guard */}
                                <div className="space-y-3">
                                  <div>
                                    <label className="flex items-center gap-2 text-[10px] font-bold uppercase text-zinc-400 mb-1">
                                      <input 
                                        type="checkbox"
                                        checked={tempIsDisputed}
                                        onChange={(e) => setTempIsDisputed(e.target.checked)}
                                        className="rounded border-zinc-300 text-[#3525cd] focus:ring-[#3525cd]"
                                      />
                                      Objection Hold
                                    </label>
                                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block leading-tight mb-1.5">Filing dispute pauses all auto-triggers.</span>
                                    <input 
                                      type="text"
                                      disabled={!tempIsDisputed}
                                      value={tempDisputeReason}
                                      onChange={(e) => setTempDisputeReason(e.target.value)}
                                      placeholder="Reason for client objection..."
                                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-750 rounded-lg text-xs disabled:opacity-50"
                                    />
                                  </div>
                                </div>

                                {/* Col 4: Record installment payments */}
                                <div className="space-y-2 bg-zinc-50/50 dark:bg-zinc-850/40 p-3 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-750">
                                  <label className="block text-[10px] font-bold uppercase text-zinc-500">Repayment Balance Tranche</label>
                                  <div className="space-y-1.5">
                                    <div className="relative">
                                      <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-zinc-400 font-mono font-bold">₹</span>
                                      <input 
                                        type="number"
                                        value={tempPartialAmount}
                                        onChange={(e) => setTempPartialAmount(e.target.value)}
                                        placeholder="Enter partial collection..."
                                        className="w-full pl-6 pr-2 py-1.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 rounded-lg text-xs"
                                      />
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRecordPartialTranche(inv)}
                                      className="w-full py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-[10.5px] rounded-lg transition-colors cursor-pointer"
                                    >
                                      Reconcile installment
                                    </button>
                                    <p className="text-[9px] text-zinc-400 text-center leading-normal">
                                      This recalculates the remaining receivables on the ledger immediately.
                                    </p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2 pt-2 border-t">
                                <button
                                  type="button"
                                  onClick={() => setExpandedInvoiceOpsId(null)}
                                  className="p-1.5 px-4 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 font-bold rounded-lg cursor-pointer transition-colors"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveInvoiceOps(inv.id)}
                                  className="p-1.5 px-4 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold rounded-lg cursor-pointer transition-colors"
                                >
                                  Save Operational Settings
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tr>
                  );
                })}

                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-zinc-400 italic">No invoice items matching selected metrics filter are active on system roster.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-zinc-100 dark:border-zinc-850 flex justify-between items-center text-[11px] text-zinc-500 font-bold font-mono">
            <span>Showing {filteredInvoices.length} of {invoices.length} invoices entries</span>
            <span>All times synced relative to active NPCI anchors.</span>
          </div>

        </div>

      </div>

      {/* UPI QR Code simulation Dialog Modal */}
      {selectedQRInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs animate-fade-in p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 max-w-sm w-full p-6 space-y-4 shadow-xl relative animate-nudge text-xs">
            
            <button 
              onClick={() => setSelectedQRInvoice(null)} 
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-zinc-600 cursor-pointer"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="text-center space-y-1">
              <span className="bg-indigo-50 text-[#3525cd] text-[9px] font-bold p-1 px-2 rounded-full uppercase tracking-widest inline-block">
                UPI PAYREF DECK GATEWAY
              </span>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-neutral-100 uppercase tracking-tight mt-1.5">
                Simulated Collection QR Code
              </h3>
              <p className="text-[10.5px] text-zinc-400 font-mono">VPA Target: {businessVpa}</p>
            </div>

            {/* Simulated Unified QR visual container */}
            <div className="bg-zinc-50 dark:bg-zinc-950 rounded-xl p-4.5 flex flex-col items-center justify-center border border-zinc-200 text-center space-y-3">
              
              {qrSimulationCompleted ? (
                <div className="h-40 flex flex-col items-center justify-center text-emerald-600 space-y-2.5 animate-nudge">
                  <CheckCircle className="w-12 h-12 text-emerald-500 animate-spin" />
                  <div>
                    <span className="font-extrabold text-sm block">₹{selectedQRInvoice.amount.toLocaleString('en-IN')} Settled!</span>
                    <span className="text-[10px] text-zinc-400 font-medium block">UPI Clearance Success updated instantly.</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="w-36 h-36 bg-white p-2 rounded-lg border border-zinc-200/65 flex items-center justify-center relative">
                    {/* Simulated vector QR layout grids */}
                    <div className="grid grid-cols-5 gap-1.5 w-full h-full opacity-90 p-1">
                      {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className={`rounded-sm ${(i % 3 === 0 || i % 7 === 1) ? 'bg-zinc-900' : 'bg-transparent'}`}></div>
                      ))}
                    </div>
                    {/* Center BHIM logo label */}
                    <span className="absolute px-1.5 py-0.5 bg-white border border-zinc-350 rounded font-mono font-extrabold text-[8.5px] text-indigo-700 tracking-tighter">UPI</span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[11px] font-extrabold text-zinc-700 dark:text-zinc-300 block">Scan to Pay via BHIM/GPAY/PHONEPE</span>
                    <span className="text-lg font-black font-mono text-zinc-900 dark:text-white leading-tight block">₹{selectedQRInvoice.amount.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-zinc-400 block font-normal">Customer Name: {getCustomerName(selectedQRInvoice.customerId)}</span>
                  </div>
                </>
              )}

            </div>

            {!qrSimulationCompleted && (
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={razorpayLoading}
                  onClick={() => handleRazorpayCheckoutClick(selectedQRInvoice)}
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-650/40"
                >
                  <CreditCard className="w-3.5 h-3.5 text-indigo-200" />
                  {razorpayLoading ? "Securing Session..." : "Pay via Razorpay (Cards/Netbanking/UPI)"}
                </button>

                <button
                  type="button"
                  onClick={handleSimulatePaymentClearance}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 font-bold text-white uppercase text-[9.5px] tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Simulate Client Scan & Payment Success ✓
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const payLink = getUPILink(businessVpa, businessName, selectedQRInvoice.amount, `Invoice ${selectedQRInvoice.id}`);
                    navigator.clipboard.writeText(payLink);
                    setIntentCopied(true);
                    setTimeout(() => setIntentCopied(false), 2500);
                  }}
                  className={`w-full py-2 font-bold rounded-xl text-[10px] transition-colors cursor-pointer ${
                    intentCopied 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-250' 
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                  }`}
                >
                  {intentCopied ? '✓ Intent URL Copied to Clipboard!' : 'Copy Raw UPI Intent URL String'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
