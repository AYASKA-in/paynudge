import { useState, useEffect } from 'react';
import { Customer, InvoiceDue } from '../types';
import { 
  Sheet, 
  Clipboard, 
  HelpCircle, 
  Check, 
  ArrowRight, 
  UserCheck, 
  AlertCircle, 
  Sparkles,
  RefreshCw,
  FileSpreadsheet,
  AlertTriangle,
  Flame,
  Grid,
  TrendingUp,
  Download,
  Terminal,
  Trash2
} from 'lucide-react';

interface ImportExportViewProps {
  onBulkImport: (newCustomers: Customer[], newInvoices: InvoiceDue[]) => void;
  existingCustomers?: Customer[];
}

const SAMPLE_CSV_PRESETS = [
  {
    name: "Coaching Institute roster",
    data: `Rahul Sharma,rahul.sh@gmail.com,+91 98765 01010,May Batch XII Physics,4500,2026-05-20,Regular
Sanjana Roy,sanj.roy@gmail.com,+91 94330 92314,May Batch XII Chemistry,4505,2026-06-01,VIP
Arvind Sen,arv.sen@vsnl.net,+91 98888 77777,Class XI Revision fee,1200,2026-05-18,New`
  },
  {
    name: "Tuition / Apartment Rent Ledger",
    data: `Anjali Gupta,anjali.g@gmail.com,+91 99123 09283,Rent Flat 304,18000,2026-05-15,VIP
Kunal Verma,kunal.v@outlook.com,+91 98450 11993,Maintenance charges,3500,2026-05-25,Regular
Sunita Rao,sunita.rao@yopmail.com,+91 94440 12345,Gas & Utility Deposit,2200,2026-05-22,Regular`
  }
];

