import React, { useState } from 'react';
import { Smartphone, Shield, Zap, ArrowRight, Wallet, ChevronDown, Check } from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (bizName: string, bizVpa: string, sector: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'onboard'>('login');
  const [vpaOrMobile, setVpaOrMobile] = useState('merchant@upi');
  const [bizName, setBizName] = useState('Acme Corp');
  const [sector, setSector] = useState('Professional Services');
  const [errorText, setErrorText] = useState('');
  const [recoveryMsg, setRecoveryMsg] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vpaOrMobile.trim()) {
      setErrorText('Please enter a valid mobile number or UPI VPA address.');
      return;
    }
    setErrorText('');
    setRecoveryMsg('');

    // If onboarding, enforce business name
    const finalBizName = activeTab === 'onboard' ? (bizName || 'My Business') : 'Acme Corp';
    // Clean VPA check or fallback
    let finalVpa = vpaOrMobile.includes('@') ? vpaOrMobile : `${vpaOrMobile}@upi`;
    if (!vpaOrMobile.includes('@') && isNaN(Number(vpaOrMobile.replace(/[\s\-\+]/g, '')))) {
      finalVpa = 'merchant@upi';
    }

    onLoginSuccess(finalBizName, finalVpa, sector);
  };

  return (
    <div className="w-full min-h-screen flex items-stretch bg-[#fcf8ff]">
      {/* Left Side: Interactive Preview (Warm Charcoal Matte) */}
      <section className="hidden lg:flex w-1/2 bg-[#302f39] text-[#eae6f4] flex-col justify-between p-12 relative overflow-hidden">
        {/* Brand */}
        <div className="z-10 relative">
          <h1 className="font-sans text-3xl font-black text-white flex items-center gap-2">
            <span className="p-1.5 bg-[#4f46e5] rounded-lg text-white">
              <Wallet className="w-6 h-6" />
            </span>
            PayNudge
          </h1>
          <p className="text-lg text-[#c7c4d8] mt-3 max-w-md">
            Seamless payments, zero friction. Nudge your customers exactly where they already are.
          </p>
        </div>

        {/* WhatsApp Mockup Canvas */}
        <div className="relative z-10 flex-grow flex items-center justify-center my-6">
          {/* Phone Frame Outline */}
          <div className="w-[320px] h-[520px] border border-[#777587]/30 rounded-[3rem] p-3 relative bg-[#1b1b24] shadow-2xl flex flex-col justify-between">
            {/* Top Bar / Channel name */}
            <div className="flex items-center gap-2 pb-3 border-b border-[#777587]/20 mb-2">
              <div className="w-9 h-9 rounded-full bg-[#eae6f4] flex items-center justify-center text-[#3525cd] font-black text-sm">
                A
              </div>
              <div>
                <div className="font-semibold text-xs text-white flex items-center gap-1">
                  {bizName || 'Acme Corp'}
                  <span className="inline-block w-3 h-3 bg-[#3525cd] text-white rounded-full flex items-center justify-center text-[7px]">✓</span>
                </div>
                <div className="text-[10px] text-[#c7c4d8]/80 font-mono">Verified Business Reminders</div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow flex flex-col justify-end space-y-3 pb-2 overflow-hidden">
              {/* Message Block 1 */}
              <div className="bg-[#eae6f4] text-[#1b1b24] p-3 rounded-2xl rounded-tl-xs w-[88%] self-start shadow-sm transition-all duration-500 transform translate-y-0">
                <p className="text-[11px] font-sans leading-relaxed text-[#1b1b24]">
                  Hi Rahul, your invoice <span className="font-bold text-[#3525cd]">#INV-2041</span> for <span className="font-bold">₹4,500</span> is due today.
                </p>
                <div className="mt-2 bg-white p-2 rounded-lg border border-[#c7c4d8]/40 flex justify-between items-center cursor-pointer hover:border-[#3525cd] transition-colors">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 bg-[#f5f2ff] rounded text-[#3525cd]">
                      <Wallet className="w-3.5 h-3.5" />
                    </span>
                    <span className="text-[10px] font-bold text-[#3525cd]">Pay Now via UPI</span>
                  </div>
                  <span className="text-xs text-[#777587] font-semibold">→</span>
                </div>
              </div>

              {/* Message Block 2 (Success flag) */}
              <div className="bg-[#3525cd]/15 border border-[#3525cd]/35 text-white p-3 rounded-2xl rounded-tr-xs w-[88%] self-end shadow-sm">
                <div className="flex items-center gap-1.5 mb-1 text-[#3525cd]">
                  <div className="w-4 h-4 rounded-full bg-[#3525cd] flex items-center justify-center text-white">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Payment Settled</span>
                </div>
                <p className="text-[11px] text-[#464555] font-medium">₹4,500 received via secure UPI. Thank you!</p>
                <div className="text-[9px] text-[#777587] font-mono mt-1">Ref UTR: UTR8472910</div>
              </div>
            </div>

            {/* Micro mock actions */}
            <div className="pt-2 border-t border-[#777587]/15">
              <div className="w-full h-8 bg-[#302f39] rounded-xl flex items-center justify-center text-[10px] text-[#c7c4d8] font-mono">
                Powered by PayNudge India
              </div>
            </div>
          </div>

          {/* Glowing orb decorative background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#3525cd]/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        </div>

        {/* Trust Indicators */}
        <div className="z-10 relative flex justify-between items-center text-[#c7c4d8] text-xs pt-4 border-t border-[#777587]/20">
          <div className="flex items-center gap-1.5 font-medium">
            <Shield className="w-4 h-4 text-[#3525cd]" /> Bank-Grade Encryption
          </div>
          <div className="flex items-center gap-1.5 font-medium">
            <Zap className="w-4 h-4 text-[#ffb695]" /> Real-time Settlement
          </div>
        </div>
      </section>

      {/* Right Side: Onboarding Panel */}
      <section className="w-full lg:w-1/2 bg-white flex items-center justify-center p-6 md:p-12 relative">
        {/* Mobile Header (Visible only on small screens) */}
        <div className="absolute top-6 left-6 lg:hidden flex items-center gap-2">
          <span className="p-1.5 bg-[#3525cd] rounded-lg text-white">
            <Wallet className="w-5 h-5" />
          </span>
          <span className="text-lg font-black text-[#1b1b24]">PayNudge</span>
        </div>

        <div className="w-full max-w-[420px] space-y-8">
          <div>
            <h2 className="text-3xl font-black text-[#1b1b24] tracking-tight">Collect polite. Ask professional.</h2>
            <p className="text-sm text-[#464555] mt-1">
              Reduce manual chasing. Schedule smart WhatsApp reminders and collect directly via standard local UPI.
            </p>
          </div>

          {/* Form Canvas */}
          <div className="bg-[#ffffff] border border-[#e2e2ee] rounded-2xl p-6 md:p-8 shadow-md hover:border-[#c3c0ff] transition-all duration-300">
            {/* Tab Switcher */}
            <div className="flex border-b border-[#e4e1ee]/60 mb-6">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('login');
                  setErrorText('');
                }}
                className={`pb-3 font-semibold text-sm px-4 border-b-2 transition-all ${
                  activeTab === 'login' ? 'border-[#3525cd] text-[#3525cd]' : 'border-transparent text-[#777587] hover:text-[#1b1b24]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('onboard');
                  setErrorText('');
                }}
                className={`pb-3 font-semibold text-sm px-4 border-b-2 transition-all ${
                  activeTab === 'onboard' ? 'border-[#3525cd] text-[#3525cd]' : 'border-transparent text-[#777587] hover:text-[#1b1b24]'
                }`}
              >
                Onboard Business
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Conditional business name input during onboarding */}
              {activeTab === 'onboard' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#464555]">Business Name / Merchant Entity</label>
                  <input
                    type="text"
                    required
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    placeholder="e.g. Acme Classes or Metro Distributors"
                    className="w-full px-4 py-2.5 bg-[#fcf8ff] border border-[#c7c4d8] rounded-xl text-sm focus:outline-hidden focus:border-[#3525cd]"
                  />
                </div>
              )}

              {/* UPI / VPA / Mobile number Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#464555]">
                  {activeTab === 'onboard' ? 'Business UPI VPA (For Direct Settlement)' : 'Business VPA or Registered Mobile'}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#777587]">
                    <Wallet className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={vpaOrMobile}
                    onChange={(e) => setVpaOrMobile(e.target.value)}
                    placeholder={activeTab === 'onboard' ? 'e.g. acme@okhdfcbank' : 'e.g. merchant@upi or 9876543210'}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#fcf8ff] border border-[#c7c4d8] rounded-xl text-sm focus:outline-hidden focus:border-[#3525cd]"
                  />
                </div>
                <p className="text-[11px] text-[#777587] leading-relaxed">
                  Collected amounts clear directly into your linked bank account with zero platform friction.
                </p>
              </div>

              {/* Business Sector Picker */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#464555]">Business Operational Sector</label>
                <div className="relative">
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#fcf8ff] border border-[#c7c4d8] rounded-xl text-sm focus:outline-hidden focus:border-[#3525cd] appearance-none"
                  >
                    <option value="Tuition & Coaching">Tuition & Coaching Centers</option>
                    <option value="Professional Services">Freelance & Professional Agencies</option>
                    <option value="Retail & Kirana">Retail & Kirana Distributors</option>
                    <option value="Local Clinics">Clinics & Healthcare Services</option>
                    <option value="Logistics & Supply">Local B2B Wholesalers</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-[#777587]">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {activeTab === 'login' && (
                <div className="flex justify-end text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setRecoveryMsg('SaaS Recovery Dispatch: A secure sandbox recovery OTP token has been simulated to your business email/mobile. No physical credentials needed.');
                    }}
                    className="text-[#3525cd] hover:underline font-bold cursor-pointer"
                  >
                    Forgot Password / Recover Workspace?
                  </button>
                </div>
              )}

              {recoveryMsg && (
                <div className="text-xs text-green-700 font-bold bg-green-50 justify-center p-3 rounded-lg border border-green-150 leading-relaxed text-center animate-nudge">
                  {recoveryMsg}
                </div>
              )}

              {errorText && (
                <div className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg">
                  {errorText}
                </div>
              )}

              {/* Submit btn */}
              <button
                type="submit"
                className="w-full py-3 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
              >
                {activeTab === 'onboard' ? 'Register & Go to Dashboard' : 'Continue to Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-grow border-t border-[#e4e1ee]/60"></div>
              <span className="mx-3 text-[10px] font-mono text-[#777587] uppercase tracking-widest">OR SEED MOCK</span>
              <div className="flex-grow border-t border-[#e4e1ee]/60"></div>
            </div>

            {/* Quick pre-auth simulation */}
            <button
              onClick={() => onLoginSuccess('Acme Corp', 'merchant@upi', 'Tuition & Coaching')}
              className="w-full py-2.5 border border-[#3525cd]/40 text-[#3525cd] font-semibold rounded-xl text-xs hover:bg-[#f5f2ff] transition-all flex items-center justify-center gap-2"
            >
              ⚡ Load High-Fidelity Demo Sandbox
            </button>
          </div>

          {/* Footer Terms */}
          <div className="text-center text-[11px] text-[#777587]">
            <p>
              By proceeding, you authorize PayNudge to generate standard UPI strings. 
              <br />
              <a href="#" className="text-[#3525cd] underline hover:text-[#4f46e5] mr-2">Terms of Use</a>
              <a href="#" className="text-[#3525cd] underline hover:text-[#4f46e5]">Privacy Shield</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
