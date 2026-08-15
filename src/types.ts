export type UserRole = 'admin' | 'manager' | 'accountant' | 'sales' | 'storekeeper';

export type Permission =
  | 'view_dashboard'
  | 'view_inventory'
  | 'edit_tyre'
  | 'delete_tyre'
  | 'manage_master_data'
  | 'view_customers'
  | 'manage_customers'
  | 'create_invoice'
  | 'delete_invoice'
  | 'view_purchases'
  | 'manage_purchases'
  | 'view_suppliers'
  | 'manage_suppliers'
  | 'view_employees'
  | 'manage_employees'
  | 'view_reports'
  | 'view_audit_logs'
  | 'manage_settings'
  | 'manage_users';

// A named, admin-managed master-data entry (Brand, Category, or Size).
// Nothing that powers a dropdown elsewhere in the app should be hardcoded --
// it should come from one of these lists instead.
export interface MasterListItem {
  id: string;
  name: string;
  active: boolean;
}

// A Tyre Model belongs to exactly one Brand (Admin -> Tyre Models).
export interface TyreModel {
  id: string;
  brand: string;
  name: string;
  active: boolean;
}

// Default permission set granted to each role. Individual users can override
// any of these via `permissions` on the User record (admin-configurable from
// Admin -> Users & Roles).
export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, Record<Permission, boolean>> = {
  admin: {
    view_dashboard: true, view_inventory: true, edit_tyre: true, delete_tyre: true, manage_master_data: true,
    view_customers: true, manage_customers: true, create_invoice: true, delete_invoice: true,
    view_purchases: true, manage_purchases: true, view_suppliers: true, manage_suppliers: true,
    view_employees: true, manage_employees: true, view_reports: true, view_audit_logs: true,
    manage_settings: true, manage_users: true
  },
  manager: {
    view_dashboard: true, view_inventory: true, edit_tyre: true, delete_tyre: false, manage_master_data: true,
    view_customers: true, manage_customers: true, create_invoice: true, delete_invoice: false,
    view_purchases: true, manage_purchases: true, view_suppliers: true, manage_suppliers: true,
    view_employees: true, manage_employees: false, view_reports: true, view_audit_logs: false,
    manage_settings: false, manage_users: false
  },
  accountant: {
    view_dashboard: true, view_inventory: true, edit_tyre: false, delete_tyre: false, manage_master_data: false,
    view_customers: true, manage_customers: true, create_invoice: true, delete_invoice: false,
    view_purchases: true, manage_purchases: false, view_suppliers: true, manage_suppliers: false,
    view_employees: true, manage_employees: false, view_reports: true, view_audit_logs: false,
    manage_settings: false, manage_users: false
  },
  sales: {
    view_dashboard: true, view_inventory: true, edit_tyre: false, delete_tyre: false, manage_master_data: false,
    view_customers: true, manage_customers: true, create_invoice: true, delete_invoice: false,
    view_purchases: false, manage_purchases: false, view_suppliers: false, manage_suppliers: false,
    view_employees: false, manage_employees: false, view_reports: false, view_audit_logs: false,
    manage_settings: false, manage_users: false
  },
  storekeeper: {
    view_dashboard: true, view_inventory: true, edit_tyre: true, delete_tyre: false, manage_master_data: false,
    view_customers: false, manage_customers: false, create_invoice: false, delete_invoice: false,
    view_purchases: true, manage_purchases: true, view_suppliers: true, manage_suppliers: false,
    view_employees: false, manage_employees: false, view_reports: false, view_audit_logs: false,
    manage_settings: false, manage_users: false
  }
};

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  active: boolean;
  // Overrides on top of the role's default permissions. Only keys present
  // here override the role default; everything else falls back to
  // ROLE_DEFAULT_PERMISSIONS[role].
  permissions: Partial<Record<Permission, boolean>>;
}

