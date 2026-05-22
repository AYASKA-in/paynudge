import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  FileText, 
  Smartphone, 
  Mail, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Calendar, 
  Clock, 
  HelpCircle, 
  Sparkles, 
  BadgeAlert, 
  User, 
  CreditCard,
  Settings,
  Flame,
  Coffee,
  Heart
} from 'lucide-react';
import { Customer, InvoiceDue, NotificationLog } from '../types';
import { getUPILink } from '../data';

interface NewNudgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  onAddInvoice: (invoice: InvoiceDue) => void;
  onAddCustomer: (customer: Customer) => void;
  onAddLog: (log: NotificationLog) => void;
  businessVpa: string;
  businessName: string;
}

export default function NewNudgeModal({
  isOpen,
  onClose,
  customers,
  onAddInvoice,
  onAddCustomer,
  onAddLog,
  businessVpa,
  businessName,
}: NewNudgeModalProps) {
  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);
  const [errorBannerMsg, setErrorBannerMsg] = useState('');

  // Customer selection mode: 'existing' or 'new'
  const [customerMode, setCustomerMode] = useState<'existing' | 'new'>('new');

  // Step 1 states (Debtor Profile)
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [newCustName, setNewCustName] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustNotes, setNewCustNotes] = useState('');
  const [newCustTier, setNewCustTier] = useState<'VIP' | 'Regular' | 'New'>('New');

  // Step 2 states (invoice details)
  const [invoiceId, setInvoiceId] = useState(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState(() => {
    // Default to 7 days from now
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [invoiceNotes, setInvoiceNotes] = useState('');

  // Step 3 states (Reminder preferences)
  const [preferredChannel, setPreferredChannel] = useState<'WhatsApp' | 'Email' | 'Both'>('Both');
  const [reminderFrequency, setReminderFrequency] = useState<'Standard' | 'Aggressive' | 'Gentle'>('Standard');
  const [autoNudge, setAutoNudge] = useState(true);

  if (!isOpen) return null;

  // Custom step actions validation
  const validateStep = (step: number): boolean => {
    setErrorBannerMsg('');
    if (step === 1) {
      if (customerMode === 'new') {
        if (!newCustName.trim()) {
          setErrorBannerMsg("Please enter the customer's name.");
          return false;
        }
        if (!newCustPhone.trim()) {
          setErrorBannerMsg("Please enter a WhatsApp mobile number.");
          return false;
        }
        if (!newCustEmail.trim()) {
          setErrorBannerMsg("Please enter an email address.");
          return false;
        }
      } else {
        if (!selectedCustomerId) {
          setErrorBannerMsg("Please select an existing customer.");
          return false;
        }
      }
    } else if (step === 2) {
      if (!amount || parseFloat(amount) <= 0) {
        setErrorBannerMsg("Please enter a valid outstanding outstanding amount (₹).");
        return false;
      }
      if (!dueDate) {
        setErrorBannerMsg("Please select a payment due date.");
        return false;
      }
      if (!invoiceId.trim()) {
        setErrorBannerMsg("Please specify an Invoice Reference ID.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    setErrorBannerMsg('');
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setErrorBannerMsg('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Compile customer details based on current selection
  const getSelectedCustomerDetails = (): { name: string; phone: string; email: string; tier: string } => {
    if (customerMode === 'new') {
      return {
        name: newCustName || 'New Client',
        phone: newCustPhone || '+91 XXXXX XXXXX',
        email: newCustEmail || 'client@example.com',
        tier: newCustTier
      };
    } else {
      const found = customers.find(c => c.id === selectedCustomerId);
      return {
        name: found?.name || 'Client',
        phone: found?.phone || 'WhatsApp',
        email: found?.email || 'Email',
        tier: found?.tier || 'Regular'
      };
    }
  };

  // Pre-fill amount presets to save user time
  const handleApplyAmountPreset = (val: number) => {
    setAmount(val.toString());
  };

  // Pre-fill due date presets
  const handleApplyDatePreset = (daysInFuture: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysInFuture);
    setDueDate(d.toISOString().split('T')[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2)) {
      return;
    }

    let targetCustomer: Customer;

    // 1. Create client profile if Mode == 'new'
    if (customerMode === 'new') {
      const newCust: Customer = {
        id: `cust_${Date.now()}`,
        name: newCustName,
        phone: newCustPhone,
        email: newCustEmail,
        tier: newCustTier,
        notes: newCustNotes || 'Onboarded via wizard',
        avgCollectionDays: 0,
        reminderFrequency: reminderFrequency,
        preferredChannel: preferredChannel
      };
      targetCustomer = newCust;
      onAddCustomer(newCust);
    } else {
      const found = customers.find(c => c.id === selectedCustomerId);
      if (!found) {
        setErrorBannerMsg('Invalid debtor selected.');
        return;
      }
      targetCustomer = found;
    }

    // 2. Compute payment record status relative to schedule
    const todayStr = new Date().toISOString().split('T')[0];
    let status: 'Critical' | 'Upcoming' | 'Active' = 'Active';
    if (dueDate === todayStr) {
      status = 'Critical';
    } else if (new Date(dueDate) < new Date(todayStr)) {
      status = 'Critical';
    } else {
      const diffMs = new Date(dueDate).getTime() - new Date(todayStr).getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 3) {
        status = 'Upcoming';
      }
    }

    // 3. Create invoice entity
    const parsedAmount = parseFloat(amount);
    const newInvoice: InvoiceDue = {
      id: invoiceId,
      customerId: targetCustomer.id,
      amount: parsedAmount,
      dueDate: dueDate,
      paymentStatus: status,
      lastContactDate: autoNudge ? todayStr : undefined,
      lastContactChannel: autoNudge ? (preferredChannel === 'Both' ? 'WhatsApp' : preferredChannel) : 'None',
      createdDate: todayStr,
      notes: invoiceNotes || 'No notes defined',
    };

    onAddInvoice(newInvoice);

    // 4. Create outbound broadcast notification log simulation if Checked
    if (autoNudge) {
      const compiledUpi = getUPILink(businessVpa, businessName, parsedAmount, invoiceId);
      const channelGreeting = preferredChannel === 'Email' ? 'Dear' : 'Hi';
      const upiPromoText = `You can clear this right away using UPI: ${compiledUpi}`;
      const messageBody = `${channelGreeting} ${targetCustomer.name}, this is an invoice notice from ${businessName}. Invoice #${invoiceId} for ₹${parsedAmount.toLocaleString('en-IN')} is scheduled due on ${dueDate}. ${upiPromoText}. Thank you!`;

      const simLog: NotificationLog = {
        id: `log_${Date.now()}`,
        invoiceId: invoiceId,
        customerName: targetCustomer.name,
        channel: preferredChannel === 'Both' ? 'WhatsApp' : preferredChannel,
        sentTime: 'Just now (Onboarding)',
        status: 'Sent',
        messagePreview: messageBody,
        upiLinkUsed: compiledUpi,
      };

      onAddLog(simLog);
    }

    // Done! Clear details and call onClose
    onClose();
    // Reset state for next wizard trigger
    setCurrentStep(1);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustNotes('');
    setAmount('');
    setInvoiceNotes('');
    setInvoiceId(`INV-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const clientInfo = getSelectedCustomerDetails();

  // Simulated live message preview formatted nicely
  const upiUrl = getUPILink(businessVpa, businessName, parseFloat(amount) || 0, invoiceId);
  const getSimulatedMessageText = () => {
    const greet = preferredChannel === 'Email' ? 'Dear' : 'Hi';
    return `${greet} ${clientInfo.name}, dynamic update: Outstanding details for Invoice ${invoiceId} of ₹${(parseFloat(amount) || 0).toLocaleString('en-IN')} are posted, due on ${dueDate}. Settle instantly using this secure UPI link: ${upiUrl}. Warm regards, ${businessName}.`;
  };

  return (
    <div className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div 
        id="onboarding-stepper-card"
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-[#e2e2ee] flex flex-col"
      >
        
        {/* TOP GLOSSY STEP INDICATOR BAR */}
        <div className="bg-[#fcfaff] border-b border-[#f0ecf9] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-xs">
            <span className="p-2 bg-indigo-50 text-[#3525cd] rounded-xl">
              <UserPlus className="w-5 h-5 animate-bounce" />
            </span>
            <div>
              <h3 className="font-bold text-base text-[#1b1b24] tracking-tight">Onboarding Wizard</h3>
              <p className="text-[11px] text-[#777587]">Register client, schedule outstanding due, and configure polite alerts.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEPPER BAR INDICATORS */}
        <div className="bg-white px-8 py-3 border-b border-[#f5f5f7] flex justify-between items-center text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
              currentStep === 1 ? 'bg-[#3525cd] text-white' : 'bg-green-100 text-green-800'
            }`}>
              {currentStep > 1 ? '✓' : '1'}
            </span>
            <span className={`font-semibold ${currentStep === 1 ? 'text-[#1b1b24]' : 'text-gray-400'}`}>Customer Details</span>
          </div>
          <div className="w-8 h-px bg-gray-200"></div>
          
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
              currentStep === 2 ? 'bg-[#3525cd] text-white' : currentStep > 2 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'
            }`}>
              {currentStep > 2 ? '✓' : '2'}
            </span>
            <span className={`font-semibold ${currentStep === 2 ? 'text-[#1b1b24]' : 'text-gray-400'}`}>Amount & Schedules</span>
          </div>
          <div className="w-8 h-px bg-gray-200"></div>

          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
              currentStep === 3 ? 'bg-[#3525cd] text-white' : currentStep > 3 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-400'
            }`}>
              {currentStep > 3 ? '✓' : '3'}
            </span>
            <span className={`font-semibold ${currentStep === 3 ? 'text-[#1b1b24]' : 'text-gray-400'}`}>Preferences</span>
          </div>
          <div className="w-8 h-px bg-gray-200"></div>

          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold ${
              currentStep === 4 ? 'bg-[#3525cd] text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              4
            </span>
            <span className={`font-semibold ${currentStep === 4 ? 'text-[#1b1b24]' : 'text-gray-400'}`}>Review & Save</span>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <div className="p-6 overflow-y-auto flex-1 bg-[#fafafc]">
          
          {errorBannerMsg && (
            <div className="mb-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-3 px-4 rounded-xl flex items-center gap-2 text-rose-800 dark:text-rose-450 text-xs font-semibold animate-nudge">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 animate-ping shrink-0" />
              <span>{errorBannerMsg}</span>
            </div>
          )}
          
          {/* STEP 1: CLIENT IDENTIFICATION */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white p-5 rounded-2xl border border-[#e4e1ee]/60 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <span className="font-bold text-sm text-[#1b1b24] flex items-center gap-1.5">
                    <User className="w-4 h-4 text-[#3525cd]" /> Customer Registration Method
                  </span>
                  <div className="flex gap-1.5 bg-[#eae6f4] p-0.5 rounded-xl text-xs">
                    <button
                      type="button"
                      onClick={() => setCustomerMode('new')}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${customerMode === 'new' ? 'bg-white text-[#3525cd] shadow-xs' : 'text-[#464555] hover:text-black'}`}
                    >
                      New Customer (Onboarding)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomerMode('existing');
                        if (customers.length > 0 && !selectedCustomerId) {
                          setSelectedCustomerId(customers[0].id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${customerMode === 'existing' ? 'bg-white text-[#3525cd] shadow-xs' : 'text-[#464555] hover:text-black'}`}
                    >
                      Existing Client
                    </button>
                  </div>
                </div>

                {customerMode === 'existing' ? (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#464555] block">Select Existing Debtor Profile</label>
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-3 py-3 bg-[#faf9fe] border border-[#c7c4d8] rounded-xl text-xs font-semibold focus:border-[#3525cd] text-[#1b1b24]"
                    >
                      {customers.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} — {c.phone} | {c.email}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-xs font-bold text-[#1b1b24] block">Full Name of Debtor <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        value={newCustName}
                        onChange={e => setNewCustName(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#faf9fe] border border-[#c7c4d8] rounded-xl text-xs font-semibold focus:border-[#3525cd] text-[#1b1b24]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#1b1b24] block">WhatsApp Mobile Number <span className="text-red-500">*</span></label>
                      <div className="flex">
                        <span className="bg-[#eae6f4] px-3 py-2.5 border border-r-0 border-[#c7c4d8] rounded-l-xl text-xs font-bold text-[#464555]">
                          +91
                        </span>
                        <input
                          type="tel"
                          placeholder="98765 01010"
                          value={newCustPhone.startsWith('+91 ') ? newCustPhone.substring(4) : newCustPhone}
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setNewCustPhone(val ? `+91 ${val}` : '');
                          }}
                          className="w-full px-3 py-2.5 bg-[#faf9fe] border border-[#c7c4d8] rounded-r-xl text-xs font-semibold focus:border-[#3525cd] text-[#1b1b24]"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400">Used for WhatsApp polite nudges</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-[#1b1b24] block font-medium">Email Address <span className="text-red-500">*</span></label>
                      <input
                        type="email"
                        placeholder="e.g. rahul.sharma@gmail.com"
                        value={newCustEmail}
                        onChange={e => setNewCustEmail(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#faf9fe] border border-[#c7c4d8] rounded-xl text-xs font-semibold focus:border-[#3525cd] text-[#1b1b24]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 block">Demographic Tier Group</label>
                      <select
                        value={newCustTier}
                        onChange={e => setNewCustTier(e.target.value as any)}
                        className="w-full px-3 py-2.5 bg-[#faf9fe] border border-[#c7c4d8] rounded-xl text-xs text-[#1b1b24]"
                      >
                        <option value="New">New Student / Client</option>
                        <option value="Regular">Regular (Consistent checks)</option>
                        <option value="VIP">VIP (High-value/Special attention)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700 block">Internal Profile Notes</label>
                      <input
                        type="text"
                        placeholder="e.g. Batch 12 class tuition student..."
                        value={newCustNotes}
                        onChange={e => setNewCustNotes(e.target.value)}
                        className="w-full px-3 py-2.5 bg-[#faf9fe] border border-[#c7c4d8] rounded-xl text-xs font-semibold focus:border-[#3525cd] text-[#1b1b24]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Informative tips box */}
              <div className="bg-[#f5f2ff] p-4 rounded-2xl border border-[#ede9fe] flex items-start gap-2.5 text-xs text-indigo-950">
                <HelpCircle className="w-5 h-5 text-[#3525cd] shrink-0" />
                <div>
                  <span className="font-bold text-[#3525cd]">About Onboarding:</span>
                  <p className="text-[11px] text-indigo-900 leading-normal mt-0.5">Entering precise coordinates ensures that follow-up alerts reach the correct customer. In India, B2C clients prefer WhatsApp notifications on weekend slots, while wholesale distributors respond faster through official Email channels.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: FINANICAL TARGET OUTSTANDINGS */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white p-5 rounded-2xl border border-[#e4e1ee]/60 shadow-xs space-y-4">
                <div className="flex items-center gap-1.5 border-b pb-2">
                  <CreditCard className="w-4 h-4 text-[#3525cd]" />
                  <span className="font-bold text-sm text-[#1b1b24]">Due Amounts & Target Schedules</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block">Invoice Reference Code</label>
                    <input
                      type="text"
                      value={invoiceId}
                      onChange={e => setInvoiceId(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#faf9fe] border border-[#c7c4d8] rounded-xl text-xs font-semibold focus:border-[#3525cd]"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-[#1b1b24] block">Outstanding Due Amount (₹) <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-3.5 text-xs font-black text-[#1b1b24]">₹</span>
                      <input
                        type="number"
                        placeholder="e.g. 5000"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full pl-6 pr-3 py-3 bg-[#fdfcff] border border-[#3525cd] rounded-xl text-sm font-bold text-[#1b1b24] focus:outline-hidden focus:ring-2 focus:ring-[#3525cd]/10"
                      />
                    </div>
                  </div>
                </div>

                {/* Amount Fast Presets */}
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase block">Indian SMB Common Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[1500, 3000, 5000, 10000, 15000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleApplyAmountPreset(val)}
                        className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 hover:border-gray-400 text-xs font-bold text-gray-700 border rounded-lg transition-all"
                      >
                        ₹ {val.toLocaleString('en-IN')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Date Picker & Presets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700 block flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> Due Timeline Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#faf9fe] border border-[#c7c4d8] rounded-xl text-xs font-semibold focus:border-[#3525cd]"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-500 font-bold uppercase block pt-1">Quick Timeline Setup:</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleApplyDatePreset(0)}
                        className="py-2 bg-red-50 hover:bg-red-100 text-[10px] font-bold text-red-700 rounded-lg border border-red-200"
                      >
                        Due Today
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyDatePreset(3)}
                        className="py-2 bg-amber-50 hover:bg-amber-100 text-[10px] font-bold text-amber-700 rounded-lg border border-amber-200"
                      >
                        In 3 Days
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyDatePreset(7)}
                        className="py-2 bg-indigo-50 hover:bg-indigo-100 text-[10px] font-bold text-[#3525cd] rounded-lg border border-indigo-200"
                      >
                        In 1 Week
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <label className="text-xs font-bold text-gray-700 block">Service Scope / Items Description</label>
                  <textarea
                    placeholder="e.g. Class Tuition Fees for physics batch, or B2B consultancy charges..."
                    value={invoiceNotes}
                    onChange={e => setInvoiceNotes(e.target.value)}
                    rows={2}
                    className="w-full p-2.5 bg-[#faf9fe] border border-[#c7c4d8] rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREFERENCES & FREQUENCIES */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white p-5 rounded-2xl border border-[#e4e1ee]/60 shadow-xs space-y-4">
                <div className="flex items-center gap-1.5 border-b pb-2">
                  <Settings className="w-4 h-4 text-[#3525cd]" />
                  <span className="font-bold text-sm text-[#1b1b24]">Nudge Routing Settings & Preferences</span>
                </div>

                {/* Preferred message delivery channel */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1b1b24] block">Default Notification Communication Channel</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPreferredChannel('WhatsApp')}
                      className={`py-3 rounded-2xl border text-xs font-black flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        preferredChannel === 'WhatsApp'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-300/20'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-emerald-600" />
                      <span>WhatsApp Primary</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreferredChannel('Email')}
                      className={`py-3 rounded-2xl border text-xs font-black flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        preferredChannel === 'Email'
                          ? 'bg-indigo-50 text-indigo-800 border-indigo-400 ring-2 ring-indigo-300/20'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      <Mail className="w-5 h-5 text-[#3525cd]" />
                      <span>Email primary</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreferredChannel('Both')}
                      className={`py-3 rounded-2xl border text-xs font-black flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                        preferredChannel === 'Both'
                          ? 'bg-purple-50 text-purple-800 border-purple-400 ring-2 ring-purple-300/20'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      <Sparkles className="w-5 h-5 text-purple-600" />
                      <span>Both Channels</span>
                    </button>
                  </div>
                </div>

                {/* Reminder Frequency Preset */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-bold text-[#1b1b24] block mb-1">Follow-up Cadence Velocity Profile</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setReminderFrequency('Gentle')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        reminderFrequency === 'Gentle'
                          ? 'bg-amber-50/50 text-amber-900 border-amber-400 ring-1 ring-amber-400'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-amber-700 font-bold text-[11px] uppercase mb-1">
                        <Coffee className="w-3.5 h-3.5" /> Gentle Pace
                      </div>
                      <p className="text-[10px] leading-relaxed text-gray-500">Only 2 polite notices (1 on due date, 1 overdue after 5 days). High customer goodwill.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReminderFrequency('Standard')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        reminderFrequency === 'Standard'
                          ? 'bg-indigo-50/50 text-indigo-900 border-[#3525cd]/60 ring-1 ring-[#3525cd]'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[#3525cd] font-bold text-[11px] uppercase mb-1">
                        <Heart className="w-3.5 h-3.5" /> Standard Pace
                      </div>
                      <p className="text-[10px] leading-relaxed text-gray-500">Auto follow-up sequence: 3 days before due, on due day, and weekly overdue nudges.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setReminderFrequency('Aggressive')}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        reminderFrequency === 'Aggressive'
                          ? 'bg-rose-50/50 text-rose-950 border-rose-400 ring-1 ring-rose-400'
                          : 'bg-white text-gray-600 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-rose-700 font-bold text-[11px] uppercase mb-1">
                        <Flame className="w-3.5 h-3.5 animate-pulse" /> Focused Pace
                      </div>
                      <p className="text-[10px] leading-relaxed text-gray-500">Strict alerts: daily overdue reminders starting from Day 1 to force collection.</p>
                    </button>
                  </div>
                </div>

                {/* Instant Nudge Toggle */}
                <div className="p-3 bg-slate-50 border rounded-2xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">Broadcast Instant Outbound Message</span>
                    <span className="text-[10px] text-gray-500 block">Dispatch live WhatsApp/Email notice immediately after saving.</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={autoNudge} 
                      onChange={e => setAutoNudge(e.target.checked)} 
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3525cd]"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: PREVIEW & BROADCAST */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-white p-5 rounded-2xl border border-[#e4e1ee]/60 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-sm text-[#1b1b24] flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-purple-600" /> Summary Verification Check
                  </span>
                  <span className="text-[10px] font-mono text-gray-400">Merchant VPA: {businessVpa}</span>
                </div>

                {/* Customer and Invoice overview grids */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-gray-400 uppercase text-[9px] block">Customer Onboarded</span>
                    <p className="font-bold text-[#1b1b24] text-[13px] mt-0.5">{clientInfo.name}</p>
                    <p className="text-gray-600 mt-1">{clientInfo.phone}</p>
                    <p className="text-gray-600">{clientInfo.email}</p>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-gray-400 uppercase text-[9px] block">Outstanding Invoice Details</span>
                    <p className="font-bold text-red-700 text-sm mt-0.5">₹ {parseFloat(amount).toLocaleString('en-IN')}</p>
                    <p className="text-[#1b1b24] mt-1 font-semibold">Code: {invoiceId}</p>
                    <p className="text-gray-600 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#3525cd]" /> Due Date: {dueDate}
                    </p>
                  </div>
                </div>

                {/* Template schedule alert logic mapping */}
                <div className="p-3 bg-indigo-50/50 border border-[#c3c0ff]/40 rounded-xl space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-[#3525cd] block">Configured Scheduler Plan</span>
                  <div className="flex justify-between items-center text-xs">
                    <p className="text-indigo-950 font-semibold">{reminderFrequency} cadence velocity</p>
                    <p className="text-[10px] text-gray-500 italic">Dispatched via {preferredChannel}</p>
                  </div>
                </div>

                {/* Live Message Dispatch simulation */}
                {autoNudge && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-xs font-bold text-slate-700 block flex items-center gap-1">
                      <BadgeAlert className="w-4 h-4 text-emerald-600" /> Live Instant Dispatch Notification Body
                    </span>
                    <div className="p-3 bg-[#e5ddd5] rounded-xl border text-xs antialiased font-sans flex flex-col space-y-2">
                      <div className="bg-white p-2.5 rounded-lg text-[10.5px] whitespace-pre-line text-[#1b1b24] border border-[#d6cfc7] shadow-xs leading-normal">
                        {getSimulatedMessageText()}
                      </div>
                      <span className="text-[9px] text-[#777587] font-semibold text-center italic">Message preview generated matching UPI deep link hooks.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* BOTTOM STEPPING CONTROLS */}
        <div className="p-5 border-t bg-white flex justify-between items-center sticky bottom-0">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="py-2.5 px-md border border-[#c7c4d8] text-[#464555] hover:bg-[#fcf8ff] rounded-xl font-bold transition-all text-xs flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Step
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 text-[#777587] hover:text-[#1b1b24] text-xs font-bold rounded-xl transition-all"
            >
              Cancel
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="py-2.5 px-lg bg-[#3525cd] hover:bg-[#4f46e5] text-white rounded-xl font-bold transition-all text-xs flex items-center gap-1 shadow-md cursor-pointer"
              >
                Go Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="py-2.5 px-xl bg-green-600 hover:bg-green-700 text-white rounded-xl font-black transition-all text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                Register & Dispatch Nudge <Check className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
