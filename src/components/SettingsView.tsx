import React, { useState } from 'react';
import { BusinessProfile, BusinessSettings } from '../types';
import { 
  Save, 
  Check, 
  Wallet, 
  ToggleLeft, 
  ToggleRight, 
  Smartphone, 
  Mail, 
  Info, 
  Key, 
  ShieldCheck, 
  Users, 
  CreditCard, 
  Flame, 
  Lock, 
  Trash2,
  Database,
  Building,
  Activity,
  Plus
} from 'lucide-react';

interface SettingsViewProps {
  profile: BusinessProfile;
  settings: BusinessSettings;
  onSaveProfile: (profile: BusinessProfile) => void;
  onSaveSettings: (settings: BusinessSettings) => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Assistant' | 'Auditor';
  status: 'Active' | 'Pending';
}

const DEFAULT_TEAM_MEMBERS: TeamMember[] = [
  { id: '1', name: 'Anirudh Roy', email: 'anirudh.r@paynudge.in', role: 'Owner', status: 'Active' },
  { id: '2', name: 'Priya Sharma', email: 'priya.s@classes.in', role: 'Assistant', status: 'Active' },
  { id: '3', name: 'Siddharth Jain', email: 'sid.jain@auditors.co.in', role: 'Auditor', status: 'Pending' }
];