export function resolvePermissions(user: Pick<User, 'role' | 'permissions'>): Record<Permission, boolean> {
  return { ...ROLE_DEFAULT_PERMISSIONS[user.role], ...user.permissions };
}

export function hasPermission(user: Pick<User, 'role' | 'permissions'>, perm: Permission): boolean {
  return resolvePermissions(user)[perm] === true;
}

export type TyreCategory = 
  | 'Car Tyre'
  | 'SUV Tyre'
  | 'Commercial Tyre'
  | 'Truck Tyre'
  | 'Bike Tyre'
  | 'Scooter Tyre'
  | 'Agricultural Tyre'
  | 'Other';

export interface Tyre {
  id: string;
  brand: string;
  model: string;
  size: string; // e.g. "175/65 R15"
  category: string;
  vehicle_type: string; // e.g. "Passenger Car", "Light Truck", "Heavy Duty"
  season: 'All-Season' | 'Summer' | 'Winter' | 'All-Terrain';
  pattern: string;
  speed_rating: string; // e.g. "H (210 km/h)"
  load_index: string; // e.g. "84"
  purchase_price: number;
  selling_price: number;
  min_selling_price: number;
  gst_rate: number; // e.g. 28 or 18
  opening_stock: number;
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type InventoryTransactionType = 
  | 'opening_stock'
  | 'purchase'
  | 'sale'
  | 'sales_return'
  | 'purchase_return'
  | 'stock_adjustment'
  | 'damaged'
  | 'lost'
  | 'manual_correction';

export interface InventoryMovement {
  id: string;
  date: string;
  ref_number: string;
  transaction_type: InventoryTransactionType;
  tyre_id: string;
  tyre_name: string; // Brand Model Size
  qty_in: number;
  qty_out: number;
  balance: number;
  user_id: string;
  user_name: string;
  remarks: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person: string;
  mobile: string;
  email: string;
  address: string;
  gstin: string;
  payment_terms: string;
  opening_balance: number;
  outstanding_balance: number;
  created_at: string;
}

export interface PurchaseItem {
  id: string;
  tyre_id: string;
  tyre_name: string;
  size: string;
  quantity: number;
  purchase_rate: number;
  discount: number;
  gst_rate: number;
  taxable_amount: number;
  gst_amount: number;
  total_amount: number;
}

export interface Purchase {
  id: string;
  purchase_number: string;
  purchase_date: string;
  supplier_id: string;
  supplier_name: string;
  supplier_invoice_number: string;
  items: PurchaseItem[];
  subtotal: number;
  discount: number;
  taxable_amount: number;
  gst_amount: number;
  grand_total: number;
  payment_status: 'paid' | 'partial' | 'unpaid';
  payment_mode: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'credit';
  amount_paid: number;
  balance_due: number;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface PurchaseReturnItem {
  tyre_id: string;
  tyre_name: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface PurchaseReturn {
  id: string;
  return_number: string;
  purchase_id: string;
  purchase_number: string;
  supplier_id: string;
  supplier_name: string;
  return_date: string;
  reason: string;
  items: PurchaseReturnItem[];
  total_refund: number;
  created_by: string;
  created_at: string;
}

export type CustomerType = 'retail' | 'dealer' | 'fleet' | 'corporate';

export interface Customer {
  id: string;
  customer_code: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  gstin: string;
  vehicle_number: string;
  vehicle_model: string;
  customer_type: CustomerType;
  credit_limit: number;
  outstanding_balance: number;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  tyre_id: string;
  tyre_name: string;
  size: string;
  quantity: number;
  selling_price: number;
  discount: number;
  taxable_amount: number;
  gst_rate: number;
  gst_amount: number;
  total_amount: number;
}

export interface SalesInvoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  customer_id: string;
  customer_name: string;
  customer_mobile: string;
  customer_address: string;
  customer_gstin: string;
  customer_type: CustomerType;
  is_interstate: boolean; // if true, IGST is used, else CGST + SGST
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  taxable_amount: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_gst: number;
  grand_total: number;
  amount_paid: number;
  balance_due: number;
  payment_status: 'paid' | 'partial' | 'unpaid' | 'cancelled';
  payment_mode: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'credit';
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface SalesReturnItem {
  tyre_id: string;
  tyre_name: string;
  quantity: number;
  selling_price: number;
  total: number;
}

export interface SalesReturn {
  id: string;
  return_number: string;
  invoice_id: string;
  invoice_number: string;
  customer_id: string;
  customer_name: string;
  return_date: string;
  reason: string;
  items: SalesReturnItem[];
  total_refund: number;
  created_by: string;
  created_at: string;
}

export interface Payment {
  id: string;
  payment_number: string;
  type: 'customer_payment' | 'supplier_payment';
  party_id: string;
  party_name: string;
  reference_number?: string; // invoice or purchase number
  amount: number;
  payment_mode: 'cash' | 'upi' | 'card' | 'bank_transfer' | 'cheque';
  payment_date: string;
  notes?: string;
  created_by: string;
}

export type EmployeeDesignation = 
  | 'owner'
  | 'manager'
  | 'sales_executive'
  | 'accountant'
  | 'storekeeper'
  | 'technician'
  | 'helper';

export interface Employee {
  id: string;
  employee_code: string;
  name: string;
  mobile: string;
  email: string;
  address: string;
  joining_date: string;
  designation: EmployeeDesignation;
  salary: number;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  status: 'active' | 'inactive';
}

export type AttendanceStatus = 'present' | 'absent' | 'half_day' | 'leave' | 'holiday';

export interface AttendanceRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  remarks?: string;
}

export interface Payroll {
  id: string;
  employee_id: string;
  employee_name: string;
  month_year: string;
  total_working_days: number;
  present_days: number;
  half_days: number;
  absent_days: number;
  base_salary: number;
  calculated_salary: number;
  bonus: number;
  deductions: number;
  net_salary: number;
  payment_date: string;
  payment_status: 'paid' | 'pending';
  payment_mode: string;
  created_at?: string;
}

export interface SalarySlip {
  id: string;
  pay_period: string; // YYYY-MM
  employee_id: string;
  employee_name: string;
  designation: string;
  basic_salary: number;
  allowances: number;
  overtime: number;
  bonus: number;
  gross_salary: number;
  deductions: number;
  advance: number;
  leave_deduction: number;
  net_salary: number;
  working_days: number;
  present_days: number;
  absent_days: number;
  payment_status: 'paid' | 'pending';
  payment_date?: string;
  generated_at: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user_name: string;
  user_role: string;
  action: string;
  module: string;
  previous_value?: string;
  new_value?: string;
}

export interface BusinessSettings {
  business_name: string;
  logo: string;
  address: string;
  phone: string;
  email: string;
  gstin: string;
  state: string;
  pin_code: string;
  invoice_prefix: string;
  starting_number: number;
  invoice_footer: string;
  terms_and_conditions: string;
  default_min_stock: number;
  allow_negative_stock: boolean;
  low_stock_threshold: number;
  gst_rates: number[];
  default_gst_rate: number;
  tax_calculation_method: 'exclusive' | 'inclusive';
}

export interface DashboardStats {
  total_tyres_in_stock: number;
  total_inventory_value: number;
  low_stock_count: number;
  today_stock_out_count: number;
  today_sales: number;
  today_purchase: number;
  today_profit: number;
  outstanding_receivables: number;
  outstanding_payables: number;
  brand_wise_stock: Array<{ brand: string; quantity: number; value: number }>;
  size_wise_stock: Array<{ size: string; quantity: number; value: number; is_low: boolean }>;
  low_stock_items: Tyre[];
  today_stock_out_items: Tyre[];
  sales_chart: Array<{ date: string; sales: number; profit: number }>;
}
