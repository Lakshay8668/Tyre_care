import React, { useState } from 'react';
import { 
  Boxes, 
  IndianRupee, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingCart, 
  PiggyBank, 
  Clock, 
  ArrowUpRight, 
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  Layers,
  Ruler
} from 'lucide-react';
import { DashboardStats, Tyre } from '../types.js';
import { formatCurrency } from '../utils/formatters.js';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';

interface DashboardViewProps {
  stats: DashboardStats | null;
  loading: boolean;
  onRefresh: () => void;
  onRestock: (tyre: Tyre) => void;
  onQuickAction: (action: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  loading,
  onRefresh,
  onRestock,
  onQuickAction
}) => {
  const [chartRange, setChartRange] = useState<'7days' | '30days' | 'month'>('7days');

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <RefreshCw className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-medium">Loading real-time Tyre Shop CRM analytics...</p>
        </div>
      </div>
    );
  }

  const kpis = [
    {
      label: 'Total Tyres in Stock',
      value: stats.total_tyres_in_stock.toLocaleString('en-IN') + ' units',
      icon: <Boxes className="w-5 h-5 text-blue-400" />,
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      textColor: 'text-blue-400'
    },
    {
      label: 'Total Inventory Value',
      value: formatCurrency(stats.total_inventory_value),
      icon: <IndianRupee className="w-5 h-5 text-emerald-400" />,
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      textColor: 'text-emerald-400'
    },
    {
      label: 'Low Stock Tyres',
      value: `${stats.low_stock_count} items`,
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      textColor: 'text-amber-400'
    },
    {
      label: "Today's Stock-Out",
      value: `${stats.today_stock_out_count} items`,
      icon: <Clock className="w-5 h-5 text-rose-400" />,
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      textColor: 'text-rose-400'
    },
    {
      label: "Today's Sales",
      value: formatCurrency(stats.today_sales),
      icon: <TrendingUp className="w-5 h-5 text-purple-400" />,
      bgColor: 'bg-purple-500/10 border-purple-500/20',
      textColor: 'text-purple-400'
    },
    {
      label: "Today's Purchase",
      value: formatCurrency(stats.today_purchase),
      icon: <ShoppingCart className="w-5 h-5 text-cyan-400" />,
      bgColor: 'bg-cyan-500/10 border-cyan-500/20',
      textColor: 'text-cyan-400'
    },
    {
      label: "Today's Gross Profit",
      value: formatCurrency(stats.today_profit),
      icon: <PiggyBank className="w-5 h-5 text-teal-400" />,
      bgColor: 'bg-teal-500/10 border-teal-500/20',
      textColor: 'text-teal-400'
    },
    {
      label: 'Customer Receivables',
      value: formatCurrency(stats.outstanding_receivables),
      icon: <ArrowUpRight className="w-5 h-5 text-amber-500" />,
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      textColor: 'text-amber-500'
    }
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Enterprise Tyre Shop Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time stock movement, GST sales, purchase tracking, and financial analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onRefresh}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          
          <button
            onClick={() => onQuickAction('new_sale')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>+ Create Invoice</span>
          </button>
        </div>
      </div>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className={`p-4 rounded-xl border ${kpi.bgColor} backdrop-blur-sm shadow-sm flex items-start justify-between`}
          >
            <div>
              <div className="text-xs font-medium text-slate-400">{kpi.label}</div>
              <div className={`text-xl font-bold mt-1 ${kpi.textColor}`}>{kpi.value}</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-700/50">
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sales & Profit Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                Sales & Estimated Profit Trend
              </h2>
              <p className="text-[11px] text-slate-400">Daily gross turnover vs net profit calculation</p>
            </div>

            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg text-[10px] font-semibold">
              <button
                onClick={() => setChartRange('7days')}
                className={`px-2.5 py-1 rounded-md transition-colors ${chartRange === '7days' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                7 Days
              </button>
              <button
                onClick={() => setChartRange('30days')}
                className={`px-2.5 py-1 rounded-md transition-colors ${chartRange === '30days' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
              >
                30 Days
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.sales_chart}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(val: any) => formatCurrency(Number(val))}
                />
                <Area type="monotone" dataKey="sales" name="Sales Revenue" stroke="#f59e0b" fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="profit" name="Gross Profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Brand-Wise Stock Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Brand-Wise Tyre Stock
            </h2>
            <p className="text-[11px] text-slate-400">Inventory quantity distribution across brands</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.brand_wise_stock} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                <XAxis type="number" stroke="#94a3b8" fontSize={10} />
                <YAxis dataKey="brand" type="category" stroke="#94a3b8" fontSize={11} width={75} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                  formatter={(val: any, name: any) => [val + ' units', 'Quantity']}
                />
                <Bar dataKey="quantity" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Brand-Wise Table & Size-Wise Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Brand-wise Stock Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span>Brand-Wise Stock Summary</span>
            <span className="text-[11px] text-slate-400 font-normal">Brand Valuation</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="px-3 py-2 rounded-l-lg">Brand</th>
                  <th className="px-3 py-2 text-right">Quantity</th>
                  <th className="px-3 py-2 text-right rounded-r-lg">Inventory Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {stats.brand_wise_stock.map((b, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="px-3 py-2 font-semibold text-slate-100">{b.brand}</td>
                    <td className="px-3 py-2 text-right font-mono text-blue-400">{b.quantity} units</td>
                    <td className="px-3 py-2 text-right font-mono text-emerald-400">{formatCurrency(b.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Size-wise Stock Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Ruler className="w-4 h-4 text-amber-400" />
              Size-Wise Stock Levels
            </span>
            <span className="text-[11px] text-slate-400 font-normal">Popular Tyre Sizes</span>
          </h3>
          <div className="overflow-x-auto max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold sticky top-0">
                <tr>
                  <th className="px-3 py-2">Tyre Size</th>
                  <th className="px-3 py-2 text-right">Quantity</th>
                  <th className="px-3 py-2 text-right">Inventory Value</th>
                  <th className="px-3 py-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {stats.size_wise_stock.map((s, i) => (
                  <tr key={i} className="hover:bg-slate-800/30">
                    <td className="px-3 py-2 font-semibold font-mono text-slate-100">{s.size}</td>
                    <td className="px-3 py-2 text-right font-mono">{s.quantity}</td>
                    <td className="px-3 py-2 text-right font-mono text-slate-300">{formatCurrency(s.value)}</td>
                    <td className="px-3 py-2 text-center">
                      {s.is_low ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          Low Stock
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Low Stock Alerts & Restock Action */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Low Stock Alert Table */}
        <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Low Stock Alerts (Action Required)
            </h2>
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
              {stats.low_stock_items.length} tyres
            </span>
          </div>

          {stats.low_stock_items.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">All tyre inventory levels are sufficient.</p>
          ) : (
            <div className="space-y-2">
              {stats.low_stock_items.map((tyre) => (
                <div key={tyre.id} className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-white">
                      {tyre.brand} {tyre.model} <span className="font-mono text-amber-400">({tyre.size})</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Remaining: <span className="text-rose-400 font-bold">{tyre.current_stock} units</span> (Min: {tyre.min_stock_level})
                    </div>
                  </div>
                  <button
                    onClick={() => onRestock(tyre)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shrink-0 shadow-md"
                  >
                    Restock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Stock-Out List */}
        <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-rose-400 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Today's Stock-Out Tyres
            </h2>
            <span className="text-xs bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
              {stats.today_stock_out_items.length} zero stock
            </span>
          </div>

          {stats.today_stock_out_items.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">No tyres ran completely out of stock today.</p>
          ) : (
            <div className="space-y-2">
              {stats.today_stock_out_items.map((tyre) => (
                <div key={tyre.id} className="p-3 bg-slate-800/80 border border-slate-700/80 rounded-xl flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-slate-200">
                      {tyre.brand} {tyre.model} <span className="font-mono text-rose-400">({tyre.size})</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Category: {tyre.category}
                    </div>
                  </div>
                  <button
                    onClick={() => onRestock(tyre)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors shrink-0"
                  >
                    Re-Order
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
