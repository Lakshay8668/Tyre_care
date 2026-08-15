import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Bell, 
  UserCircle, 
  ShieldCheck, 
  Store, 
  ShoppingCart, 
  Receipt, 
  Users, 
  Truck,
  SlidersHorizontal
} from 'lucide-react';
import { UserRole } from '../types.js';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSearch: (q: string) => void;
  onOpenQuickAction: (action: string) => void;
  lowStockCount: number;
  onNavigateToLowStock: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  onSearch,
  onOpenQuickAction,
  lowStockCount,
  onNavigateToLowStock
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    onSearch(val);
  };

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'admin', label: 'Owner / Admin', desc: 'Full System Access' },
    { role: 'manager', label: 'Store Manager', desc: 'Inventory, Sales & Purchases' },
    { role: 'accountant', label: 'Accountant', desc: 'Invoices, Receivables & Payroll' },
    { role: 'sales', label: 'Sales Executive', desc: 'Billing & Customer CRM' },
    { role: 'storekeeper', label: 'Storekeeper', desc: 'Inward Stock & Movements' }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 p-2 rounded-xl font-bold flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent">
              Apex TyreCare
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 font-medium border border-amber-500/30">
              ERP v2026
            </span>
          </div>
        </div>

        {/* Global Search */}
        <div className="flex-1 max-w-lg hidden md:flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search tyre brand, model or size..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-4 py-1.5 text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Actions & Role Switcher */}
        <div className="flex items-center gap-3">

          {/* Quick Action Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Quick Action</span>
            </button>

            {showQuickMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quick Create
                </div>
                <button
                  onClick={() => { onOpenQuickAction('new_sale'); setShowQuickMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <span>+ New Sale Invoice</span>
                </button>
                <button
                  onClick={() => { onOpenQuickAction('new_purchase'); setShowQuickMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4 text-blue-400" />
                  <span>+ New Purchase Entry</span>
                </button>
                <button
                  onClick={() => { onOpenQuickAction('add_tyre'); setShowQuickMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <Store className="w-4 h-4 text-amber-400" />
                  <span>+ Add Tyre Master</span>
                </button>
                <div className="my-1 border-t border-slate-700" />
                <button
                  onClick={() => { onOpenQuickAction('add_customer'); setShowQuickMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>+ Add Customer</span>
                </button>
                <button
                  onClick={() => { onOpenQuickAction('add_supplier'); setShowQuickMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <Truck className="w-4 h-4 text-teal-400" />
                  <span>+ Add Supplier</span>
                </button>
                <button
                  onClick={() => { onOpenQuickAction('stock_adjustment'); setShowQuickMenu(false); }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-200 hover:bg-slate-700 flex items-center gap-2"
                >
                  <SlidersHorizontal className="w-4 h-4 text-rose-400" />
                  <span>Stock Adjustment</span>
                </button>
              </div>
            )}
          </div>

          {/* Low Stock Notification Bell */}
          <button
            onClick={onNavigateToLowStock}
            className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Low Stock Notifications"
          >
            <Bell className="w-4 h-4" />
            {lowStockCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                {lowStockCount}
              </span>
            )}
          </button>

          {/* Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all text-xs"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span className="capitalize font-semibold text-slate-200 hidden sm:inline">{currentRole}</span>
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
                <div className="px-3 py-1.5 border-b border-slate-700 text-xs font-semibold text-slate-400">
                  Switch Active ERP Security Role
                </div>
                {rolesList.map(r => (
                  <button
                    key={r.role}
                    onClick={() => { onRoleChange(r.role); setShowRoleMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-xs flex items-start gap-2 hover:bg-slate-700 transition-colors ${
                      currentRole === r.role ? 'bg-amber-500/10 text-amber-400 border-l-2 border-amber-400' : 'text-slate-300'
                    }`}
                  >
                    <UserCircle className="w-4 h-4 mt-0.5" />
                    <div>
                      <div className="font-semibold">{r.label}</div>
                      <div className="text-[10px] text-slate-400">{r.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};
