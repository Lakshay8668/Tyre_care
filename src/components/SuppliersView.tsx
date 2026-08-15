import React, { useState } from 'react';
import { Truck, Plus, Search, Phone, MapPin, IndianRupee, ArrowDownLeft } from 'lucide-react';
import { Supplier, Purchase } from '../types.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

interface SuppliersViewProps {
  suppliers: Supplier[];
  purchases: Purchase[];
  onCreateSupplier: (supplier: Omit<Supplier, 'id' | 'created_at'>) => void;
  onPaySupplier: (supplier_id: string, amount: number, paymentMode: string, notes: string) => void;
}

export const SuppliersView: React.FC<SuppliersViewProps> = ({
  suppliers,
  purchases,
  onCreateSupplier,
  onPaySupplier
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedSupForPay, setSelectedSupForPay] = useState<Supplier | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Supplier, 'id' | 'created_at'>>({
    name: '',
    contact_person: '',
    mobile: '',
    email: '',
    address: '',
    gstin: '',
    payment_terms: '15 Days Credit',
    opening_balance: 0,
    outstanding_balance: 0
  });

  // Pay Supplier state
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState<string>('bank_transfer');
  const [payNotes, setPayNotes] = useState<string>('Vendor credit balance payment');

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.mobile.includes(searchTerm) ||
    s.gstin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateSupplier(formData);
    setIsModalOpen(false);
  };

  const handleOpenPayModal = (sup: Supplier) => {
    setSelectedSupForPay(sup);
    setPayAmount(sup.outstanding_balance);
    setIsPayModalOpen(true);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSupForPay && payAmount > 0) {
      onPaySupplier(selectedSupForPay.id, payAmount, payMode, payNotes);
      setIsPayModalOpen(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Truck className="w-6 h-6 text-cyan-400" />
            Supplier Directory & Payables
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage tyre manufacturers, distributors, inward GST invoices, and credit balance payments.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              contact_person: '',
              mobile: '+91 ',
              email: '',
              address: '',
              gstin: '',
              payment_terms: '15 Days Credit',
              opening_balance: 0,
              outstanding_balance: 0
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Supplier</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search supplier name, phone or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Supplier Name</th>
                <th className="px-4 py-3">Contact Person & Phone</th>
                <th className="px-4 py-3">GSTIN</th>
                <th className="px-4 py-3 text-right">Outstanding Payable</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-cyan-400">{s.id.replace('sup-', 'SUP-').toUpperCase()}</td>
                  <td className="px-4 py-3 font-semibold">
                    <div className="text-white text-sm">{s.name}</div>
                    <div className="text-[10px] text-slate-400">{s.address}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-slate-200 font-medium">{s.contact_person || 'Sales Rep'}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                      <Phone className="w-3 h-3 text-slate-500" /> {s.mobile}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300 font-semibold">{s.gstin}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-amber-400">{formatCurrency(s.outstanding_balance)}</td>
                  <td className="px-4 py-3 text-right">
                    {s.outstanding_balance > 0 && (
                      <button
                        onClick={() => handleOpenPayModal(s)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 ml-auto"
                      >
                        <ArrowDownLeft className="w-3 h-3" />
                        <span>Pay Vendor</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Supplier Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-cyan-400" />
              Add Vendor / Manufacturer
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Company / Supplier Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    placeholder="e.g. MRF Tyres Ltd"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Contact Person</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">GSTIN</label>
                  <input
                    type="text"
                    required
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Payment Terms</label>
                  <input
                    type="text"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    placeholder="e.g. 15 Days Credit"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Opening Balance (₹)</label>
                  <input
                    type="number"
                    value={formData.opening_balance}
                    onChange={(e) => setFormData({ ...formData, opening_balance: Number(e.target.value), outstanding_balance: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg shadow">Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pay Vendor Modal */}
      {isPayModalOpen && selectedSupForPay && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4 text-cyan-400" />
              Supplier Credit Payment
            </h3>

            <div className="p-3 bg-slate-800/80 rounded-xl text-xs space-y-1 border border-slate-700">
              <div className="font-bold text-white">{selectedSupForPay.name}</div>
              <div className="text-slate-400">Total Outstanding Credit Payable: <span className="text-amber-400 font-bold font-mono">{formatCurrency(selectedSupForPay.outstanding_balance)}</span></div>
            </div>

            <form onSubmit={handlePaySubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Amount Paid (₹)</label>
                <input
                  type="number"
                  min={1}
                  max={selectedSupForPay.outstanding_balance}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Payment Mode</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="bank_transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="upi">UPI</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Remarks / Note</label>
                <input
                  type="text"
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsPayModalOpen(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-cyan-500 text-slate-950 font-bold rounded-lg shadow">Confirm Payment</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
