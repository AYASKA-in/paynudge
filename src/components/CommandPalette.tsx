import { useState, useEffect, useRef } from 'react';
import { Search, Compass, Shield, Zap, RefreshCw, AlertTriangle, X, Terminal, HelpCircle } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToView: (view: 'dashboard' | 'ledger' | 'customers' | 'templates' | 'logs' | 'settings' | 'import' | 'copilot' | 'integrations' | 'billing') => void;
  onSwitchRole: (role: 'Owner' | 'Finance Partner (Admin)' | 'Collection Executive (Staff)') => void;
  onToggleOffline: () => void;
  isOffline: boolean;
  businessName: string;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onNavigateToView,
  onSwitchRole,
  onToggleOffline,
  isOffline,
  businessName,
}: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(); // Controlled externally
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const items = [
    { category: 'Navigation Panels', label: 'Go to main Collections Dashboard', action: () => onNavigateToView('dashboard'), keyword: 'home analytics stats overview' },
    { category: 'Navigation Panels', label: 'Review Receivables Ledger database', action: () => onNavigateToView('ledger'), keyword: 'invoices pending direct uptr' },
    { category: 'Navigation Panels', label: 'Relationship Overview & CRM Dues', action: () => onNavigateToView('customers'), keyword: 'debtors clients details health notes group' },
    { category: 'Navigation Panels', label: 'Launch AI Copilot Companion Desk', action: () => onNavigateToView('copilot'), keyword: 'ai follow-up draft response generator tone dialect' },
    { category: 'Navigation Panels', label: 'Nudge Multi-channel Templates', action: () => onNavigateToView('templates'), keyword: 'custom alerts script languages hindi email whatsapp' },
    { category: 'Navigation Panels', label: 'Audit Telemetry dispatch logs', action: () => onNavigateToView('logs'), keyword: 'records list webhook trace tracking' },
    { category: 'Navigation Panels', label: 'Spreadsheets Bulk Ingest Invoices', action: () => onNavigateToView('import'), keyword: 'csv download template parser excel roster' },
    { category: 'Navigation Panels', label: 'Real API Gateway Integrations Center', action: () => onNavigateToView('integrations'), keyword: 'twilio meta cloud resend smtp razorpay webhook simulation ping' },
    { category: 'Navigation Panels', label: 'SaaS Plan Subscriptions & Quotas desk', action: () => onNavigateToView('billing'), keyword: 'upgrade billing receipt coin limits core currency free pro scale' },
    { category: 'Navigation Panels', label: 'System Configuration panel', action: () => onNavigateToView('settings'), keyword: 'vpa hours business safety setup profile settings' },
    { category: 'SaaS Credentials & Active RBAC Profile', label: 'Switch Role to Workspace Owner', action: () => onSwitchRole('Owner'), keyword: 'rbac permission role upgrade absolute authority level' },
    { category: 'SaaS Credentials & Active RBAC Profile', label: 'Switch Role to Finance Partner (Admin)', action: () => onSwitchRole('Finance Partner (Admin)'), keyword: 'rbac permission admin assistant partner level' },
    { category: 'SaaS Credentials & Active RBAC Profile', label: 'Switch Role to Collection Executive (Staff)', action: () => onSwitchRole('Collection Executive (Staff)'), keyword: 'rbac staff low access only view ledger' },
    { category: 'Operational Reliability Simulator', label: isOffline ? 'Go Online (Restore sandboxed gateway DNS)' : 'Go Offline (Simulate DNS & Gateway disconnects)', action: () => onToggleOffline(), keyword: 'internet cellular router failed latency timed out fallback' },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      item.keyword.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-[#1b1b24]/60 backdrop-blur-xs z-50 flex items-start justify-center p-4 pt-16 md:pt-28">
      <div 
        className="bg-white dark:bg-zinc-900 border border-[#e4e1ee] dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in duration-150"
        id="global-command-palette-panel"
      >
        {/* Search header container */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
          <Search className="w-5 h-5 text-zinc-400" />
          <input
            ref={inputRef}
            type="text"
            className="flex-grow bg-transparent text-sm text-zinc-900 dark:text-zinc-150 placeholder-zinc-400 outline-none w-full"
            placeholder="Type a command or keyword... (e.g. 'ai', 'billing', 'offline', 'role')"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-650"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results directory wrapper */}
        <div className="p-2 max-h-80 overflow-y-auto">
          {filteredItems.length > 0 ? (
            <div>
              {/* Category headers helper */}
              {Array.from(new Set(filteredItems.map(i => i.category))).map(cat => (
                <div key={cat} className="mb-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest font-extrabold text-indigo-500 px-3 py-1 mt-1">
                    {cat}
                  </div>
                  <div className="space-y-0.5">
                    {filteredItems.filter(i => i.category === cat).map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          item.action();
                          onClose();
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-350 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-[#3525cd] dark:hover:text-indigo-400 transition-colors flex items-center justify-between group"
                      >
                        <span className="flex items-center gap-2">
                          <Compass className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#3525cd]" />
                          {item.label}
                        </span>
                        <kbd className="hidden sm:inline-block bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-400">
                          ↵ hit
                        </kbd>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-400 text-xs italic">
              <AlertTriangle className="w-5 h-5 mx-auto mb-1 text-amber-500" />
              No commands found matching "{search}". Try searching for 'vpa' or 'csv'.
            </div>
          )}
        </div>

        {/* Command help Footer panel */}
        <div className="bg-zinc-50 dark:bg-zinc-900/60 p-3 px-4 border-t border-zinc-150 dark:border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-medium">
          <span className="flex items-center gap-1">
            <Terminal className="w-3.5 h-3.5 text-[#3525cd]" />
            Active workspace: <span className="font-extrabold text-zinc-700 dark:text-zinc-400 ml-0.5">{businessName}</span>
          </span>
          <span className="text-[10px] font-mono leading-none">
            Ctrl+K to close
          </span>
        </div>
      </div>
    </div>
  );
}
