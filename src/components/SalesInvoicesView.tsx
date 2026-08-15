import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  FileText, 
  Printer, 
  XCircle, 
  RotateCcw, 
  AlertCircle, 
  Trash2, 
  UserPlus, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SalesInvoice, SalesReturn, Customer, Tyre, InvoiceItem, BusinessSettings } from '../types.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

interface SalesInvoicesViewProps {
  invoices: SalesInvoice[];
  returns: SalesReturn[];
  customers: Customer[];
  tyres: Tyre[];
  settings: BusinessSettings;
  onCreateInvoice: (invoice: Omit<SalesInvoice, 'id' | 'invoice_number' | 'created_at'>) => void;
  onCancelInvoice: (id: string, reason: string) => void;
  onCreateSalesReturn: (sReturn: Omit<SalesReturn, 'id' | 'return_number' | 'created_at'>) => void;
  onCreateCustomer: (customer: Omit<Customer, 'id' | 'customer_code' | 'created_at'>) => void;
  onViewInvoiceModal: (invoice: SalesInvoice) => void;
}

export const SalesInvoicesView: React.FC<SalesInvoicesViewProps> = ({
  invoices,
  returns,
  customers,
  tyres,
  settings,
  onCreateInvoice,
  onCancelInvoice,
  onCreateSalesReturn,
  onCreateCustomer,
  onViewInvoiceModal
}) => {
  const [activeTab, setActiveTab] = useState<'invoices' | 'returns'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedInvoiceForReturn, setSelectedInvoiceForReturn] = useState<SalesInvoice | null>(null);

  // Quick Customer Modal
  const [isQuickCustOpen, setIsQuickCustOpen] = useState(false);
  const [newCustName, setNewCustName] = useState('');
  const [newCustMobile, setNewCustMobile] = useState('');

  // Invoice Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [isInterstate, setIsInterstate] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'cash' | 'upi' | 'card' | 'bank_transfer' | 'credit'>('upi');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Invoice Items Cart
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);

  // Item Selector State
  const [selectedTyreId, setSelectedTyreId] = useState(tyres[0]?.id || '');
  const [itemQty, setItemQty] = useState(1);
  const [itemPrice, setItemPrice] = useState(tyres[0]?.selling_price || 5000);
  const [itemDiscount, setItemDiscount] = useState(0);
  const [stockErrorMessage, setStockErrorMessage] = useState('');

  // Return state
  const [returnReason, setReturnReason] = useState('Customer Changed Mind');
  const [returnQtyMap, setReturnQtyMap] = useState<{ [tyreId: string]: number }>({});

  const handleTyreSelectChange = (id: string) => {
    setSelectedTyreId(id);
    setStockErrorMessage('');
    const t = tyres.find(x => x.id === id);
    if (t) {
      setItemPrice(t.selling_price);
    }
  };

  const handleAddCartItem = () => {
    setStockErrorMessage('');
    const tyre = tyres.find(t => t.id === selectedTyreId);
    if (!tyre) return;

    // ATOMIC STOCK CHECK RULE
    const existingInCart = cartItems.find(i => i.tyre_id === tyre.id)?.quantity || 0;
    const requestedTotal = existingInCart + itemQty;

    if (requestedTotal > tyre.current_stock && !settings.allow_negative_stock) {
      setStockErrorMessage(`Insufficient stock. Only ${tyre.current_stock} units are currently available for "${tyre.brand} ${tyre.model} (${tyre.size})".`);
      return;
    }

    const sub = itemQty * itemPrice - itemDiscount;
    const gstRate = tyre.gst_rate || 28;
    const taxable = sub / (1 + gstRate / 100);
    const gstAmt = sub - taxable;

    const newItem: InvoiceItem = {
      id: 'sitem-' + Date.now(),
      tyre_id: tyre.id,
      tyre_name: `${tyre.brand} ${tyre.model}`,
      size: tyre.size,
      quantity: itemQty,
      selling_price: itemPrice,
      discount: itemDiscount,
      taxable_amount: taxable,
      gst_rate: gstRate,
      gst_amount: gstAmt,
      total_amount: sub
    };

    setCartItems([...cartItems, newItem]);
    setItemQty(1);
    setItemDiscount(0);
  };

  const handleRemoveCartItem = (id: string) => {
    setCartItems(cartItems.filter(i => i.id !== id));
  };

  const calculateInvoiceTotals = () => {
    const subtotal = cartItems.reduce((acc, i) => acc + (i.quantity * i.selling_price), 0);
    const discount = cartItems.reduce((acc, i) => acc + i.discount, 0);
    const grandTotal = cartItems.reduce((acc, i) => acc + i.total_amount, 0);
    const taxableAmount = cartItems.reduce((acc, i) => acc + i.taxable_amount, 0);
    const totalGst = cartItems.reduce((acc, i) => acc + i.gst_amount, 0);

    let cgst = 0;
    let sgst = 0;
    let igst = 0;

    if (isInterstate) {
      igst = totalGst;
    } else {
      cgst = totalGst / 2;
      sgst = totalGst / 2;
    }

    const balanceDue = Math.max(0, grandTotal - amountPaid);
    let paymentStatus: 'paid' | 'partial' | 'unpaid' = 'unpaid';
    if (amountPaid >= grandTotal) paymentStatus = 'paid';
    else if (amountPaid > 0) paymentStatus = 'partial';

    return { subtotal, discount, grandTotal, taxableAmount, totalGst, cgst, sgst, igst, balanceDue, paymentStatus };
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Please add at least one tyre to the invoice.');
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomerId);
    if (!customer) {
      alert('Please select or create a valid customer.');
      return;
    }

    const totals = calculateInvoiceTotals();

    onCreateInvoice({
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      customer_id: customer.id,
      customer_name: customer.name,
      customer_mobile: customer.mobile,
      customer_address: customer.address,
      customer_gstin: customer.gstin,
      customer_type: customer.customer_type,
      is_interstate: isInterstate,
      items: cartItems,
      subtotal: totals.subtotal,
      discount: totals.discount,
      taxable_amount: totals.taxableAmount,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      total_gst: totals.totalGst,
      grand_total: totals.grandTotal,
      amount_paid: amountPaid,
      balance_due: totals.balanceDue,
      payment_status: totals.paymentStatus,
      payment_mode: paymentMode,
      notes,
      created_by: 'Sales Executive'
    });

    setIsCreateInvoiceOpen(false);
    setCartItems([]);
  };

  const handleQuickCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustName.trim()) {
      onCreateCustomer({
        name: newCustName.trim(),
        mobile: newCustMobile.trim() || '+91 98765 00000',
        email: '',
        address: 'Retail Walk-in',
        gstin: '',
        vehicle_number: '',
        vehicle_model: '',
        customer_type: 'retail',
        credit_limit: 0,
        outstanding_balance: 0
      });
      setIsQuickCustOpen(false);
      setNewCustName('');
      setNewCustMobile('');
    }
  };

  const handleOpenReturnModal = (inv: SalesInvoice) => {
    setSelectedInvoiceForReturn(inv);
    const qMap: { [id: string]: number } = {};
    inv.items.forEach(i => { qMap[i.tyre_id] = 0; });
    setReturnQtyMap(qMap);
    setReturnReason('Customer Tyre Size Exchange / Return');
    setIsReturnModalOpen(true);
  };

  const handleSalesReturnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceForReturn) return;

    const returnItems: any[] = [];
    let totalRefund = 0;

    selectedInvoiceForReturn.items.forEach(i => {
      const q = returnQtyMap[i.tyre_id] || 0;
      if (q > 0) {
        const tot = q * i.selling_price;
        returnItems.push({
          tyre_id: i.tyre_id,
          tyre_name: i.tyre_name,
          quantity: q,
          selling_price: i.selling_price,
          total: tot
        });
        totalRefund += tot;
      }
    });

    if (returnItems.length === 0) {
      alert('Please specify quantity to return for at least one item.');
      return;
    }

    onCreateSalesReturn({
      invoice_id: selectedInvoiceForReturn.id,
      invoice_number: selectedInvoiceForReturn.invoice_number,
      customer_id: selectedInvoiceForReturn.customer_id,
      customer_name: selectedInvoiceForReturn.customer_name,
      return_date: new Date().toISOString().split('T')[0],
      reason: returnReason,
      items: returnItems,
      total_refund: totalRefund,
      created_by: 'Manager'
    });

    setIsReturnModalOpen(false);
  };

  const filteredInvoices = invoices.filter(i =>
    i.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.customer_mobile.includes(searchTerm)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Receipt className="w-6 h-6 text-amber-400" />
            Sales Invoices & Billing
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate GST tax invoices with instant stock deduction, CGST/SGST/IGST breakdown, and printable PDF documents.
          </p>
        </div>

        <button
          onClick={() => {
            setCartItems([]);
            setIsCreateInvoiceOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Sales Invoice</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'invoices' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Sales Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('returns')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'returns' ? 'border-rose-400 text-rose-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Sales Returns ({returns.length})
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number, customer name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Invoices List Table */}
      {activeTab === 'invoices' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="px-4 py-3">Invoice No</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3 text-center">Payment Mode</th>
                  <th className="px-4 py-3 text-right">Grand Total</th>
                  <th className="px-4 py-3 text-right">Paid Amount</th>
                  <th className="px-4 py-3 text-right">Balance Due</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">{inv.invoice_number}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{formatDate(inv.invoice_date)}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-white">{inv.customer_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inv.customer_mobile}</div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono uppercase text-[10px] border border-slate-700">
                        {inv.payment_mode}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(inv.grand_total)}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">{formatCurrency(inv.amount_paid)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-amber-400">{formatCurrency(inv.balance_due)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        inv.payment_status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 
                        (inv.payment_status === 'cancelled' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400')
                      }`}>
                        {inv.payment_status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onViewInvoiceModal(inv)}
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg"
                          title="View & Print GST Invoice"
                        >
                          <Printer className="w-4 h-4" />
                        </button>

                        {inv.payment_status !== 'cancelled' && (
                          <>
                            <button
                              onClick={() => handleOpenReturnModal(inv)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-lg"
                              title="Customer Return"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to CANCEL Invoice ${inv.invoice_number}? Stock will be automatically restored.`)) {
                                  onCancelInvoice(inv.id, 'Cancelled by user');
                                }
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg"
                              title="Cancel Invoice & Restore Stock"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
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
                  <th className="px-4 py-3">Invoice Ref</th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3 text-right">Refund Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {returns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-rose-400">{r.return_number}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{formatDate(r.return_date)}</td>
                    <td className="px-4 py-3 font-mono text-amber-400">{r.invoice_number}</td>
                    <td className="px-4 py-3 font-semibold text-white">{r.customer_name}</td>
                    <td className="px-4 py-3 text-slate-300 italic">{r.reason}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(r.total_refund)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Sales Invoice Modal */}
      {isCreateInvoiceOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Receipt className="w-5 h-5 text-amber-400" />
                Generate New Sales Invoice (GST)
              </h2>
              <button onClick={() => setIsCreateInvoiceOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateInvoiceSubmit} className="space-y-6 text-xs">
              
              {/* Customer Selector & Interstate toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 items-end">
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-400">Select Customer</label>
                    <button
                      type="button"
                      onClick={() => setIsQuickCustOpen(true)}
                      className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                    >
                      <UserPlus className="w-3 h-3" /> + Quick Add Customer
                    </button>
                  </div>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.mobile}) - {c.customer_type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">GST Transaction Type</label>
                  <select
                    value={isInterstate ? 'true' : 'false'}
                    onChange={(e) => setIsInterstate(e.target.value === 'true')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                  >
                    <option value="false">Intra-State (CGST + SGST)</option>
                    <option value="true">Inter-State (IGST)</option>
                  </select>
                </div>
              </div>

              {/* Add Tyre Item Section */}
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-amber-400 text-[11px]">Select Tyre Item & Quantity</h3>
                </div>

                {stockErrorMessage && (
                  <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 rounded-lg flex items-center gap-2 font-semibold">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{stockErrorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Tyre Item</label>
                    <select
                      value={selectedTyreId}
                      onChange={(e) => handleTyreSelectChange(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    >
                      {tyres.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.brand} {t.model} - {t.size} (Stock: {t.current_stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={itemQty}
                      onChange={(e) => {
                        setItemQty(Number(e.target.value));
                        setStockErrorMessage('');
                      }}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Price / Tyre (₹)</label>
                    <input
                      type="number"
                      value={itemPrice}
                      onChange={(e) => setItemPrice(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCartItem}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shadow"
                  >
                    + Add to Invoice
                  </button>
                </div>
              </div>

              {/* Cart Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800 text-slate-400 uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2">Tyre Item</th>
                      <th className="px-3 py-2 text-center">Qty</th>
                      <th className="px-3 py-2 text-right">Selling Price</th>
                      <th className="px-3 py-2 text-right">Taxable</th>
                      <th className="px-3 py-2 text-right">GST ({isInterstate ? 'IGST' : 'CGST+SGST'})</th>
                      <th className="px-3 py-2 text-right">Total</th>
                      <th className="px-3 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {cartItems.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-3 py-6 text-center text-slate-500 italic">
                          No tyre items added to this invoice yet.
                        </td>
                      </tr>
                    ) : (
                      cartItems.map(item => (
                        <tr key={item.id}>
                          <td className="px-3 py-2 font-semibold text-white">{item.tyre_name} ({item.size})</td>
                          <td className="px-3 py-2 text-center font-mono font-bold text-amber-400">{item.quantity}</td>
                          <td className="px-3 py-2 text-right font-mono">{formatCurrency(item.selling_price)}</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-300">{formatCurrency(item.taxable_amount)}</td>
                          <td className="px-3 py-2 text-right font-mono text-slate-400">{formatCurrency(item.gst_amount)}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-emerald-400">{formatCurrency(item.total_amount)}</td>
                          <td className="px-3 py-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveCartItem(item.id)}
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

              {/* Payment details & Totals */}
              {cartItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 items-end">
                  <div>
                    <label className="block text-slate-400 mb-1">Payment Mode</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                    >
                      <option value="upi">UPI / QR Code</option>
                      <option value="cash">Cash</option>
                      <option value="card">Debit / Credit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="credit">Customer Credit (Unpaid)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1">Amount Paid Now (₹)</label>
                    <input
                      type="number"
                      min={0}
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono font-bold"
                    />
                  </div>

                  <div className="text-right space-y-1 font-mono">
                    <div className="text-slate-400 text-xs">Grand Total: <span className="text-white text-base font-bold">{formatCurrency(calculateInvoiceTotals().grandTotal)}</span></div>
                    <div className="text-amber-400 text-xs">Balance Due: <span className="font-bold">{formatCurrency(calculateInvoiceTotals().balanceDue)}</span></div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateInvoiceOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-amber-500 text-slate-950 font-extrabold rounded-lg shadow-md"
                >
                  Generate Invoice & Deduct Stock
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Quick Customer Modal */}
      {isQuickCustOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-amber-400" />
              Quick Add Retail Customer
            </h3>
            <form onSubmit={handleQuickCustomerSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newCustMobile}
                  onChange={(e) => setNewCustMobile(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsQuickCustOpen(false)} className="px-3 py-1 bg-slate-800 text-slate-300 rounded">Cancel</button>
                <button type="submit" className="px-4 py-1 bg-amber-500 text-slate-950 font-bold rounded">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sales Return Modal */}
      {isReturnModalOpen && selectedInvoiceForReturn && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Sales Return & Stock Restoration
            </h2>
            <p className="text-xs text-slate-400">
              Process return for Invoice {selectedInvoiceForReturn.invoice_number} ({selectedInvoiceForReturn.customer_name}). Returned tyres will be added back to inventory automatically.
            </p>

            <form onSubmit={handleSalesReturnSubmit} className="space-y-4 text-xs">
              <div className="space-y-2 border border-slate-800 rounded-xl p-3 bg-slate-800/40">
                {selectedInvoiceForReturn.items.map(item => (
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
                  Process Return & Restore Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
