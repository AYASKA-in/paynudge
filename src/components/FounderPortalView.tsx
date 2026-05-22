import { useState, useEffect } from 'react';
import { 
  Users, 
  HelpCircle, 
  Megaphone, 
  Activity, 
  Sparkles, 
  CheckCircle, 
  Trash2, 
  Clock, 
  ArrowUpRight, 
  BarChart2, 
  Settings, 
  AlertCircle, 
  Layers, 
  Globe,
  Check,
  Send,
  MessageSquare
} from 'lucide-react';

interface WaitlistLead {
  id: string;
  businessName: string;
  email: string;
  vpa: string;
  volume: string;
  channel: string;
  position: number;
  submittedAt: string;
  status: string;
}

interface SupportTicket {
  id: string;
  userEmail: string;
  category: string;
  description: string;
  createdAt: string;
  status: 'Open' | 'Resolved';
  replyText?: string;
}

interface FounderPortalViewProps {
  onUpdateAnnouncement: (announcement: string) => void;
  currentAnnouncement: string;
  onResetWorkspaceData: (scenario: 'fresh' | 'crisis' | 'scale') => void;
}

export default function FounderPortalView({ 
  onUpdateAnnouncement, 
  currentAnnouncement, 
  onResetWorkspaceData 
}: FounderPortalViewProps) {
  // Waitlist State
  const [leads, setLeads] = useState<WaitlistLead[]>([]);
  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  // Local Announcement State
  const [announcementText, setAnnouncementText] = useState(currentAnnouncement);
  // Active sub-tab inside Founder Portal
  const [activeTab, setActiveTab] = useState<'leads' | 'tickets' | 'announcements' | 'scenarios' | 'telemetry'>('leads');
  
  // Support Reply State
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyInput, setReplyInput] = useState('');

  // Load waitlist and tickets from LocalStorage
  const loadLeadsAndTickets = () => {
    const rawLeads = localStorage.getItem('paynudge_leads');
    if (rawLeads) {
      setLeads(JSON.parse(rawLeads));
    } else {
      // Seed default leads
      const defaultLeads: WaitlistLead[] = [
        {
          id: 'lead-1',
          businessName: 'Apex Steel Distributors',
          email: 'finance@apexsteel.in',
          vpa: 'apexsteel@okhdfcbank',
          volume: '20+ Lakhs',
          channel: 'Both',
          position: 124,
          submittedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
          status: 'Pending Approval'
        },
        {
          id: 'lead-2',
          businessName: 'Gupta Medical Hall',
          email: 'contact@guptamedical.com',
          vpa: 'guptamedical@okaxis',
          volume: '1-5 Lakhs',
          channel: 'WhatsApp',
          position: 189,
          submittedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
          status: 'Pending Approval'
        }
      ];
      localStorage.setItem('paynudge_leads', JSON.stringify(defaultLeads));
      setLeads(defaultLeads);
    }

    const rawTickets = localStorage.getItem('paynudge_tickets');
    if (rawTickets) {
      setTickets(JSON.parse(rawTickets));
    } else {
      // Seed default tickets
      const defaultTickets: SupportTicket[] = [
        {
          id: 'ticket-5412',
          userEmail: 'accounts@bhomiaacademy.com',
          category: 'UPI Link Verification',
          description: 'Can we use direct GPay Merchant short links instead of raw UPI VPA handles? Our bank terminal has an active merchant ID.',
          createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
          status: 'Open'
        },
        {
          id: 'ticket-9841',
          userEmail: 'sharma@goodsdistributors.in',
          category: 'WhatsApp Cloud Token Reset',
          description: 'Our WhatsApp test developer token expired after 24 hours. Does PayNudge support permanent system-user access tokens?',
          createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
          status: 'Resolved',
          replyText: 'Yes, Sharma! Go to Meta Developers Console -> System Users, generate a non-expiring WhatsApp User token, and paste it into API & Integrations.'
        }
      ];
      localStorage.setItem('paynudge_tickets', JSON.stringify(defaultTickets));
      setTickets(defaultTickets);
    }
  };

  useEffect(() => {
    loadLeadsAndTickets();
  }, []);

  const handleApproveLead = (leadId: string) => {
    const updated = leads.map(l => {
      if (l.id === leadId) {
        return { ...l, status: 'Approved & Invited' };
      }
      return l;
    });
    localStorage.setItem('paynudge_leads', JSON.stringify(updated));
    setLeads(updated);
  };

  const handleDeleteLead = (leadId: string) => {
    const updated = leads.filter(l => l.id !== leadId);
    localStorage.setItem('paynudge_leads', JSON.stringify(updated));
    setLeads(updated);
  };

  const handleSendTicketReply = (ticketId: string) => {
    if (!replyInput.trim()) return;
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return { 
          ...t, 
          status: 'Resolved' as const, 
          replyText: replyInput 
        };
      }
      return t;
    });
    localStorage.setItem('paynudge_tickets', JSON.stringify(updated));
    setTickets(updated);
    setReplyInput('');
    setActiveTicketId(null);
  };

  const handleSaveAnnouncement = () => {
    onUpdateAnnouncement(announcementText);
  };

  const handleScenarioTrigger = (scenario: 'fresh' | 'crisis' | 'scale') => {
    onResetWorkspaceData(scenario);
    // Reload waitlist and tickets as well
    loadLeadsAndTickets();
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#1b1b24] to-[#121218] p-6 rounded-2xl border border-zinc-800 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2.5 bg-amber-500/20 text-amber-500 border border-amber-500/35 rounded-full text-[10px] font-black uppercase tracking-wider">FOUNDER & PRESENTATION MODE</span>
          </div>
          <h2 className="text-xl font-black tracking-tight">PayNudge Startup Operations Suite</h2>
          <p className="text-xs text-zinc-400">
            Simulate administrative commands, review waitlist signups, manage user support queries, and switch demo environments instantly.
          </p>
        </div>
        <div className="flex items-center gap-1.5 self-start md:self-center">
          <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-400">Sandbox GTM Online</span>
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex flex-wrap gap-1 bg-input border border-border-medium p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('leads')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'leads' ? 'bg-card text-accent border border-border-subtle shadow-xs' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <Users className="w-3.5 h-3.5" /> Waitlist Inbound ({leads.filter(l => l.status === 'Pending Approval').length})
        </button>
        <button
          onClick={() => setActiveTab('tickets')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'tickets' ? 'bg-card text-accent border border-border-subtle shadow-xs' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <HelpCircle className="w-3.5 h-3.5" /> Support Inbox ({tickets.filter(t => t.status === 'Open').length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'announcements' ? 'bg-card text-accent border border-border-subtle shadow-xs' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <Megaphone className="w-3.5 h-3.5" /> Announcement Banner
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'scenarios' ? 'bg-card text-accent border border-border-subtle shadow-xs' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Demo Presenter Desk
        </button>
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'telemetry' ? 'bg-card text-accent border border-border-subtle shadow-xs' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <BarChart2 className="w-3.5 h-3.5" /> Telemetry Charts
        </button>
      </div>

      {/* Leads Tab Content */}
      {activeTab === 'leads' && (
        <div className="bg-card border border-border-subtle rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wider">Inbound Waitlist Leads</h3>
            <span className="text-[10px] font-bold text-text-secondary">Simulating landing page waitlist capture</span>
          </div>

          {leads.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border-medium rounded-xl space-y-2">
              <Users className="w-8 h-8 text-text-secondary/50 mx-auto" />
              <p className="text-xs text-text-secondary">No waitlist requests submitted yet.</p>
              <p className="text-[10px] text-zinc-400">Go to the Landing Page and enter a business request to seed it.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle text-text-secondary font-bold text-[10px] uppercase">
                    <th className="py-2.5">Business / Merchant</th>
                    <th className="py-2.5">Contact Email</th>
                    <th className="py-2.5">UPI VPA</th>
                    <th className="py-2.5">Billing Volume</th>
                    <th className="py-2.5">Channel</th>
                    <th className="py-2.5">Position</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {leads.map(l => (
                    <tr key={l.id} className="hover:bg-card-hover/40 transition-colors">
                      <td className="py-3 font-bold text-text-primary">{l.businessName}</td>
                      <td className="py-3 text-text-secondary">{l.email}</td>
                      <td className="py-3 font-mono text-[10px] text-[#3525cd] dark:text-indigo-400">{l.vpa}</td>
                      <td className="py-3"><span className="p-0.5 px-2 bg-input border border-border-medium rounded text-[10px]">{l.volume}</span></td>
                      <td className="py-3 text-text-secondary">{l.channel}</td>
                      <td className="py-3 font-mono text-zinc-650 dark:text-zinc-350">#{l.position}</td>
                      <td className="py-3">
                        <span className={`p-0.5 px-2 rounded-full text-[9px] font-black uppercase ${
                          l.status.includes('Approved') ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3 text-right space-x-1.5">
                        {l.status === 'Pending Approval' && (
                          <button
                            onClick={() => handleApproveLead(l.id)}
                            className="p-1 px-2.5 bg-emerald-600 text-white text-[10px] font-bold rounded-lg hover:bg-emerald-700 cursor-pointer"
                          >
                            Approve Access
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteLead(l.id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer"
                          title="Reject lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Support Tab Content */}
      {activeTab === 'tickets' && (
        <div className="bg-card border border-border-subtle rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wider">Active Support Tickets Desk</h3>
            <span className="text-[10px] font-bold text-text-secondary">Simulates inbound SaaS support desk operations</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Tickets List */}
            <div className="lg:col-span-5 space-y-2 max-h-[450px] overflow-y-auto pr-2">
              {tickets.map(t => (
                <div 
                  key={t.id}
                  onClick={() => {
                    setActiveTicketId(t.id);
                    setReplyInput('');
                  }}
                  className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                    activeTicketId === t.id ? 'bg-[#3525cd]/5 dark:bg-indigo-950/20 border-[#3525cd]' : 'bg-input hover:bg-card-hover border-border-medium'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <span className="font-bold text-xs text-text-primary truncate max-w-[150px]">{t.userEmail}</span>
                    <span className={`p-0.5 px-2 rounded-full text-[8px] font-black uppercase shrink-0 ${
                      t.status === 'Open' ? 'bg-red-50 dark:bg-red-950/40 text-red-600 border border-red-200/20' : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-200/20'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <span className="text-[10px] font-semibold text-text-secondary block mb-2">{t.category}</span>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">{t.description}</p>
                </div>
              ))}
            </div>

            {/* Ticket Reply Area */}
            <div className="lg:col-span-7 border border-border-subtle rounded-xl p-4 bg-input/50 min-h-[300px] flex flex-col justify-between">
              {activeTicketId ? (
                (() => {
                  const activeTicket = tickets.find(t => t.id === activeTicketId);
                  if (!activeTicket) return <p className="text-xs text-text-secondary m-auto">Select a support ticket to respond</p>;
                  return (
                    <div className="flex flex-col justify-between h-full space-y-4">
                      <div className="space-y-3">
                        <div className="border-b border-border-subtle pb-3">
                          <div className="flex justify-between items-center text-[10px] text-text-secondary">
                            <span>Ticket ID: <strong>#{activeTicket.id}</strong></span>
                            <span>Received: {new Date(activeTicket.createdAt).toLocaleString()}</span>
                          </div>
                          <h4 className="font-bold text-xs text-text-primary mt-1">{activeTicket.category}</h4>
                          <span className="text-[11px] text-[#3525cd] dark:text-indigo-400">{activeTicket.userEmail}</span>
                        </div>
                        <div className="p-3 bg-card border border-border-subtle rounded-xl text-xs text-text-primary leading-relaxed">
                          {activeTicket.description}
                        </div>
                        
                        {activeTicket.replyText && (
                          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-250/20 rounded-xl space-y-1">
                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-wider block">Founder Reply</span>
                            <p className="text-[11px] text-emerald-800 dark:text-emerald-300 leading-relaxed">{activeTicket.replyText}</p>
                          </div>
                        )}
                      </div>

                      {activeTicket.status === 'Open' ? (
                        <div className="space-y-2 mt-4">
                          <label className="text-[10px] font-bold text-text-secondary uppercase">Compose Ticket Resolution Response</label>
                          <div className="flex gap-2">
                            <textarea 
                              rows={3}
                              value={replyInput}
                              onChange={e => setReplyInput(e.target.value)}
                              placeholder="e.g. Setting a permanent Access Token fixes this..."
                              className="w-full p-2 bg-card border border-border-subtle rounded-xl text-xs text-text-primary outline-hidden focus:border-[#3525cd] resize-none"
                            />
                          </div>
                          <button
                            onClick={() => handleSendTicketReply(activeTicket.id)}
                            className="w-full py-2 bg-[#3525cd] hover:bg-[#3525cd]/95 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            <Send className="w-3.5 h-3.5" /> Dispatch Reply & Resolve Ticket
                          </button>
                        </div>
                      ) : (
                        <div className="text-center p-4 border border-dashed border-emerald-200 rounded-xl text-emerald-600 text-xs font-bold bg-emerald-50/20">
                          ✓ This support query is marked as Resolved.
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="text-center my-auto space-y-2 text-text-secondary/50">
                  <MessageSquare className="w-8 h-8 mx-auto" />
                  <p className="text-xs">Select an inbound support ticket from the list to view conversations and reply.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Announcements Tab Content */}
      {activeTab === 'announcements' && (
        <div className="bg-card border border-border-subtle rounded-2xl p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wider">Internal Workspace Alerts & Announcements</h3>
            <p className="text-xs text-text-secondary">Publish real-time banners visible to all team members at the top of their dashboard panels.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Banner Alert Message (HTML Supported)</label>
              <textarea 
                rows={3}
                value={announcementText}
                onChange={e => setAnnouncementText(e.target.value)}
                placeholder="e.g. ⚠️ Meta developer servers scheduled maintenance is on May 22, 02:00 AM IST. Webhooks might delay."
                className="w-full p-3 bg-input border border-border-medium rounded-xl text-xs text-text-primary outline-hidden focus:border-[#3525cd] font-semibold"
              />
            </div>

            <div className="flex gap-2">
              <button 
                onClick={handleSaveAnnouncement}
                className="p-2 px-6 bg-[#3525cd] hover:bg-[#3525cd]/95 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Publish Announcement Alert
              </button>
              <button 
                onClick={() => {
                  setAnnouncementText('');
                  onUpdateAnnouncement('');
                }}
                className="p-2 px-6 bg-input border border-border-medium hover:bg-card-hover text-text-primary text-xs font-bold rounded-xl cursor-pointer"
              >
                Clear Announcement
              </button>
            </div>

            <div className="border border-border-subtle rounded-xl p-4 bg-zinc-50 dark:bg-zinc-850/50 space-y-2">
              <span className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest block">Live Preview in App Header</span>
              {announcementText ? (
                <div className="bg-amber-500 text-black font-semibold text-xs py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-black shrink-0" />
                  <span>{announcementText}</span>
                </div>
              ) : (
                <div className="text-center py-2 text-[11px] text-zinc-400 italic">
                  No announcement published. Alert banner is hidden.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Presenter Desk Tab Content */}
      {activeTab === 'scenarios' && (
        <div className="bg-card border border-border-subtle rounded-2xl p-5 space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wider">Demo Scenario Switcher Console</h3>
            <p className="text-xs text-text-secondary">Instantly seed the client database with preset workspace conditions during presentations to pitch customers or investors.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Scenario 1 */}
            <div className="bg-input border border-border-medium rounded-xl p-5 hover:border-accent/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg"><Layers className="w-4 h-4" /></span>
                  <h4 className="font-bold text-xs text-text-primary uppercase">1. Fresh Setup</h4>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Generates an empty workspace slate. Demonstrates guided onboarding steps, configuration alerts, and UPI/VPA binds.
                </p>
              </div>
              <button
                onClick={() => handleScenarioTrigger('fresh')}
                className="w-full py-2 bg-zinc-800 hover:bg-zinc-900 text-white text-[11px] font-bold rounded-lg cursor-pointer"
              >
                Load Fresh Workspace
              </button>
            </div>

            {/* Scenario 2 */}
            <div className="bg-input border border-border-medium rounded-xl p-5 hover:border-amber-500/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-amber-100 text-amber-700 rounded-lg"><AlertCircle className="w-4 h-4" /></span>
                  <h4 className="font-bold text-xs text-text-primary uppercase">2. Overdue Crisis</h4>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Seeds several critical overdue invoices. Highlights AI Copilot's optimal send time calculations and risk scoring logs.
                </p>
              </div>
              <button
                onClick={() => handleScenarioTrigger('crisis')}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-lg cursor-pointer animate-pulse"
              >
                Load Overdue Crisis
              </button>
            </div>

            {/* Scenario 3 */}
            <div className="bg-input border border-border-medium rounded-xl p-5 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="p-1 bg-emerald-100 text-emerald-700 rounded-lg"><Activity className="w-4 h-4" /></span>
                  <h4 className="font-bold text-xs text-text-primary uppercase">3. Scale Success</h4>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Seeds a robust set of hundreds of transactions, low aging delays, high collection ratios, and telemetry analytics.
                </p>
              </div>
              <button
                onClick={() => handleScenarioTrigger('scale')}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg cursor-pointer"
              >
                Load Scale Success
              </button>
            </div>
          </div>

          <div className="border border-border-subtle bg-amber-500/10 p-4 rounded-xl space-y-2 text-left">
            <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block">Presentation Pitch Strategy Tip</span>
            <p className="text-[11px] text-zinc-650 dark:text-zinc-300 leading-relaxed">
              Start your pitch in <strong>Fresh Setup</strong> to show ease-of-onboarding and UPI connection checklist. Then, switch to <strong>Overdue Crisis</strong> to demonstrate AI Risk Profiling and template dispatching. Conclude with <strong>Scale Success</strong> to display beautiful metrics, highlighting the massive collections efficiency improvements for Indian SMBs.
            </p>
          </div>
        </div>
      )}

      {/* Telemetry Tab Content */}
      {activeTab === 'telemetry' && (
        <div className="bg-card border border-border-subtle rounded-2xl p-5 space-y-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-sm text-text-primary uppercase tracking-wider">GTM Telemetry Dashboard</h3>
            <p className="text-xs text-text-secondary">Simulates operational telemetry monitors showing live SaaS conversion and API gateway metrics.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-input border border-border-medium rounded-xl p-4 text-left">
              <span className="text-[10px] font-bold text-text-secondary uppercase">Beta Onboarded Signups</span>
              <div className="text-2xl font-black font-mono text-text-primary mt-1">42</div>
              <span className="text-[9px] text-emerald-600 font-bold block mt-1">+14% vs last week</span>
            </div>
            <div className="bg-input border border-border-medium rounded-xl p-4 text-left">
              <span className="text-[10px] font-bold text-text-secondary uppercase">WhatsApp API Deliverability</span>
              <div className="text-2xl font-black font-mono text-text-primary mt-1">99.8%</div>
              <span className="text-[9px] text-zinc-500 block mt-1">11,241 dispatches logs</span>
            </div>
            <div className="bg-input border border-border-medium rounded-xl p-4 text-left">
              <span className="text-[10px] font-bold text-text-secondary uppercase">Direct UPI Success Rate</span>
              <div className="text-2xl font-black font-mono text-text-primary mt-1">94.6%</div>
              <span className="text-[9px] text-emerald-600 font-bold block mt-1">Zero-Fee Peer-to-Peer</span>
            </div>
            <div className="bg-input border border-border-medium rounded-xl p-4 text-left">
              <span className="text-[10px] font-bold text-text-secondary uppercase">Avg. Collection Cycle Recovery</span>
              <div className="text-2xl font-black font-mono text-text-primary mt-1">3.4 Days</div>
              <span className="text-[9px] text-emerald-600 font-bold block mt-1">-5.2 days reduction</span>
            </div>
          </div>

          <div className="border border-border-subtle rounded-xl p-5 bg-input space-y-4">
            <h4 className="font-bold text-xs text-text-primary uppercase text-left">Collections Run-Rate Telemetry (Last 7 Days)</h4>
            <div className="h-40 flex items-end gap-3 pt-6 border-b border-border-subtle">
              {/* Bar 1 */}
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[9px] font-mono font-bold text-text-secondary">₹1.2L</span>
                <div className="w-full bg-[#3525cd] dark:bg-indigo-600 rounded-t-md h-[40%]"></div>
                <span className="text-[9px] text-zinc-400">Mon</span>
              </div>
              {/* Bar 2 */}
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[9px] font-mono font-bold text-text-secondary">₹85K</span>
                <div className="w-full bg-[#3525cd] dark:bg-indigo-600 rounded-t-md h-[28%]"></div>
                <span className="text-[9px] text-zinc-400">Tue</span>
              </div>
              {/* Bar 3 */}
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[9px] font-mono font-bold text-text-secondary">₹2.1L</span>
                <div className="w-full bg-[#3525cd] dark:bg-indigo-600 rounded-t-md h-[72%]"></div>
                <span className="text-[9px] text-zinc-400">Wed</span>
              </div>
              {/* Bar 4 */}
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[9px] font-mono font-bold text-text-secondary">₹1.4L</span>
                <div className="w-full bg-[#3525cd] dark:bg-indigo-600 rounded-t-md h-[48%]"></div>
                <span className="text-[9px] text-zinc-400">Thu</span>
              </div>
              {/* Bar 5 */}
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[9px] font-mono font-bold text-text-secondary">₹3.2L</span>
                <div className="w-full bg-[#3525cd] dark:bg-indigo-600 rounded-t-md h-[95%]"></div>
                <span className="text-[9px] text-zinc-400">Fri</span>
              </div>
              {/* Bar 6 */}
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[9px] font-mono font-bold text-text-secondary">₹60K</span>
                <div className="w-full bg-[#3525cd] dark:bg-indigo-600 rounded-t-md h-[20%]"></div>
                <span className="text-[9px] text-zinc-400">Sat</span>
              </div>
              {/* Bar 7 */}
              <div className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="text-[9px] font-mono font-bold text-text-secondary">₹45K</span>
                <div className="w-full bg-[#3525cd] dark:bg-indigo-600 rounded-t-md h-[15%]"></div>
                <span className="text-[9px] text-zinc-400">Sun</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
