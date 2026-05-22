import { useState } from 'react';
import { NotificationLog, InvoiceDue } from '../types';
import { Search, Filter, Smartphone, Mail, RefreshCw, CheckCheck, Eye, Compass, Coins, CheckCircle, Clock } from 'lucide-react';

interface AuditLogsViewProps {
  logs: NotificationLog[];
  onTriggerCustomerActionSimulate: (logId: string) => void;
  invoices: InvoiceDue[];
}

export default function AuditLogsView({
  logs,
  onTriggerCustomerActionSimulate,
  invoices,
}: AuditLogsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'WhatsApp' | 'Email'>('all');
  const [activeLogIdForSimulate, setActiveLogIdForSimulate] = useState('');
  const [auditLogInfoMsg, setAuditLogInfoMsg] = useState('');

  const activeLog = logs.find(l => l.id === activeLogIdForSimulate);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          log.invoiceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.messagePreview.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesChannel = channelFilter === 'all' ? true : log.channel === channelFilter;

    return matchesSearch && matchesChannel;
  });

  const getLogInvoice = (invoiceId: string) => {
    return invoices.find(i => i.id === invoiceId);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#1b1b24] tracking-tight">Audit Outbound Logs</h2>
          <p className="text-sm text-[#464555] mt-1">Trace real-time reminder dispatches, delivery receipts, and collect telemetry indicators.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Outbound Logs index (Span 7 or 8) */}
        <div className="lg:col-span-8 bg-white rounded-[24px] border border-[#e4e1ee]/60 p-5 shadow-xs space-y-4">
          <div className="flex justify-between items-center bg-white">
            {/* Local search bar */}
            <div className="relative w-full md:w-64">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#777587]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search recipient or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#c7c4d8] rounded-xl font-body-sm text-xs text-[#1b1b24] focus:outline-hidden focus:border-[#3525cd]"
              />
            </div>

            {/* Micro channel filter selector toggles */}
            <div className="flex gap-1.5 p-1 bg-[#eae6f4] rounded-lg text-xs font-semibold">
              <button
                onClick={() => setChannelFilter('all')}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${channelFilter === 'all' ? 'bg-white text-[#3525cd] shadow-xs' : 'text-[#464555]'}`}
              >
                All
              </button>
              <button
                onClick={() => setChannelFilter('WhatsApp')}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${channelFilter === 'WhatsApp' ? 'bg-white text-[#3525cd] shadow-xs' : 'text-[#464555]'}`}
              >
                WhatsApp
              </button>
              <button
                onClick={() => setChannelFilter('Email')}
                className={`px-3 py-1.5 rounded-md cursor-pointer transition-all ${channelFilter === 'Email' ? 'bg-white text-[#3525cd] shadow-xs' : 'text-[#464555]'}`}
              >
                Email
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredLogs.length === 0 ? (
              <div className="py-16 text-center text-[#777587] text-xs">
                No outbound telemetry log sequences recorded matching current parameters.
              </div>
            ) : (
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-[#f0ecf9] text-[11px] font-semibold uppercase text-[#777587] tracking-wider bg-slate-50/50">
                    <th className="py-2.5 px-4 font-semibold">Sent timestamp</th>
                    <th className="py-2.5 px-4 font-semibold">Customer Recipient</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Inbound channel</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                    <th className="py-2.5 px-4 font-semibold">Invoice ID</th>
                    <th className="py-2.5 px-4 text-center">Interactive Simulator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0ecf9] text-xs text-[#1b1b24]">
                  {filteredLogs.map(log => (
                    <tr
                      key={log.id}
                      onClick={() => setActiveLogIdForSimulate(log.id)}
                      className={`hover:bg-[#fcf8ff] transition-colors group cursor-pointer ${activeLogIdForSimulate === log.id ? 'bg-[#f5f2ff]' : ''}`}
                    >
                      <td className="py-3 px-4 font-mono font-medium text-[#777587]">
                        {log.sentTime}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#1b1b24]">
                        {log.customerName}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center gap-1 text-[10px] bg-[#fcf8ff] px-2.5 py-0.5 rounded-full border border-[#eae6f4] ${log.channel === 'WhatsApp' ? 'text-green-700 font-bold border-[#25d366]/20' : 'text-indigo-700'}`}>
                          {log.channel === 'WhatsApp' ? <Smartphone className="w-3 h-3 text-[#25D366]" /> : <Mail className="w-3 h-3" />} {log.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {log.status === 'Paid' && (
                          <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200 uppercase font-extrabold text-[9px]">
                            Collected ✓
                          </span>
                        )}
                        {log.status === 'Read' && (
                          <span className="inline-flex items-center gap-1 bg-[#3525cd]/15 text-[#3525cd] px-2 py-0.5 rounded-full border border-[#3525cd]/25 uppercase font-extrabold text-[9px]">
                            <CheckCheck className="w-3 h-3 text-[#3525cd]" /> Read
                          </span>
                        )}
                        {log.status === 'Delivered' && (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200 uppercase font-extrabold text-[9px]">
                            Delivered
                          </span>
                        )}
                        {log.status === 'Sent' && (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-[#464555] px-2 py-0.5 rounded-full border border-slate-200 uppercase font-extrabold text-[9px]">
                            Outbound sent
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-[#3525cd]">
                        #{log.invoiceId}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          className="py-1 px-2.5 bg-white group-hover:bg-[#3525cd] group-hover:text-white border border-[#c7c4d8] rounded-lg transition-all font-semibold"
                        >
                          Simulate →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Side: Log status walkthrough simulator (Span 4) */}
        <div className="lg:col-span-4 bg-[#302f39] text-[#eae6f4] rounded-[24px] border border-[#777587]/30 p-5 shadow-xs flex flex-col justify-between min-h-[480px]">
          {activeLog ? (
            <div className="space-y-4 flex-grow flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-extrabold font-mono uppercase text-[#c7c4d8] bg-[#3525cd] px-2.5 py-0.5 rounded-full inline-block mb-2">
                  Outbound pipeline controller
                </span>

                <h3 className="font-sans text-lg font-black text-white">{activeLog.customerName} file</h3>
                <p className="text-[11px] text-[#c7c4d8] font-mono leading-none">Invoice Reference Serial: #{activeLog.invoiceId}</p>

                {/* Delivery pipeline timeline walkthrough */}
                <div className="mt-6 border-l border-[#777587]/40 pl-5 ml-2 space-y-4 text-xs font-mono">
                  
                  {/* Step 1: Outbound matching */}
                  <div className="relative">
                    <span className="absolute -left-[28px] top-1 w-3.5 h-3.5 rounded-full bg-green-500 flex items-center justify-center text-[8px] text-white">✓</span>
                    <span className="font-bold text-white block text-[11px]">Nudge registered on network</span>
                    <p className="text-[10px] text-[#c7c4d8]">PayNudge engine matched with pay VPA.</p>
                  </div>

                  {/* Step 2: Gateway cleared */}
                  <div className="relative">
                    <span className={`absolute -left-[28px] top-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] text-white ${['Delivered', 'Read', 'Paid'].includes(activeLog.status) ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}>
                      {['Delivered', 'Read', 'Paid'].includes(activeLog.status) ? '✓' : '●'}
                    </span>
                    <span className="font-bold text-white block text-[11px]">Outbound Gateway cleared</span>
                    <p className="text-[10px] text-[#c7c4d8]">Delivered to telecom carrier nodes.</p>
                  </div>

                  {/* Step 3: Read receipt status check */}
                  <div className="relative">
                    <span className={`absolute -left-[28px] top-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] text-white ${['Read', 'Paid'].includes(activeLog.status) ? 'bg-green-500' : 'bg-[#777587]'}`}>
                      {['Read', 'Paid'].includes(activeLog.status) ? '✓' : '○'}
                    </span>
                    <span className="font-bold text-white block text-[11px]">Receipt Open confirmation mark</span>
                    <p className="text-[10px] text-[#c7c4d8]">Recipient opened the chat bubble on mobile screen.</p>
                  </div>

                  {/* Step 4: UPI Settlement verification */}
                  <div className="relative">
                    <span className={`absolute -left-[28px] top-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] text-white ${['Paid'].includes(activeLog.status) ? 'bg-green-500' : 'bg-[#777587]'}`}>
                      {['Paid'].includes(activeLog.status) ? '✓' : '○'}
                    </span>
                    <span className="font-bold text-white block text-[11px]">UPI direct settled</span>
                    <p className="text-[10px] text-[#c7c4d8]">Direct bank-to-bank settlement clear.</p>
                  </div>

                </div>
              </div>

              {/* Simulation triggers actions */}
              <div className="space-y-2 pt-6 border-t border-[#777587]/20">
                <span className="text-[10px] font-extrabold block text-[#c7c4d8] uppercase font-mono mb-1">Trigger simulated client replies</span>

                {auditLogInfoMsg && (
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-[10.5px] rounded-xl font-mono leading-relaxed text-center animate-nudge">
                    {auditLogInfoMsg}
                  </div>
                )}

                {activeLog.status !== 'Paid' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerCustomerActionSimulate(activeLog.id);
                        setAuditLogInfoMsg("✓ Chat opened: message audit read status synchronized!");
                        setTimeout(() => setAuditLogInfoMsg(''), 4000);
                      }}
                      className="w-full py-2 bg-[#eae6f4] hover:bg-white text-[#1b1b24] font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#3525cd]" /> Open chat (Mark read status)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerCustomerActionSimulate(activeLog.id); // Mark read first
                        onTriggerCustomerActionSimulate(activeLog.id); // Mark paid next
                        setAuditLogInfoMsg(`✓ UPI Clearance: Invoice cleared and payment recorded for ${activeLog.customerName}!`);
                        setTimeout(() => setAuditLogInfoMsg(''), 5050);
                      }}
                      className="w-full py-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-[#25d366]"
                    >
                      <Coins className="w-3.5 h-3.5 text-white" /> Simulate Payment settlement ✓
                    </button>
                  </>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-3 rounded-xl text-center text-xs font-mono space-y-1">
                    <span className="font-bold flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-400" /> Payment record secure
                    </span>
                    <p className="text-[10px] text-[#c7c4d8]">This row has been marked PAID. Ref database synced.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-6 space-y-3">
              <span className="p-3 bg-[#eae6f4]/15 rounded-full border border-[#777587]/30 text-white">
                <Compass className="w-6 h-6 text-indigo-400" />
              </span>
              <span className="font-bold text-sm text-white">Interactive Sandbox Trace</span>
              <p className="text-xs text-[#c7c4d8] uppercase tracking-wider font-semibold">
                Select any log row on the left panel to execute outbound receipt lifecycle simulation testing.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
