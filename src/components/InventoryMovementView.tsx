import React, { useState } from 'react';
import { ArrowRightLeft, Search, Filter, Calendar } from 'lucide-react';
import { InventoryMovement } from '../types.js';
import { formatDateTime } from '../utils/formatters.js';

interface InventoryMovementViewProps {
  movements: InventoryMovement[];
}

export const InventoryMovementView: React.FC<InventoryMovementViewProps> = ({ movements }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const typesList = [
    'All',
    'opening_stock',
    'purchase',
    'sale',
    'sales_return',
    'purchase_return',
    'stock_adjustment',
    'damaged',
    'lost',
    'manual_correction'
  ];

  const filtered = movements.filter(m => {
    const matchesSearch = 
      m.ref_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.tyre_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.remarks.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'All' || m.transaction_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <ArrowRightLeft className="w-6 h-6 text-amber-400" />
          Stock Movement Ledger
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete, traceable audit history for every inward purchase, outward invoice, customer return, and stock correction.
        </p>
      </div>

      {/* Search & Filter */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search ref number, tyre, user or remarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">Transaction Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 uppercase"
          >
            {typesList.map(t => (
              <option key={t} value={t}>{t.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Movement Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
              <tr>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Ref Number</th>
                <th className="px-4 py-3">Transaction Type</th>
                <th className="px-4 py-3">Tyre Description</th>
                <th className="px-4 py-3 text-center text-emerald-400">Qty In (+)</th>
                <th className="px-4 py-3 text-center text-rose-400">Qty Out (-)</th>
                <th className="px-4 py-3 text-center">Closing Balance</th>
                <th className="px-4 py-3">Recorded By</th>
                <th className="px-4 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500 italic">
                    No movement records found.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{formatDateTime(m.date)}</td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">{m.ref_number}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        m.qty_in > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {m.transaction_type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      {m.tyre_name}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-emerald-400">
                      {m.qty_in > 0 ? `+${m.qty_in}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-rose-400">
                      {m.qty_out > 0 ? `-${m.qty_out}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-center font-mono font-extrabold text-white text-sm bg-slate-800/40">
                      {m.balance}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-medium">{m.user_name}</td>
                    <td className="px-4 py-3 text-slate-400 italic max-w-xs truncate">{m.remarks}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
