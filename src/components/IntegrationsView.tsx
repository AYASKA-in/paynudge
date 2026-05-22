import { useState } from 'react';
import { ProviderDiagnostic, WebhookDeliveryLog } from '../types';
import { 
  Terminal, 
  Settings, 
  Layers, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Smartphone, 
  Mail, 
  CreditCard, 
  Link, 
  Play, 
  Code,
  Globe,
  Database
} from 'lucide-react';
import { INITIAL_DIAGNOSTICS, INITIAL_WEBHOOK_LOGS } from '../data';
import { SandboxServiceSimulator } from '../lib/saasManager';

interface IntegrationsViewProps {
  onTriggerWebhookSettle: (invoiceId: string) => void;
  unpaidInvoiceIds: string[];
}

export default function IntegrationsView({
  onTriggerWebhookSettle,
  unpaidInvoiceIds,
}: IntegrationsViewProps) {
  const [diagnostics, setDiagnostics] = useState<ProviderDiagnostic[]>(INITIAL_DIAGNOSTICS);
  const [webhookLogs, setWebhookLogs] = useState<WebhookDeliveryLog[]>(INITIAL_WEBHOOK_LOGS);
  
  // Custom API configuration inputs
  const [whatsappApiKey, setWhatsappApiKey] = useState('meta_cloud_live_pk_9ab8c3328e10ff');
  const [resendApiKey, setResendApiKey] = useState('re_93FakEsEcrEtKeY_89abc2');
  const [webhookEndpoint, setWebhookEndpoint] = useState('https://api.acme.in/v1/paynudge-webhook');
  
  // Simulation switches
  const [targetSettleInvoiceId, setTargetSettleInvoiceId] = useState(unpaidInvoiceIds[0] || '');
  const [isSimulatingCall, setIsSimulatingCall] = useState(false);
  const [customError, setCustomError] = useState('');

  // Settle via webhook simulation trigger
  const handleTriggerMockWebhook = () => {
    if (!targetSettleInvoiceId) {
      setCustomError('No active outstanding invoices found to settle.');
      return;
    }
    setCustomError('');
    setIsSimulatingCall(true);

    setTimeout(() => {
      // Trigger matching status change
      onTriggerWebhookSettle(targetSettleInvoiceId);

      // Create log
      const newLogVal: WebhookDeliveryLog = {
        id: `WH_${Math.floor(10000 + Math.random() * 90000)}`,
        targetUrl: webhookEndpoint,
        event: 'payment.settled',
        status: 'success',
        responseCode: 200,
        timestamp: 'Just now (Callback received)',
        payloadSnippet: `{"invoice_id": "${targetSettleInvoiceId}", "amount": 4500, "status": "Paid", "cleared_via_webhook": true, "utr": "UTR${Math.floor(10000000 + Math.random() * 90000000)}"}`,
        retryCount: 0,
      };

      setWebhookLogs(prev => [newLogVal, ...prev]);
      setIsSimulatingCall(false);
    }, 550);
  };

  const handlePingAllGateways = () => {
    setDiagnostics(prev => prev.map(item => ({
      ...item,
      latencyMs: Math.round(item.latencyMs * (0.8 + Math.random() * 0.4)),
    })));
  };

  return (
    <div className="space-y-6">
      
      {/* Header component */}
      <div>
        <div className="flex items-center gap-1.5 bg-zinc-900 text-amber-400 p-1.5 px-3 rounded-xl text-[10px] font-mono w-fit mb-2 border border-zinc-800">
          <Terminal className="w-3.5 h-3.5" />
          CORE API CREDENTIALS & Webhook Sandbox WebHook Simulator
        </div>
        <h2 className="text-3xl font-black text-[#1b1b24] tracking-tight">API & Integrations Config</h2>
        <p className="text-xs text-zinc-500 mt-1 max-w-2xl">
          Securely configure twilio channels, resend SMTP gateways, direct BHIM merchant IDs, and simulate webhook responses in a dry-run local developer sandbox.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* API Credentials Setup Forms (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-[#3525cd]" />
              Production Service Providers Connections
            </h3>

            <div className="space-y-4 text-xs">
              
              {/* WhatsApp Live meta credentials */}
              <div className="p-4 rounded-xl border border-zinc-150 bg-[#fcf8ff] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-zinc-800 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-[#25D366]" /> WhatsApp Business API (Meta)
                  </span>
                  <p className="text-[10px] text-zinc-400">Uses official Meta graph interfaces to broadcast. Set live production token.</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Bearer Secret Key</span>
                  <input
                    type="password"
                    value={whatsappApiKey}
                    onChange={(e) => setWhatsappApiKey(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#c7c4d8] rounded-lg focus:outline-hidden text-zinc-700 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Resend Email Secret API credentials */}
              <div className="p-4 rounded-xl border border-zinc-150 bg-[#fcf8ff] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-zinc-800 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-indigo-500" /> Resend Delivery Gateway
                  </span>
                  <p className="text-[10px] text-zinc-400">SMTP relay for sending polished email invoices. Set SMTP Secret Token.</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Resend Live Token</span>
                  <input
                    type="password"
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#c7c4d8] rounded-lg focus:outline-hidden text-zinc-700 font-mono text-[11px]"
                  />
                </div>
              </div>

              {/* Custom Webhook url registry callback endpoint */}
              <div className="p-4 rounded-xl border border-zinc-150 bg-[#fcf8ff] grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-zinc-800 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-500" /> Outbound Webhook Webhook URI
                  </span>
                  <p className="text-[10px] text-zinc-400">Your systems callback endpoint. Dispatches webhooks when payments clear.</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-zinc-500">Live Endpoint Endpoint URL</span>
                  <input
                    type="text"
                    value={webhookEndpoint}
                    onChange={(e) => setWebhookEndpoint(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-[#c7c4d8] rounded-lg focus:outline-hidden text-zinc-700 font-mono text-[11px]"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* Webhook Execution Terminal section */}
          <div className="bg-white rounded-2xl border border-zinc-200/60 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-sm text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-500" />
                Live Webhook Trigger Terminal
              </h3>
              <p className="text-[11px] text-[#464555] mt-0.5">
                Simulate a payment gateway webhook callback payload pushing into your workspace ledger. Perfect for demonstrating live integration sync.
              </p>
            </div>

            <div className="bg-zinc-550 p-4 rounded-xl border border-zinc-200 bg-[#fcf8ff] text-xs grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-zinc-500 block">Select Outstanding Invoice to Settle</span>
                <select
                  value={targetSettleInvoiceId}
                  onChange={(e) => setTargetSettleInvoiceId(e.target.value)}
                  className="w-full p-2 bg-white border border-[#c7c4d8] font-bold rounded-lg outline-none cursor-pointer text-xs"
                >
                  <option value="">-- Choose outstanding invoice --</option>
                  {unpaidInvoiceIds.map(id => (
                    <option key={id} value={id}>Invoice: #{id}</option>
                  ))}
                </select>

                {customError && <span className="text-rose-600 block text-[10px] font-bold">{customError}</span>}
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={isSimulatingCall || !targetSettleInvoiceId}
                  onClick={handleTriggerMockWebhook}
                  className="px-5 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-xs font-mono font-bold text-emerald-400 border border-zinc-800 rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2 cursor-pointer h-12"
                >
                  {isSimulatingCall ? <RefreshCw className="w-4 h-4 animate-spin text-emerald-300" /> : <Play className="w-4 h-4 text-emerald-400" />}
                  POST Event: payment.settled ({targetSettleInvoiceId || 'none'})
                </button>
              </div>
            </div>

            {/* Webhook logs stream list */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase text-zinc-550 block font-mono">Sandbox Outbound Dispatch History Logs</span>
              <div className="divide-y divide-zinc-150 rounded-xl border border-zinc-150 overflow-hidden font-mono text-[11px]">
                {webhookLogs.map(log => (
                  <div key={log.id} className="p-3 bg-white-50 flex flex-wrap justify-between items-center gap-2 hover:bg-zinc-50">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#3525cd]">#{log.id}</span>
                      <span className="p-0.5 px-1.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded text-[9px] uppercase font-bold">
                        {log.event}
                      </span>
                      <span className="text-zinc-650 truncate max-w-xs">{log.targetUrl}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <code className="text-xs text-zinc-400">{log.timestamp}</code>
                      <code className="p-1 px-2.5 bg-zinc-900 text-emerald-300 rounded font-bold text-[10px]">HTTP {log.responseCode}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right column (4 cols): Provider uptime telemetry dashboards */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-2xl border border-zinc-200/60 p-5 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-650 flex items-center gap-1">
                <Layers className="w-4 h-4 text-indigo-500" /> Integration Diagnostics
              </h4>
              <button 
                onClick={handlePingAllGateways}
                className="p-1 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-indigo-600 transition-colors"
                title="Refresh API Pings"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3.5">
              {diagnostics.map(item => (
                <div key={item.id} className="p-3 rounded-xl border border-zinc-100/60 space-y-1 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-bold text-zinc-800 block leading-none">{item.name}</span>
                      <span className="text-[9px] font-mono text-zinc-400 mt-1 block">{item.providerType} Adapter</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono leading-none font-extrabold text-emerald-600 bg-emerald-50 p-1 px-1.5 rounded">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-zinc-500 border-t border-zinc-100/60 pt-2 mt-1">
                    <span>Uptime: <strong className="text-zinc-700">{item.uptimePercentage}%</strong></span>
                    <span className="text-right">Ping: <strong className="text-zinc-700">{item.latencyMs}ms</strong></span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-zinc-400 text-center leading-relaxed">
              Provider adapters fall back automatically to static direct UPI QR vectors when service channels offline.
            </p>
          </div>

          {/* Webhook events checklist mapping documentation */}
          <div className="bg-zinc-950 text-white p-5 rounded-2xl border border-zinc-800/80 space-y-3.5 text-xs font-mono">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#eae6f4] flex items-center gap-1">
              <Database className="w-3.5 h-3.5" /> Webhook specifications
            </span>
            <p className="text-[10px] text-zinc-400">Events are dispatched as standard JSON payloads from our central queue handlers:</p>
            
            <div className="space-y-2 text-[10px] border-l-2 border-indigo-500 pl-3">
              <div>
                <span className="text-indigo-300 font-bold block">payment.settled</span>
                <span className="text-zinc-500 block">Dispatched when a merchant/assistant marks invoice as paid.</span>
              </div>
              <div>
                <span className="text-indigo-300 font-bold block">reminder.failed</span>
                <span className="text-zinc-500 block">Pushed when Twilio SMS carrier reports undelivered rate failure limits.</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
