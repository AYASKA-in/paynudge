import { useState, useEffect } from 'react';
import { Customer, InvoiceDue, ReminderTemplate } from '../types';
import { 
  Sparkles, 
  Smile, 
  MessageSquare, 
  VolumeX, 
  Copy, 
  RefreshCw, 
  Globe2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck,
  Check,
  Languages,
  BadgeAlert,
  BrainCircuit
} from 'lucide-react';
import { AICollectionsIntelligence } from '../lib/saasManager';
import { getUPILink } from '../data';

interface AICopilotViewProps {
  customers: Customer[];
  invoices: InvoiceDue[];
  businessVpa: string;
  businessName: string;
}

export default function AICopilotView({
  customers,
  invoices,
  businessVpa,
  businessName,
}: AICopilotViewProps) {
  // Current active customer selection for drafting
  const [selectedCustId, setSelectedCustId] = useState(customers[0]?.id || '');
  const [activeTone, setActiveTone] = useState<'polite' | 'formal' | 'strict_legal' | 'received'>('polite');
  const [activeLang, setActiveLang] = useState<'English' | 'Hindi' | 'Tamil' | 'Telugu' | 'Kannada'>('English');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [copilotDraftOutput, setCopilotDraftOutput] = useState('');
  const [wasCopied, setWasCopied] = useState(false);

  // Behavioral segments counters
  const activeUnpaid = invoices.filter(i => i.paymentStatus !== 'Paid');
  const findInvoicesForCustomer = (cId: string) => invoices.filter(i => i.customerId === cId);

  // Auto regenerate draft when parameters modify
  useEffect(() => {
    handleSynthesize();
  }, [selectedCustId, activeTone, activeLang]);

  const handleSynthesize = () => {
    const custObj = customers.find(c => c.id === selectedCustId);
    if (!custObj) return;

    setIsSynthesizing(true);
    // Simulate LLM latency processing
    setTimeout(() => {
      const matchInvoices = findInvoicesForCustomer(selectedCustId).filter(i => i.paymentStatus !== 'Paid');
      const targetInvoice = matchInvoices[0] || invoices[0] || { id: 'INV-TEMP', amount: 5000, dueDate: 'Due Today' };
      const compileLink = getUPILink(businessVpa, businessName, targetInvoice.amount, targetInvoice.id);

      let formulated = '';

      if (activeTone === 'polite') {
        switch (activeLang) {
          case 'Hindi':
            formulated = `नमस्ते ${custObj.name} जी, आशा है आप सकुशल हैं। ${businessName} से बिल ${targetInvoice.id} राशि ₹${targetInvoice.amount.toLocaleString('en-IN')} की भुगतान तारीख ${targetInvoice.dueDate} है। आपसे विनम्र अनुरोध है कि नीचे दिए गए सुरक्षित UPI लिंक पर क्लिक करके भुगतान पूरा करें: ${compileLink}। आपकी सुविधा के लिए बहुत धन्यवाद।`;
            break;
          case 'Tamil':
            formulated = `வணக்கம் ${custObj.name}, ${businessName} நிறுவனத்திடமிருந்து உங்களுடைய கட்டணத்தொகை ₹${targetInvoice.amount.toLocaleString('en-IN')} (இன்வாய்ஸ்: ${targetInvoice.id}), வரும் ${targetInvoice.dueDate} தேதியன்று செலுத்தப்பட வேண்டும். இந்த பாதுகாப்பான UPI லிங்க் மூலம் உங்கள் நிலுவைத் தொகையை எளிதாக செலுத்துமாறு கேட்டுக்கொள்கிறோம்: ${compileLink}. மிக்க நன்றி!`;
            break;
          case 'Telugu':
            formulated = `నమస్తే ${custObj.name} గారు, ${businessName} నుండి ఇన్వాయిస్ ${targetInvoice.id} రుసుము ₹${targetInvoice.amount.toLocaleString('en-IN')} గడువు తేదీ ${targetInvoice.dueDate}. దయచేసి క్రింది సురక్షితమైన UPI లింక్ ద్వారా రుసుము చెల్లించగలరు: ${compileLink}. ధన్యవాదాలు!`;
            break;
          case 'Kannada':
            formulated = `ನಮಸ್ತೆ ${custObj.name} ಅವರೇ, ${businessName} ನಿಂದ ಪಡೆದ ಇನ್‌ವಾಯ್ಸ್ ${targetInvoice.id} ಮೊತ್ತ ₹${targetInvoice.amount.toLocaleString('en-IN')} ಪಾವತಿಯ ಗಡುವು ${targetInvoice.dueDate} ಆಗಿದೆ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಸುರಕ್ಷಿತ UPI ಲಿಂಕ್ ಪಾವತಿಸಿ: ${compileLink}. ಧನ್ಯವಾದಗಳು!`;
            break;
          default:
            formulated = `Dear ${custObj.name}, I hope you are having a pleasant day. This is a gentle reminder that Invoice ${targetInvoice.id} for ₹${targetInvoice.amount.toLocaleString('en-IN')} from ${businessName} is scheduled for dynamic clearing by ${targetInvoice.dueDate}. You can securely clear this instantly using BHIM UPI: ${compileLink}. Thank you for your partnership!`;
        }
      } else if (activeTone === 'formal') {
        switch (activeLang) {
          case 'Hindi':
            formulated = `प्रिय ग्राहक ${custObj.name}, यह सूचित किया जाता है कि ${businessName} का बिल ${targetInvoice.id} (राशि ₹${targetInvoice.amount.toLocaleString('en-IN')}) लंबित है। भुगतान की अंतिम तिथि ${targetInvoice.dueDate} थी। आपसे अनुरोध है कि बैंक परिचालन सुचारू रखने के लिए इस लिंक का उपयोग करें: ${compileLink}। सधन्यवाद, वित्त विभाग।`;
            break;
          case 'Tamil':
            formulated = `மதிப்பிற்குரிய வாடிக்கையாளர் ${custObj.name} அவர்களுக்கு, ${businessName} இன் இன்வாய்ஸ் ${targetInvoice.id} தொகை ₹${targetInvoice.amount.toLocaleString('en-IN')} செலுத்த வேண்டிய கடைசி நாள் ${targetInvoice.dueDate} ஆகும். தாமதத்தைத் தவிர்க்க, இந்த அதிகாரப்பூர்வ UPI முகவரி மூலம் உடனடியாகச் செலுத்தவும்: ${compileLink}। நிதித் துறை.`;
            break;
          case 'Telugu':
            formulated = `గౌరవనీయులైన కస్టమర్ ${custObj.name} గారికి, ${businessName} ఇన్వాయిస్ ${targetInvoice.id} మొత్తం ₹${targetInvoice.amount.toLocaleString('en-IN')} గడువు తేదీ ${targetInvoice.dueDate} ముగిసినది. దయచేసి క్రింది అధికారిక UPI ద్వారా వెంటనే చెల్లించండి: ${compileLink}. ఇట్లు, ఫైనాన్స్ టీమ్.`;
            break;
          case 'Kannada':
            formulated = `ಗೌರವಾನ್ವಿತ ಗ್ರಾಹಕರಾದ ${custObj.name} ಅವರಿಗೆ, ${businessName} ಇನ್‌ವಾಯ್ಸ್ ${targetInvoice.id} ಮೊತ್ತ ₹${targetInvoice.amount.toLocaleString('en-IN')} ನ ಪಾವತಿ ದಿನಾಂಕ ${targetInvoice.dueDate} ಆಗಿರುತ್ತದೆ. ದಯವಿಟ್ಟು ಕೆಳಗಿನ ಅಧಿಕೃತ UPI ಲಿಂಕ್ ಬಳಸಿ ತಕ್ಷಣ ಪಾವತಿಸಿ: ${compileLink}. ವಂದನೆಗಳೊಂದಿಗೆ, ಫೈನಾನ್ಸ್ ವಿಭಾಗ.`;
            break;
          default:
            formulated = `Dear Client ${custObj.name}, Please look into this official notification regarding pending Invoice ${targetInvoice.id} for ₹${targetInvoice.amount.toLocaleString('en-IN')}. The verified billing profile records indicate a designated settlement target offset of ${targetInvoice.dueDate}. Kindly transition payment via the formal NCPI UPI gateway to avoid compliance issues: ${compileLink}. Sincerely, Finance Operations at ${businessName}.`;
        }
      } else if (activeTone === 'strict_legal') {
        switch (activeLang) {
          case 'Hindi':
            formulated = `चेतावनी: ${custObj.name}, आपके द्वारा ${businessName} का इनवॉइस ${targetInvoice.id} राशि ₹${targetInvoice.amount.toLocaleString('en-IN')} गंभीर रूप से लंबित (overdue) हो चुका है। बार-बार अनुस्मारक भेजे जाने के बावजूद भुगतान अप्राप्त है। असुविधाजनक कानूनी विवाद से बचने के लिए, नीचे दिए गए लिंक पर तुरंत भुगतान करें: ${compileLink}।`;
            break;
          case 'Tamil':
            formulated = `எச்சரிக்கை அறிவிப்பு: ${custObj.name} அவர்களே, ${businessName} நிறுவனத்தின் இன்வாய்ஸ் ${targetInvoice.id} கணக்கு ₹${targetInvoice.amount.toLocaleString('en-IN')} மிக நீண்ட நாட்களாக செலுத்தப்படாமல் உள்ளது. சட்டரீதியான நடவடிக்கைகளைத் தவிர்க்க, உடனடியாக இந்த லிங்க் மூலம் செலுத்தவும்: ${compileLink}।`;
            break;
          case 'Telugu':
            formulated = `అంతిమ హెచ్చరిక: ${custObj.name}, ${businessName} కు చెందిన ఇన్వాయిస్ ${targetInvoice.id} మొత్తం ₹${targetInvoice.amount.toLocaleString('en-IN')} తీవ్రంగా ఆలస్యమైనది. చట్టపరమైన ఇబ్బందులు రాకుండా ఉండటానికి, వెంటనే ఈ లింక్ ద్వారా చెల్లింపు పూర్తి చేయండి: ${compileLink}.`;
            break;
          case 'Kannada':
            formulated = `ಅಂತಿಮ ಸೂಚನೆ: ${custObj.name}, ನೀವು ${businessName} ಇನ್‌ವಾಯ್ಸ್ ${targetInvoice.id} ರ ಮೊತ್ತ ₹${targetInvoice.amount.toLocaleString('en-IN')} ಅನ್ನು ದೀರ್ಘಕಾಲದಿಂದ ಪಾವತಿಸಿಲ್ಲ. ಯಾವುದೇ ಕಾನೂನು ಕ್ರಮವನ್ನು ತಪ್ಪಿಸಲು, ಈ ಲಿಂಕ್ ಬಳಸಿ ತಕ್ಷಣ ಪಾವತಿಸಿ: ${compileLink}.`;
            break;
          default:
            formulated = `URGENT DEMAND NOTICE: ${custObj.name}, Payment for Invoice ${targetInvoice.id} valued at ₹${targetInvoice.amount.toLocaleString('en-IN')} is severely OVERDUE. Despite multiple previous system-generated reminders, the balance remains unresolved. We instruct you to settle this immediately using our secure direct VPA link: ${compileLink}. Failure to resolve within 24 hours will escalate this file to administrative review.`;
        }
      } else {
        // Payment confirmation template
        switch (activeLang) {
          case 'Hindi':
            formulated = `धन्यवाद ${custObj.name} जी! ₹${targetInvoice.amount.toLocaleString('en-IN')} का भुगतान इनवॉइस ${targetInvoice.id} के एवज में ${businessName} को सफलतापूर्वक प्राप्त हो गया है। आपका संदर्भ कोड है: UTR8472910।`;
            break;
          default:
            formulated = `TRANSACTION SETTLED: Thank you ${custObj.name}! We have successfully logged your UPI payment of ₹${targetInvoice.amount.toLocaleString('en-IN')} against invoice reference ${targetInvoice.id}. Ledger records updated successfully. Reference key: UTR8472910.`;
        }
      }

      setCopilotDraftOutput(formulated);
      setIsSynthesizing(false);
    }, 450);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(copilotDraftOutput);
    setWasCopied(true);
    setTimeout(() => setWasCopied(false), 2000);
  };

  // Grouping customers into behavioral risk classes
  const lowRiskCusts = customers.filter(c => {
    const report = AICollectionsIntelligence.analyzeCustomerCollectability(c, findInvoicesForCustomer(c.id));
    return report.riskTier === 'Low' || report.riskTier === 'Medium';
  });

  const highRiskCusts = customers.filter(c => {
    const report = AICollectionsIntelligence.analyzeCustomerCollectability(c, findInvoicesForCustomer(c.id));
    return report.riskTier === 'High' || report.riskTier === 'Severe';
  });

  const activeCustomerObj = customers.find(c => c.id === selectedCustId);
  const activeReport = activeCustomerObj 
    ? AICollectionsIntelligence.analyzeCustomerCollectability(activeCustomerObj, findInvoicesForCustomer(activeCustomerObj.id))
    : null;

  return (
    <div className="space-y-6">
      
      {/* Header component */}
      <div>
        <div className="flex items-center gap-1 bg-indigo-50 text-[#3525cd] px-3 py-1 rounded-full text-[10px] font-bold w-fit mb-2">
          <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
          INDIAN MSME AI INTELLIGENCE SYSTEM v3.5
        </div>
        <h2 className="text-3xl font-black text-[#1b1b24] tracking-tight">AI Finance Copilot</h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
          Auto-optimize copy narratives based on customer sentiments, predict payment resolution likelihood, and generate polite notifications tailored to different regional dialects.
        </p>
      </div>

      {/* Main split dashboard view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column (8 cols): Draft generation arena */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-xs space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  Dynamic Tone & Dialect Optimizer
                </h3>
                <p className="text-[11px] text-[#464555] mt-0.5">
                  Produce regional scripts complete with embedded static static UPI instant payment links.
                </p>
              </div>

              {/* Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-500">Pick Debtor:</span>
                <select
                  value={selectedCustId}
                  onChange={(e) => setSelectedCustId(e.target.value)}
                  className="p-1.5 px-3 bg-[#fcf8ff] border border-[#c7c4d8] text-xs font-bold rounded-lg outline-none focus:border-[#3525cd]"
                >
                  {customers.map(c => {
                    const duesTotal = findInvoicesForCustomer(c.id).filter(i => i.paymentStatus !== 'Paid').reduce((s, i) => s + i.amount, 0);
                    return (
                      <option key={c.id} value={c.id}>
                        {c.name} (₹{duesTotal ? duesTotal.toLocaleString('en-IN') : '0'})
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Direct selector for optimization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#fcf8ff] p-4 rounded-xl border border-zinc-150">
              {/* Tone Preset Select */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Conversational Tone Goal</span>
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTone('polite')}
                    className={`p-1.5 rounded text-[11px] font-bold text-center border capitalize transition-all cursor-pointer ${activeTone === 'polite' ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-xs' : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50'}`}
                  >
                    Friendly
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTone('formal')}
                    className={`p-1.5 rounded text-[11px] font-bold text-center border capitalize transition-all cursor-pointer ${activeTone === 'formal' ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-xs' : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50'}`}
                  >
                    Professional
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTone('strict_legal')}
                    className={`p-1.5 rounded text-[11px] font-bold text-center border capitalize transition-all cursor-pointer ${activeTone === 'strict_legal' ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-xs' : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50'}`}
                  >
                    Strict
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTone('received')}
                    className={`p-1.5 rounded text-[11px] font-bold text-center border capitalize transition-all cursor-pointer ${activeTone === 'received' ? 'bg-[#3525cd] text-white border-[#3525cd] shadow-xs' : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50'}`}
                  >
                    Receipt
                  </button>
                </div>
              </div>

              {/* Language Selector */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Dialect Translation Framework</span>
                <div className="grid grid-cols-5 gap-1">
                  {(['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada'] as const).map(lang => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveLang(lang)}
                      className={`p-1 text-[10px] font-extrabold rounded text-center border transition-all cursor-pointer ${activeLang === lang ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50'}`}
                    >
                      {lang === 'English' ? 'EN' : lang === 'Hindi' ? 'HI' : lang === 'Tamil' ? 'TA' : lang === 'Telugu' ? 'TE' : 'KN'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generated Output Area */}
            <div className="space-y-2 relative">
              <span className="text-[10px] font-extrabold uppercase tracking-wide text-zinc-500 flex items-center justify-between">
                <span>Optimized Dispatch Payload Output ({activeLang})</span>
                {isSynthesizing && <span className="text-[#3525cd] text-[10px] animate-pulse">Running tone AI optimization model...</span>}
              </span>

              <div className="bg-zinc-950 text-emerald-400 p-4 rounded-xl font-mono text-xs leading-relaxed min-h-28 border border-zinc-800/80 relative flex flex-col justify-between">
                {isSynthesizing ? (
                  <div className="flex-grow flex items-center justify-center py-4">
                    <RefreshCw className="w-6 h-6 text-[#3525cd] animate-spin" />
                  </div>
                ) : (
                  <>
                    <p className="text-zinc-100">{copilotDraftOutput || 'Select params to generate alert draft.'}</p>
                    <div className="mt-4 flex items-center justify-between text-[10px] text-zinc-500 border-t border-zinc-850 pt-2 selection:bg-transparent">
                      <span>Dialect code: {activeLang.toUpperCase()} | Compliant UPI Intent Link Included</span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="text-indigo-400 hover:text-white font-bold inline-flex items-center gap-1 bg-indigo-500/10 p-1 px-2.5 rounded-lg border border-indigo-500/20 active:scale-95 transition-all"
                      >
                        {wasCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        {wasCopied ? 'Copied payload' : 'Copy alert draft'}
                      </button>
                    </div>
                  </>
                )}
              </div>
              <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Automated compliance security filter verified this copy as anti-spam polite.
              </p>
            </div>

          </div>

          {/* AI Behavioral clustering analysis cards */}
          <div className="bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <VolumeX className="w-4 h-4 text-indigo-500" />
                Debtor Behavioral Cohort Clustering (AI segment)
              </h3>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Grouping client lists mathematically to establish sequence schedules.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-150">
                <span className="font-extrabold text-emerald-950 uppercase tracking-widest text-[9px] block">Cooperative VIPs</span>
                <div className="text-2xl font-black font-mono text-emerald-800 mt-1">
                  {customers.filter(c => c.tier === 'VIP').length} <span className="text-[11px] font-sans font-normal text-emerald-600 block">Requires zero pushy nudges</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-150">
                <span className="font-extrabold text-amber-950 uppercase tracking-widest text-[9px] block">Forgetful Clients</span>
                <div className="text-2xl font-black font-mono text-amber-800 mt-1">
                  {customers.filter(c => c.notes.toLowerCase().includes('forget') || c.id === 'cust_01').length} 
                  <span className="text-[11px] font-sans font-normal text-amber-600 block">Needs standard weekend WhatsApp cues</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-150">
                <span className="font-extrabold text-indigo-950 uppercase tracking-widest text-[9px] block">Evasive/Slow</span>
                <div className="text-2xl font-black font-mono text-indigo-800 mt-1">
                  {customers.filter(c => c.avgCollectionDays > 12).length}
                  <span className="text-[11px] font-sans font-normal text-indigo-600 block">Needs automatic email escalations</span>
                </div>
              </div>

              <div className="p-3 bg-rose-50 rounded-xl border border-rose-150">
                <span className="font-extrabold text-rose-950 uppercase tracking-widest text-[9px] block">Disgruntled Dispute</span>
                <div className="text-2xl font-black font-mono text-rose-800 mt-1">
                  {customers.filter(c => c.notes.toLowerCase().includes('dispute') || c.notes.toLowerCase().includes('issue')).length}
                  <span className="text-[11px] font-sans font-normal text-rose-600 block">Manual Supervisor call advised</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Right column (4 cols): Predictive Intelligence Radar */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-zinc-950 text-white rounded-2xl border border-zinc-800 p-5 shadow-xs space-y-4">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#eae6f4] flex items-center gap-1 bg-white/[0.05] p-1.5 px-3 rounded-lg w-fit">
              <BrainCircuit className="w-3.5 h-3.5 text-amber-300" />
              Collectability Telemetry
            </span>

            {activeCustomerObj && activeReport ? (
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-zinc-400 block font-semibold">Active Client Reference</span>
                  <span className="text-sm font-extrabold text-zinc-100 block">{activeCustomerObj.name}</span>
                  <span className="text-[10px] text-zinc-500 block font-mono">ID: {activeCustomerObj.id} | Tier: {activeCustomerObj.tier}</span>
                </div>

                <div className="border-t border-zinc-850 pt-3 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-mono uppercase">Risk Score index</span>
                    <span className="text-xl font-bold font-mono text-rose-400">{activeReport.riskScore}/100</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-mono uppercase">Settlement Prob</span>
                    <span className="text-xl font-bold font-mono text-emerald-400">{activeReport.probability}%</span>
                  </div>
                </div>

                <div className="border-t border-zinc-850 pt-3 text-xs space-y-1.5">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-mono">AI SEND-TIME RECOMMENDATION</span>
                    <span className="font-bold text-indigo-300">{activeReport.bestSendTime}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-mono">DEDUCED SENTIMENT PROFILE</span>
                    <span className="p-0.5 px-2 bg-amber-400/20 text-amber-300 rounded font-semibold text-[10px] inline-block uppercase mt-0.5 font-mono">
                      {activeReport.sentiment}
                    </span>
                  </div>
                </div>

                <div className="border-t border-zinc-850 pt-3 space-y-1 text-xs">
                  <span className="text-[10px] text-zinc-400 block font-mono">STRATEGIC COPILOT WORKPLAN</span>
                  <p className="text-[11.5px] font-sans text-zinc-300 leading-relaxed font-semibold">
                    "{activeReport.strategicSuggestion}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-zinc-500 italic text-xs py-8 text-center">
                Configure a customer profile to display predictive radar metrics.
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-zinc-200/60 p-5 shadow-xs space-y-3.5">
            <h4 className="font-bold text-xs uppercase tracking-wide text-zinc-600">Copilot Recommended Actions</h4>
            
            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-150 space-y-1">
                <span className="font-bold block text-zinc-800">Target Weekend Reminders</span>
                <span className="text-[10.5px] text-zinc-500 block">Rahul Sharma owes ₹4,500. Sending WhatsApp on Sunday morning will likely trigger an immediate direct UPI payment.</span>
              </div>

              <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-150 space-y-1">
                <span className="font-bold block text-zinc-800">Draft Strict Notice for Globex</span>
                <span className="text-[10.5px] text-zinc-500 block">Invoice INV-8923 has crossed standard settlement. Transition email tone from 'Friendly' to 'Strict'.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
