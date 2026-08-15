import React, { useRef, useState } from 'react';
import { Database, Download, Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../services/api.js';

interface ImportResult {
  total: number;
  created: number;
  skipped: number;
  errors: string[];
}

const EXPORTS: { kind: 'database' | 'inventory' | 'customers' | 'suppliers' | 'sales' | 'invoices' | 'purchases'; label: string; desc: string }[] = [
  { kind: 'database', label: 'Export Full Database', desc: 'Complete JSON backup of everything in the CRM' },
  { kind: 'inventory', label: 'Export Inventory', desc: 'All tyres with stock, pricing and GST' },
  { kind: 'customers', label: 'Export Customers', desc: 'Customer list with contact and balance info' },
  { kind: 'suppliers', label: 'Export Suppliers', desc: 'Supplier list with GSTIN and balances' },
  { kind: 'sales', label: 'Export Sales', desc: 'Sales invoice summary rows' },
  { kind: 'invoices', label: 'Export Invoices', desc: 'Invoice-level detail with line items' },
  { kind: 'purchases', label: 'Export Purchases', desc: 'Purchase bill history from suppliers' }
];

const IMPORTS: { kind: 'tyres' | 'customers' | 'suppliers'; label: string }[] = [
  { kind: 'tyres', label: 'Import Tyres' },
  { kind: 'customers', label: 'Import Customers' },
  { kind: 'suppliers', label: 'Import Suppliers' }
];

export const DataManagementView: React.FC<{ currentUserName: string; onImportComplete: () => void }> = ({ currentUserName, onImportComplete }) => {
  const [exportingKind, setExportingKind] = useState<string | null>(null);
  const [importingKind, setImportingKind] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, ImportResult>>({});
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleExport = async (kind: typeof EXPORTS[number]['kind']) => {
    setExportingKind(kind);
    try {
      await api.downloadExport(kind);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
    } finally {
      setExportingKind(null);
    }
  };

  const handleTemplate = async (kind: typeof IMPORTS[number]['kind']) => {
    try {
      await api.downloadImportTemplate(kind);
    } catch (err: any) {
      alert(`Template download failed: ${err.message}`);
    }
  };

  const handleFileSelected = async (kind: typeof IMPORTS[number]['kind'], file: File | null) => {
    if (!file) return;
    setImportingKind(kind);
    try {
      const result = await api.importFile(kind, file, currentUserName);
      setResults(prev => ({ ...prev, [kind]: result }));
      onImportComplete();
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setImportingKind(null);
      const input = fileInputs.current[kind];
      if (input) input.value = '';
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-amber-400" />
          Data Management
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Export your data for backup or accounting, or bulk-import tyres, customers and suppliers from Excel.
        </p>
      </div>

      {/* Export Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Download className="w-4 h-4 text-amber-400" /> Export
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXPORTS.map(exp => (
            <button
              key={exp.kind}
              onClick={() => handleExport(exp.kind)}
              disabled={exportingKind === exp.kind}
              className="flex items-start gap-3 text-left bg-slate-800/60 hover:bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 transition-colors disabled:opacity-60"
            >
              <div className="mt-0.5">
                {exportingKind === exp.kind ? <Loader2 className="w-4 h-4 text-amber-400 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 text-amber-400" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">{exp.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{exp.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <Upload className="w-4 h-4 text-amber-400" /> Import from Excel
        </h2>

        {IMPORTS.map(imp => {
          const result = results[imp.kind];
          return (
            <div key={imp.kind} className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs font-bold text-white">{imp.label}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTemplate(imp.kind)}
                    className="text-[11px] px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg font-semibold"
                  >
                    Download Template
                  </button>
                  <label className="text-[11px] px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-extrabold cursor-pointer inline-flex items-center gap-1.5">
                    {importingKind === imp.kind ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                    Upload File
                    <input
                      ref={(el) => { fileInputs.current[imp.kind] = el; }}
                      type="file"
                      accept=".xlsx,.xls"
                      className="hidden"
                      onChange={(e) => handleFileSelected(imp.kind, e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>

              {result && (
                <div className="text-[11px] bg-slate-900/60 border border-slate-700 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {result.created} of {result.total} rows imported successfully
                  </div>
                  {result.skipped > 0 && (
                    <div className="flex items-start gap-1.5 text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <div>
                        <div className="font-semibold">{result.skipped} row(s) skipped</div>
                        <ul className="mt-1 space-y-0.5 text-slate-400">
                          {result.errors.slice(0, 5).map((e, i) => <li key={i}>{e}</li>)}
                          {result.errors.length > 5 && <li>...and {result.errors.length - 5} more</li>}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
