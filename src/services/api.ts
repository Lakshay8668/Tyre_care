import {
  Tyre,
  InventoryMovement,
  Supplier,
  Purchase,
  PurchaseReturn,
  Customer,
  SalesInvoice,
  SalesReturn,
  Payment,
  Employee,
  AttendanceRecord,
  SalarySlip,
  AuditLog,
  BusinessSettings,
  DashboardStats,
  User,
  Permission,
  MasterListItem,
  TyreModel
} from '../types.js';

const API_BASE = '/api';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Network error occurred' }));
    throw new Error(err.error || `Error ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: async (email: string, role: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role })
    });
    return handleResponse<{ user: any; token: string }>(res);
  },

  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    return handleResponse<DashboardStats>(res);
  },

  // Tyres
  getTyres: async (): Promise<Tyre[]> => {
    const res = await fetch(`${API_BASE}/tyres`);
    return handleResponse<Tyre[]>(res);
  },

  // ---- Master Data: Brands / Categories / Sizes / Models ----
  getBrands: async (): Promise<MasterListItem[]> => {
    const res = await fetch(`${API_BASE}/master/brands`);
    return handleResponse<MasterListItem[]>(res);
  },
  createBrand: async (name: string, user_name?: string): Promise<MasterListItem> => {
    const res = await fetch(`${API_BASE}/master/brands`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, user_name }) });
    return handleResponse<MasterListItem>(res);
  },
  updateBrand: async (id: string, updates: Partial<Pick<MasterListItem, 'name' | 'active'>>, user_name?: string): Promise<MasterListItem> => {
    const res = await fetch(`${API_BASE}/master/brands/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...updates, user_name }) });
    return handleResponse<MasterListItem>(res);
  },
  deleteBrand: async (id: string, user_name?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/master/brands/${id}?user_name=${encodeURIComponent(user_name || '')}`, { method: 'DELETE' });
    await handleResponse<{ success: boolean }>(res);
  },

  getCategories: async (): Promise<MasterListItem[]> => {
    const res = await fetch(`${API_BASE}/master/categories`);
    return handleResponse<MasterListItem[]>(res);
  },
  createCategory: async (name: string, user_name?: string): Promise<MasterListItem> => {
    const res = await fetch(`${API_BASE}/master/categories`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, user_name }) });
    return handleResponse<MasterListItem>(res);
  },
  updateCategory: async (id: string, updates: Partial<Pick<MasterListItem, 'name' | 'active'>>, user_name?: string): Promise<MasterListItem> => {
    const res = await fetch(`${API_BASE}/master/categories/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...updates, user_name }) });
    return handleResponse<MasterListItem>(res);
  },
  deleteCategory: async (id: string, user_name?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/master/categories/${id}?user_name=${encodeURIComponent(user_name || '')}`, { method: 'DELETE' });
    await handleResponse<{ success: boolean }>(res);
  },

  getSizes: async (): Promise<MasterListItem[]> => {
    const res = await fetch(`${API_BASE}/master/sizes`);
    return handleResponse<MasterListItem[]>(res);
  },
  createSize: async (name: string, user_name?: string): Promise<MasterListItem> => {
    const res = await fetch(`${API_BASE}/master/sizes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, user_name }) });
    return handleResponse<MasterListItem>(res);
  },
  updateSize: async (id: string, updates: Partial<Pick<MasterListItem, 'name' | 'active'>>, user_name?: string): Promise<MasterListItem> => {
    const res = await fetch(`${API_BASE}/master/sizes/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...updates, user_name }) });
    return handleResponse<MasterListItem>(res);
  },
  deleteSize: async (id: string, user_name?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/master/sizes/${id}?user_name=${encodeURIComponent(user_name || '')}`, { method: 'DELETE' });
    await handleResponse<{ success: boolean }>(res);
  },

  getModels: async (): Promise<TyreModel[]> => {
    const res = await fetch(`${API_BASE}/master/models`);
    return handleResponse<TyreModel[]>(res);
  },
  createModel: async (brand: string, name: string, user_name?: string): Promise<TyreModel> => {
    const res = await fetch(`${API_BASE}/master/models`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brand, name, user_name }) });
    return handleResponse<TyreModel>(res);
  },
  updateModel: async (id: string, updates: Partial<Pick<TyreModel, 'name' | 'active' | 'brand'>>, user_name?: string): Promise<TyreModel> => {
    const res = await fetch(`${API_BASE}/master/models/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...updates, user_name }) });
    return handleResponse<TyreModel>(res);
  },
  deleteModel: async (id: string, user_name?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/master/models/${id}?user_name=${encodeURIComponent(user_name || '')}`, { method: 'DELETE' });
    await handleResponse<{ success: boolean }>(res);
  },

  searchTyres: async (q: string): Promise<Tyre[]> => {
    const res = await fetch(`${API_BASE}/tyres/search?q=${encodeURIComponent(q)}`);
    return handleResponse<Tyre[]>(res);
  },

  createTyre: async (tyre: Omit<Tyre, 'id' | 'created_at' | 'updated_at'>, user_name?: string): Promise<Tyre> => {
    const res = await fetch(`${API_BASE}/tyres`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...tyre, user_name })
    });
    return handleResponse<Tyre>(res);
  },

  updateTyre: async (id: string, updates: Partial<Tyre>, user_name?: string): Promise<Tyre> => {
    const res = await fetch(`${API_BASE}/tyres/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, user_name })
    });
    return handleResponse<Tyre>(res);
  },

  // Inventory & Adjustment
  getInventoryMovements: async (): Promise<InventoryMovement[]> => {
    const res = await fetch(`${API_BASE}/inventory/movements`);
    return handleResponse<InventoryMovement[]>(res);
  },

  adjustStock: async (tyre_id: string, qtyChange: number, type: string, remarks: string, user_name?: string): Promise<Tyre> => {
    const res = await fetch(`${API_BASE}/inventory/adjust`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tyre_id, qtyChange, type, remarks, user_name })
    });
    return handleResponse<Tyre>(res);
  },

  // Purchases
  getPurchases: async (): Promise<Purchase[]> => {
    const res = await fetch(`${API_BASE}/purchases`);
    return handleResponse<Purchase[]>(res);
  },

  getPurchaseReturns: async (): Promise<PurchaseReturn[]> => {
    const res = await fetch(`${API_BASE}/purchases/returns`);
    return handleResponse<PurchaseReturn[]>(res);
  },

  createPurchase: async (purchase: Omit<Purchase, 'id' | 'purchase_number' | 'created_at'>, user_name?: string): Promise<Purchase> => {
    const res = await fetch(`${API_BASE}/purchases`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...purchase, user_name })
    });
    return handleResponse<Purchase>(res);
  },

  createPurchaseReturn: async (pReturn: Omit<PurchaseReturn, 'id' | 'return_number' | 'created_at'>, user_name?: string): Promise<PurchaseReturn> => {
    const res = await fetch(`${API_BASE}/purchases/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...pReturn, user_name })
    });
    return handleResponse<PurchaseReturn>(res);
  },

  // Invoices & Sales
  getInvoices: async (): Promise<SalesInvoice[]> => {
    const res = await fetch(`${API_BASE}/invoices`);
    return handleResponse<SalesInvoice[]>(res);
  },

  getSalesReturns: async (): Promise<SalesReturn[]> => {
    const res = await fetch(`${API_BASE}/invoices/returns`);
    return handleResponse<SalesReturn[]>(res);
  },

  getInvoiceById: async (id: string): Promise<SalesInvoice> => {
    const res = await fetch(`${API_BASE}/invoices/${id}`);
    return handleResponse<SalesInvoice>(res);
  },

  createInvoice: async (invoice: Omit<SalesInvoice, 'id' | 'invoice_number' | 'created_at'>, user_name?: string): Promise<SalesInvoice> => {
    const res = await fetch(`${API_BASE}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...invoice, user_name })
    });
    return handleResponse<SalesInvoice>(res);
  },

  cancelInvoice: async (id: string, reason: string, user_name?: string): Promise<SalesInvoice> => {
    const res = await fetch(`${API_BASE}/invoices/${id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason, user_name })
    });
    return handleResponse<SalesInvoice>(res);
  },

  createSalesReturn: async (sReturn: Omit<SalesReturn, 'id' | 'return_number' | 'created_at'>, user_name?: string): Promise<SalesReturn> => {
    const res = await fetch(`${API_BASE}/invoices/returns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...sReturn, user_name })
    });
    return handleResponse<SalesReturn>(res);
  },

  // Customers
  getCustomers: async (): Promise<Customer[]> => {
    const res = await fetch(`${API_BASE}/customers`);
    return handleResponse<Customer[]>(res);
  },

  createCustomer: async (customer: Omit<Customer, 'id' | 'customer_code' | 'created_at'>, user_name?: string): Promise<Customer> => {
    const res = await fetch(`${API_BASE}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...customer, user_name })
    });
    return handleResponse<Customer>(res);
  },

  getCustomerHistory: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/customers/${id}/history`);
    return handleResponse<any>(res);
  },

  // Suppliers
  getSuppliers: async (): Promise<Supplier[]> => {
    const res = await fetch(`${API_BASE}/suppliers`);
    return handleResponse<Supplier[]>(res);
  },

  createSupplier: async (supplier: Omit<Supplier, 'id' | 'created_at'>, user_name?: string): Promise<Supplier> => {
    const res = await fetch(`${API_BASE}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...supplier, user_name })
    });
    return handleResponse<Supplier>(res);
  },

  getSupplierHistory: async (id: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/suppliers/${id}/history`);
    return handleResponse<any>(res);
  },

  // Payments
  getPayments: async (): Promise<Payment[]> => {
    const res = await fetch(`${API_BASE}/payments`);
    return handleResponse<Payment[]>(res);
  },

  createPayment: async (payment: Omit<Payment, 'id' | 'payment_number'>, user_name?: string): Promise<Payment> => {
    const res = await fetch(`${API_BASE}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payment, user_name })
    });
    return handleResponse<Payment>(res);
  },

  // Employees, Attendance & Payroll
  getEmployees: async (): Promise<Employee[]> => {
    const res = await fetch(`${API_BASE}/employees`);
    return handleResponse<Employee[]>(res);
  },

  createEmployee: async (emp: Omit<Employee, 'id' | 'employee_code'>, user_name?: string): Promise<Employee> => {
    const res = await fetch(`${API_BASE}/employees`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...emp, user_name })
    });
    return handleResponse<Employee>(res);
  },

  getAttendance: async (): Promise<AttendanceRecord[]> => {
    const res = await fetch(`${API_BASE}/attendance`);
    return handleResponse<AttendanceRecord[]>(res);
  },

  recordAttendance: async (records: AttendanceRecord[], user_name?: string): Promise<AttendanceRecord[]> => {
    const res = await fetch(`${API_BASE}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ records, user_name })
    });
    return handleResponse<AttendanceRecord[]>(res);
  },

  getSalaries: async (): Promise<SalarySlip[]> => {
    const res = await fetch(`${API_BASE}/salaries`);
    return handleResponse<SalarySlip[]>(res);
  },

  generateSalarySlip: async (data: any): Promise<SalarySlip> => {
    const res = await fetch(`${API_BASE}/salaries/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse<SalarySlip>(res);
  },

  // Users & Roles
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_BASE}/users`);
    return handleResponse<User[]>(res);
  },

  createUser: async (user: { name: string; username: string; email: string; role: string; phone?: string; permissions?: Partial<Record<Permission, boolean>> }, user_name?: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...user, user_name })
    });
    return handleResponse<User>(res);
  },

  updateUser: async (id: string, updates: Partial<Pick<User, 'role' | 'permissions' | 'active' | 'name' | 'email' | 'phone'>>, user_name?: string): Promise<User> => {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...updates, user_name })
    });
    return handleResponse<User>(res);
  },

  resetUserLogin: async (id: string, user_name?: string): Promise<{ message: string }> => {
    const res = await fetch(`${API_BASE}/users/${id}/reset-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_name })
    });
    return handleResponse<{ message: string }>(res);
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await fetch(`${API_BASE}/audit-logs`);
    return handleResponse<AuditLog[]>(res);
  },

  // Settings
  getSettings: async (): Promise<BusinessSettings> => {
    const res = await fetch(`${API_BASE}/settings`);
    return handleResponse<BusinessSettings>(res);
  },

  updateSettings: async (settings: BusinessSettings, user_name?: string): Promise<BusinessSettings> => {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...settings, user_name })
    });
    return handleResponse<BusinessSettings>(res);
  },

  // ---- Data Management: Export / Import ----
  downloadExport: async (kind: 'database' | 'inventory' | 'customers' | 'suppliers' | 'sales' | 'invoices' | 'purchases'): Promise<void> => {
    const res = await fetch(`${API_BASE}/export/${kind}`);
    if (!res.ok) throw new Error(`Export failed (${res.status})`);
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition') || '';
    const match = disposition.match(/filename="(.+)"/);
    const filename = match ? match[1] : `${kind}-export`;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  downloadImportTemplate: async (kind: 'tyres' | 'customers' | 'suppliers'): Promise<void> => {
    const res = await fetch(`${API_BASE}/import/template/${kind}`);
    if (!res.ok) throw new Error(`Template download failed (${res.status})`);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${kind}-import-template.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  importFile: async (kind: 'tyres' | 'customers' | 'suppliers', file: File, user_name?: string): Promise<{ total: number; created: number; skipped: number; errors: string[] }> => {
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = () => reject(new Error('Could not read file'));
      reader.readAsDataURL(file);
    });
    const res = await fetch(`${API_BASE}/import/${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_base64: base64, user_name })
    });
    return handleResponse<{ total: number; created: number; skipped: number; errors: string[] }>(res);
  }
};
