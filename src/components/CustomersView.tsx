import React, { useState } from 'react';
import { Users, Plus, Search, Phone, MapPin, IndianRupee, FileText, ArrowUpRight } from 'lucide-react';
import { Customer, SalesInvoice } from '../types.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

interface CustomersViewProps {
  customers: Customer[];
  invoices: SalesInvoice[];
  onCreateCustomer: (customer: Omit<Customer, 'id' | 'customer_code' | 'created_at'>) => void;
  onReceivePayment: (customer_id: string, amount: number, paymentMode: string, notes: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  invoices,
  onCreateCustomer,
  onReceivePayment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedCustForPayment, setSelectedCustForPayment] = useState<Customer | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Customer, 'id' | 'customer_code' | 'created_at'>>({
    name: '',
    mobile: '',
    email: '',
    address: '',
    gstin: '',
    vehicle_number: '',
    vehicle_model: '',
    customer_type: 'retail',
    credit_limit: 50000,
    outstanding_balance: 0
  });

  // Payment form state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<string>('upi');
  const [paymentNotes, setPaymentNotes] = useState<string>('Outstanding credit payment received');

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.mobile.includes(searchTerm) ||
    c.vehicle_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.gstin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateCustomer(formData);
    setIsModalOpen(false);
  };

  const handleOpenPayment = (cust: Customer) => {
    setSelectedCustForPayment(cust);
    setPaymentAmount(cust.outstanding_balance);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustForPayment && paymentAmount > 0) {
      onReceivePayment(selectedCustForPayment.id, paymentAmount, paymentMode, paymentNotes);
      setIsPaymentModalOpen(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-amber-400" />
            Customer Directory & Ledger
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track retail customers, fleet accounts, outstanding credit receivables, and vehicle history.
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              name: '',
              mobile: '+91 ',
              email: '',
              address: '',
              gstin: '',
              vehicle_number: '',
              vehicle_model: '',
              customer_type: 'retail',
              credit_limit: 50000,
              outstanding_balance: 0
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Customer</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, mobile, vehicle number or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Customers Grid / Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Contact & Vehicle</th>
                <th className="px-4 py-3 text-center">Type</th>
                <th className="px-4 py-3 text-right">Credit Limit</th>
                <th className="px-4 py-3 text-right">Outstanding Due</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-amber-400">{c.customer_code}</td>
                  <td className="px-4 py-3 font-semibold">
                    <div className="text-white text-sm">{c.name}</div>
                    <div className="text-[10px] text-slate-400">{c.address || 'Retail Customer'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-slate-300">
                      <Phone className="w-3 h-3 text-slate-400" /> {c.mobile}
                    </div>
                    {c.vehicle_number && (
                      <div className="text-[10px] text-amber-300 font-mono mt-0.5">
                        🚗 {c.vehicle_number} ({c.vehicle_model})
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono uppercase text-[10px] border border-slate-700">
                      {c.customer_type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-slate-300">{formatCurrency(c.credit_limit)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-rose-400">{formatCurrency(c.outstanding_balance)}</td>
                  <td className="px-4 py-3 text-right">
                    {c.outstanding_balance > 0 && (
                      <button
                        onClick={() => handleOpenPayment(c)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 ml-auto"
                      >
                        <ArrowUpRight className="w-3 h-3" />
                        <span>Receive Payment</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Add Customer Account
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Customer Category</label>
                  <select
                    value={formData.customer_type}
                    onChange={(e) => setFormData({ ...formData, customer_type: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                  >
                    <option value="retail">Retail Customer</option>
                    <option value="wholesale">Wholesale Dealer</option>
                    <option value="fleet">Fleet Owner / Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">GSTIN (Optional)</label>
                  <input
                    type="text"
                    value={formData.gstin}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Vehicle Number</label>
                  <input
                    type="text"
                    placeholder="e.g. DL 01 AB 1234"
                    value={formData.vehicle_number}
                    onChange={(e) => setFormData({ ...formData, vehicle_number: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Credit Limit (₹)</label>
                  <input
                    type="number"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({ ...formData, credit_limit: Number(e.target.value) })}
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
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg shadow"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {isPaymentModalOpen && selectedCustForPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              Receive Customer Credit Payment
            </h3>

            <div className="p-3 bg-slate-800/80 rounded-xl text-xs space-y-1 border border-slate-700">
              <div className="font-bold text-white">{selectedCustForPayment.name} ({selectedCustForPayment.mobile})</div>
              <div className="text-slate-400">Total Outstanding Balance: <span className="text-rose-400 font-bold font-mono">{formatCurrency(selectedCustForPayment.outstanding_balance)}</span></div>
            </div>

            <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Amount Received (₹)</label>
                <input
                  type="number"
                  min={1}
                  max={selectedCustForPayment.outstanding_balance}
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                >
                  <option value="upi">UPI / PhonePe / Paytm</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Remarks / Reference</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg shadow">Confirm Payment Receipt</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
