import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Truck, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  RotateCcw,
  Trash2,
  Eye
} from 'lucide-react';
import { Purchase, PurchaseItem, PurchaseReturn, Supplier, Tyre } from '../types.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

interface PurchasesViewProps {
  purchases: Purchase[];
  returns: PurchaseReturn[];
  suppliers: Supplier[];
  tyres: Tyre[];
  onCreatePurchase: (purchase: Omit<Purchase, 'id' | 'purchase_number' | 'created_at'>) => void;
  onCreatePurchaseReturn: (pReturn: Omit<PurchaseReturn, 'id' | 'return_number' | 'created_at'>) => void;
}

export const PurchasesView: React.FC<PurchasesViewProps> = ({
  purchases,
  returns,
  suppliers,
  tyres,
  onCreatePurchase,
  onCreatePurchaseReturn
}) => {
  const [activeTab, setActiveTab] = useState<'purchases' | 'returns'>('purchases');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedPurchaseForReturn, setSelectedPurchaseForReturn] = useState<Purchase | null>(null);

  // New Purchase Form State
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [supplierInvoiceNo, setSupplierInvoiceNo] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'card' | 'bank_transfer' | 'credit'>('bank_transfer');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Cart items for purchase entry
  const [items, setItems] = useState<PurchaseItem[]>([]);
  
  // Quick item entry
  const [selectedTyreId, setSelectedTyreId] = useState(tyres[0]?.id || '');
  const [itemQty, setItemQty] = useState(10);
  const [itemRate, setItemRate] = useState(tyres[0]?.purchase_price || 3000);
  const [itemDiscount, setItemDiscount] = useState(0);

  // Return Form state
  const [returnReason, setReturnReason] = useState('');
  const [returnQtyMap, setReturnQtyMap] = useState<{ [tyreId: string]: number }>({});

  const handleSelectTyreChange = (id: string) => {
    setSelectedTyreId(id);
    const t = tyres.find(x => x.id === id);
    if (t) {
      setItemRate(t.purchase_price);
    }
  };

  const handleAddItem = () => {
    const tyre = tyres.find(t => t.id === selectedTyreId);
    if (!tyre) return;

    const sub = itemQty * itemRate - itemDiscount;
    const gstRate = tyre.gst_rate || 28;
    const taxable = sub / (1 + gstRate / 100);
    const gstAmt = sub - taxable;

    const newItem: PurchaseItem = {
      id: 'pitem-' + Date.now(),
      tyre_id: tyre.id,
      tyre_name: `${tyre.brand} ${tyre.model}`,
      size: tyre.size,
      quantity: itemQty,
      purchase_rate: itemRate,
      discount: itemDiscount,
      gst_rate: gstRate,
      taxable_amount: taxable,
      gst_amount: gstAmt,
      total_amount: sub
    };

    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(i => i.id !== id));
  };

  const calculatePurchaseTotals = () => {
    const subtotal = items.reduce((acc, i) => acc + (i.quantity * i.purchase_rate), 0);
    const totalDiscount = items.reduce((acc, i) => acc + i.discount, 0);
    const grandTotal = items.reduce((acc, i) => acc + i.total_amount, 0);
    const taxable = items.reduce((acc, i) => acc + i.taxable_amount, 0);
    const gstAmount = items.reduce((acc, i) => acc + i.gst_amount, 0);
    const balanceDue = Math.max(0, grandTotal - amountPaid);
    let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    if (amountPaid >= grandTotal) paymentStatus = 'paid';
    else if (amountPaid > 0) paymentStatus = 'partial';

    return { subtotal, discount: totalDiscount, grandTotal, taxable, gstAmount, balanceDue, paymentStatus };
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert('Please add at least one tyre item to the purchase entry.');
      return;
    }

    const sup = suppliers.find(s => s.id === supplierId);
    if (!sup) {
      alert('Please select a valid supplier');
      return;
    }

    const totals = calculatePurchaseTotals();

    onCreatePurchase({
      purchase_date: purchaseDate,
      supplier_id: sup.id,
      supplier_name: sup.name,
      supplier_invoice_number: supplierInvoiceNo || 'N/A',
      items,
      subtotal: totals.subtotal,
      discount: totals.discount,
      taxable_amount: totals.taxable,
      gst_amount: totals.gstAmount,
      grand_total: totals.grandTotal,
      payment_status: totals.paymentStatus,
      payment_mode: paymentMode,
      amount_paid: amountPaid,
      balance_due: totals.balanceDue,
      notes,
      created_by: 'Storekeeper'
    });

    setIsPurchaseModalOpen(false);
    setItems([]);
  };

  const handleOpenReturnModal = (p: Purchase) => {
    setSelectedPurchaseForReturn(p);
    const qMap: { [id: string]: number } = {};
    p.items.forEach(i => { qMap[i.tyre_id] = 0; });
    setReturnQtyMap(qMap);
    setReturnReason('Damaged / Defective Stock Inward');
    setIsReturnModalOpen(true);
  };

  const handleReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPurchaseForReturn) return;

    const returnItems: any[] = [];
    let totalRefund = 0;

    selectedPurchaseForReturn.items.forEach(i => {
      const q = returnQtyMap[i.tyre_id] || 0;
      if (q > 0) {
        const itemTot = q * i.purchase_rate;
        returnItems.push({
          tyre_id: i.tyre_id,
          tyre_name: i.tyre_name,
          quantity: q,
          unit_price: i.purchase_rate,
          total: itemTot
        });
        totalRefund += itemTot;
      }
    });

    if (returnItems.length === 0) {
      alert('Please specify quantity to return for at least one tyre.');
      return;
    }

    onCreatePurchaseReturn({
      purchase_id: selectedPurchaseForReturn.id,
      purchase_number: selectedPurchaseForReturn.purchase_number,
      supplier_id: selectedPurchaseForReturn.supplier_id,
      supplier_name: selectedPurchaseForReturn.supplier_name,
      return_date: new Date().toISOString().split('T')[0],
      reason: returnReason,
      items: returnItems,
      total_refund: totalRefund,
      created_by: 'Storekeeper'
    });

    setIsReturnModalOpen(false);
  };

  const filteredPurchases = purchases.filter(p => 
    p.purchase_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.supplier_invoice_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-cyan-400" />
            Purchase Management & Supplier Inward
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Record batch tyre purchases from suppliers. Stock increases automatically upon creation.
          </p>
        </div>

        <button
          onClick={() => {
            setItems([]);
            setIsPurchaseModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Purchase Entry</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('purchases')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'purchases' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Purchases Inward ({purchases.length})
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'returns' ? 'border-rose-400 text-rose-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Purchase Returns ({returns.length})
        </button>
      </div>

      {/* Search */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search purchase no, supplier or invoice no..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Main Table */}
      {activeTab === 'purchases' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="px-4 py-3">Purchase No</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3">Supplier Inv No</th>
                  <th className="px-4 py-3 text-center">Items Count</th>
                  <th className="px-4 py-3 text-right">Grand Total</th>
                  <th className="px-4 py-3 text-right">Balance Due</th>
                  <th className="px-4 py-3 text-center">Payment Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredPurchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-cyan-400">{p.purchase_number}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{formatDate(p.purchase_date)}</td>
                    <td className="px-4 py-3 font-semibold text-white">{p.supplier_name}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{p.supplier_invoice_number}</td>
                    <td className="px-4 py-3 text-center font-mono">{p.items.length} tyres</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(p.grand_total)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-400">{formatCurrency(p.balance_due)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {p.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenReturnModal(p)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 ml-auto"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Return Stock</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="px-4 py-3">Return No</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Purchase Ref</th>
                  <th className="px-4 py-3">Supplier Name</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 text-right">Refund Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-rose-400">{r.return_number}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{formatDate(r.return_date)}</td>
                    <td className="px-4 py-3 font-mono text-cyan-400">{r.purchase_number}</td>
                    <td className="px-4 py-3 font-semibold text-white">{r.supplier_name}</td>
                    <td className="px-4 py-3 text-slate-300 italic">{r.reason}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(r.total_refund)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Purchase Entry Modal */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                New Inward Purchase Order Entry
              </h2>
              <button onClick={() => setIsPurchaseModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="space-y-6 text-xs">
              
              {/* Supplier & Header details */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                <div>
                  <label className="block text-slate-400 mb-1">Select Supplier</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                  >
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Supplier Invoice No</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MRF/DEL/9921"
                    value={supplierInvoiceNo}
                    onChange={(e) => setSupplierInvoiceNo(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Inward Date</label>
                  <input
                    type="date"
                    required
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                  >
                    <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                    <option value="cash">Cash</option>
                    <option value="upi">UPI</option>
                    <option value="card">Card</option>
                    <option value="credit">Supplier Credit</option>
                  </select>
                </div>
              </div>

              {/* Add Tyre Item to Entry */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
                <h3 className="font-bold text-amber-400 text-[11px]">Add Tyre to Batch Inward</h3>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Tyre Item</label>
                    <select
                      value={selectedTyreId}
                      onChange={(e) => handleSelectTyreChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    >
                      {tyres.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.brand} {t.model} - {t.size}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Inward Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={itemQty}
                      onChange={(e) => setItemQty(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Purchase Rate (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={itemRate}
                      onChange={(e) => setItemRate(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow"
                  >
                    + Add Item
                  </button>
                </div>
              </div>

              {/* Cart Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2">Tyre</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2 text-right">Rate</th>
                      <th className="px-3 py-2 text-right">Taxable</th>
                      <th className="px-3 py-2 text-right">GST</th>
                      <th className="px-3 py-2 text-right">Total</th>
                      <th className="px-3 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-6 text-center text-slate-500 italic">
                          No items added to purchase batch yet.
                        </td>
                      </tr>
                    ) : (
                      items.map(item => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 font-semibold text-white">{item.tyre_name} ({item.size})</td>
                          <td className="px-3 py-2 text-center font-mono font-bold text-amber-400">{item.quantity}</td>
                          <td className="px-3 py-2 text-right font-mono">{formatCurrency(item.purchase_rate)}</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-300">{formatCurrency(item.taxable_amount)}</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-400">{formatCurrency(item.gst_amount)}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-emerald-400">{formatCurrency(item.total_amount)}</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-rose-400 hover:text-rose-300"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Totals & Payment */}
              {items.length > 0 && (
                <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 flex flex-col sm:flex-row justify-between items-end gap-4">
                  <div className="w-full sm:w-1/2 space-y-2">
                    <label className="block text-slate-400">Amount Paid Now (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono font-bold text-sm"
                    />
                  </div>

                  <div className="text-right space-y-1 font-mono">
                    <div className="text-slate-400 text-xs">Grand Total: <span className="text-white text-base font-bold">{formatCurrency(calculatePurchaseTotals().grandTotal)}</span></div>
                    <div className="text-amber-400 text-xs">Balance Payable: <span className="font-bold">{formatCurrency(calculatePurchaseTotals().balanceDue)}</span></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPurchaseModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 text-slate-950 font-extrabold rounded-lg shadow-md"
                >
                  Save Inward & Increase Stock
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Purchase Return Modal */}
      {isReturnModalOpen && selectedPurchaseForReturn && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Purchase Return to Supplier
            </h2>
            <p className="text-xs text-slate-400">
              Return tyres to {selectedPurchaseForReturn.supplier_name} (Purchase Ref: {selectedPurchaseForReturn.purchase_number}). Stock decreases automatically.
            </p>

            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
              <div className="space-y-2 border border-slate-800 rounded-xl p-3 bg-slate-800/40">
                {selectedPurchaseForReturn.items.map(item => (
                  <div key={item.tyre_id} className="flex items-center justify-between gap-3 text-xs">
                    <div>
                      <div className="font-bold text-white">{item.tyre_name} ({item.size})</div>
                      <div className="text-[10px] text-slate-400">Purchased Qty: {item.quantity} units</div>
                    </div>
                    <input
                      type="number"
                      min={0}
                      max={item.quantity}
                      value={returnQtyMap[item.tyre_id] || 0}
                      onChange={(e) => setReturnQtyMap({ ...returnQtyMap, [item.tyre_id]: Number(e.target.value) })}
                      className="w-20 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-center font-mono"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Return Reason</label>
                <input
                  type="text"
                  required
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-rose-500 text-white font-bold rounded-lg shadow-md"
                >
                  Confirm Return & Deduct Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