export default function SettingsView({
  profile,
  settings,
  onSaveProfile,
  onSaveSettings,
}: SettingsViewProps) {
  // Tabs Control Configuration
  const [activeTab, setActiveTab] = useState<'general' | 'sequences' | 'team' | 'api' | 'billing'>('general');

  // General state profile inputs
  const [bizName, setBizName] = useState(profile.name);
  const [bizVpa, setBizVpa] = useState(profile.vpa);
  const [bizMobile, setBizMobile] = useState(profile.mobile);
  const [bizSector, setBizSector] = useState(profile.sector);
  const [dataRetention, setDataRetention] = useState('12'); // Months

  // Reminders config settings
  const [autoSendBefore, setAutoSendBefore] = useState(settings.autoSendBefore);
  const [daysBefore, setDaysBefore] = useState(settings.daysBefore);
  const [autoSendOnDue, setAutoSendOnDue] = useState(settings.autoSendOnDue);
  const [autoSendOverdue, setAutoSendOverdue] = useState(settings.autoSendOverdue);
  const [preferredChannel, setPreferredChannel] = useState(settings.preferredChannel);

  // Teams States
  const [teamList, setTeamList] = useState<TeamMember[]>(DEFAULT_TEAM_MEMBERS);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamEmail, setNewTeamEmail] = useState('');
  const [newTeamRole, setNewTeamRole] = useState<'Owner' | 'Assistant' | 'Auditor'>('Assistant');

  // Integrations & Developer Config Keys
  const [sandboxApiKey, setSandboxApiKey] = useState('pk_sandbox_51Nnud92314aF0W...');
  const [prodApiKey, setProdApiKey] = useState('pk_live_9433abc85bCd8F1...');
  const [showKeys, setShowKeys] = useState(false);
  const [webhooksEnabled, setWebhooksEnabled] = useState(true);

  // Bill plan choice
  const [billingPlan, setBillingPlan] = useState<'free' | 'starter' | 'growth'>('starter');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [sandboxCopied, setSandboxCopied] = useState(false);
  const [prodCopied, setProdCopied] = useState(false);

  const handleSubmitAll = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');
    if (!bizVpa || !bizVpa.includes('@')) {
      setErrorText('Please enter a valid, active UPI VPA address (e.g. merchant@upi) for direct collections output.');
      return;
    }

    onSaveProfile({
      id: profile.id,
      name: bizName,
      vpa: bizVpa,
      mobile: bizMobile,
      sector: bizSector,
      verified: profile.verified,
    });

    onSaveSettings({
      autoSendBefore,
      daysBefore: Number(daysBefore),
      autoSendOnDue,
      autoSendOverdue,
      preferredChannel,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleAddTeamMember = () => {
    if (!newTeamName || !newTeamEmail) return;
    const member: TeamMember = {
      id: `team_${Date.now()}`,
      name: newTeamName,
      email: newTeamEmail,
      role: newTeamRole,
      status: 'Pending'
    };
    setTeamList([...teamList, member]);
    setNewTeamName('');
    setNewTeamEmail('');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleRemoveMember = (id: string) => {
    setTeamList(teamList.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      
      {/* Header banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800 pb-5">
        <div>
          <span className="text-xs font-bold text-[#3525cd] uppercase tracking-wider flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-[#3525cd]" /> Enterprise Settings Panel
          </span>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-neutral-100 tracking-tight mt-0.5">Control Center</h2>
          <p className="text-xs text-zinc-500 mt-1">Configure your UPI credentials, automatic reminders sequences, role authorizations and live API keys.</p>
        </div>
      </div>

      {/* Tabs Control strip */}
      <div className="flex overflow-x-auto gap-1 border-b border-zinc-150 dark:border-zinc-800 pb-px text-xs font-bold scrollbar-hide">
        <button
          onClick={() => setActiveTab('general')}
          className={`py-3 px-4 shrink-0 border-b-2 text-center cursor-pointer transition-all ${
            activeTab === 'general' ? 'border-[#3525cd] text-[#3525cd] dark:text-indigo-400 font-extrabold' : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          💳 Settlements & Identity
        </button>
        <button
          onClick={() => setActiveTab('sequences')}
          className={`py-3 px-4 shrink-0 border-b-2 text-center cursor-pointer transition-all ${
            activeTab === 'sequences' ? 'border-[#3525cd] text-[#3525cd] dark:text-indigo-400 font-extrabold' : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          🕰 Automated Timelines
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`py-3 px-4 shrink-0 border-b-2 text-center cursor-pointer transition-all ${
            activeTab === 'team' ? 'border-[#3525cd] text-[#3525cd] dark:text-indigo-400 font-extrabold' : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          👥 Team Roles ({teamList.length})
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`py-3 px-4 shrink-0 border-b-2 text-center cursor-pointer transition-all ${
            activeTab === 'api' ? 'border-[#3525cd] text-[#3525cd] dark:text-indigo-400 font-extrabold' : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          🔑 Integrations & API
        </button>
        <button
          onClick={() => setActiveTab('billing')}
          className={`py-3 px-4 shrink-0 border-b-2 text-center cursor-pointer transition-all ${
            activeTab === 'billing' ? 'border-[#3525cd] text-[#3525cd] dark:text-indigo-400 font-extrabold' : 'border-transparent text-zinc-500 hover:text-zinc-700'
          }`}
        >
          ⭐️ Subscription Pricing
        </button>
      </div>

      <form onSubmit={handleSubmitAll}>
        
        {errorText && (
          <div className="mb-6 bg-rose-50 dark:bg-rose-950/20 border border-rose-250 dark:border-rose-900/50 p-3.5 px-4 rounded-xl flex items-center gap-2.5 text-rose-800 dark:text-rose-450 text-xs font-semibold animate-nudge">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-400 animate-ping shrink-0" />
            <span>{errorText}</span>
          </div>
        )}
        
        {/* TAB 1: General settlements */}
        {activeTab === 'general' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-nudge">
            
            {/* VPA Inputs */}
            <div className="md:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 space-y-4">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 font-bold text-sm text-zinc-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Wallet className="w-4 h-4 text-[#3525cd]" /> Settlement Accounts & Business Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">Business Name</label>
                  <input
                    type="text"
                    required
                    value={bizName}
                    onChange={e => setBizName(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-850 dark:border-zinc-800 text-zinc-900 dark:text-slate-100 border border-zinc-205 rounded-lg focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">Anchor Phone ID</label>
                  <input
                    type="tel"
                    required
                    value={bizMobile}
                    onChange={e => setBizMobile(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-850 dark:border-zinc-800 text-zinc-900 dark:text-slate-100 border border-zinc-205 rounded-lg font-mono focus:outline-hidden"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[#3525cd] dark:text-indigo-400 uppercase tracking-widest text-[10.5px] font-black block">Direct UPI Settlement Address (VPA)</label>
                  <input
                    type="text"
                    required
                    value={bizVpa}
                    onChange={e => setBizVpa(e.target.value)}
                    placeholder="e.g. payment@okaxis"
                    className="w-full px-3 py-2.5 bg-indigo-50/20 dark:bg-zinc-850 dark:border-zinc-800 text-indigo-700 dark:text-indigo-300 border border-[#3525cd]/40 rounded-xl font-mono font-black focus:outline-hidden"
                  />
                  <p className="text-[10px] text-zinc-400 leading-normal">
                    ⚠️ PayNudge applets route payment links straight through BHIM-UPI into this address VPA. Payments skip intermediate escrow, resulting in 0% platform charges. Ensure VPA is correct.
                  </p>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-500 dark:text-zinc-400 uppercase tracking-wider text-[10px]">Operational Category</label>
                  <select
                    value={bizSector}
                    onChange={e => setBizSector(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-850 dark:border-zinc-800 text-zinc-900 dark:text-slate-100 border border-zinc-205 rounded-lg focus:outline-hidden"
                  >
                    <option value="Tuition & Coaching">Tuition & Coaching classes</option>
                    <option value="Professional Services">Freelance and Creative Services</option>
                    <option value="Local Clinics">Clinics and Personal Care Services</option>
                    <option value="Retail & Kirana">Retail & Kirana suppliers</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-zinc-550 dark:text-zinc-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                    <Database className="w-3.5 h-3.5 text-zinc-400" /> Auto Data Retention Rule
                  </label>
                  <select
                    value={dataRetention}
                    onChange={e => setDataRetention(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-850 dark:border-zinc-800 text-zinc-900 dark:text-slate-100 border border-zinc-205 rounded-lg focus:outline-hidden text-xs"
                  >
                    <option value="3">3 Months (Recommended for transient freelancers)</option>
                    <option value="6">6 Months (Audit compliant)</option>
                    <option value="12">12 Months (Medium corporate standard)</option>
                    <option value="forever">Forever (Keep all transaction backups)</option>
                  </select>
                </div>
              </div>

            </div>

            {/* Verification status side badge */}
            <div className="md:col-span-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-800 uppercase tracking-wider border-b border-zinc-200/50 pb-3">
                <Building className="w-4 h-4 text-[#3525cd]" /> Verification Standing
              </div>

              <div className="space-y-3.5 text-xs text-zinc-500 leading-relaxed">
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-850 rounded-xl flex items-start gap-1.5 font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="block text-[11px] uppercase tracking-wide font-black">NPCI Gateway Approved</span>
                    <span className="font-normal text-[10px] mt-0.5 block text-xs">VPA settlement records synced onto live UPI databases. No holdbacks active.</span>
                  </div>
                </div>

                <p className="text-[10px] dark:text-zinc-500">
                  Changing your mobile anchor or settlement business legal names temporarily triggers approval validations from local compliance authorities. Holdback cycles are skipped in simulation mode.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Automated Sequences timetables */}
        {activeTab === 'sequences' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-6 space-y-4 animate-nudge max-w-4xl text-xs">
            
            <div className="border-b border-zinc-100 dark:border-zinc-850 pb-3 mb-4 font-bold text-sm text-zinc-800 dark:text-slate-100 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-[#3525cd]" /> Scheduled Outbound Sequences Rules
            </div>

            <div className="space-y-4 font-semibold text-zinc-700">
              
              {/* Sequence prior */}
              <div className="flex flex-wrap items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-150/50 dark:border-zinc-800/80 hover:bg-zinc-100/50 transition-colors gap-3">
                <div className="space-y-0.5">
                  <span className="text-zinc-900 dark:text-neutral-100 font-bold block">1. Early Reminder Trigger (Stage I)</span>
                  <p className="text-[10.5px] text-zinc-400 font-normal">Message accounts early prior to reaching invoice targets.</p>
                </div>
                <div className="flex items-center gap-2">
                  {autoSendBefore && (
                    <select
                      value={daysBefore}
                      onChange={e => setDaysBefore(Number(e.target.value))}
                      className="p-1 px-2 border dark:border-zinc-700 rounded-md text-[11px] bg-white dark:bg-zinc-850 text-[#3525cd] font-bold"
                    >
                      <option value={1}>1 day prior</option>
                      <option value={3}>3 days prior</option>
                      <option value={5}>5 days prior</option>
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => setAutoSendBefore(!autoSendBefore)}
                    className="text-[#3525cd] cursor-pointer"
                  >
                    {autoSendBefore ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-zinc-400" />}
                  </button>
                </div>
              </div>

              {/* Sequence On Due */}
              <div className="flex flex-wrap items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-150/50 dark:border-zinc-800/80 hover:bg-zinc-100/50 transition-colors gap-3">
                <div className="space-y-0.5">
                  <span className="text-zinc-900 dark:text-neutral-100 font-bold block">2. Due-Day Alert (Stage II)</span>
                  <p className="text-[10.5px] text-zinc-400 font-normal">Dispatches settlement links directly on the precise target due date.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSendOnDue(!autoSendOnDue)}
                  className="text-[#3525cd] cursor-pointer"
                >
                  {autoSendOnDue ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-zinc-400" />}
                </button>
              </div>

              {/* Sequence Overdue */}
              <div className="flex flex-wrap items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-150/50 dark:border-zinc-800/80 hover:bg-zinc-100/50 transition-colors gap-3">
                <div className="space-y-0.5">
                  <span className="text-zinc-900 dark:text-neutral-100 font-bold block">3. Overdue Escalations Loop (Stage III)</span>
                  <p className="text-[10.5px] text-zinc-400 font-normal">Triggers series loops with escalating urgency on late accounts.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutoSendOverdue(!autoSendOverdue)}
                  className="text-[#3525cd] cursor-pointer"
                >
                  {autoSendOverdue ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-zinc-400" />}
                </button>
              </div>

              {/* Outbound channels selectors */}
              <div className="space-y-2 pt-2">
                <label className="text-xs text-zinc-550 block uppercase tracking-wider text-[10px]">Preferred System Delivery Channel</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setPreferredChannel('WhatsApp')}
                    className={`py-2 p-3 font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                      preferredChannel === 'WhatsApp' ? 'bg-green-50 text-[#075e54] border-green-300 dark:bg-emerald-950/20' : 'bg-white dark:bg-zinc-850 dark:border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-emerald-500" /> WhatsApp Preferred
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredChannel('Email')}
                    className={`py-2 p-3 font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                      preferredChannel === 'Email' ? 'bg-[#3525cd]/15 text-[#3525cd] dark:text-indigo-450 border-indigo-250 dark:bg-indigo-950/20' : 'bg-white dark:bg-zinc-850 dark:border-zinc-800 text-zinc-400'
                    }`}
                  >
                    <Mail className="w-4 h-4 text-[#3525cd]" /> Email Preferred
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreferredChannel('Both')}
                    className={`py-2 p-3 font-bold rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer ${
                      preferredChannel === 'Both' ? 'bg-indigo-50 border-indigo-200 text-indigo-800 dark:bg-zinc-800 dark:border-zinc-750' : 'bg-white dark:bg-zinc-850 dark:border-zinc-800 text-zinc-400'
                    }`}
                  >
                    Dual Route Delivery
                  </button>
                </div>
              </div>

              {/* Cooldown and strict window restriction alerts */}
              <div className="p-3 bg-amber-50/50 dark:bg-zinc-850 rounded-xl border border-amber-100 dark:border-zinc-800">
                <p className="text-[10px] text-amber-800 dark:text-amber-400 flex items-center gap-1">
                  <Flame className="w-4 h-4 fill-current text-amber-500 animate-pulse" /> 
                  <span><strong>Cooldown rules active</strong>: PayNudge safeguards user experience by blocking automatic sequences if communication attempts were dispatched less than 12 hours ago.</span>
                </p>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: Team list & Roles */}
        {activeTab === 'team' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-nudge">
            
            {/* Team Roster Grid (Col span 7) */}
            <div className="md:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 space-y-4">
              <div className="border-b border-zinc-100 dark:border-zinc-850 pb-3 font-bold text-sm text-zinc-800 dark:text-neutral-200 flex items-center gap-1.5">
                <Users className="w-4.5 h-4.5 text-[#3525cd]" /> Team Accounts & Roles Access
              </div>

              <div className="border border-zinc-100 dark:border-zinc-850 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-850 p-2 font-bold uppercase text-[9.5px] text-zinc-400">
                    <tr>
                      <th className="p-3">Member name</th>
                      <th className="p-3">Role</th>
                      <th className="p-3">Authorizations</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                    {teamList.map((member) => (
                      <tr key={member.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-zinc-900 dark:text-neutral-100">{member.name}</div>
                          <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{member.email}</div>
                        </td>
                        <td className="p-3">
                          <span className={`p-1 px-2 text-[9.5px] font-bold uppercase rounded-md ${
                            member.role === 'Owner' ? 'bg-[#3525cd]/10 text-[#3525cd]' :
                            member.role === 'Assistant' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-zinc-600'
                          }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] text-zinc-500 font-mono uppercase font-bold">
                            {member.status === 'Active' ? '✓ Write Limitless' : '⏳ Pending confirmation'}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {member.role !== 'Owner' && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-1 text-zinc-400 hover:text-rose-600 cursor-pointer"
                              title="Delete Team member access"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>

            {/* Inboard new Member (Col span 4) */}
            <div className="md:col-span-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 space-y-4">
              <div className="font-bold text-xs uppercase tracking-wider text-zinc-650 flex items-center gap-1.5 border-b border-zinc-200/50 pb-3">
                <Plus className="w-4.5 h-4.5 text-[#3525cd]" /> Invite Workspace member
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-bold block">First & Last name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Chandra"
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 p-2 text-xs rounded-lg text-zinc-900 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-bold block">Email address</label>
                  <input
                    type="email"
                    placeholder="ramesh@gmail.com"
                    value={newTeamEmail}
                    onChange={e => setNewTeamEmail(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 p-2 text-xs rounded-lg text-zinc-900 dark:text-slate-100 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase font-bold block">Authorized Role Profile</label>
                  <select
                    value={newTeamRole}
                    onChange={e => setNewTeamRole(e.target.value as any)}
                    className="w-full bg-white dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 p-2 text-xs rounded-lg text-zinc-900 dark:text-slate-100 focus:outline-hidden"
                  >
                    <option value="Assistant">Collections Assistant (Dues management)</option>
                    <option value="Auditor">Account Auditor (Read only Ledger reports)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAddTeamMember}
                  className="w-full py-2.5 bg-[#3525cd] hover:bg-[#4f46e5] font-bold text-white uppercase text-[10px] tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Confirm Send Invite →
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: API & Developer Sandbox Keys */}
        {activeTab === 'api' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-6 space-y-4 animate-nudge text-xs max-w-4xl">
            
            <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3 mb-4 font-bold text-sm text-zinc-805 dark:text-neutral-100 flex items-center justify-between">
              <span className="flex items-center gap-1.5"><Key className="w-4.5 h-4.5 text-[#3525cd]" /> Developer Sandbox API Integration</span>
              <button
                type="button"
                onClick={() => setShowKeys(!showKeys)}
                className="text-xs text-[#3525cd] dark:text-indigo-400 font-bold hover:underline"
              >
                {showKeys ? 'Hide Keys' : 'View API tokens'}
              </button>
            </div>

            <div className="space-y-4 font-semibold text-zinc-700">
              <p className="text-zinc-400 font-normal select-none">
                Integrate PayNudge collections automation loops directly into your internal billing, ERP software or Custom App.
              </p>

              {/* Sandbox Key */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest block font-bold">Sandbox Token Key (Publishable)</label>
                <div className="flex gap-2">
                  <input
                    type={showKeys ? 'text' : 'password'}
                    readOnly
                    value={sandboxApiKey}
                    className="flex-grow p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-xs text-[#3525cd] font-bold focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sandboxApiKey);
                      setSandboxCopied(true);
                      setTimeout(() => setSandboxCopied(false), 2400);
                    }}
                    className={`p-2 border px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      sandboxCopied 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-zinc-800' 
                        : 'border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-800 dark:text-slate-100 text-zinc-650 hover:bg-zinc-100'
                    }`}
                  >
                    {sandboxCopied ? '✓ Copied!' : 'Copy Token'}
                  </button>
                </div>
              </div>

              {/* Prod key block */}
              <div className="space-y-1">
                <label className="text-[10px] text-rose-500 uppercase tracking-widest block font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Production secret key (Restricted access)
                </label>
                <div className="flex gap-2">
                  <input
                    type={showKeys ? 'text' : 'password'}
                    readOnly
                    value={prodApiKey}
                    className="flex-grow p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl font-mono text-xs text-rose-600 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(prodApiKey);
                      setProdCopied(true);
                      setTimeout(() => setProdCopied(false), 2400);
                    }}
                    className={`p-2 border px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                      prodCopied 
                        ? 'bg-rose-50 text-rose-700 border-rose-250 dark:bg-zinc-800' 
                        : 'border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-800 dark:text-slate-100 text-zinc-650 hover:bg-zinc-100'
                    }`}
                  >
                    {prodCopied ? '✓ Secured Copy!' : 'Copy Token'}
                  </button>
                </div>
              </div>

              {/* Webhooks config */}
              <div className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-800/80 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div className="space-y-0.5">
                  <span className="text-zinc-900 dark:text-neutral-100 font-bold block">Integrations Webhooks Triggering</span>
                  <p className="text-[10.5px] text-zinc-400 font-normal">Dispatches an instant callback event whenever client clears transaction dues online.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setWebhooksEnabled(!webhooksEnabled)}
                  className="text-[#3525cd] cursor-pointer"
                >
                  {webhooksEnabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8 text-zinc-400" />}
                </button>
              </div>

            </div>

          </div>
        )}

        {/* TAB 5: Billing & Platforms limits */}
        {activeTab === 'billing' && (
          <div className="space-y-4 animate-nudge text-xs max-w-4xl">
            
            <div className="p-5 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 space-y-4">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 font-bold text-sm text-zinc-800 dark:text-neutral-100 flex items-center gap-1.5 mb-1">
                <CreditCard className="w-4.5 h-4.5 text-[#3525cd]" /> Plan Subscription Tiers & Billing Records
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Plan 1 */}
                <div className={`p-4 rounded-xl border text-center relative ${
                  billingPlan === 'free' ? 'border-[#3525cd] bg-indigo-50/10' : 'border-zinc-150/50 dark:border-zinc-800'
                }`}>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Sandbox standard</span>
                  <h4 className="font-serif text-base font-extrabold text-zinc-800 dark:text-neutral-100 mt-1">Acme Free Tier</h4>
                  <div className="my-2.5 font-bold text-xl text-zinc-900 dark:text-slate-100 font-mono">₹0 / mo</div>
                  <ul className="text-[10px] text-zinc-400 space-y-1 my-3 select-none">
                    <li>✓ 5 active debtors maximum</li>
                    <li>✓ Manual WhatsApp triggers</li>
                    <li>✓ Core templating systems</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => setBillingPlan('free')}
                    className="w-full py-1.5 border border-zinc-250 dark:border-zinc-700 font-bold rounded-lg hover:bg-zinc-50"
                  >
                    {billingPlan === 'free' ? 'Currently Active' : 'Switch tier'}
                  </button>
                </div>

                {/* Plan 2 */}
                <div className={`p-4 rounded-xl border text-center relative ${
                  billingPlan === 'starter' ? 'border-[#3525cd] bg-indigo-55/10 ring-2 ring-[#3525cd]/15' : 'border-zinc-150/50 dark:border-zinc-800'
                }`}>
                  <span className="absolute -top-2.5 left-1/2 transform -translate-x-1/2 bg-[#3525cd] text-white font-bold text-[8.5px] tracking-widest uppercase p-1 px-2.5 rounded-full">
                    Recommended Pro
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase mt-1">Growth level</span>
                  <h4 className="font-serif text-base font-extrabold text-zinc-800 dark:text-neutral-100 mt-1">Scale Pro Premium</h4>
                  <div className="my-2.5 font-bold text-xl text-[#3525cd] dark:text-indigo-400 font-mono">₹1,499 / mo</div>
                  <ul className="text-[10px] text-zinc-400 space-y-1 my-3 select-none font-medium">
                    <li>✓ Unlimited client ledgers</li>
                    <li>✓ Full Automated Sequence runs</li>
                    <li>✓ Advanced CRM profile intelligence</li>
                    <li>✓ Double Tick telemetry audits</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => setBillingPlan('starter')}
                    className="w-full py-1.5 bg-[#3525cd] text-white font-bold rounded-lg hover:bg-[#4f46e5]"
                  >
                    {billingPlan === 'starter' ? '✓ Recommended Active' : 'Activate Plan'}
                  </button>
                </div>

                {/* Plan 3 */}
                <div className={`p-4 rounded-xl border text-center relative ${
                  billingPlan === 'growth' ? 'border-[#3525cd] bg-indigo-50/10' : 'border-zinc-150/50 dark:border-zinc-800'
                }`}>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase">Super distributor</span>
                  <h4 className="font-serif text-base font-extrabold text-zinc-800 dark:text-neutral-100 mt-1">Enterprise Plan</h4>
                  <div className="my-2.5 font-bold text-xl text-zinc-900 dark:text-slate-100 font-mono">₹4,999 / mo</div>
                  <ul className="text-[10px] text-zinc-400 space-y-1 my-3 select-none">
                    <li>✓ Unlimited teams/roles</li>
                    <li>✓ Custom SMS/Viber send APIs</li>
                    <li>✓ Dedicated NPCI VPA handles</li>
                    <li>✓ Custom white-labeled links</li>
                  </ul>
                  <button
                    type="button"
                    onClick={() => setBillingPlan('growth')}
                    className="w-full py-1.5 border border-zinc-250 dark:border-zinc-700 font-bold rounded-lg hover:bg-zinc-50"
                  >
                    {billingPlan === 'growth' ? 'Currently Active' : 'Switch tier'}
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Global Save Trigger and Toast Alerts */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-150 dark:border-zinc-850 pt-5">
          <p className="text-[11px] text-zinc-400 max-w-md">
            ✓ Multi-state validation active. Saving updates changes recorded inside your sandbox browser store immediately.
          </p>

          <div className="flex items-center gap-3">
            {saveSuccess && (
              <span className="text-[11px] font-bold text-green-700 bg-green-50 dark:bg-emerald-900/10 p-2 px-3 rounded-lg flex items-center gap-1 border border-green-150">
                <Check className="w-4 h-4" /> Local changes saved!
              </span>
            )}
            
            <button
              type="submit"
              className="py-3 px-6 bg-[#3525cd] hover:bg-[#4f46e5] font-black text-xs text-white rounded-xl shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5 h-11"
            >
              Confirm System Changes <Save className="w-4 h-4" />
            </button>
          </div>
        </div>

      </form>

    </div>
  );
}
