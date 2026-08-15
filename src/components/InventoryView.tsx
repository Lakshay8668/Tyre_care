import React, { useState } from 'react';
import { 
  Boxes, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  IndianRupee,
  RefreshCw
} from 'lucide-react';
import { Tyre } from '../types.js';
import { formatCurrency } from '../utils/formatters.js';

interface InventoryViewProps {
  tyres: Tyre[];
  onAdjustStock: (tyre_id: string, qtyChange: number, type: string, remarks: string) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ tyres, onAdjustStock }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('All');
  const [selectedTyreForAdj, setSelectedTyreForAdj] = useState<Tyre | null>(null);
  
  // Adjustment Form State
  const [adjType, setAdjType] = useState<'stock_adjustment' | 'damaged' | 'lost' | 'manual_correction'>('stock_adjustment');
  const [adjQty, setAdjQty] = useState<number>(1);
  const [adjDirection, setAdjDirection] = useState<'add' | 'reduce'>('add');
  const [adjRemarks, setAdjRemarks] = useState('');

  const totalUnits = tyres.reduce((acc, t) => acc + t.current_stock, 0);
  const totalValuation = tyres.reduce((acc, t) => acc + (t.current_stock * t.purchase_price), 0);

  const filteredTyres = tyres.filter(t => {
    const matchesSearch = 
      t.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.size.toLowerCase().includes(searchTerm.toLowerCase());

    let status = 'In Stock';
    if (t.current_stock === 0) status = 'Out of Stock';
    else if (t.current_stock <= t.min_stock_level) status = 'Low Stock';

    const matchesStatus = statusFilter === 'All' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenAdjModal = (tyre: Tyre) => {
    setSelectedTyreForAdj(tyre);
    setAdjQty(1);
    setAdjDirection('add');
    setAdjType('stock_adjustment');
    setAdjRemarks('');
  };

  const handleAdjSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTyreForAdj) {
      const finalQty = adjDirection === 'add' ? adjQty : -adjQty;
      onAdjustStock(selectedTyreForAdj.id, finalQty, adjType, adjRemarks || 'Manual Stock Adjustment');
      setSelectedTyreForAdj(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Tyre Inventory & Valuation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock ledger, inventory valuation formula (Current Stock × Purchase Rate), and stock corrections.
          </p>
        </div>

        {/* Summary Badges */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-right">
            <div className="text-[10px] text-blue-400 font-medium">Total Physical Units</div>
            <div className="text-sm font-bold text-white font-mono">{totalUnits.toLocaleString('en-IN')} tyres</div>
          </div>
          <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-right">
            <div className="text-[10px] text-emerald-400 font-medium">Inventory Valuation</div>
            <div className="text-sm font-bold text-emerald-400 font-mono">{formatCurrency(totalValuation)}</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search brand, size or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">Stock Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
          >
            <option value="All">All Items</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
              <tr>
                <th className="px-4 py-3">Brand & Model</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Purchase Price</th>
                <th className="px-4 py-3 text-right">Selling Price</th>
                <th className="px-4 py-3 text-center">Opening Stock</th>
                <th className="px-4 py-3 text-center">Current Stock</th>
                <th className="px-4 py-3 text-right">Inventory Value</th>
                <th className="px-4 py-3 text-center">Stock Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredTyres.map((t) => {
                const invValue = t.current_stock * t.purchase_price;
                let statusBadge = (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    In Stock
                  </span>
                );
                if (t.current_stock === 0) {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      Out of Stock
                    </span>
                  );
                } else if (t.current_stock <= t.min_stock_level) {
                  statusBadge = (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                      Low Stock
                    </span>
                  );
                }

                return (
                  <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-100">{t.brand} {t.model}</td>
                    <td className="px-4 py-3 font-mono text-slate-200 font-bold">{t.size}</td>
                    <td className="px-4 py-3 text-slate-400">{t.category}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">{formatCurrency(t.purchase_price)}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-400 font-semibold">{formatCurrency(t.selling_price)}</td>
                    <td className="px-4 py-3 text-center font-mono text-slate-400">{t.opening_stock}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-sm text-white">{t.current_stock}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(invValue)}</td>
                    <td className="px-4 py-3 text-center">{statusBadge}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenAdjModal(t)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 ml-auto"
                      >
                        <SlidersHorizontal className="w-3 h-3" />
                        <span>Adjust</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {selectedTyreForAdj && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              Stock Adjustment / Correction
            </h2>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs space-y-1">
              <div className="font-bold text-amber-400">{selectedTyreForAdj.brand} {selectedTyreForAdj.model} ({selectedTyreForAdj.size})</div>
              <div className="text-slate-400">Current Stock: <span className="text-white font-bold">{selectedTyreForAdj.current_stock} units</span></div>
            </div>

            <form onSubmit={handleAdjSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Direction</label>
                  <select
                    value={adjDirection}
                    onChange={(e) => setAdjDirection(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  >
                    <option value="add">+ Add Stock (Inward)</option>
                    <option value="reduce">- Reduce Stock (Outward)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={adjQty}
                    onChange={(e) => setAdjQty(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Reason / Transaction Type</label>
                <select
                  value={adjType}
                  onChange={(e) => setAdjType(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="stock_adjustment">Stock Adjustment</option>
                  <option value="damaged">Damaged Stock</option>
                  <option value="lost">Lost / Missing</option>
                  <option value="manual_correction">Manual Correction</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Remarks / Note</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physical audit count correction"
                  value={adjRemarks}
                  onChange={(e) => setAdjRemarks(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTyreForAdj(null)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg shadow-md"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
