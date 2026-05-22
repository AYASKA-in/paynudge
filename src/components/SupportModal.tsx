import React, { useState } from 'react';
import { X, HelpCircle, Mail, MessageSquare, CheckCircle, ArrowRight, Shield } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export default function SupportModal({ isOpen, onClose, userEmail = '' }: SupportModalProps) {
  const [email, setEmail] = useState(userEmail);
  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setTicketId(`TKT-${Math.floor(100000 + Math.random() * 900000)}`);
    }, 1500);
  };

  const handleReset = () => {
    setTicketId('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1b1b24] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-zinc-150 dark:border-zinc-800/80 flex flex-col transition-colors duration-350">
        
        {/* HEADER */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-800/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-[#3525cd] dark:text-indigo-400 rounded-xl">
              <HelpCircle className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <h3 className="font-bold text-base text-[#1b1b24] dark:text-slate-100 tracking-tight">Support Desk & FAQ Hub</h3>
              <p className="text-[10px] text-[#777587] dark:text-zinc-500">Need help integrating Meta Cloud APIs or configuring UPI routing?</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 overflow-y-auto flex-1 bg-zinc-50/50 dark:bg-[#15151c] space-y-6">
          
          {/* Ticket Created State */}
          {ticketId ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/60 p-6 rounded-2xl text-center space-y-4 shadow-xs animate-nudge">
              <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-900/30">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-slate-100 uppercase tracking-wide">Support Ticket Dispatched</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto leading-relaxed">
                  Your ticket has been logged successfully in our system. A technician will review and reply within 1 hour.
                </p>
              </div>
              <div className="inline-block bg-zinc-100 dark:bg-zinc-800 text-[#3525cd] dark:text-indigo-400 font-mono text-[11px] font-bold p-2 px-4 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
                Ticket Reference: {ticketId}
              </div>
              <div>
                <button 
                  onClick={handleReset}
                  className="text-xs font-bold text-[#3525cd] dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  Create another ticket <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Form Section */}
              <div className="md:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/60 p-5 rounded-2xl shadow-xs space-y-4">
                <h4 className="font-extrabold text-[11px] text-zinc-900 dark:text-slate-100 uppercase tracking-widest border-b border-zinc-100 dark:border-zinc-800/50 pb-2">
                  Create support ticket
                </h4>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400 uppercase tracking-wide">Email Address</label>
                    <input 
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-slate-200 outline-hidden focus:border-[#3525cd]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400 uppercase tracking-wide">Help Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-slate-200 focus:border-[#3525cd]"
                    >
                      <option value="general">General Inquiries / Account</option>
                      <option value="whatsapp">Meta WhatsApp Cloud API integration</option>
                      <option value="upi">UPI VPA Custom Handles / Deep Links</option>
                      <option value="razorpay">Razorpay Auto-webhook Settle Error</option>
                      <option value="billing">Billing Dues / Plan Quota Upgrade</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400 uppercase tracking-wide">Subject Summary</label>
                    <input 
                      type="text"
                      required
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      placeholder="e.g. WhatsApp Sandbox Access Token expired"
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-slate-200 outline-hidden focus:border-[#3525cd]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400 uppercase tracking-wide">Description Details</label>
                    <textarea 
                      required
                      rows={3}
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Provide precise details of errors or questions..."
                      className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-slate-200 outline-hidden focus:border-[#3525cd]"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-[#3525cd] hover:bg-[#4f46e5] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        <span>Logging Ticket...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" /> Log Support Ticket
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* FAQs Section */}
              <div className="md:col-span-5 space-y-4">
                <h4 className="font-extrabold text-[11px] text-[#1b1b24] dark:text-slate-100 uppercase tracking-widest">
                  Frequently Asked Questions
                </h4>

                <div className="space-y-3">
                  <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/60 rounded-xl space-y-1">
                    <span className="text-[11px] font-extrabold text-zinc-800 dark:text-slate-200 block">Why are my WhatsApp nudges not delivering?</span>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Check your temporary WhatsApp Developer Access Token on Meta panel. These expire every 24 hours in sandbox developer mode.
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/60 rounded-xl space-y-1">
                    <span className="text-[11px] font-extrabold text-zinc-800 dark:text-slate-200 block">Are there any transaction commission fees?</span>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Zero fees! Dynamic UPI deep links route payments directly peer-to-peer to your registered business VPA address.
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800/60 rounded-xl space-y-1">
                    <span className="text-[11px] font-extrabold text-zinc-800 dark:text-slate-200 block">How to verify incoming webhooks?</span>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      Go to Integrations, verify client payloads using the simulated Razorpay payload trigger or Meta Sandbox simulator.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* Secure lock notice */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 p-3.5 rounded-2xl flex items-center gap-2.5 text-[10.5px] text-indigo-900 dark:text-indigo-400">
            <Shield className="w-4 h-4 text-[#3525cd] dark:text-indigo-450 shrink-0" />
            <span>
              All support requests are routed directly to <strong>support@paynudge.in</strong>. SLA: Premium plan tickets are verified by engineers within 30 minutes.
            </span>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-150 dark:border-zinc-800/80 flex justify-end">
          <button 
            onClick={onClose}
            className="p-2 px-5 bg-[#1b1b24] dark:bg-zinc-850 hover:bg-zinc-900 dark:hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            Close Support Desk
          </button>
        </div>

      </div>
    </div>
  );
}
