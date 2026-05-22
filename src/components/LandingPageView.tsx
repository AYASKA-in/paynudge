import React, { useState } from 'react';
import { 
  Smartphone, 
  MessageSquare, 
  Wallet, 
  Sparkles, 
  CheckCircle, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Users, 
  History, 
  Database,
  Lock,
  Star,
  RefreshCw,
  HelpCircle
} from 'lucide-react';

interface LandingPageViewProps {
  onStartOnboarding: () => void;
  onLaunchDemo: () => void;
  onOpenTerms: () => void;
  onOpenPrivacy: () => void;
}

export default function LandingPageView({ onStartOnboarding, onLaunchDemo, onOpenTerms, onOpenPrivacy }: LandingPageViewProps) {
  // Live Simulator State
  const [clientName, setClientName] = useState('Rahul Verma');
  const [invoiceAmount, setInvoiceAmount] = useState('4500');
  const [invoiceId, setInvoiceId] = useState('INV-8951');
  const [simulatorStatus, setSimulatorStatus] = useState<'idle' | 'sent' | 'delivered' | 'read' | 'paid'>('idle');
  const [simUtr, setSimUtr] = useState('');

  // Waitlist State
  const [waitlistBiz, setWaitlistBiz] = useState('');
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistVpa, setWaitlistVpa] = useState('');
  const [waitlistVolume, setWaitlistVolume] = useState('1-5 Lakhs');
  const [waitlistChannel, setWaitlistChannel] = useState('WhatsApp');
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false);
  const [waitlistPosition, setWaitlistPosition] = useState(0);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const position = Math.floor(100 + Math.random() * 800);
    setWaitlistPosition(position);
    
    // Save to localStorage list paynudge_leads
    const existingLeadsRaw = localStorage.getItem('paynudge_leads');
    const existingLeads = existingLeadsRaw ? JSON.parse(existingLeadsRaw) : [];
    const newLead = {
      id: `lead-${Date.now()}`,
      businessName: waitlistBiz,
      email: waitlistEmail,
      vpa: waitlistVpa,
      volume: waitlistVolume,
      channel: waitlistChannel,
      position: position,
      submittedAt: new Date().toISOString(),
      status: 'Pending Approval'
    };
    localStorage.setItem('paynudge_leads', JSON.stringify([newLead, ...existingLeads]));

    setWaitlistSubmitted(true);
    setWaitlistBiz('');
    setWaitlistEmail('');
    setWaitlistVpa('');
  };

  const handleSimulateSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !invoiceAmount) return;
    setSimulatorStatus('sent');
    setTimeout(() => {
      setSimulatorStatus('delivered');
    }, 1200);
  };

  const handleSimulateRead = () => {
    if (simulatorStatus === 'delivered') {
      setSimulatorStatus('read');
    }
  };

  const handleSimulatePayment = () => {
    setSimulatorStatus('paid');
    setSimUtr(`UTR${Math.floor(10000000 + Math.random() * 90000000)}`);
  };

  const resetSimulator = () => {
    setSimulatorStatus('idle');
    setSimUtr('');
  };

  return (
    <div className="w-full min-h-screen bg-[#fcf8ff] text-[#1e1d2c] font-sans antialiased overflow-x-hidden selection:bg-[#3b2fe2] selection:text-white">
      {/* 1. ELEGANT HEADER */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-[#e4e1ee]/60 relative z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#3b2fe2] rounded-xl flex items-center justify-center text-white shadow-xs">
            <span className="font-extrabold text-base leading-none">PN</span>
          </div>
          <div>
            <h1 className="font-sans text-xl font-black text-[#3b2fe2] tracking-tight">PayNudge</h1>
            <p className="text-[10px] text-[#585575] font-mono leading-none font-bold">MSME Collections OS</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-[#585575]">
          <a href="#features" className="hover:text-[#3b2fe2] transition-colors">Features</a>
          <a href="#simulator" className="hover:text-[#3b2fe2] transition-colors">Live Demo</a>
          <a href="#pricing" className="hover:text-[#3b2fe2] transition-colors">Pricing</a>
          <a href="#trust" className="hover:text-[#3b2fe2] transition-colors">Security</a>
        </nav>

        <div className="flex items-center gap-3">
          <button 
            onClick={onLaunchDemo}
            className="text-xs font-bold text-[#585575] hover:text-[#3b2fe2] px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            Launch Sandbox
          </button>
          <button 
            onClick={onStartOnboarding}
            className="bg-[#3b2fe2] hover:bg-[#3b2fe2]/90 text-white font-bold text-xs p-2 px-5 rounded-xl shadow-md transition-all hover:scale-[1.02] cursor-pointer"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-25">
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-[#f3f0ff] border border-[#dcd6fc] p-1 px-3 rounded-full text-[11px] font-bold text-[#3b2fe2] animate-bounce">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Smart Automated Receivables for Indian SMBs</span>
          </div>

          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1e1d2c] tracking-tight leading-tight">
            Collect polite. <br />
            <span className="text-[#3b2fe2]">Settle instant via UPI.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#585575] leading-relaxed max-w-xl mx-auto lg:mx-0">
            Reduce outstanding dues by 3x. PayNudge delivers automated payment reminders directly to your clients on WhatsApp, embedded with peer-to-peer UPI handles. No merchant fees, zero transaction delays.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button 
              onClick={onStartOnboarding}
              className="w-full sm:w-auto bg-[#3b2fe2] hover:bg-[#3b2fe2]/90 text-white font-bold text-sm p-4 px-8 rounded-xl shadow-lg hover:shadow-indigo-500/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
            >
              Onboard Your Business <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={onLaunchDemo}
              className="w-full sm:w-auto bg-white hover:bg-[#f9f8fc] border border-[#e4e1ee] text-[#585575] font-bold text-sm p-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              Launch Sandbox Demo
            </button>
          </div>

          <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-[#585575] font-semibold">
            <span className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-600" /> NPCI UPI Compliant</span>
            <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-[#ffb695]" /> Instant Settlement</span>
          </div>
        </div>

        {/* Hero Illustration: Interactive App Shell Mockup */}
        <div className="lg:col-span-6 flex justify-center relative">
          <div className="w-full max-w-[460px] bg-white border border-[#e4e1ee] rounded-3xl p-5 shadow-2xl relative">
            <div className="flex justify-between items-center pb-3 border-b border-[#e4e1ee]/60 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-red-400 rounded-full"></span>
                <span className="w-3 h-3 bg-amber-400 rounded-full"></span>
                <span className="w-3 h-3 bg-green-400 rounded-full"></span>
              </div>
              <span className="text-[10px] font-mono text-[#585575] font-bold">paynudge.in/dashboard</span>
            </div>

            {/* Simulated Dashboard Stats */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#fcf8ff] p-3 rounded-xl border border-[#e4e1ee]/40">
                  <span className="text-[9px] font-extrabold text-[#585575] uppercase block">Outstanding Dues</span>
                  <span className="text-base font-black text-[#1e1d2c] font-mono mt-0.5">₹1,82,500</span>
                </div>
                <div className="bg-[#fcf8ff] p-3 rounded-xl border border-[#e4e1ee]/40">
                  <span className="text-[9px] font-extrabold text-[#585575] uppercase block">MTD Settled (100% Free)</span>
                  <span className="text-base font-black text-emerald-600 font-mono mt-0.5">₹3,45,000</span>
                </div>
              </div>

              {/* Client aging tracker */}
              <div className="bg-[#fcf8ff] p-3.5 rounded-xl border border-[#e4e1ee]/40 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-extrabold text-[#585575] uppercase">
                  <span>Client Collectability Risk</span>
                  <span className="text-red-500 font-mono">High Risk (61+ Days)</span>
                </div>
                <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-[#3b2fe2] rounded-full"></div>
                </div>
              </div>

              {/* simulated notification audit row */}
              <div className="p-3 bg-[#eae6f4]/45 border border-[#3b2fe2]/15 rounded-xl flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#3b2fe2]" />
                  <span>Nudge INV-8951 sent to Rahul Verma</span>
                </div>
                <span className="text-[9px] font-mono bg-[#3b2fe2] text-white px-2 py-0.5 rounded-full font-bold">DELIVERED</span>
              </div>
            </div>
          </div>
          {/* Decorative glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#3b2fe2]/10 rounded-full blur-3xl -z-10"></div>
        </div>
      </section>

      {/* 3. INTERACTIVE SIMULATOR SECTION */}
      <section id="simulator" className="bg-[#f5f2ff] border-y border-[#e4e1ee] py-20 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-2 mb-12">
            <span className="text-[10px] font-extrabold uppercase text-[#3b2fe2] tracking-wider">Try it Live</span>
            <h3 className="text-3xl font-black text-[#1e1d2c] tracking-tight">Interactive Nudge Simulator</h3>
            <p className="text-xs sm:text-sm text-[#585575] max-w-xl mx-auto leading-relaxed">
              Create a test invoice below and see how our system generates compliance-safe WhatsApp notifications and handles settlements.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Input Form Column */}
            <div className="lg:col-span-5 bg-white border border-[#e4e1ee] rounded-3xl p-6 shadow-md flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-sm text-[#1e1d2c] uppercase tracking-wider mb-4 border-b border-[#e4e1ee]/60 pb-2">
                  1. Setup Test Invoice
                </h4>
                <form onSubmit={handleSimulateSend} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#585575]">Client / Debtor Name</label>
                    <input 
                      type="text" 
                      value={clientName} 
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Rahul Verma"
                      required
                      className="w-full px-4 py-2.5 bg-[#fcf8ff] border border-[#e4e1ee] rounded-xl text-xs outline-hidden focus:border-[#3b2fe2]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#585575]">Amount due (INR)</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-[#585575]">₹</span>
                      <input 
                        type="number" 
                        value={invoiceAmount} 
                        onChange={(e) => setInvoiceAmount(e.target.value)}
                        placeholder="e.g. 4500"
                        required
                        className="w-full pl-7 pr-4 py-2.5 bg-[#fcf8ff] border border-[#e4e1ee] rounded-xl text-xs outline-hidden focus:border-[#3b2fe2]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#585575]">Invoice ID</label>
                    <input 
                      type="text" 
                      value={invoiceId} 
                      onChange={(e) => setInvoiceId(e.target.value)}
                      placeholder="e.g. INV-8951"
                      required
                      className="w-full px-4 py-2.5 bg-[#fcf8ff] border border-[#e4e1ee] rounded-xl text-xs outline-hidden focus:border-[#3b2fe2]"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-3 bg-[#3b2fe2] hover:bg-[#3b2fe2]/90 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-4 h-4" /> Trigger Automated WhatsApp Alert
                  </button>
                </form>
              </div>

              {simulatorStatus !== 'idle' && (
                <button 
                  onClick={resetSimulator}
                  className="mt-6 text-center text-xs font-bold text-[#3b2fe2] hover:underline cursor-pointer"
                >
                  ← Reset Simulator & Try Another
                </button>
              )}
            </div>

            {/* Screen Previews Column */}
            <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* WhatsApp Message Panel */}
              <div className="bg-[#1b1b24] border border-[#777587]/30 rounded-3xl p-4 shadow-xl flex flex-col justify-between min-h-[380px] text-white">
                <div>
                  {/* Top header bar */}
                  <div className="flex items-center gap-2 pb-3 border-b border-[#777587]/20 mb-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#3b2fe2] font-black text-xs">
                      PN
                    </div>
                    <div>
                      <div className="font-semibold text-xs flex items-center gap-1">
                        PayNudge Collection
                        <span className="w-3.5 h-3.5 bg-[#3b2fe2] text-white rounded-full flex items-center justify-center text-[8px] border border-white/15">✓</span>
                      </div>
                      <div className="text-[9px] text-[#c7c4d8]/80 font-mono">Official Verified Business Reminders</div>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="space-y-3">
                    {simulatorStatus === 'idle' ? (
                      <div className="p-8 text-center text-[#c7c4d8]/50 italic text-xs">
                        Configure the form on the left and click trigger to dispatch a mockup WhatsApp alert.
                      </div>
                    ) : (
                      <div className="bg-[#eae6f4] text-[#1b1b24] p-3 rounded-2xl rounded-tl-xs w-[92%] self-start shadow-sm space-y-2 animate-nudge">
                        <p className="text-[11px] leading-relaxed">
                          Dear <strong>{clientName}</strong>, your payment for invoice <strong>#{invoiceId}</strong> of <strong>₹{Number(invoiceAmount).toLocaleString('en-IN')}</strong> is outstanding and due. Settle instantly:
                        </p>
                        
                        <div 
                          onClick={handleSimulateRead}
                          className="bg-white p-2.5 rounded-lg border border-[#c7c4d8]/40 flex justify-between items-center cursor-pointer hover:border-[#3b2fe2] transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Wallet className="w-4 h-4 text-[#3b2fe2]" />
                            <span className="text-[10px] font-bold text-[#3b2fe2]">Pay via BHIM-UPI Link</span>
                          </div>
                          <span className="text-xs text-[#777587]">→</span>
                        </div>
                        <span className="text-[9px] text-[#777587] block font-mono">TRAI compliant compliance disclaimer alert.</span>
                      </div>
                    )}

                    {/* Blue check status ticker */}
                    {simulatorStatus !== 'idle' && (
                      <div className="text-[10px] font-bold flex justify-end gap-1 select-none pr-3">
                        {simulatorStatus === 'sent' && <span className="text-[#c7c4d8]/50">✓ Sent</span>}
                        {simulatorStatus === 'delivered' && (
                          <span className="text-[#c7c4d8]/80 cursor-pointer hover:underline" onClick={handleSimulateRead}>
                            ✓✓ Delivered (Click to read)
                          </span>
                        )}
                        {(simulatorStatus === 'read' || simulatorStatus === 'paid') && (
                          <span className="text-sky-400">✓✓ Read</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#777587]/15">
                  <div className="w-full text-center text-[9px] font-mono text-[#c7c4d8]/50">
                    STATUS: {simulatorStatus.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Payment Settlement / Gateways simulation */}
              <div className="bg-white border border-[#e4e1ee] rounded-3xl p-5 shadow-xl min-h-[380px] flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-[#1e1d2c] uppercase tracking-wider mb-4 border-b border-[#e4e1ee]/60 pb-2">
                    2. Payment Gateway Hub
                  </h4>

                  {simulatorStatus === 'idle' || simulatorStatus === 'sent' || simulatorStatus === 'delivered' ? (
                    <div className="p-8 text-center text-[#585575] italic text-xs leading-relaxed">
                      Awaiting user interaction. Click "Pay via BHIM-UPI Link" inside the WhatsApp preview to trigger checkout link.
                    </div>
                  ) : (
                    <div className="space-y-4 animate-nudge">
                      <div className="p-3 bg-[#fcf8ff] border border-[#3b2fe2]/15 rounded-2xl flex flex-col items-center justify-center">
                        <span className="text-[9px] font-extrabold uppercase text-[#585575] tracking-widest block mb-2">Scan & Pay via any UPI App</span>
                        
                        {/* Simulated QR Code */}
                        <div className="w-28 h-28 bg-white border border-zinc-200 p-2 rounded-xl flex items-center justify-center shadow-xs">
                          <div className="grid grid-cols-4 gap-1 w-full h-full opacity-75">
                            {Array.from({ length: 16 }).map((_, i) => (
                              <div key={i} className={`rounded-xs ${i % 3 === 0 || i % 5 === 0 ? 'bg-zinc-900' : 'bg-transparent'}`}></div>
                            ))}
                          </div>
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono font-bold mt-2">paynudge.merchant@upi</span>
                      </div>

                      {simulatorStatus !== 'paid' ? (
                        <button 
                          onClick={handleSimulatePayment}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle className="w-4 h-4" /> Simulate Paid Completion
                        </button>
                      ) : (
                        <div className="bg-emerald-50 border border-emerald-200/50 text-emerald-800 p-3.5 rounded-2xl space-y-2 text-center animate-nudge">
                          <div className="flex items-center justify-center gap-1.5 text-emerald-700 font-bold">
                            <CheckCircle className="w-5 h-5 fill-current text-emerald-500" />
                            <span className="text-xs uppercase tracking-wider">Payment Confirmed</span>
                          </div>
                          <p className="text-[11px]">₹{Number(invoiceAmount).toLocaleString('en-IN')} reconciled. Ledger updated!</p>
                          <div className="text-[9px] font-mono text-emerald-600">Ref: {simUtr}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[#e4e1ee]/60 text-center text-[10px] text-[#585575] font-mono">
                  NPCI UPI Protocol Standard Interface
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURES GRID */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center space-y-2 mb-16">
          <span className="text-[10px] font-extrabold uppercase text-[#3b2fe2] tracking-wider">Built for MSMEs</span>
          <h3 className="text-3xl font-black text-[#1e1d2c] tracking-tight">Robust Collections Infrastructure</h3>
          <p className="text-xs sm:text-sm text-[#585575] max-w-xl mx-auto leading-relaxed">
            Everything your business needs to automate notifications, secure cash flow, and maintain clean audit records.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white border border-[#e4e1ee] p-6 rounded-3xl shadow-xs hover:shadow-md transition-all hover:scale-[1.01]">
            <div className="w-10 h-10 bg-[#f3f0ff] rounded-xl flex items-center justify-center text-[#3b2fe2] mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#1e1d2c] uppercase tracking-wider mb-2">WhatsApp-First Reminders</h4>
            <p className="text-xs text-[#585575] leading-relaxed">
              Reach clients directly in their primary messaging channel. Maintain compliance hours (9 PM to 8 AM quiet periods) automatically.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#e4e1ee] p-6 rounded-3xl shadow-xs hover:shadow-md transition-all hover:scale-[1.01]">
            <div className="w-10 h-10 bg-[#f3f0ff] rounded-xl flex items-center justify-center text-[#3b2fe2] mb-4">
              <Wallet className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#1e1d2c] uppercase tracking-wider mb-2">Direct UPI Settlement</h4>
            <p className="text-xs text-[#585575] leading-relaxed">
              Accept payment directly to your linked UPI VPA address. Zero intermediaries, zero processing fees, and immediate cash availability.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#e4e1ee] p-6 rounded-3xl shadow-xs hover:shadow-md transition-all hover:scale-[1.01]">
            <div className="w-10 h-10 bg-[#f3f0ff] rounded-xl flex items-center justify-center text-[#3b2fe2] mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#1e1d2c] uppercase tracking-wider mb-2">AI-Powered Risk Scoring</h4>
            <p className="text-xs text-[#585575] leading-relaxed">
              Predict payment delay likelihood and automatically trigger optimal message tones (polite, strict, legal) based on debtor behavior history.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-[#e4e1ee] p-6 rounded-3xl shadow-xs hover:shadow-md transition-all hover:scale-[1.01]">
            <div className="w-10 h-10 bg-[#f3f0ff] rounded-xl flex items-center justify-center text-[#3b2fe2] mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#1e1d2c] uppercase tracking-wider mb-2">Webhook Reconciliation</h4>
            <p className="text-xs text-[#585575] leading-relaxed">
              Ingest instant callbacks from Razorpay or Meta Cloud. Payment status settles automatically without manual ledger matching.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-white border border-[#e4e1ee] p-6 rounded-3xl shadow-xs hover:shadow-md transition-all hover:scale-[1.01]">
            <div className="w-10 h-10 bg-[#f3f0ff] rounded-xl flex items-center justify-center text-[#3b2fe2] mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#1e1d2c] uppercase tracking-wider mb-2">Multi-Tenant RBAC Security</h4>
            <p className="text-xs text-[#585575] leading-relaxed">
              Support roles for Owners, Finance Admins, and Staff. Mask critical database credentials and restrict live production gateway keys.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-white border border-[#e4e1ee] p-6 rounded-3xl shadow-xs hover:shadow-md transition-all hover:scale-[1.01]">
            <div className="w-10 h-10 bg-[#f3f0ff] rounded-xl flex items-center justify-center text-[#3b2fe2] mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-[#1e1d2c] uppercase tracking-wider mb-2">Robust offline Circuit Breaker</h4>
            <p className="text-xs text-[#585575] leading-relaxed">
              If downstream API nodes undergo connection storms or outages, internal circuit breakers isolate failures to preserve core SaaS runtimes.
            </p>
          </div>
        </div>
      </section>

      {/* 4.5 TRUST, COMPLIANCE & CUSTOMER STORIES SECTION */}
      <section className="bg-[#fcf8ff] border-t border-[#e4e1ee] py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          {/* Trust and Compliance Badges Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 items-center text-center">
            <div className="bg-white border border-[#e4e1ee] p-4 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-[#3b2fe2] tracking-wider block">MDR Transaction Cost</span>
              <span className="text-lg font-black text-[#1e1d2c] font-mono">0% ZERO FEES</span>
            </div>
            <div className="bg-white border border-[#e4e1ee] p-4 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-[#3b2fe2] tracking-wider block">PCI-DSS Framework</span>
              <span className="text-lg font-black text-[#1e1d2c] font-mono">100% SECURE</span>
            </div>
            <div className="bg-white border border-[#e4e1ee] p-4 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-[#3b2fe2] tracking-wider block">RBI Settlement Policy</span>
              <span className="text-lg font-black text-[#1e1d2c] font-mono">DIRECT TO BANK</span>
            </div>
            <div className="bg-white border border-[#e4e1ee] p-4 rounded-2xl shadow-xs space-y-1">
              <span className="text-[10px] font-black uppercase text-[#3b2fe2] tracking-wider block">Cloud Host Gateway</span>
              <span className="text-lg font-black text-[#1e1d2c] font-mono">99.9% UPTIME</span>
            </div>
          </div>

          {/* Customer Stories / Testimonials Grid */}
          <div className="space-y-10">
            <div className="text-center space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-[#3b2fe2] tracking-wider">Customer Success Stories</span>
              <h3 className="text-2xl font-black text-[#1e1d2c] tracking-tight">Trusted by leading Indian B2B Merchants</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white border border-[#e4e1ee] p-6 rounded-3xl space-y-4 shadow-xs text-left">
                <p className="text-xs text-[#585575] leading-relaxed italic">
                  "Before PayNudge, our accounts team was spending 10+ hours a week sending copy-paste payment follow-ups. Transitioning to direct UPI reminders reduced our collection cycle from 18 days to 3.4 days, and we paid ₹0 in processing fees."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f3f0ff] flex items-center justify-center font-bold text-xs text-[#3b2fe2]">
                    AS
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-[#1e1d2c]">Apex Steel Distributors</h5>
                    <span className="text-[10px] text-[#777587]">Delhi NCR • B2B Wholesaler</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#e4e1ee] p-6 rounded-3xl space-y-4 shadow-xs text-left">
                <p className="text-xs text-[#585575] leading-relaxed italic">
                  "Our retail clients settle in seconds now. The WhatsApp nudges are polite yet highly effective, and having the direct BHIM-UPI QR code on the link means clients don't need credit cards to clear their balances."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#f3f0ff] flex items-center justify-center font-bold text-xs text-[#3b2fe2]">
                    TS
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-[#1e1d2c]">Tiwari Sweets & Bakers</h5>
                    <span className="text-[10px] text-[#777587]">Jaipur • Regional Bakery Chain</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING SECTION */}
      <section id="pricing" className="bg-white border-y border-[#e4e1ee] py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-2 mb-16">
            <span className="text-[10px] font-extrabold uppercase text-[#3b2fe2] tracking-wider">Simple Transparent Pricing</span>
            <h3 className="text-3xl font-black text-[#1e1d2c] tracking-tight">Plans designed for any growth scale</h3>
            <p className="text-xs sm:text-sm text-[#585575] max-w-xl mx-auto leading-relaxed">
              All plans settle funds directly to your linked UPI address with zero transaction processing cuts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
            {/* Plan 1 */}
            <div className="bg-[#fcf8ff] border border-[#e4e1ee]/60 p-8 rounded-3xl flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#585575] block mb-2">Free Sandbox</span>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black text-[#1e1d2c] font-mono">₹0</span>
                  <span className="text-xs text-[#585575] font-semibold">/ forever</span>
                </div>
                <p className="text-xs text-[#585575] leading-relaxed mb-6">Perfect for sandbox testing and exploring the collections dashboard.</p>
                
                <ul className="space-y-2 text-xs font-semibold text-[#585575] mb-8">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> 5 Active billing debtors</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Manual WhatsApp simulations</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Standard UPI link generation</li>
                </ul>
              </div>
              <button 
                onClick={onLaunchDemo}
                className="w-full py-3 border border-[#3b2fe2]/30 text-[#3b2fe2] hover:bg-[#3b2fe2]/5 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Launch Test Sandbox
              </button>
            </div>

            {/* Plan 2 */}
            <div className="bg-[#fcf8ff] border-2 border-[#3b2fe2] p-8 rounded-3xl flex flex-col justify-between relative shadow-lg">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#3b2fe2] text-white text-[9px] font-black uppercase tracking-wider p-1 px-4 rounded-full">
                Most Popular
              </span>
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#3b2fe2] block mb-2">Starter Premium</span>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black text-[#1e1d2c] font-mono">₹999</span>
                  <span className="text-xs text-[#585575] font-semibold">/ month</span>
                </div>
                <p className="text-xs text-[#585575] leading-relaxed mb-6">Built for growing regional firms channelling manual collections pipelines.</p>
                
                <ul className="space-y-2 text-xs font-semibold text-[#585575] mb-8">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#3b2fe2] shrink-0" /> 50 Active billing debtors</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#3b2fe2] shrink-0" /> Automated WhatsApp reminders</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#3b2fe2] shrink-0" /> Custom branding alerts</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#3b2fe2] shrink-0" /> Dynamic webhook integrations</li>
                </ul>
              </div>
              <button 
                onClick={onStartOnboarding}
                className="w-full py-3 bg-[#3b2fe2] hover:bg-[#3b2fe2]/90 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer text-center"
              >
                Start Free Onboarding
              </button>
            </div>

            {/* Plan 3 */}
            <div className="bg-[#fcf8ff] border border-[#e4e1ee]/60 p-8 rounded-3xl flex flex-col justify-between">
              <div>
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#585575] block mb-2">Enterprise growth</span>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black text-[#1e1d2c] font-mono">₹2,999</span>
                  <span className="text-xs text-[#585575] font-semibold">/ month</span>
                </div>
                <p className="text-xs text-[#585575] leading-relaxed mb-6">Designed for scale collections matching automated risk intelligence scoring.</p>
                
                <ul className="space-y-2 text-xs font-semibold text-[#585575] mb-8">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Unlimited active debtors</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> AI-Powered optimal send hours</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Full API integration support</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" /> Priority webhook settlement</li>
                </ul>
              </div>
              <button 
                onClick={onStartOnboarding}
                className="w-full py-3 border border-[#3b2fe2]/30 text-[#3b2fe2] hover:bg-[#3b2fe2]/5 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
              >
                Contact Sales Upgrade
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Beta Access Waitlist & Leads Capture Form */}
      <section id="waitlist" className="max-w-4xl mx-auto px-6 py-12 bg-white dark:bg-[#1a1a26]/60 border border-[#e4e1ee] dark:border-zinc-800 rounded-3xl shadow-sm relative overflow-hidden my-6">
        <div className="absolute top-0 right-0 w-24 h-24 bg-[#3b2fe2]/5 rounded-full blur-xl"></div>
        
        <div className="text-center space-y-2 mb-6">
          <span className="text-[10px] font-extrabold uppercase text-[#3b2fe2] dark:text-indigo-400 tracking-wider block">Join The Beta</span>
          <h3 className="text-2xl font-black text-[#1e1d2c] dark:text-slate-100 tracking-tight">Request Early Waitlist Access</h3>
          <p className="text-xs text-[#585575] dark:text-zinc-400 max-w-md mx-auto">
            PayNudge is currently in private preview. Register your UPI Virtual Payment Address (VPA) to get verified for sandbox beta access.
          </p>
        </div>

        {waitlistSubmitted ? (
          <div className="text-center p-6 space-y-4">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/40 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 dark:border-emerald-900/30">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-zinc-900 dark:text-slate-100 uppercase">Waitlist Spot Confirmed!</h4>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
                Thank you! Your business profile has been cataloged. We will dispatch your WhatsApp onboarding credentials shortly.
              </p>
            </div>
            <div className="inline-block bg-zinc-50 dark:bg-zinc-900 text-[#3b2fe2] dark:text-indigo-400 font-mono text-xs font-bold p-2 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
              Queue Position: #{waitlistPosition}
            </div>
            <div>
              <button 
                type="button"
                onClick={() => setWaitlistSubmitted(false)}
                className="text-xs font-bold text-[#3b2fe2] dark:text-indigo-400 hover:underline cursor-pointer bg-transparent border-0"
              >
                Submit another request
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleWaitlistSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400 uppercase tracking-wide">Business / Merchant Name</label>
              <input 
                type="text"
                required
                value={waitlistBiz}
                onChange={e => setWaitlistBiz(e.target.value)}
                placeholder="e.g. Sharma Steel Corporation"
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-text-primary outline-hidden focus:border-[#3b2fe2]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400 uppercase tracking-wide">Contact Email</label>
              <input 
                type="email"
                required
                value={waitlistEmail}
                onChange={e => setWaitlistEmail(e.target.value)}
                placeholder="owner@sharmasteel.com"
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-text-primary outline-hidden focus:border-[#3b2fe2]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400 uppercase tracking-wide">UPI ID (VPA) for Collections</label>
              <input 
                type="text"
                required
                value={waitlistVpa}
                onChange={e => setWaitlistVpa(e.target.value)}
                placeholder="sharmasteel@okhdfcbank"
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-text-primary outline-hidden focus:border-[#3b2fe2]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400 uppercase tracking-wide">Monthly Billing Volume</label>
              <select
                value={waitlistVolume}
                onChange={e => setWaitlistVolume(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-text-primary focus:border-[#3b2fe2]"
              >
                <option value="< 1 Lakh">Under ₹1 Lakh / mo</option>
                <option value="1-5 Lakhs">₹1 Lakh - ₹5 Lakhs / mo</option>
                <option value="5-20 Lakhs">₹5 Lakhs - ₹20 Lakhs / mo</option>
                <option value="20+ Lakhs">Over ₹20 Lakhs / mo</option>
              </select>
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-zinc-650 dark:text-zinc-400 uppercase tracking-wide">Primary Collection Channel</label>
              <select
                value={waitlistChannel}
                onChange={e => setWaitlistChannel(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-text-primary focus:border-[#3b2fe2]"
              >
                <option value="WhatsApp">WhatsApp Reminders (Recommended)</option>
                <option value="Email">Email Statements Only</option>
                <option value="Both">Both WhatsApp & Email</option>
              </select>
            </div>

            <button 
              type="submit"
              className="md:col-span-2 py-3 bg-[#3b2fe2] hover:bg-[#4f46e5] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-2"
            >
              <span>Submit Early Access Request</span> <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </section>

      {/* 6. TRUST & MSME TESTIMONIALS */}
      <section id="trust" className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-6">
            <span className="text-[10px] font-extrabold uppercase text-[#3b2fe2] tracking-wider block">Customer Stories</span>
            <h3 className="text-3xl font-black text-[#1e1d2c] tracking-tight">Trusted by local Indian businesses</h3>
            <p className="text-xs sm:text-sm text-[#585575] leading-relaxed">
              Read how tuition coordinators, clinical labs, and B2B distributors save hours of chasing with PayNudge.
            </p>

            <div className="bg-white border border-[#e4e1ee] p-5 rounded-2xl flex items-center gap-3">
              <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center text-[#25D366]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xs text-[#1e1d2c] block">100% Encrypted & Secure</span>
                <span className="text-[10px] text-zinc-500">NPCI compliance standards strictly observed.</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Review 1 */}
            <div className="bg-white border border-[#e4e1ee] p-5 rounded-2xl space-y-3">
              <div className="flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <p className="text-xs text-[#585575] leading-relaxed italic">
                "Connecting our UPI handle took less than 2 minutes. Now, when student fees are pending, parents get a friendly WhatsApp with the fee summary. We collect 90% of our dues within 48 hours."
              </p>
              <div className="text-[10px] font-bold text-zinc-800">
                — Bhomia Coaching Academy, Jaipur
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white border border-[#e4e1ee] p-5 rounded-2xl space-y-3">
              <div className="flex gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
              </div>
              <p className="text-xs text-[#585575] leading-relaxed italic">
                "Our steel fabrication deliveries require immediate payment verification. The webhook integration means our staff gets notified the moment a client clears a UPI invoice. No fee, instant settlement."
              </p>
              <div className="text-[10px] font-bold text-zinc-800">
                — Sharma Goods Distributors, Ludhiana
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#1b1b24] text-[#c7c4d8]/80 py-12 border-t border-[#777587]/20 relative z-10 text-xs">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center text-[#3b2fe2]">
                <span className="font-extrabold text-sm">PN</span>
              </div>
              <span className="font-black text-white text-base tracking-tight">PayNudge</span>
            </div>
            <p className="text-[11px] text-[#c7c4d8]/60">
              The automated collections Operating System for Indian MSMEs. Peer-to-peer UPI linkages.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3 text-[10px]">Product</h5>
            <ul className="space-y-2">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#simulator" className="hover:text-white transition-colors">Interactive Demo</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing Details</a></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3 text-[10px]">Support & Trust</h5>
            <ul className="space-y-2">
              <li><a href="#trust" className="hover:text-white transition-colors">Security Standards</a></li>
              <li><span className="text-[#25D366] font-bold inline-flex items-center gap-1">● System Status: Operational</span></li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3 text-[10px]">Legal</h5>
            <ul className="space-y-2">
              <li><span onClick={onOpenPrivacy} className="cursor-pointer hover:text-white transition-colors">Privacy Policy</span></li>
              <li><span onClick={onOpenTerms} className="cursor-pointer hover:text-white transition-colors">Terms of Service</span></li>
              <li><span onClick={onOpenTerms} className="cursor-pointer hover:text-white transition-colors">Refund Policy</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-[#777587]/10 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#c7c4d8]/40">
          <span>&copy; {new Date().getFullYear()} PayNudge Technologies Private Limited. All Rights Reserved.</span>
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Direct settlement only. NPCI Unified Payments Interface compliance guidelines checked.</span>
        </div>
      </footer>
    </div>
  );
}
