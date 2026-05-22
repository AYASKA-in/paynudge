import { useState, useEffect } from 'react';
import { Customer, InvoiceDue, NotificationLog } from '../types';
import { 
  User, 
  Wallet, 
  Phone, 
  Mail, 
  Award, 
  CheckCircle, 
  Clock, 
  Save, 
  Edit, 
  ChevronDown, 
  Check, 
  Sparkles,
  Zap,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  Send,
  Plus,
  Smartphone
} from 'lucide-react';
import { AICollectionsIntelligence, ReminderAutomationEngine, SandboxServiceSimulator } from '../lib/saasManager';

interface RelationshipViewProps {
  customers: Customer[];
  invoices: InvoiceDue[];
  logs: NotificationLog[];
  selectedCustomerId: string;
  onSelectCustomerId: (id: string) => void;
  onUpdateCustomerNotes: (id: string, notes: string) => void;
  onTriggerSingleNudge: (invoiceId: string, channel: 'WhatsApp' | 'Email') => void;
  onPartialPayment?: (invoiceId: string, paidAmount: number) => void;
  onUpdateInvoice: (invoiceId: string, updates: Partial<InvoiceDue>) => void;
  businessVpa: string;
  businessName: string;
}

export default function RelationshipView({
  customers,
  invoices,
  logs,
  selectedCustomerId,
  onSelectCustomerId,
  onUpdateCustomerNotes,
  onTriggerSingleNudge,
  onPartialPayment,
  onUpdateInvoice,
  businessVpa,
  businessName,
}: RelationshipViewProps) {
  const currentCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const [notesText, setNotesText] = useState(currentCustomer?.notes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [simFilterChannel, setSimFilterChannel] = useState<'all' | 'WhatsApp' | 'Email'>('all');

  // Keep internal text area synchronized with selected customer changes
  useEffect(() => {
    if (currentCustomer) {
      setNotesText(currentCustomer.notes);
      setIsEditingNotes(false);
    }
  }, [selectedCustomerId, currentCustomer]);

  if (!currentCustomer) {
    return (
      <div className="py-12 text-center text-zinc-400 dark:text-zinc-505">
        No registered customer profiles found. Add a customer to populate CRM details.
      </div>
    );
  }

  // Handle parent notes state updates
  const handleSaveNotes = () => {
    onUpdateCustomerNotes(currentCustomer.id, notesText);
    setIsEditingNotes(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleCustomerSelect = (id: string) => {
    onSelectCustomerId(id);
  };

  // Math Analytics for currently selected customer profile
  const selectedInvoices = invoices.filter(i => i.customerId === currentCustomer.id);
  const unpaidInvoices = selectedInvoices.filter(i => i.paymentStatus !== 'Paid');
  const paidInvoices = selectedInvoices.filter(i => i.paymentStatus === 'Paid');

  const totalPaidSum = paidInvoices.reduce((sum, curr) => sum + curr.amount, 0);
  const totalOutstandingSum = unpaidInvoices.reduce((sum, curr) => sum + curr.amount, 0);

  // Recovery Rate calculation
  const recoveryRate = Math.round((paidInvoices.length / (selectedInvoices.length || 1)) * 100);

  // Compute local AI Report
  const aiReport = AICollectionsIntelligence.analyzeCustomerCollectability(currentCustomer, selectedInvoices);

  // Timeline telemetry log filter
  const matchedNotifications = logs.filter(l => {
    const term = currentCustomer.name.toLowerCase();
    const isMatched = l.customerName.toLowerCase().includes(term) || l.customerName.toLowerCase() === term;
    if (simFilterChannel === 'all') return isMatched;
    return isMatched && l.channel === simFilterChannel;
  });

  // Calculate Relationship Health Index Model
  // Health starts at 100, drops on aging risk scores
  const healthScore = Math.max(10, Math.round(100 - (aiReport.riskScore * 0.8)));

  // Communication Stage calculation
  let activeStage: 'Onboarding' | 'Active' | 'Gentle Nudge' | 'Firm escalation' | 'Settled' = 'Onboarding';
  if (selectedInvoices.length === 0) activeStage = 'Onboarding';
  else if (unpaidInvoices.length === 0) activeStage = 'Settled';
  else if (aiReport.riskScore >= 70) activeStage = 'Firm escalation';
  else if (aiReport.riskScore >= 35) activeStage = 'Gentle Nudge';
  else activeStage = 'Active';

  return (
    <div className="space-y-6 animate-nudge">
      
      {/* Selector Banner layout with Mercury/Linear styled inputs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80">
        <div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-neutral-100 tracking-tight">CRM Profile Intelligence</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Track repayment behavior ratios, risk indexes, and conversation streams.</p>
        </div>

        <div className="relative">
          <select
            value={currentCustomer.id}
            onChange={(e) => handleCustomerSelect(e.target.value)}
            className="pl-4 pr-10 py-2.5 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 rounded-xl font-bold text-xs focus:outline-hidden focus:border-[#3525cd] appearance-none cursor-pointer shadow-xs"
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                👤 {c.name} ({c.tier} Debtor)
              </option>
            ))}
          </select>
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400">
            <ChevronDown className="w-4 h-4" />
          </span>
        </div>
      </div>

      {/* Main CRM Grid View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Hand: Dashboard Panel & CRM Telemetry cards */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* A. Customer Information & Financial health scores card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <span className="bg-indigo-50 dark:bg-zinc-800 text-[#3525cd] dark:text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                {currentCustomer.tier} ACCOUNT TIER
              </span>
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                activeStage === 'Settled' ? 'bg-green-50 text-green-700 border border-green-200' :
                activeStage === 'Firm escalation' ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' :
                'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}>
                Stage: {activeStage}
              </span>
            </div>

            <div className="flex items-center gap-4 mt-1">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#3525cd] to-indigo-500 text-white flex items-center justify-center font-black text-lg shadow-md">
                {currentCustomer.name.split(' ').map(n=>n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-neutral-100">{currentCustomer.name}</h3>
                <p className="text-[11px] text-zinc-400 font-mono mt-0.5">VPA Anchor: {businessVpa}</p>
              </div>
            </div>

            {/* AI Risk Indicators and circular health gauge */}
            <div className="grid grid-cols-2 gap-4 mt-6 p-3.5 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-150/50 dark:border-zinc-800/85">
              <div>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Health Index</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-black font-mono ${healthScore >= 75 ? 'text-emerald-500' : healthScore >= 45 ? 'text-amber-500' : 'text-rose-500'}`}>
                    {healthScore}%
                  </span>
                  <span className="text-[9px] text-zinc-500 font-bold uppercase">Rapport</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    style={{ width: `${healthScore}%` }} 
                    className={`h-full rounded-full ${healthScore >= 75 ? 'bg-emerald-500' : healthScore >= 45 ? 'bg-amber-500' : 'bg-rose-500'}`}
                  ></div>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">Collection Risk</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className={`text-2xl font-black font-mono ${aiReport.riskScore >= 60 ? 'text-rose-500' : 'text-zinc-700 dark:text-zinc-300'}`}>
                    {aiReport.riskScore}/100
                  </span>
                  <span className="text-[9px] text-zinc-400 uppercase font-bold">{aiReport.riskTier}</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    style={{ width: `${aiReport.riskScore}%` }} 
                    className={`h-full rounded-full ${aiReport.riskScore >= 60 ? 'bg-rose-500' : 'bg-indigo-500'}`}
                  ></div>
                </div>
              </div>
            </div>

            {/* Dynamic Contacts roster list */}
            <div className="space-y-2.5 mt-5">
              <div className="flex items-center justify-between text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-150 dark:border-zinc-750">
                <span className="text-zinc-400 font-mono text-[10px] uppercase">Registered Phone</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-200 font-mono">{currentCustomer.phone}</span>
              </div>
              <div className="flex items-center justify-between text-xs p-2.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-150 dark:border-zinc-750">
                <span className="text-zinc-400 font-mono text-[10px] uppercase">Client Email</span>
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">{currentCustomer.email}</span>
              </div>
            </div>

            {/* Collection behavior matrices */}
            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 text-center text-xs">
              <div className="bg-zinc-50 dark:bg-zinc-800 p-2 rounded-xl">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Paid (YTD)</span>
                <span className="font-bold font-mono text-xs text-emerald-600 block mt-0.5">₹{totalPaidSum.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800 p-2 rounded-xl">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Dues Unpaid</span>
                <span className="font-bold font-mono text-xs text-rose-500 block mt-0.5">₹{totalOutstandingSum.toLocaleString('en-IN')}</span>
              </div>
              <div className="bg-zinc-50 dark:bg-zinc-800 p-2 rounded-xl">
                <span className="text-[10px] text-zinc-400 uppercase font-bold block">Recov Rate</span>
                <span className="font-black font-mono text-xs text-[#3525cd] dark:text-indigo-400 block mt-0.5">{recoveryRate}%</span>
              </div>
            </div>

          </div>

          {/* B. AI collections summary recommendations */}
          <div className="bg-zinc-950 text-white rounded-2xl border border-zinc-800 p-5 shadow-xs relative overflow-hidden">
            <div className="absolute right-0 top-0 w-20 h-20 bg-indigo-500/[0.05] rounded-bl-full pointer-events-none"></div>
            
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#93c5fd] flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> Cogntive Advisory Deck
            </span>

            <div className="space-y-3 mt-1.5 text-xs">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono">Simulated Sentiment status:</span>
                <span className="text-sm font-bold text-indigo-300 mt-0.5 block flex items-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                  {aiReport.sentiment}
                </span>
              </div>

              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-mono">Suggested collections approach:</span>
                <p className="text-[11px] text-zinc-200 mt-0.5 italic leading-relaxed">
                  "{aiReport.strategicSuggestion}"
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.07] grid grid-cols-2 gap-2 text-[11.5px]">
                <div>
                  <span className="text-zinc-500 block text-[9.5px] uppercase font-mono">Best Send Time:</span>
                  <span className="font-bold text-amber-300 block mt-0.5">{aiReport.bestSendTime}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[9.5px] uppercase font-mono">Next Rec. Nudge:</span>
                  <span className="font-medium text-emerald-400 block mt-0.5 uppercase">{aiReport.recommendedTemplate} card</span>
                </div>
              </div>
            </div>
          </div>

          {/* C. Editable Notes card */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 shadow-xs">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold uppercase tracking-wider text-zinc-500 text-[10px]">Merchant Notes</span>
              {!isEditingNotes ? (
                <button
                  onClick={() => setIsEditingNotes(true)}
                  className="text-xs font-semibold text-[#3525cd] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit note
                </button>
              ) : (
                <button
                  onClick={handleSaveNotes}
                  className="text-xs font-bold text-green-600 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" /> Save File
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
                rows={4}
                className="w-full text-xs p-3 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#3525cd]"
              />
            ) : (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-805 p-3.5 rounded-xl border border-zinc-150/50 dark:border-zinc-800/80 italic leading-relaxed">
                "{notesText || 'Add collection cues, fee preferences or student tracking details...'}"
              </p>
            )}

            {saveSuccess && (
              <div className="text-[10px] text-green-700 font-semibold bg-green-50 dark:bg-emerald-900/10 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all">
                ✓ Saved notes successfully
              </div>
            )}
          </div>

        </div>

        {/* Right Hand Side: Action invoices + Simulated Chat threads mockup view */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Timeline & Messaging Simulator Section */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 shadow-xs">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-zinc-100 dark:border-zinc-800/80 pb-3 mb-4 gap-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#3525cd]" />
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white uppercase tracking-wider">Simulated Conversation thread</h3>
              </div>

              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg text-[10.5px]">
                <button
                  onClick={() => setSimFilterChannel('all')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${simFilterChannel === 'all' ? 'bg-white dark:bg-zinc-750 text-zinc-900 dark:text-slate-100 font-bold shadow-xs' : 'text-zinc-500'}`}
                >
                  All (Thread)
                </button>
                <button
                  onClick={() => setSimFilterChannel('WhatsApp')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${simFilterChannel === 'WhatsApp' ? 'bg-white dark:bg-zinc-750 text-zinc-900 dark:text-slate-100 font-bold shadow-xs' : 'text-zinc-500'}`}
                >
                  WhatsApp
                </button>
                <button
                  onClick={() => setSimFilterChannel('Email')}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${simFilterChannel === 'Email' ? 'bg-white dark:bg-zinc-750 text-zinc-900 dark:text-slate-100 font-bold shadow-xs' : 'text-zinc-500'}`}
                >
                  Email
                </button>
              </div>
            </div>

            {/* Render Simulated Chat Bubbles */}
            <div className="bg-[#fcfcff] dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800/90 max-h-80 overflow-y-auto space-y-3.5 mb-6">
              
              {matchedNotifications.map((log) => {
                const isWa = log.channel === 'WhatsApp';
                return (
                  <div key={log.id} className={`flex ${isWa ? 'justify-end' : 'justify-start'} text-xs animate-nudge`}>
                    <div className={`max-w-[85%] rounded-2xl p-3.5 border ${
                      isWa
                        ? 'bg-[#dcf8c6] border-[#c2e4a6]/40 text-zinc-900 shadow-sm' 
                        : 'bg-white dark:bg-zinc-900 border-zinc-150 dark:border-zinc-800 shadow-sm text-zinc-800 dark:text-zinc-200'
                    }`}>
                      <div className="flex justify-between items-center mb-1 gap-4 text-[9.5px] font-bold text-zinc-550">
                        <span className="uppercase tracking-widest">{log.channel} DISPATCH CHANNEL ({log.status})</span>
                        <span className="font-mono">{log.sentTime}</span>
                      </div>
                      
                      {!isWa && log.subject && (
                        <div className="mb-2 pb-1.5 border-b border-zinc-150/50 dark:border-zinc-800/50 text-[10.5px]">
                          <strong>Subject:</strong> {log.subject}
                        </div>
                      )}

                      <p className="font-sans leading-relaxed text-[11.5px] whitespace-pre-wrap">
                        {log.messagePreview}
                      </p>

                      {log.upiLinkUsed && (
                        <div className="mt-3 block text-center">
                          <span className="inline-flex items-center gap-1 bg-[#3525cd] text-white font-bold p-1 px-3 rounded-lg text-[10px] tracking-wide">
                            <Send className="w-3 h-3" /> Secure UPI Link attached
                          </span>
                        </div>
                      )}

                      <div className="mt-1.5 flex justify-end">
                        <span className="text-[9px] font-mono text-zinc-400 italic">
                          Double tick Blue: {log.status === 'Paid' ? 'Paid ✓' : 'Read ✓'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {matchedNotifications.length === 0 && (
                <div className="text-center py-12 text-zinc-400 italic">
                  No conversation logs recorded under the filtered status scope. Trigger a "Nudge" to start simulation!
                </div>
              )}
            </div>

            {/* Unified Client Invoice Management Node listings */}
            <div>
              <h4 className="font-bold text-xs text-zinc-700 dark:text-zinc-400 uppercase tracking-widest mb-3.5">
                Active Dues Ledger ({unpaidInvoices.length})
              </h4>

              <div className="space-y-3">
                {selectedInvoices.map(inv => {
                  const isPaid = inv.paymentStatus === 'Paid';
                  
                  return (
                    <div 
                      key={inv.id} 
                      className={`p-4 rounded-xl border transition-all ${
                        isPaid 
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/50' 
                          : 'bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-[#3525cd]/40'
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold font-mono text-[#3525cd] dark:text-indigo-400 text-sm">#{inv.id}</span>
                          <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">Timeline Targets: {inv.dueDate}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold font-mono block text-zinc-900 dark:text-slate-100">₹{inv.amount.toLocaleString('en-IN')}</span>
                          <span className={`inline-block text-[10px] font-bold font-mono leading-none rounded-full mt-1 px-2 py-0.5 ${
                            isPaid ? 'bg-green-150 text-green-700 border border-green-200' :
                            inv.paymentStatus === 'Critical' ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse' :
                            'bg-amber-50 text-amber-700 border border-amber-250/50'
                          }`}>
                            {inv.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {inv.notes && (
                        <p className="text-[11px] text-zinc-500 mt-2 italic">"{inv.notes}"</p>
                      )}

                      {!isPaid && onPartialPayment && (
                        <div className="mt-3 pt-3 border-t border-dashed border-zinc-150 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/50 dark:bg-zinc-850/30 p-2.5 rounded-xl">
                          <span className="text-[10px] uppercase font-mono font-bold text-zinc-400 dark:text-zinc-500 block">
                            Installment / Partial Simulation:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => onPartialPayment(inv.id, Math.round(inv.amount * 0.25))}
                              className="px-2.5 py-1 bg-white hover:bg-zinc-105 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-350 text-[9.5px] font-mono font-bold rounded-lg cursor-pointer transition-colors"
                            >
                              ₹{Math.round(inv.amount * 0.25).toLocaleString('en-IN')} (25%)
                            </button>
                            <button
                              type="button"
                              onClick={() => onPartialPayment(inv.id, Math.round(inv.amount * 0.50))}
                              className="px-2.5 py-1 bg-white hover:bg-zinc-105 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-350 text-[9.5px] font-mono font-bold rounded-lg cursor-pointer transition-colors"
                            >
                              ₹{Math.round(inv.amount * 0.50).toLocaleString('en-IN')} (50%)
                            </button>
                            <button
                              type="button"
                              onClick={() => onPartialPayment(inv.id, Math.round(inv.amount * 0.75))}
                              className="px-2.5 py-1 bg-white hover:bg-zinc-105 dark:bg-zinc-800 dark:hover:bg-zinc-750 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-350 text-[9.5px] font-mono font-bold rounded-lg cursor-pointer transition-colors"
                            >
                              ₹{Math.round(inv.amount * 0.75).toLocaleString('en-IN')} (75%)
                            </button>
                          </div>
                        </div>
                      )}

                      {!isPaid && (
                        <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex justify-between items-center gap-2">
                          <span className="text-[10.5px] text-zinc-400 flex items-center gap-1 italic">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Auto stop active on settlement
                          </span>
                          
                          <div className="flex gap-1.5 h-8">
                            <button
                              type="button"
                              onClick={() => {
                                onTriggerSingleNudge(inv.id, 'WhatsApp');
                              }}
                              className="px-3 bg-white hover:bg-emerald-50 dark:bg-zinc-800 border border-[#25D366]/40 text-[#075e54] dark:text-emerald-400 text-[10.5px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Smartphone className="w-3.5 h-3.5 text-emerald-500" /> WhatsApp Nudge
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                onTriggerSingleNudge(inv.id, 'Email');
                              }}
                              className="px-3 bg-white hover:bg-indigo-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-700 text-indigo-700 dark:text-indigo-300 text-[10.5px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Mail className="w-3.5 h-3.5 text-indigo-500" /> Email Nudge
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {selectedInvoices.length === 0 && (
                  <div className="p-8 text-center text-zinc-400 italic text-xs">
                    No active invoices created yet. Onboard invoices using the Quick Action.
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
