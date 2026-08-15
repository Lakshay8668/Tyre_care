import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, Percent, PieChart, TrendingUp, Calendar, Filter } from 'lucide-react';
import { Tyre, SalesInvoice, Purchase, Customer, Supplier } from '../types.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

interface ReportsViewProps {
  tyres: Tyre[];
  invoices: SalesInvoice[];
  purchases: Purchase[];
  customers: Customer[];
  suppliers: Supplier[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  tyres,
  invoices,
  purchases,
  customers,
  suppliers
}) => {
  const [activeReport, setActiveReport] = useState<'gst' | 'profit_loss' | 'stock_valuation' | 'ledgers'>('gst');
  const [dateRange, setDateRange] = useState({
    startDate: '2024-10-01',
    endDate: '2024-10-31'
  });

  // Calculate GST Summary
  const totalTaxableB2B = invoices.filter(inv => inv.customer_gstin).reduce((acc, i) => acc + i.taxable_amount, 0);
  const totalGstB2B = invoices.filter(inv => inv.customer_gstin).reduce((acc, i) => acc + i.total_gst, 0);
  
  const totalTaxableB2C = invoices.filter(inv => !inv.customer_gstin).reduce((acc, i) => acc + i.taxable_amount, 0);
  const totalGstB2C = invoices.filter(inv => !inv.customer_gstin).reduce((acc, i) => acc + i.total_gst, 0);

  // Profit & Loss Calculation
  const totalSalesRevenue = invoices.reduce((sum, inv) => sum + inv.grand_total, 0);
  const totalPurchaseCost = purchases.reduce((sum, p) => sum + p.grand_total, 0);
  const totalSalesTaxable = invoices.reduce((sum, inv) => sum + inv.taxable_amount, 0);
  
  // Cost of goods sold estimated
  const estimatedCOGS = invoices.reduce((sum, inv) => {
    return sum + inv.items.reduce((itemSum, item) => {
      const tyre = tyres.find(t => t.id === item.tyre_id);
      return itemSum + ((tyre?.purchase_price || item.selling_price * 0.75) * item.quantity);
    }, 0);
  }, 0);

  const grossProfit = totalSalesTaxable - estimatedCOGS;
  const grossProfitMargin = totalSalesTaxable > 0 ? ((grossProfit / totalSalesTaxable) * 100).toFixed(1) : '0.0';

  // Stock Valuation
  const totalStockQty = tyres.reduce((acc, t) => acc + t.current_stock, 0);
  const totalStockAtPurchase = tyres.reduce((acc, t) => acc + (t.current_stock * t.purchase_price), 0);
  const totalStockAtSelling = tyres.reduce((acc, t) => acc + (t.current_stock * t.selling_price), 0);
  const potentialProfitInStock = totalStockAtSelling - totalStockAtPurchase;

  const exportCSV = (filename: string) => {
    alert(`Generating & Downloading ${filename} CSV format for GST Portal upload...`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-amber-400" />
            GST Tax & Financial Analytics Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            GSTR-1, GSTR-3B audit reports, Profit & Loss breakdown, and inventory valuation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="bg-transparent text-slate-200 outline-none font-mono"
            />
            <span className="text-slate-500">to</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="bg-transparent text-slate-200 outline-none font-mono"
            />
          </div>

          <button
            onClick={() => exportCSV(`${activeReport.toUpperCase()}_Report.csv`)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs shadow-md shadow-amber-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-800 gap-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveReport('gst')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeReport === 'gst' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          GST Returns (GSTR-1 / B2B / B2C)
        </button>
        <button
          onClick={() => setActiveReport('profit_loss')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeReport === 'profit_loss' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Profit & Loss Statement
        </button>
        <button
          onClick={() => setActiveReport('stock_valuation')}
          className={`pb-3 transition-colors border-b-2 whitespace-nowrap ${
            activeReport === 'stock_valuation' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Stock Valuation & Ageing
        </button>
      </div>

      {/* Tab Content */}
      {activeReport === 'gst' && (
        <div className="space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">B2B Registered Taxable</div>
              <div className="text-xl font-mono font-bold text-white mt-1">{formatCurrency(totalTaxableB2B)}</div>
              <div className="text-[11px] text-emerald-400 font-mono mt-0.5">GST Collected: {formatCurrency(totalGstB2B)}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">B2C Retail Taxable</div>
              <div className="text-xl font-mono font-bold text-white mt-1">{formatCurrency(totalTaxableB2C)}</div>
              <div className="text-[11px] text-amber-400 font-mono mt-0.5">GST Collected: {formatCurrency(totalGstB2C)}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total GST Output Liability</div>
              <div className="text-xl font-mono font-bold text-amber-400 mt-1">{formatCurrency(totalGstB2B + totalGstB2C)}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">CGST + SGST + IGST Total</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Input Tax Credit (ITC)</div>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-1">
                {formatCurrency(purchases.reduce((acc, p) => acc + p.gst_amount, 0))}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">From Purchase Invoices</div>
            </div>
          </div>

          {/* Detailed Tax Invoice Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-white">GSTR-1 Outward Supplies Breakdown</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
                  <tr>
                    <th className="px-4 py-3">Invoice No</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Customer Name</th>
                    <th className="px-4 py-3">GSTIN</th>
                    <th className="px-4 py-3 text-right">Taxable (₹)</th>
                    <th className="px-4 py-3 text-right">CGST (₹)</th>
                    <th className="px-4 py-3 text-right">SGST (₹)</th>
                    <th className="px-4 py-3 text-right">IGST (₹)</th>
                    <th className="px-4 py-3 text-right">Grand Total (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-mono font-bold text-amber-400">{inv.invoice_number}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{formatDate(inv.invoice_date)}</td>
                      <td className="px-4 py-3 font-semibold text-white">{inv.customer_name}</td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {inv.customer_gstin ? (
                          <span className="text-emerald-400 font-bold">{inv.customer_gstin}</span>
                        ) : (
                          <span className="text-slate-500 italic">Unregistered (B2C)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono">{formatCurrency(inv.taxable_amount)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-400">{formatCurrency(inv.cgst)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-400">{formatCurrency(inv.sgst)}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-400">{formatCurrency(inv.igst)}</td>
                      <td className="px-4 py-3 text-right font-mono font-extrabold text-amber-400">{formatCurrency(inv.grand_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {activeReport === 'profit_loss' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 max-w-3xl mx-auto">
          <div className="border-b border-slate-800 pb-4 text-center">
            <h2 className="text-lg font-extrabold text-white">Statement of Profit & Loss</h2>
            <p className="text-xs text-slate-400">Estimated Tyre Retail Trading Account for the Period</p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 bg-slate-800/50 rounded-xl space-y-2 border border-slate-700">
              <div className="flex justify-between items-center text-slate-300">
                <span>Total Taxable Sales Revenue</span>
                <span className="font-bold text-white">{formatCurrency(totalSalesTaxable)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>(-) Estimated Cost of Goods Sold (COGS)</span>
                <span className="font-bold text-rose-400">-{formatCurrency(estimatedCOGS)}</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between items-center text-sm font-bold text-emerald-400">
                <span>Gross Trading Profit</span>
                <span>{formatCurrency(grossProfit)} ({grossProfitMargin}%)</span>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-xl space-y-2 border border-slate-700">
              <div className="text-slate-400 font-sans font-bold text-xs uppercase">Operating Cash Flows</div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Gross Collections (Sales + GST)</span>
                <span className="text-white">{formatCurrency(totalSalesRevenue)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Stock Purchases Outflow</span>
                <span className="text-slate-400">{formatCurrency(totalPurchaseCost)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'stock_valuation' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Stock Quantity</div>
              <div className="text-xl font-mono font-bold text-white mt-1">{totalStockQty} Pcs</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Stock Valuation (Cost Price)</div>
              <div className="text-xl font-mono font-bold text-emerald-400 mt-1">{formatCurrency(totalStockAtPurchase)}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Stock Valuation (Selling Value)</div>
              <div className="text-xl font-mono font-bold text-amber-400 mt-1">{formatCurrency(totalStockAtSelling)}</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-sm font-bold text-white mb-4">Tyre Model Stock Valuation Breakdown</h2>
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="px-4 py-3">Tyre Brand & Model</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3 text-center">Stock Qty</th>
                  <th className="px-4 py-3 text-right">Unit Purchase Rate</th>
                  <th className="px-4 py-3 text-right">Unit Selling Price</th>
                  <th className="px-4 py-3 text-right">Total Asset Cost (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {tyres.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-semibold text-white">{t.brand} {t.model}</td>
                    <td className="px-4 py-3 font-mono text-amber-400">{t.size}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold">{t.current_stock}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(t.purchase_price)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(t.selling_price)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                      {formatCurrency(t.current_stock * t.purchase_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
