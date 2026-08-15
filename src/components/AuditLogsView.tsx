import React, { useState } from 'react';
import { ShieldCheck, Search, Filter, Clock, User, FileText } from 'lucide-react';
import { AuditLog } from '../types.js';
import { formatDate } from '../utils/formatters.js';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (log.previous_value && log.previous_value.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (log.new_value && log.new_value.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesModule = moduleFilter === 'all' || log.module.toLowerCase() === moduleFilter.toLowerCase();
    
    return matchesSearch && matchesModule;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            Security & Audit Activity Logs
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident trail tracking every inventory modification, price update, stock deletion, and invoice entry.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search log by staff name, action, or value..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-slate-200 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-amber-400 shrink-0" />
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
          >
            <option value="all">All Modules</option>
            <option value="Inventory">Inventory & Tyres</option>
            <option value="Sales">Sales Invoices</option>
            <option value="Purchases">Purchases</option>
            <option value="Customers">Customers</option>
            <option value="Suppliers">Suppliers</option>
            <option value="Employees">Staff & Payroll</option>
          </select>
        </div>

      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Module</th>
              <th className="px-4 py-3">Action performed</th>
              <th className="px-4 py-3">Value Audit Trail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {filteredLogs.map(log => (
              <tr key={log.id} className="hover:bg-slate-800/50">
                <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                  {formatDate(log.timestamp)}
                </td>
                <td className="px-4 py-3">
                  <div className="font-bold text-white">{log.user_name}</div>
                  <div className="text-[10px] text-amber-400 uppercase font-mono">{log.user_role}</div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 border border-slate-700 text-slate-300">
                    {log.module}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-200">{log.action}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                  {log.previous_value && <span className="text-rose-400 line-through mr-2">{log.previous_value}</span>}
                  {log.new_value && <span className="text-emerald-400 font-bold">{log.new_value}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
