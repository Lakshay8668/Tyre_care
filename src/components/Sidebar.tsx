import React from 'react';
import { 
  LayoutDashboard, 
  Boxes, 
  BookOpen, 
  ShoppingCart, 
  Receipt, 
  Users, 
  Truck, 
  UserCheck, 
  CalendarCheck, 
  Banknote, 
  BarChart3, 
  Settings as SettingsIcon,
  History,
  ArrowRightLeft,
  ShieldCheck,
  Layers,
  Database
} from 'lucide-react';
import { Permission } from '../types.js';

export type NavTab = 
  | 'dashboard'
  | 'inventory'
  | 'master'
  | 'movements'
  | 'purchases'
  | 'sales'
  | 'customers'
  | 'suppliers'
  | 'employees'
  | 'attendance'
  | 'salary'
  | 'reports'
  | 'settings'
  | 'audit'
  | 'users'
  | 'masterdata'
  | 'data';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  userRole: string;
  permissions: Record<Permission, boolean>;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, userRole, permissions }) => {
  const allMenuItems: { id: NavTab; label: string; icon: React.ReactNode; requires?: Permission }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, requires: 'view_dashboard' },
    { id: 'inventory', label: 'Tyre Inventory', icon: <Boxes className="w-4 h-4" />, requires: 'view_inventory' },
    { id: 'master', label: 'Tyre Master', icon: <BookOpen className="w-4 h-4" />, requires: 'view_inventory' },
    { id: 'masterdata', label: 'Master Data', icon: <Layers className="w-4 h-4" />, requires: 'manage_master_data' },
    { id: 'movements', label: 'Stock Movement', icon: <ArrowRightLeft className="w-4 h-4" />, requires: 'view_inventory' },
    { id: 'purchases', label: 'Purchases', icon: <ShoppingCart className="w-4 h-4" />, requires: 'view_purchases' },
    { id: 'sales', label: 'Sales & Invoices', icon: <Receipt className="w-4 h-4" />, requires: 'create_invoice' },
    { id: 'customers', label: 'Customers', icon: <Users className="w-4 h-4" />, requires: 'view_customers' },
    { id: 'suppliers', label: 'Suppliers', icon: <Truck className="w-4 h-4" />, requires: 'view_suppliers' },
    { id: 'employees', label: 'Employees', icon: <UserCheck className="w-4 h-4" />, requires: 'view_employees' },
    { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="w-4 h-4" />, requires: 'view_employees' },
    { id: 'salary', label: 'Salary / Payroll', icon: <Banknote className="w-4 h-4" />, requires: 'view_employees' },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-4 h-4" />, requires: 'view_reports' },
    { id: 'users', label: 'Users & Roles', icon: <ShieldCheck className="w-4 h-4" />, requires: 'manage_users' },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon className="w-4 h-4" />, requires: 'manage_settings' },
    { id: 'data', label: 'Data Management', icon: <Database className="w-4 h-4" />, requires: 'manage_settings' },
    { id: 'audit', label: 'Audit Log', icon: <History className="w-4 h-4" />, requires: 'view_audit_logs' }
  ];
  const menuItems = allMenuItems.filter(item => !item.requires || permissions[item.requires]);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          Main Navigation
        </div>
        
        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
              }`}
            >
              <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto p-4 border-t border-slate-800">
        <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
            AP
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-slate-200 truncate">Apex Tyre Hub</div>
            <div className="text-[10px] text-emerald-400 font-mono">Live DB Connected</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