export default function ImportExportView({ onBulkImport, existingCustomers = [] }: ImportExportViewProps) {
  const [inputText, setInputText] = useState('');
  const [importPhase, setImportPhase] = useState<'paste' | 'map' | 'preview'>('paste');
  const [successCount, setSuccessCount] = useState(0);
  const [errorBanner, setErrorBanner] = useState('');
  const [templateCopied, setTemplateCopied] = useState(false);

  // Column Mapping selections indexes
  const [colIndexName, setColIndexName] = useState<number>(0);
  const [colIndexEmail, setColIndexEmail] = useState<number>(1);
  const [colIndexPhone, setColIndexPhone] = useState<number>(2);
  const [colIndexDesc, setColIndexDesc] = useState<number>(3);
  const [colIndexAmount, setColIndexAmount] = useState<number>(4);
  const [colIndexDate, setColIndexDate] = useState<number>(5);

  // Parsed internal nodes
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number>(-1);

  // Pre-load state matching
  const loadPreset = (index: number) => {
    setSelectedPresetIndex(index);
    setInputText(SAMPLE_CSV_PRESETS[index].data);
    setErrorBanner('');
    setImportPhase('paste');
  };

  /**
   * Stage 1: Transitioning pasture clipboard input into internal row tokens
   */
  const handleAnalyzeCSV = () => {
    if (!inputText.trim()) {
      setErrorBanner('Please paste spreadsheet entries or pick one of our micro-MSME presets first.');
      return;
    }

    const lines = inputText.split('\n').filter(l => l.trim() !== '');
    if (lines.length === 0) {
      setErrorBanner('No readable text lines found. Verify characters copy-pasted match standard CSV formats.');
      return;
    }

    // Capture temporary headers
    const sampleLine = lines[0];
    const columnCount = sampleLine.split(',').length;

    if (columnCount < 4) {
      setErrorBanner(`Warning: Highly compressed columns (${columnCount}). We recommend formatting your spreadsheet with at least 5 standard columns (Name, Email, Phone, Description, Amount).`);
      return;
    }

    setErrorBanner('');
    setImportPhase('map');
  };

  /**
   * Stage 2: Mapping columns indices to object values
   */
  const handleMapColumns = () => {
    const lines = inputText.split('\n').filter(l => l.trim() !== '');
    const computedRows: any[] = [];

    lines.forEach((line, index) => {
      const parts = line.split(',');
      if (parts.length < 3) return; // Skip completely empty separators

      const getValue = (idx: number) => (parts[idx] ? parts[idx].trim() : '');

      const rawAmount = getValue(colIndexAmount).replace(/[^0-9.]/g, '');
      const parsedAmount = parseFloat(rawAmount);

      const rawDate = getValue(colIndexDate);
      let validatedDate = rawDate;
      let hasDateError = false;

      // Smart Date autocorrection logic (Indian DD-MM-YYYY to standard ISO YYYY-MM-DD)
      const dateParts = rawDate.split(/[-/]/);
      if (dateParts.length === 3) {
        if (dateParts[0].length === 2 && dateParts[2].length === 4) {
          // DD-MM-YYYY -> YYYY-MM-DD
          validatedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
        } else if (dateParts[0].length === 4) {
          // Already YYYY-MM-DD
          validatedDate = `${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`;
        }
      } else {
        // Fallback to today plus 7 days if no date or malformed
        const defaultTarget = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        validatedDate = defaultTarget;
        hasDateError = true;
      }

      const clientName = getValue(colIndexName);
      const clientEmail = getValue(colIndexEmail);
      const clientPhone = getValue(colIndexPhone);

      // Check if duplicate exist in cache state
      const isDuplicate = existingCustomers.some(
        c => c.name.toLowerCase() === clientName.toLowerCase() || 
             c.phone.replace(/[^0-9]/g, '') === clientPhone.replace(/[^0-9]/g, '')
      );

      computedRows.push({
        id: `row_${index}`,
        name: clientName || `Unnamed Student ${index + 1}`,
        email: clientEmail || `${clientName.toLowerCase().replace(/\s/g, '')}@no-email.in`,
        phone: clientPhone || '+91 99000 00000',
        description: getValue(colIndexDesc) || 'Consolidated periodic subscription fees',
        amount: isNaN(parsedAmount) ? 1000 : parsedAmount,
        dueDate: validatedDate,
        isDuplicate,
        hasAmountFormatError: isNaN(parsedAmount),
        hasDateFormatError: hasDateError,
        isValid: clientName !== '' && !isNaN(parsedAmount)
      });
    });

    setParsedRows(computedRows);
    setImportPhase('preview');
  };

  /**
   * Stage 3: Performing the final compilation and emitting bulk callback
   */
  const handleFinalIngest = () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      setErrorBanner('All pasted rows failed validation criteria. Please modify column indexes mapping and retry.');
      return;
    }

    const customers: Customer[] = [];
    const invoices: InvoiceDue[] = [];

    validRows.forEach((row, index) => {
      const cId = `cust_bulk_${Date.now()}_${index}`;
      
      customers.push({
        id: cId,
        name: row.name,
        email: row.email,
        phone: row.phone,
        tier: 'Regular',
        notes: `Ingested via smart CSV mapper on ${new Date().toLocaleDateString('en-IN')}. Reference: ${row.description}`,
        avgCollectionDays: 10
      });

      const invId = `INV-IM-${Math.floor(10000 + Math.random() * 90000)}`;
      const todayStr = new Date().toISOString().split('T')[0];
      const isOverdue = new Date(row.dueDate) < new Date(todayStr);

      invoices.push({
        id: invId,
        customerId: cId,
        amount: row.amount,
        dueDate: row.dueDate,
        paymentStatus: isOverdue ? 'Critical' : 'Active',
        createdDate: todayStr,
        notes: row.description
      });
    });

    onBulkImport(customers, invoices);
    setSuccessCount(validRows.length);
    
    // Clear state caches
    setParsedRows([]);
    setInputText('');
    setImportPhase('paste');
    setSelectedPresetIndex(-1);
    
    setTimeout(() => {
      setSuccessCount(0);
    }, 6000);
  };

  // Copy sample template helper
  const copyTemplateToClipboard = () => {
    const header = "FullName,Email,Phone,Description,Amount,DueDate\n";
    const body = "Rahul Roy,rahul@gmail.com,+919876543210,Class Tuition fee,4200,2026-05-25";
    navigator.clipboard.writeText(header + body);
    setTemplateCopied(true);
    setTimeout(() => setTemplateCopied(false), 2400);
  };

  // Math totals for the previewing list
  const totalPreviewAmount = parsedRows.filter(r => r.isValid).reduce((sum, r) => sum + r.amount, 0);
  const totalDuplicateCount = parsedRows.filter(r => r.isDuplicate && r.isValid).length;

  return (
    <div className="space-y-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200/50 dark:border-zinc-800 pb-5">
        <div>
          <span className="text-xs font-bold text-[#3525cd] uppercase tracking-wider flex items-center gap-1">
            <FileSpreadsheet className="w-4 h-4 text-[#3525cd]" /> Automated Lead Ingest
          </span>
          <h2 className="text-3xl font-black text-zinc-900 dark:text-neutral-100 tracking-tight mt-1">Smart Roster Ingestion</h2>
          <p className="text-xs text-zinc-500 mt-1">Extract student records, rent ledgers, or vendor balances directly from Excel/Google Sheets clipboard blocks.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Work Area (Left: Span 8) */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 shadow-xs space-y-5">
          
          {/* Phase UI Indicators Stepper */}
          <div className="flex items-center justify-between bg-zinc-550/5 dark:bg-zinc-800 p-2.5 rounded-xl text-[11px] font-bold text-zinc-500 font-mono">
            <span className={`${importPhase === 'paste' ? 'text-[#3525cd] dark:text-indigo-400' : 'text-zinc-400'} flex items-center gap-1`}>
              <Terminal className="w-3.5 h-3.5" /> 1. Paste Spreadsheet Block
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-300" />
            <span className={`${importPhase === 'map' ? 'text-[#3525cd] dark:text-indigo-400' : 'text-zinc-400'} flex items-center gap-1`}>
              <Grid className="w-3.5 h-3.5" /> 2. Align Column Indexes
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-300" />
            <span className={`${importPhase === 'preview' ? 'text-[#3525cd] dark:text-indigo-400' : 'text-zinc-400'} flex items-center gap-1`}>
              <Check className="w-3.5 h-3.5" /> 3. Verification & Ingest
            </span>
          </div>

          {successCount > 0 && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 font-bold text-xs p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/50 flex flex-col gap-1 shadow-sm">
              <span className="flex items-center gap-1.5 text-sm">
                <UserCheck className="w-5 h-5 text-emerald-600 animate-bounce" /> Bulk Import Ingest Completed Successfully!
              </span>
              <p className="font-normal text-[11px] mt-1 pl-6">
                Ingested <strong className="font-bold">{successCount} customers and due balance logs</strong> into the sandbox ledger, programmatically compiling NCPI client UPI codes.
              </p>
            </div>
          )}

          {errorBanner && (
            <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-800 dark:text-rose-400 font-bold text-xs p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/40 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              <span>{errorBanner}</span>
            </div>
          )}

          {/* PHASE A: Paste Clipboard Clipboard */}
          {importPhase === 'paste' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-bold uppercase tracking-wider">Fast-Start Preset Ingest Samples:</span>
                <span className="text-zinc-400">Click a preset to fill mock clipboard data</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {SAMPLE_CSV_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => loadPreset(idx)}
                    className={`text-[10.5px] font-bold px-3.5 py-2.5 rounded-xl border transition-all cursor-pointer ${
                      selectedPresetIndex === idx 
                        ? 'bg-[#3525cd] text-white border-[#3525cd]' 
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    🚀 {preset.name}
                  </button>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide block">Clipboard Raw Input</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={8}
                  placeholder="Paste CSV block directly from Google Sheets or Excel (Comma-separated values). Or select quick preset loops above..."
                  className="w-full p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl font-mono text-[11px] leading-relaxed select-all"
                />
              </div>

              <button
                type="button"
                onClick={handleAnalyzeCSV}
                className="w-full py-3 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5 h-11"
              >
                Scan Clipboard Columns <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* PHASE B: Align Column Index Droppers */}
          {importPhase === 'map' && (
            <div className="space-y-5">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-150 dark:border-zinc-800/80">
                <h4 className="font-bold text-xs text-zinc-800 dark:text-neutral-200 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" /> Deep Intelligent Mapping
                </h4>
                <p className="text-[11px] text-zinc-500 select-none">
                  Specify which spreadsheet entry corresponds to each field to prevent import format misconfiguration. We read columns from left to right starting at index <strong>0</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-semibold">
                
                {/* 1. Name */}
                <div className="flex flex-col gap-1.5 p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Client Legal Name:</span>
                  <select 
                    value={colIndexName} 
                    onChange={e => setColIndexName(parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-700 p-2 border border-zinc-205 rounded-lg text-[11px] font-bold"
                  >
                    <option value={0}>Column 0 (First)</option>
                    <option value={1}>Column 1</option>
                    <option value={2}>Column 2</option>
                    <option value={3}>Column 3</option>
                  </select>
                </div>

                {/* 2. Email */}
                <div className="flex flex-col gap-1.5 p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Recipient Email/VPA:</span>
                  <select 
                    value={colIndexEmail} 
                    onChange={e => setColIndexEmail(parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-700 p-2 border border-zinc-205 rounded-lg text-[11px] font-bold"
                  >
                    <option value={0}>Column 0</option>
                    <option value={1}>Column 1 (Second)</option>
                    <option value={2}>Column 2</option>
                    <option value={3}>Column 3</option>
                  </select>
                </div>

                {/* 3. Phone */}
                <div className="flex flex-col gap-1.5 p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">WhatsApp Phone:</span>
                  <select 
                    value={colIndexPhone} 
                    onChange={e => setColIndexPhone(parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-700 p-2 border border-zinc-250 rounded-lg text-[11px] font-bold"
                  >
                    <option value={0}>Column 0</option>
                    <option value={1}>Column 1</option>
                    <option value={2}>Column 2 (Third)</option>
                    <option value={3}>Column 3</option>
                    <option value={4}>Column 4</option>
                  </select>
                </div>

                {/* 4. Description */}
                <div className="flex flex-col gap-1.5 p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Invoice Description:</span>
                  <select 
                    value={colIndexDesc} 
                    onChange={e => setColIndexDesc(parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-700 p-2 border border-zinc-250 rounded-lg text-[11px] font-bold"
                  >
                    <option value={0}>Column 0</option>
                    <option value={2}>Column 2</option>
                    <option value={3}>Column 3 (Fourth)</option>
                    <option value={4}>Column 4</option>
                  </select>
                </div>

                {/* 5. Amount */}
                <div className="flex flex-col gap-1.5 p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Owed Amount (₹):</span>
                  <select 
                    value={colIndexAmount} 
                    onChange={e => setColIndexAmount(parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-700 p-2 border border-zinc-250 rounded-lg text-[11px] font-bold"
                  >
                    <option value={2}>Column 2</option>
                    <option value={3}>Column 3</option>
                    <option value={4}>Column 4 (Fifth)</option>
                    <option value={5}>Column 5</option>
                  </select>
                </div>

                {/* 6. Due Date */}
                <div className="flex flex-col gap-1.5 p-3.5 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  <span className="text-zinc-500 block uppercase tracking-wider text-[10px]">Dues Target Date:</span>
                  <select 
                    value={colIndexDate} 
                    onChange={e => setColIndexDate(parseInt(e.target.value))}
                    className="w-full bg-white dark:bg-zinc-700 p-2 border border-zinc-250 rounded-lg text-[11px] font-bold"
                  >
                    <option value={3}>Column 3</option>
                    <option value={4}>Column 4</option>
                    <option value={5}>Column 5 (Sixth)</option>
                    <option value={6}>Column 6</option>
                  </select>
                </div>

              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setImportPhase('paste')}
                  className="px-5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-bold rounded-xl h-11 cursor-pointer transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleMapColumns}
                  className="flex-1 py-3 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-xs rounded-xl shadow-md h-11 cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  Launch Verification Preview <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PHASE C: Validation & Direct Sandbox Preview Ingest */}
          {importPhase === 'preview' && (
            <div className="space-y-5 animate-nudge">
              
              {/* Telemetry dashboard aggregates */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-50 dark:bg-zinc-850 rounded-xl border border-zinc-150 dark:border-zinc-800/80 text-center text-xs">
                <div>
                  <span className="text-zinc-400 block text-[9px] uppercase font-bold text-zinc-500">Total Rows</span>
                  <span className="font-extrabold text-sm text-zinc-900 dark:text-slate-200 font-mono">{parsedRows.length} entries</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[9px] uppercase font-bold text-zinc-500">Import Volume (₹)</span>
                  <span className="font-extrabold text-sm text-[#3525cd] dark:text-indigo-400 font-mono">₹{totalPreviewAmount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[9px] uppercase font-bold text-zinc-500">LEDGER COPPERS</span>
                  <span className="font-extrabold text-sm text-amber-500 font-mono">{totalDuplicateCount} duplicates</span>
                </div>
              </div>

              <div className="border border-zinc-150 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
                <div className="bg-zinc-50 dark:bg-zinc-850 p-2.5 font-bold text-zinc-500 dark:text-zinc-450 uppercase text-[10px] tracking-wider">
                  Validation Preview & Repair Feed
                </div>
                
                <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-56 overflow-y-auto">
                  {parsedRows.map((row) => (
                    <div key={row.id} className="p-3 bg-white dark:bg-zinc-900 flex items-center justify-between gap-4 hover:bg-zinc-50 transition-colors">
                      <div className="space-y-1 max-w-[70%]">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <strong className="text-zinc-900 dark:text-neutral-100 text-xs font-bold">{row.name}</strong>
                          <span className="font-mono text-[10px] text-zinc-400">({row.phone})</span>
                          
                          {row.isDuplicate && (
                            <span className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 text-[8.5px] px-1.5 py-0.2 rounded border border-amber-200 uppercase font-mono font-bold">
                              Overlap Match
                            </span>
                          )}
                          
                          {!row.isValid && (
                            <span className="bg-rose-50 text-rose-700 text-[8.5px] px-1.5 py-0.2 rounded border border-rose-200 uppercase font-mono font-bold">
                              Missing name
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400 italic line-clamp-1">Item: {row.description} | Target: {row.dueDate}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold font-mono block text-sm text-zinc-900 dark:text-slate-100">₹{row.amount.toLocaleString('en-IN')}</span>
                        {row.hasDateFormatError && (
                          <span className="text-[9px] text-rose-500 font-bold block">Autocorrect applied</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setImportPhase('map')}
                  className="px-5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-750 text-zinc-700 dark:text-zinc-250 text-xs font-bold rounded-xl h-11 transition-all cursor-pointer"
                >
                  Map Columns
                </button>
                <button
                  type="button"
                  onClick={handleFinalIngest}
                  className="flex-grow py-3 bg-[#3525cd] hover:bg-[#4f46e5] text-white font-bold text-xs rounded-xl shadow-md h-11 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" /> Final Commit & Ingest {parsedRows.filter(r => r.isValid).length} Rows
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Right Hand Side: Copy-Paste templates guide (Span 4) */}
        <div className="lg:col-span-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-neutral-300 border-b border-zinc-150 dark:border-zinc-800 pb-3">
            <Sheet className="w-5 h-5 text-[#3525cd]" />
            <span>Format Guidance & Specifications</span>
          </div>

          <div className="space-y-4 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            <p>
              To run seamless spreadsheet integrations matching Indian business parameters, adhere to the standard specifications structure.
            </p>

            <div className="bg-zinc-100/50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-200/25 text-[10px] font-mono leading-relaxed space-y-2">
              <div className="flex justify-between items-center text-[9px] font-bold text-zinc-400 tracking-widest uppercase border-b border-zinc-200 dark:border-zinc-800 pb-1.5 mb-1.5">
                <span>Standard Header Map</span>
                <span className="text-[#3525cd]">Order: 0 to 5</span>
              </div>
              <ul className="space-y-1">
                <li><strong className="text-zinc-700 dark:text-zinc-300">Col 0:</strong> Full Name (e.g. Vikram Seth)</li>
                <li><strong className="text-zinc-700 dark:text-zinc-300">Col 1:</strong> Email Address / ID</li>
                <li><strong className="text-zinc-700 dark:text-zinc-300">Col 2:</strong> Phone Number (+91 format)</li>
                <li><strong className="text-zinc-700 dark:text-zinc-300">Col 3:</strong> Fees Reason Detail</li>
                <li><strong className="text-zinc-700 dark:text-zinc-300">Col 4:</strong> Dues Balance Value (₹)</li>
                <li><strong className="text-zinc-700 dark:text-zinc-300">Col 5:</strong> Calendar Due Targets</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={copyTemplateToClipboard}
              className={`w-full py-2.5 border border-dashed font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                templateCopied 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
                  : 'border-[#c3c0ff] bg-indigo-50/20 text-[#3525cd] hover:bg-[#3525cd] hover:text-white dark:text-indigo-400'
              }`}
            >
              {templateCopied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600 animate-bounce" /> Pristine Template Copied!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Copy Clean CSV Template
                </>
              )}
            </button>
            <p className="text-[10px] text-zinc-400 italic">
              Once imported, PayNudge automatically computes risk and sentiment ratings so that you can trace collectability right away.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
