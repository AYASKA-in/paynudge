import React from 'react';
import { X, ShieldAlert, FileText, Lock, CheckCircle } from 'lucide-react';

interface LegalPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'terms' | 'privacy';
}

export default function LegalPolicyModal({ isOpen, onClose, mode }: LegalPolicyModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#1b1b24] rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-zinc-150 dark:border-zinc-800/80 flex flex-col transition-colors duration-350">
        
        {/* HEADER */}
        <div className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-150 dark:border-zinc-800/80 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-[#3525cd] dark:text-indigo-400 rounded-xl">
              {mode === 'terms' ? <FileText className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </span>
            <div>
              <h3 className="font-bold text-base text-[#1b1b24] dark:text-slate-100 tracking-tight">
                {mode === 'terms' ? 'Terms of Service & Usage Agreements' : 'Privacy Shield & Data Policy'}
              </h3>
              <p className="text-[10px] text-[#777587] dark:text-zinc-500">
                Last modified: May 2026 • Compliance version 1.4.1
              </p>
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
        <div className="p-6 overflow-y-auto flex-1 text-xs text-zinc-650 dark:text-zinc-400 space-y-4 leading-relaxed font-sans">
          
          {mode === 'terms' ? (
            <>
              <div className="space-y-1.5">
                <span className="font-extrabold text-[#1b1b24] dark:text-slate-100 uppercase tracking-wide text-[10.5px] block">1. Scope of Service</span>
                <p>
                  PayNudge provides automated accounts receivable reminder scheduling and UPI peer-to-peer route wrapping software. PayNudge operates as a client-side interface orchestrating public gateways (Meta Cloud API, Resend, and Razorpay APIs).
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-extrabold text-[#1b1b24] dark:text-slate-100 uppercase tracking-wide text-[10.5px] block">2. Payment Routing Liability</span>
                <p>
                  All generated invoice links route funds directly to the merchant's specified UPI Virtual Payment Address (VPA) via standard deep linking protocols. PayNudge acts solely as a client-side generator. We never hold, intercept, or process client funds. Merchants are solely responsible for verifying the accuracy of their UPI handle/VPA.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-extrabold text-[#1b1b24] dark:text-slate-100 uppercase tracking-wide text-[10.5px] block">3. Spam Prevention & Message Compliance</span>
                <p>
                  Merchants agree to comply with TRAI (Telecom Regulatory Authority of India) and Meta WhatsApp Business policies. Automated reminders must not be triggered during quiet hours (9:00 PM to 8:00 AM local time). PayNudge reserves the right to suspend API sandbox keys if spam triggers are flagged.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-extrabold text-[#1b1b24] dark:text-slate-100 uppercase tracking-wide text-[10.5px] block">4. Refund Policy</span>
                <p>
                  Monthly SaaS subscriptions (Starter, Enterprise plans) are subject to a 7-day money-back guarantee. No refunds will be provided for instances where WhatsApp template delivery credits have been exhausted or verification callbacks have failed due to third-party endpoint outages.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <span className="font-extrabold text-[#1b1b24] dark:text-slate-100 uppercase tracking-wide text-[10.5px] block">1. Data Minimization & Retention</span>
                <p>
                  PayNudge processes minimal customer/debtor identifiers (WhatsApp number, invoice amount, and client email). For our sandbox testing environment, data is stored in the browser's <code>localStorage</code> database cache. Direct production databases utilize secure PostgreSQL partitions hosted in Supabase.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-extrabold text-[#1b1b24] dark:text-slate-100 uppercase tracking-wide text-[10.5px] block">2. Security & Credentials Encryption</span>
                <p>
                  Your downstream API credentials (Meta Cloud Access Tokens, Razorpay API Secret Keys) are handled with standard encryption protocols. PayNudge never transfers credentials or client records to external analytics brokers.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-extrabold text-[#1b1b24] dark:text-slate-100 uppercase tracking-wide text-[10.5px] block">3. Dynamic UPI Linking Security</span>
                <p>
                  Our system computes payment links utilizing open-standard NPCI URI schemas. These are assembled directly on your client device and are never aggregated or indexed on public lookup directories.
                </p>
              </div>

              <div className="space-y-1.5">
                <span className="font-extrabold text-[#1b1b24] dark:text-slate-100 uppercase tracking-wide text-[10.5px] block">4. Debtor Right to Opt-Out</span>
                <p>
                  Every automated WhatsApp notice contains a default compliance message. Debtors have the absolute right to unsubscribe or opt-out of reminders by replying 'STOP'. PayNudge registers opt-out flags and immediately ceases automated runs.
                </p>
              </div>
            </>
          )}

          {/* Compliance Shield Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 p-3.5 rounded-2xl flex items-start gap-2.5 text-[10.5px] text-emerald-800 dark:text-emerald-450">
            <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block uppercase tracking-wider text-[9.5px]">NPCI & Meta Verified Sandbox Standards</span>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                This sandbox environment validates real infrastructure behaviour. No payment keys are cached on remote servers. All encryption happens client-side.
              </p>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-150 dark:border-zinc-800/80 flex justify-between items-center">
          <span className="text-[10px] text-[#777587] dark:text-zinc-500 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5 text-[#3525cd] dark:text-indigo-450" /> Secure SSL Standard Link
          </span>
          <button 
            onClick={onClose}
            className="p-2 px-5 bg-[#1b1b24] dark:bg-zinc-850 hover:bg-zinc-900 dark:hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
          >
            I Acknowledge
          </button>
        </div>

      </div>
    </div>
  );
}
