import React, { useState } from 'react';
import { ShieldCheck, Plus, KeyRound, UserCog, CheckCircle2, XCircle } from 'lucide-react';
import { User, UserRole, Permission, ROLE_DEFAULT_PERMISSIONS, resolvePermissions } from '../types.js';

interface UsersRolesViewProps {
  users: User[];
  onCreateUser: (user: { name: string; username: string; email: string; role: UserRole; phone?: string }) => void;
  onUpdateUser: (id: string, updates: Partial<Pick<User, 'role' | 'permissions' | 'active'>>) => void;
  onResetLogin: (id: string) => void;
}

const PERMISSION_GROUPS: { label: string; items: { key: Permission; label: string }[] }[] = [
  {
    label: 'Inventory',
    items: [
      { key: 'view_inventory', label: 'View Inventory' },
      { key: 'edit_tyre', label: 'Edit Tyre' },
      { key: 'delete_tyre', label: 'Delete Tyre' },
      { key: 'manage_master_data', label: 'Manage Brands/Models/Sizes/Categories' }
    ]
  },
  {
    label: 'Sales & Customers',
    items: [
      { key: 'view_customers', label: 'View Customers' },
      { key: 'manage_customers', label: 'Manage Customers' },
      { key: 'create_invoice', label: 'Create Invoice' },
      { key: 'delete_invoice', label: 'Delete Invoice' }
    ]
  },
  {
    label: 'Purchases & Suppliers',
    items: [
      { key: 'view_purchases', label: 'View Purchases' },
      { key: 'manage_purchases', label: 'Manage Purchases' },
      { key: 'view_suppliers', label: 'View Suppliers' },
      { key: 'manage_suppliers', label: 'Manage Suppliers' }
    ]
  },
  {
    label: 'Staff & Reports',
    items: [
      { key: 'view_employees', label: 'View Employees' },
      { key: 'manage_employees', label: 'Manage Employees' },
      { key: 'view_reports', label: 'View Reports' },
      { key: 'view_audit_logs', label: 'View Audit Logs' }
    ]
  },
  {
    label: 'Administration',
    items: [
      { key: 'manage_settings', label: 'Manage Settings' },
      { key: 'manage_users', label: 'Manage Users & Roles' }
    ]
  }
];

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Owner / Admin',
  manager: 'Store Manager',
  accountant: 'Accountant',
  sales: 'Sales Executive',
  storekeeper: 'Storekeeper'
};

export const UsersRolesView: React.FC<UsersRolesViewProps> = ({ users, onCreateUser, onUpdateUser, onResetLogin }) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', username: '', email: '', role: 'sales' as UserRole, phone: '' });

  const editingUser = users.find(u => u.id === editingUserId) || null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateUser(form);
    setForm({ name: '', username: '', email: '', role: 'sales', phone: '' });
    setIsAddOpen(false);
  };

  const togglePermission = (user: User, perm: Permission) => {
    const current = resolvePermissions(user);
    const nextValue = !current[perm];
    onUpdateUser(user.id, { permissions: { ...user.permissions, [perm]: nextValue } });
  };

  const resetToRoleDefaults = (user: User) => {
    onUpdateUser(user.id, { permissions: {} });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 text-slate-100">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            Users & Roles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create staff logins, assign a role, and fine-tune individual permissions. Overrides apply on top of the role's defaults.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add User</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Username</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-800/50">
                <td className="px-4 py-3 font-semibold text-white">{u.name}</td>
                <td className="px-4 py-3 font-mono text-slate-400">@{u.username}</td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) => onUpdateUser(u.id, { role: e.target.value as UserRole })}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-200"
                  >
                    {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onUpdateUser(u.id, { active: !u.active })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                      u.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {u.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {u.active ? 'Active' : 'Disabled'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => setEditingUserId(u.id)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1"
                  >
                    <UserCog className="w-3 h-3" /> Permissions
                  </button>
                  <button
                    onClick={() => onResetLogin(u.id)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" /> Reset Login
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-amber-400" /> Create Login for Staff
            </h2>
            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Username</label>
                  <input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono" />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200">
                    {(Object.keys(ROLE_LABELS) as UserRole[]).map(r => (
                      <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Email</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200" />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono" />
              </div>
              <p className="text-[10px] text-slate-500">A temporary login will be issued; the user sets their own password on first sign-in.</p>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsAddOpen(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg shadow">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permissions Editor Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <UserCog className="w-4 h-4 text-amber-400" /> {editingUser.name}'s Permissions
                </h2>
                <p className="text-[10px] text-slate-400 mt-1">
                  Role default: <span className="text-amber-400 font-semibold">{ROLE_LABELS[editingUser.role]}</span>. Toggle individual checkboxes to override.
                </p>
              </div>
              <button onClick={() => resetToRoleDefaults(editingUser)} className="text-[10px] text-slate-400 hover:text-amber-400 underline">
                Reset to role defaults
              </button>
            </div>

            <div className="space-y-4">
              {PERMISSION_GROUPS.map(group => (
                <div key={group.label} className="bg-slate-800/50 border border-slate-700/60 rounded-xl p-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{group.label}</div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.items.map(item => {
                      const resolved = resolvePermissions(editingUser);
                      const isOverridden = editingUser.permissions[item.key] !== undefined;
                      return (
                        <label key={item.key} className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={resolved[item.key]}
                            onChange={() => togglePermission(editingUser, item.key)}
                            className="accent-amber-500"
                          />
                          <span className={isOverridden ? 'text-amber-400 font-semibold' : ''}>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setEditingUserId(null)} className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg shadow">Done</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
