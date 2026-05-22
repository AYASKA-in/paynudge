import React, { useState, useRef, useEffect } from 'react';
import { ReminderTemplate } from '../types';
import { 
  FileText, 
  Save, 
  Check, 
  RefreshCw, 
  Smartphone, 
  Mail, 
  Info, 
  Send, 
  Plus, 
  Trash2, 
  Sparkles,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { formatTemplate, getUPILink } from '../data';

interface TemplatesViewProps {
  templates: ReminderTemplate[];
  onSaveTemplate: (id: string, subject: string, body: string, channel: 'WhatsApp' | 'Email' | 'Both') => void;
  onCreateTemplate: (template: ReminderTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  businessVpa: string;
  businessName: string;
}

export default function TemplatesView({
  templates,
  onSaveTemplate,
  onCreateTemplate,
  onDeleteTemplate,
  businessVpa,
  businessName,
}: TemplatesViewProps) {
  const [selectedTempId, setSelectedTempId] = useState(templates[0]?.id || 'temp_polite');
  const temp = templates.find(t => t.id === selectedTempId) || templates[0];

  // Editor states
  const [subjectText, setSubjectText] = useState('');
  const [bodyText, setBodyText] = useState('');
  const [channelType, setChannelType] = useState<'WhatsApp' | 'Email' | 'Both'>('Both');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [templateErrorMsg, setTemplateErrorMsg] = useState('');

  // New template form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<'polite' | 'first' | 'overdue' | 'final' | 'received'>('polite');
  const [newSubject, setNewSubject] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newChannel, setNewChannel] = useState<'WhatsApp' | 'Email' | 'Both'>('Both');

  // Preview options state
  const [previewChannel, setPreviewChannel] = useState<'WhatsApp' | 'Email'>('WhatsApp');
  const [previewCustomerName, setPreviewCustomerName] = useState('Rahul Sharma');
  const [previewAmount, setPreviewAmount] = useState(4500);
  const [previewInvoiceId, setPreviewInvoiceId] = useState('INV-2041');
  const [previewDueDate, setPreviewDueDate] = useState('today');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Synchronize text inputs when template selection changes or templates update
  useEffect(() => {
    if (temp) {
      setSubjectText(temp.subject || '');
      setBodyText(temp.body || '');
      setChannelType(temp.channel || 'Both');
      setSaveSuccess(false);
      // Auto-set preview channel based on template availability
      if (temp.channel === 'WhatsApp') {
        setPreviewChannel('WhatsApp');
      } else if (temp.channel === 'Email') {
        setPreviewChannel('Email');
      }
    }
  }, [selectedTempId, temp]);

  // Inject a placeholder tag at the cursor's current position
  const handleInjectPlaceholder = (placeholder: string) => {
    const el = textareaRef.current;
    if (!el) {
      // Fallback: append
      setBodyText(prev => prev + ' ' + placeholder);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    const newText = before + placeholder + after;
    
    setBodyText(newText);
    
    // Maintain focus and reset selection cursor
    setTimeout(() => {
      el.focus();
      const newPos = start + placeholder.length;
      el.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const handleResetToDefaults = () => {
    const defaultTemplates: Record<string, { subject: string; body: string; channel: 'WhatsApp' | 'Email' | 'Both' }> = {
      temp_polite: {
        subject: 'Friendly update: Pending outstanding due at {{business_name}}',
        body: 'Dear {{customer_name}}, code of payment for Invoice {{invoice_id}} of ₹{{amount}} will reach its timeline on {{due_date}}. Tap here to quickly settle via secure UPI link: {{upi_link}}. Warm regards, {{business_name}}.',
        channel: 'Both'
      },
      temp_first: {
        subject: 'Action Required: Payment of {{invoice_id}} is due today',
        body: 'Hi {{customer_name}}, this is a friendly reminder that Invoice {{invoice_id}} from {{business_name}} for ₹{{amount}} is due today. Request you to kindly clear this outstanding balance. You can pay instantly using UPI: {{upi_link}}. Thank you!',
        channel: 'WhatsApp'
      },
      temp_overdue: {
        subject: 'Immediate Action: Invoice {{invoice_id}} is OVERDUE',
        body: 'Dear {{customer_name}}, this is a reminder that Invoice {{invoice_id}} for ₹{{amount}} is currently past due. We kindly request you to clear the outstanding dues immediately to avoid any interruption in services. Tap below to pay via UPI: {{upi_link}}',
        channel: 'Both'
      },
      temp_final: {
        subject: 'FINAL WARNING: Outstanding duties due for Invoice {{invoice_id}}',
        body: 'ATTN: {{customer_name}}, Invoice {{invoice_id}} for ₹{{amount}} is significantly past due. Despite multiple follow-ups, payment remains outstanding. Please settle immediately via secure link: {{upi_link}} to prevent legal escalation.',
        channel: 'Email'
      },
      temp_received: {
        subject: 'Receipt: Payment received successfully!',
        body: 'Thank you {{customer_name}}! We have successfully received payment of ₹{{amount}} against Invoice {{invoice_id}}. Your transaction reference ID is {{ref_code}}. Safe credentials provided, and your record is marked as PAID.',
        channel: 'Both'
      }
    };

    const defaultVals = defaultTemplates[selectedTempId];
    if (defaultVals) {
      setSubjectText(defaultVals.subject);
      setBodyText(defaultVals.body);
      setChannelType(defaultVals.channel);
    }
  };

  const handleSave = () => {
    setTemplateErrorMsg('');
    if (!bodyText.trim()) {
      setTemplateErrorMsg('Template body text cannot be empty.');
      return;
    }
    onSaveTemplate(temp.id, subjectText, bodyText, channelType);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2400);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTemplateErrorMsg('');
    if (!newTitle.trim() || !newBody.trim()) {
      setTemplateErrorMsg('Please fill out the template title and message body.');
      return;
    }

    const created: ReminderTemplate = {
      id: `temp_custom_${Date.now()}`,
      type: newType,
      title: newTitle,
      subject: newSubject || `Payment Alert regarding Invoice {{invoice_id}}`,
      body: newBody,
      channel: newChannel,
    };

    onCreateTemplate(created);
    setSelectedTempId(created.id);
    setShowCreateModal(false);

    // Reset state
    setNewTitle('');
    setNewSubject('');
    setNewBody('');
    setNewChannel('Both');
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplateErrorMsg('');
    if (id.startsWith('temp_') && !id.startsWith('temp_custom_')) {
      setTemplateErrorMsg('Pre-defined system templates cannot be deleted to ensure system reliability.');
      setTimeout(() => setTemplateErrorMsg(''), 4500);
      return;
    }
    const confirmDelete = window.confirm('Are you sure you want to delete this custom template?');
    if (confirmDelete) {
      onDeleteTemplate(id);
      // Select first remaining template
      const remaining = templates.filter(t => t.id !== id);
      if (remaining.length > 0) {
        setSelectedTempId(remaining[0].id);
      }
    }
  };

  // Compile real live simulation data block
  const currentUpi = getUPILink(businessVpa, businessName, previewAmount, previewInvoiceId);
  const previewVariables = {
    customer_name: previewCustomerName,
    business_name: businessName,
    amount: previewAmount,
    invoice_id: previewInvoiceId,
    due_date: previewDueDate,
    upi_link: currentUpi,
    ref_code: 'UTR938472910'
  };

  const livePreviewText = formatTemplate(bodyText, previewVariables);

  // Helper colors for channel status badges
  const getChannelBadge = (ch: 'WhatsApp' | 'Email' | 'Both' | undefined) => {
    switch (ch) {
      case 'WhatsApp':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">WhatsApp Only</span>;
      case 'Email':
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">Email Only</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-200">WhatsApp & Email</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section with CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1b1b24] tracking-tight">Outbound Nudge Templates</h2>
          <p className="text-sm text-[#464555] mt-1">Configure polite, custom notification sequences for WhatsApp and Email formats.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#3525cd] hover:bg-[#4f46e5] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create Custom Template
        </button>
      </div>

      {templateErrorMsg && (
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-450 p-3.5 px-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-nudge">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{templateErrorMsg}</span>
          <button 
            type="button"
            onClick={() => setTemplateErrorMsg('')}
            className="ml-auto text-rose-500 hover:text-rose-700 text-sm font-bold block cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Template Selection Roster (Span 4) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#777587] block mb-1">Templates Directory</span>
          <div className="space-y-3 max-h-[80vh] overflow-y-auto pr-1">
            {templates.map(t => {
              const isSelected = selectedTempId === t.id;
              const isSystem = t.id.startsWith('temp_') && !t.id.startsWith('temp_custom_');
              return (
                <div
                  key={t.id}
                  onClick={() => setSelectedTempId(t.id)}
                  className={`w-full p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between items-start relative group ${
                    isSelected
                      ? 'bg-white border-[#3525cd] shadow-md ring-2 ring-[#3525cd]/10'
                      : 'bg-white border-[#e4e1ee] hover:border-[#3525cd]/40 hover:bg-[#fcf8ff]'
                  }`}
                >
                  {/* Subject context badge */}
                  <div className="w-full flex justify-between items-center mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`p-1.5 rounded-lg text-xs font-semibold ${isSelected ? 'bg-[#3525cd] text-white' : 'bg-[#f5f2ff] text-[#3525cd]'}`}>
                        <FileText className="w-4 h-4" />
                      </span>
                      <span className="font-bold text-[11px] uppercase tracking-wide text-[#777587]">{t.type} Nudge</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getChannelBadge(t.channel)}
                      {!isSystem && (
                        <button
                          onClick={(e) => handleDeleteClick(t.id, e)}
                          className="opacity-0 group-hover:opacity-100 p-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md transition-all"
                          title="Delete custom template"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="font-bold text-xs text-[#1b1b24] line-clamp-1">{t.title}</h4>
                  <p className="text-[11px] text-[#464555] line-clamp-2 mt-1 leading-normal italic">
                    "{t.body}"
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Custom Editor Panel & Simulator Visualizer (Span 8) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* Main Visual Editor (Md span 7) */}
          <div className="md:col-span-7 bg-white rounded-3xl border border-[#e4e1ee] p-5 shadow-xs space-y-4">
            <div className="border-b border-[#f0ecf9] pb-3 flex justify-between items-center bg-white">
              <div>
                <span className="font-bold text-[#1b1b24] text-sm">Editing Profile:</span>
                <p className="font-mono text-[11px] text-[#3525cd] font-semibold">{temp?.title || 'Unknown Template'}</p>
              </div>
              <button
                onClick={handleResetToDefaults}
                className="text-xs font-semibold text-[#777587] hover:text-[#3525cd] flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Reset default
              </button>
            </div>

            {/* Stage type indicator */}
            <div className="bg-[#fdfaff] p-3 rounded-xl border border-[#ede9fe] flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-[#464555] block">Sequence Stage Group</span>
                <span className="text-[11px] text-[#777587] uppercase font-mono font-bold">{temp?.type || 'polite'} reminder sequence</span>
              </div>
              <span className="px-2 py-1 bg-[#3525cd]/5 text-[#3525cd] text-[10px] font-bold rounded-lg border border-[#3525cd]/10 uppercase">
                System template
              </span>
            </div>

            {/* Template Specific Channel Restriction and Mapping */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#1b1b24] block">Associate Template with Messaging Channels</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setChannelType('WhatsApp')}
                  className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all outline-hidden cursor-pointer ${
                    channelType === 'WhatsApp'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-400 ring-2 ring-emerald-400/20'
                      : 'bg-white text-[#464555] border-[#c7c4d8] hover:bg-[#fcf8ff]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" /> WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() => setChannelType('Email')}
                  className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all outline-hidden cursor-pointer ${
                    channelType === 'Email'
                      ? 'bg-indigo-50 text-indigo-800 border-indigo-400 ring-2 ring-indigo-400/20'
                      : 'bg-white text-[#464555] border-[#c7c4d8] hover:bg-[#fcf8ff]'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </button>
                <button
                  type="button"
                  onClick={() => setChannelType('Both')}
                  className={`py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all outline-hidden cursor-pointer ${
                    channelType === 'Both'
                      ? 'bg-purple-50 text-purple-800 border-purple-400 ring-2 ring-purple-400/20'
                      : 'bg-white text-[#464555] border-[#c7c4d8] hover:bg-[#fcf8ff]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Both
                </button>
              </div>
              <p className="text-[10px] text-[#777587] italic">Restricting a template ensures the system only drafts communications for that designated medium.</p>
            </div>

            {/* Subject Configuration (For Email outputs) */}
            {(channelType === 'Email' || channelType === 'Both') && (
              <div className="space-y-1 animate-fadeIn">
                <label className="text-xs font-semibold text-[#464555] block">Draft Email Subject Line</label>
                <input
                  type="text"
                  value={subjectText}
                  onChange={(e) => setSubjectText(e.target.value)}
                  placeholder="Subject line placeholder..."
                  className="w-full px-3 py-2 border border-[#c7c4d8] rounded-xl text-xs font-body-sm text-[#1b1b24] focus:outline-hidden focus:border-[#3525cd]"
                />
              </div>
            )}

            {/* Core Body editor with ref injection */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-xs font-semibold text-[#464555]">
                <label>Message Content Template</label>
                <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-[#3525cd] px-2 py-0.5 rounded-full font-bold">Safe Editor</span>
              </div>
              <textarea
                ref={textareaRef}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                rows={7}
                placeholder="Compose message here..."
                className="w-full p-3 border border-[#c7c4d8] rounded-2xl text-xs font-serif leading-relaxed text-[#1b1b24] focus:outline-hidden focus:border-[#3525cd]"
              />
            </div>

            {/* Click-to-Inject placeholder panel */}
            <div className="p-3 bg-[#fcf8ff] rounded-2xl border border-[#e4e1ee] space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#777587] block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#3525cd]" /> Tap parameters to inject into message text:
              </span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleInjectPlaceholder('{{customer_name}}')}
                  className="bg-white border text-[10px] font-semibold text-[#1b1b24] px-2 py-1 rounded-lg hover:border-[#3525cd] hover:bg-[#3525cd]/5 transition-all text-left flex items-center gap-1.5"
                  title="Inject Debtor Name"
                >
                  <span className="font-mono text-purple-700">{"{{customer_name}}"}</span>
                  <span className="text-[8px] text-[#777587] font-normal">(Rahul Sharma)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInjectPlaceholder('{{amount}}')}
                  className="bg-white border text-[10px] font-semibold text-[#1b1b24] px-2 py-1 rounded-lg hover:border-[#3525cd] hover:bg-[#3525cd]/5 transition-all text-left flex items-center gap-1.5"
                  title="Inject Amount Due"
                >
                  <span className="font-mono text-purple-700">{"{{amount}}"}</span>
                  <span className="text-[8px] text-[#777587] font-normal">(4,500)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInjectPlaceholder('{{due_date}}')}
                  className="bg-white border text-[10px] font-semibold text-[#1b1b24] px-2 py-1 rounded-lg hover:border-[#3525cd] hover:bg-[#3525cd]/5 transition-all text-left flex items-center gap-1.5"
                  title="Inject Due Date"
                >
                  <span className="font-mono text-purple-700">{"{{due_date}}"}</span>
                  <span className="text-[8px] text-[#777587] font-normal">(today)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInjectPlaceholder('{{upi_link}}')}
                  className="bg-white border text-[10px] font-semibold text-[#1b1b24] px-2 py-1 rounded-lg hover:border-[#3525cd] hover:bg-[#3525cd]/5 transition-all text-left flex items-center gap-1.5 text-ellipsis overflow-hidden"
                  title="Inject UPI payment Deep-link"
                >
                  <span className="font-mono text-emerald-700 font-bold">{"{{upi_link}}"}</span>
                  <span className="text-[8px] text-[#777587] font-normal">(Payment URL)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInjectPlaceholder('{{invoice_id}}')}
                  className="bg-white border text-[10px] font-semibold text-[#1b1b24] px-2 py-1 rounded-lg hover:border-[#3525cd] hover:bg-[#3525cd]/5 transition-all text-left flex items-center gap-1.5"
                  title="Inject Invoice Code"
                >
                  <span className="font-mono text-purple-700">{"{{invoice_id}}"}</span>
                  <span className="text-[8px] text-[#777587] font-normal">(INV-2041)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleInjectPlaceholder('{{business_name}}')}
                  className="bg-white border text-[10px] font-semibold text-[#1b1b24] px-2 py-1 rounded-lg hover:border-[#3525cd] hover:bg-[#3525cd]/5 transition-all text-left flex items-center gap-1.5"
                  title="Inject Business Name"
                >
                  <span className="font-mono text-purple-700">{"{{business_name}}"}</span>
                  <span className="text-[8px] text-[#777587] font-normal">({businessName})</span>
                </button>
              </div>
            </div>

            {/* Error / success metrics messages */}
            {saveSuccess && (
              <div className="bg-emerald-50 text-emerald-800 font-bold text-center text-xs p-3 rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200 animate-pulse">
                <Check className="w-4 h-4 text-emerald-600" /> Template configurations updated successfully in memory!
              </div>
            )}

            {/* Action button */}
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-3 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              Confirm Template Updates <Save className="w-4 h-4" />
            </button>
          </div>

          {/* VISUALIZER & SIMULATOR FOR MOBILE OUTBOUND (Md span 5) */}
          <div className="md:col-span-5 space-y-4">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#777587] block mb-1">Live Outbound Visual Previewer</span>

            {/* Toggle Preview Channel Option */}
            <div className="flex bg-[#eae6f4] p-0.5 rounded-xl border text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPreviewChannel('WhatsApp')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                  previewChannel === 'WhatsApp' ? 'bg-white text-emerald-800 shadow-sm' : 'text-[#464555]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" /> WhatsApp Live
              </button>
              <button
                type="button"
                onClick={() => setPreviewChannel('Email')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
                  previewChannel === 'Email' ? 'bg-white text-indigo-800 shadow-sm' : 'text-[#464555]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" /> Email Live
              </button>
            </div>

            {/* Interactive Mockup custom variables modifier */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#e4e1ee] space-y-3">
              <span className="text-[10px] font-bold text-[#1b1b24] block uppercase">Simulation Parameters</span>
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-[9px] text-[#464555] font-bold uppercase tracking-wider block">Customer</label>
                    <input
                      type="text"
                      value={previewCustomerName}
                      onChange={(e) => setPreviewCustomerName(e.target.value)}
                      className="w-full px-2 py-1 bg-[#fbfaff] border border-[#c7c4d8] rounded-lg text-[10px] text-[#1b1b24]"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] text-[#464555] font-bold uppercase tracking-wider block">Due Amount</label>
                    <input
                      type="number"
                      value={previewAmount}
                      onChange={(e) => setPreviewAmount(Number(e.target.value))}
                      className="w-full px-2 py-1 bg-[#fbfaff] border border-[#c7c4d8] rounded-lg text-[10px] text-[#1b1b24]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <label className="text-[9px] text-[#464555] font-bold uppercase tracking-wider block">Invoice ID</label>
                    <input
                      type="text"
                      value={previewInvoiceId}
                      onChange={(e) => setPreviewInvoiceId(e.target.value)}
                      className="w-full px-2 py-1 bg-[#fbfaff] border border-[#c7c4d8] rounded-lg text-[10px] text-[#1b1b24]"
                    />
                  </div>
                  <div className="space-y-0.5">
                    <label className="text-[9px] text-[#464555] font-bold uppercase tracking-wider block">Due Timeline</label>
                    <input
                      type="text"
                      value={previewDueDate}
                      onChange={(e) => setPreviewDueDate(e.target.value)}
                      className="w-full px-2 py-1 bg-[#fbfaff] border border-[#c7c4d8] rounded-lg text-[10px] text-[#1b1b24]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* CHANNEL OUTPUT SCREEN TARGET MOCKUP */}
            {previewChannel === 'WhatsApp' ? (
              /* WhatsApp Mobile Frame */
              <div className="bg-[#1e2640] rounded-[24px] overflow-hidden border border-[#58579b]/20 shadow-xl flex flex-col relative">
                {/* Status Bar */}
                <div className="bg-[#075e54] p-3 text-white flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-slate-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {businessName[0] || 'V'}
                    </span>
                    <div>
                      <h5 className="font-bold text-[10px] leading-tight block">{businessName} verified</h5>
                      <span className="text-[8px] text-emerald-300 font-mono tracking-wider flex items-center gap-0.5">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-pulse"></span> Chat interface
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] bg-[#128c7e] px-1.5 py-0.5 rounded-full uppercase tracking-wider font-bold">BUSINESS</span>
                </div>

                {/* Chat body background */}
                <div className="bg-[#e5ddd5] p-3 min-h-[190px] flex flex-col justify-end relative">
                  {/* Whatsapp bubble card */}
                  <div className="bg-white text-[#1b1b24] p-2.5 rounded-xl rounded-tr-xs shadow-md space-y-2 max-w-[90%] self-start border border-[#ccc]">
                    <p className="text-[10px] leading-relaxed font-sans text-neutral-800 whitespace-pre-line">
                      {livePreviewText}
                    </p>
                    
                    {/* Integrated Interactive UPI payment quick card link */}
                    <div className="bg-emerald-50 border border-emerald-200 p-2 rounded-lg flex flex-col items-center justify-between text-center mt-2">
                      <span className="text-[9px] font-bold text-[#075e54] uppercase tracking-wide flex items-center gap-1">
                        <Send className="w-3 h-3 text-emerald-600 animate-bounce" /> Click to Settle via UPI
                      </span>
                      <p className="text-[8px] text-emerald-700 break-all font-mono select-all bg-white p-1 rounded-sm border w-full text-center mt-1">
                        {currentUpi}
                      </p>
                    </div>
                  </div>
                  {/* Timestamp mockup */}
                  <span className="text-[8px] text-[#777587] mt-1 ml-1.5 font-bold">Today, 2:40 PM</span>
                </div>
              </div>
            ) : (
              /* Email Mailbox Frame */
              <div className="bg-white rounded-3xl overflow-hidden border border-[#c7c4d8]/40 shadow-xl flex flex-col">
                {/* Mail Header */}
                <div className="bg-slate-100 p-3 border-b text-xs text-[#464555] space-y-1">
                  <div className="flex items-center justify-between">
                    <span><strong>From:</strong> updates@{businessName.toLowerCase().replace(/\s+/g, '')}.in</span>
                    <span className="text-[9px] font-mono font-bold bg-slate-200 px-1.5 py-0.5 rounded-md">SMTP Simulated</span>
                  </div>
                  <div><strong>To:</strong> {previewCustomerName.toLowerCase().replace(/\s+/g, '')}@gmail.com</div>
                  <div className="text-[10px] text-[#1b1b24] pt-1">
                    <strong>Subject:</strong> {formatTemplate(subjectText, previewVariables)}
                  </div>
                </div>

                {/* Mail Content Canvas */}
                <div className="p-4 bg-[#f8fafc] min-h-[190px] flex flex-col justify-between space-y-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    {/* Polite branding header */}
                    <div className="border-b pb-2 flex justify-between items-center text-[10px] text-slate-400">
                      <span>{businessName} Ledger Desk</span>
                      <span className="font-bold">Urgent Notification</span>
                    </div>

                    <p className="text-[11px] leading-relaxed text-slate-800 whitespace-pre-line font-serif">
                      {livePreviewText}
                    </p>

                    <div className="pt-2">
                      <p className="text-[9px] text-[#777587] italic">This is an automated request dispatched on behalf of {businessName}’s payment desk. For questions, reach out directly at coordinates on file.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Visual warning on placeholders missing */}
            {!bodyText.includes('{{upi_link}}') && (
              <div className="bg-amber-50 text-amber-800 p-3 rounded-xl border border-amber-200 flex items-start gap-2 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Missing {"{{upi_link}}"} Placeholder!</span>
                  <p className="text-[10px] text-amber-700 leading-snug mt-0.5">UPI links are vital for instant collection support in Indian markets. Customers will have to type payee VPAs manually without this link.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* CREATE NEW CUSTOM TEMPLATE DIALOG MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-[#1b1b24]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[24px] max-w-lg w-full p-6 shadow-xl border border-[#e4e1ee] space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-bold text-lg text-[#1b1b24] flex items-center gap-1">
                <Sparkles className="w-5 h-5 text-[#3525cd]" /> Create Custom Nudge Template
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-xs font-bold text-gray-400 hover:text-black cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 block">Template Short Name / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tuition Weekend Pending follow-up"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs text-[#1b1b24] focus:border-[#3525cd]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">Reminder Stage Stage</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl text-xs text-[#1b1b24]"
                  >
                    <option value="polite">Polite (Gentle request)</option>
                    <option value="first">First reminder (Due target)</option>
                    <option value="overdue">Overdue warning (Late alerts)</option>
                    <option value="final">Final request (Legal escalation)</option>
                    <option value="received">Receipt confirmation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">Designated Medium</label>
                  <select
                    value={newChannel}
                    onChange={e => setNewChannel(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-xl text-xs text-[#1b1b24]"
                  >
                    <option value="Both">WhatsApp & Email both</option>
                    <option value="WhatsApp">WhatsApp Only</option>
                    <option value="Email">Email Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 block">Default Email Subject line</label>
                <input
                  type="text"
                  placeholder="e.g. Pending tuition balances - {{business_name}}"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl text-xs text-[#1b1b24] focus:border-[#3525cd]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 block">Message Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Hi {{customer_name}}, this is a gentle payment notice for invoice {{invoice_id}} of ₹{{amount}}. Please settle at link: {{upi_link}}"
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  className="w-full p-2.5 border rounded-xl text-xs text-[#1b1b24] font-serif"
                />
                <span className="text-[10px] text-gray-400">Specify wildcards like {"{{customer_name}}"} and {"{{upi_link}}"} to dynamically adapt at dispatch time.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3525cd] text-white hover:bg-[#4f46e5] text-xs font-bold rounded-xl"
                >
                  Add Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
