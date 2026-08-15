import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar.js';
import { Sidebar, NavTab } from './components/Sidebar.js';
import { DashboardView } from './components/DashboardView.js';
import { TyreMasterView } from './components/TyreMasterView.js';
import { InventoryView } from './components/InventoryView.js';
import { InventoryMovementView } from './components/InventoryMovementView.js';
import { SalesInvoicesView } from './components/SalesInvoicesView.js';
import { PurchasesView } from './components/PurchasesView.js';
import { CustomersView } from './components/CustomersView.js';
import { SuppliersView } from './components/SuppliersView.js';
import { EmployeesView } from './components/EmployeesView.js';
import { ReportsView } from './components/ReportsView.js';
import { SettingsView } from './components/SettingsView.js';
import { AuditLogsView } from './components/AuditLogsView.js';
import { UsersRolesView } from './components/UsersRolesView.js';
import { MasterDataView } from './components/MasterDataView.js';
import { DataManagementView } from './components/DataManagementView.js';
import { InvoicePrintModal } from './components/InvoicePrintModal.js';

import { api } from './services/api.js';
import {
  Tyre,
  InventoryMovement,
  Purchase,
  PurchaseReturn,
  SalesInvoice,
  SalesReturn,
  Customer,
  Supplier,
  Employee,
  AttendanceRecord,
  SalarySlip,
  AuditLog,
  BusinessSettings,
  DashboardStats,
  User,
  UserRole,
  Payment,
  MasterListItem,
  TyreModel,
  resolvePermissions,
  ROLE_DEFAULT_PERMISSIONS
} from './types.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // App Data State
  const [tyres, setTyres] = useState<Tyre[]>([]);
  const [categories, setCategories] = useState<MasterListItem[]>([]);
  const [brands, setBrands] = useState<MasterListItem[]>([]);
  const [tyreSizes, setTyreSizes] = useState<MasterListItem[]>([]);
  const [tyreModels, setTyreModels] = useState<TyreModel[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>([]);
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [salaries, setSalaries] = useState<SalarySlip[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<BusinessSettings>({
    business_name: 'Apex Tyre Care & Alignment Hub',
    logo: '',
    address: 'Plot 42, GT Road Industrial Area, Sector 18, Gurugram, Haryana - 122015',
    phone: '+91 98765 43210',
    email: 'billing@apextyres.in',
    gstin: '06AAAAA0000A1Z5',
    state: 'Haryana',
    pin_code: '122015',
    invoice_prefix: 'APEX/2024-25/',
    starting_number: 1001,
    invoice_footer: 'Thank you for choosing Apex Tyres.',
    terms_and_conditions: '1. Goods once sold will not be taken back without original bill.\n2. Warranty as per manufacturer terms.\n3. Subject to local jurisdiction.',
    default_min_stock: 5,
    allow_negative_stock: false,
    low_stock_threshold: 5,
    gst_rates: [28, 18, 12, 5, 0],
    default_gst_rate: 28,
    tax_calculation_method: 'exclusive'
  });
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Demo user session: an Admin creates real logins under Users & Roles; this
  // switcher lets you preview the app as any of those accounts (there is no
  // real password-based session yet -- see README for the caveat).
  const [currentUserId, setCurrentUserId] = useState<string>('usr-1');
  const currentUser: User = useMemo(() => {
    return users.find(u => u.id === currentUserId) || {
      id: 'usr-1', name: 'Rajesh Sharma', username: 'rajesh', email: 'owner@apextyres.com',
      role: 'admin', phone: '', active: true, permissions: {}
    };
  }, [users, currentUserId]);

  const permissions = useMemo(() => resolvePermissions(currentUser), [currentUser]);

  // Printing Invoice Modal State
  const [printingInvoice, setPrintingInvoice] = useState<SalesInvoice | null>(null);

  // Initial Load & Refresh
  const loadAppData = async () => {
    try {
      setLoading(true);
      const [
        tyresData, categoriesData, brandsData, sizesData, modelsData, movementsData, purchasesData, purchaseReturnsData,
        invoicesData, salesReturnsData, customersData, suppliersData, paymentsData,
        employeesData, attendanceData, salariesData, auditLogsData, usersData,
        settingsData, statsData
      ] = await Promise.all([
        api.getTyres(), api.getCategories(), api.getBrands(), api.getSizes(), api.getModels(), api.getInventoryMovements(), api.getPurchases(), api.getPurchaseReturns(),
        api.getInvoices(), api.getSalesReturns(), api.getCustomers(), api.getSuppliers(), api.getPayments(),
        api.getEmployees(), api.getAttendance(), api.getSalaries(), api.getAuditLogs(), api.getUsers(),
        api.getSettings(), api.getDashboardStats()
      ]);

      setTyres(tyresData);
      setCategories(categoriesData);
      setBrands(brandsData);
      setTyreSizes(sizesData);
      setTyreModels(modelsData);
      setMovements(movementsData);
      setPurchases(purchasesData);
      setPurchaseReturns(purchaseReturnsData);
      setInvoices(invoicesData);
      setSalesReturns(salesReturnsData);
      setCustomers(customersData);
      setSuppliers(suppliersData);
      setPayments(paymentsData);
      setEmployees(employeesData);
      setAttendance(attendanceData);
      setSalaries(salariesData);
      setAuditLogs(auditLogsData);
      setUsers(usersData);
      setSettings(settingsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load shop data from server API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppData();
  }, []);

  // If switching to a tab the current demo user isn't permitted to view
  // (e.g. after switching accounts), bounce back to the dashboard.
  useEffect(() => {
    const tabPermission: Partial<Record<NavTab, keyof typeof permissions>> = {
      dashboard: 'view_dashboard', inventory: 'view_inventory', master: 'view_inventory',
      movements: 'view_inventory', purchases: 'view_purchases', sales: 'create_invoice',
      customers: 'view_customers', suppliers: 'view_suppliers', employees: 'view_employees',
      attendance: 'view_employees', salary: 'view_employees', reports: 'view_reports',
      users: 'manage_users', settings: 'manage_settings', audit: 'view_audit_logs',
      masterdata: 'manage_master_data', data: 'manage_settings'
    };
    const required = tabPermission[currentTab];
    if (required && !permissions[required]) {
      setCurrentTab('dashboard');
    }
  }, [currentTab, permissions]);

  const handleSwitchUser = (userId: string) => {
    setCurrentUserId(userId);
    setCurrentTab('dashboard');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new_sale': setCurrentTab('sales'); break;
      case 'new_purchase': setCurrentTab('purchases'); break;
      case 'add_tyre': setCurrentTab('master'); break;
      case 'add_customer': setCurrentTab('customers'); break;
      case 'add_supplier': setCurrentTab('suppliers'); break;
      case 'stock_adjustment': setCurrentTab('inventory'); break;
      default: break;
    }
  };

  // Handler functions with backend API sync
  const handleAddTyre = async (tyre: Omit<Tyre, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await api.createTyre(tyre, currentUser.name);
      await loadAppData();
    } catch (err: any) {
      alert(`Error creating tyre: ${err.message}`);
    }
  };

  const handleUpdateTyre = async (id: string, updates: Partial<Tyre>) => {
    try {
      await api.updateTyre(id, updates, currentUser.name);
      await loadAppData();
    } catch (err: any) {
      alert(`Error updating tyre: ${err.message}`);
    }
  };

  const handleAddCategory = async (category: string) => {
    try {
      await api.createCategory(category, currentUser.name);
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (err: any) {
      alert(`Error adding category: ${err.message}`);
    }
  };

  // Master Data: Brands
  const handleAddBrand = async (name: string) => {
    try { await api.createBrand(name, currentUser.name); setBrands(await api.getBrands()); }
    catch (err: any) { alert(`Error adding brand: ${err.message}`); }
  };
  const handleUpdateBrand = async (id: string, updates: Partial<Pick<MasterListItem, 'name' | 'active'>>) => {
    try { await api.updateBrand(id, updates, currentUser.name); setBrands(await api.getBrands()); }
    catch (err: any) { alert(`Error updating brand: ${err.message}`); }
  };
  const handleDeleteBrand = async (id: string) => {
    try { await api.deleteBrand(id, currentUser.name); setBrands(await api.getBrands()); }
    catch (err: any) { alert(`Error deleting brand: ${err.message}`); }
  };

  // Master Data: Categories
  const handleUpdateCategory = async (id: string, updates: Partial<Pick<MasterListItem, 'name' | 'active'>>) => {
    try { await api.updateCategory(id, updates, currentUser.name); setCategories(await api.getCategories()); }
    catch (err: any) { alert(`Error updating category: ${err.message}`); }
  };
  const handleDeleteCategory = async (id: string) => {
    try { await api.deleteCategory(id, currentUser.name); setCategories(await api.getCategories()); }
    catch (err: any) { alert(`Error deleting category: ${err.message}`); }
  };

  // Master Data: Sizes
  const handleAddSize = async (name: string) => {
    try { await api.createSize(name, currentUser.name); setTyreSizes(await api.getSizes()); }
    catch (err: any) { alert(`Error adding size: ${err.message}`); }
  };
  const handleUpdateSize = async (id: string, updates: Partial<Pick<MasterListItem, 'name' | 'active'>>) => {
    try { await api.updateSize(id, updates, currentUser.name); setTyreSizes(await api.getSizes()); }
    catch (err: any) { alert(`Error updating size: ${err.message}`); }
  };
  const handleDeleteSize = async (id: string) => {
    try { await api.deleteSize(id, currentUser.name); setTyreSizes(await api.getSizes()); }
    catch (err: any) { alert(`Error deleting size: ${err.message}`); }
  };

  // Master Data: Models
  const handleAddModel = async (brand: string, name: string) => {
    try { await api.createModel(brand, name, currentUser.name); setTyreModels(await api.getModels()); }
    catch (err: any) { alert(`Error adding model: ${err.message}`); }
  };
  const handleUpdateModel = async (id: string, updates: Partial<Pick<TyreModel, 'name' | 'active' | 'brand'>>) => {
    try { await api.updateModel(id, updates, currentUser.name); setTyreModels(await api.getModels()); }
    catch (err: any) { alert(`Error updating model: ${err.message}`); }
  };
  const handleDeleteModel = async (id: string) => {
    try { await api.deleteModel(id, currentUser.name); setTyreModels(await api.getModels()); }
    catch (err: any) { alert(`Error deleting model: ${err.message}`); }
  };

  const handleAdjustStock = async (tyre_id: string, qtyChange: number, type: string, remarks: string) => {
    try {
      await api.adjustStock(tyre_id, qtyChange, type, remarks, currentUser.name);
      await loadAppData();
    } catch (err: any) {
      alert(`Error adjusting stock: ${err.message}`);
    }
  };

  const handleCreateInvoice = async (invoice: Omit<SalesInvoice, 'id' | 'invoice_number' | 'created_at'>) => {
    try {
      const created = await api.createInvoice(invoice, currentUser.name);
      await loadAppData();
      setPrintingInvoice(created);
    } catch (err: any) {
      alert(`Error creating tax invoice: ${err.message}`);
    }
  };

  const handleCancelInvoice = async (id: string, reason: string) => {
    try {
      await api.cancelInvoice(id, reason, currentUser.name);
      await loadAppData();
    } catch (err: any) {
      alert(`Error cancelling invoice: ${err.message}`);
    }
  };

  const handleCreateSalesReturn = async (sReturn: Omit<SalesReturn, 'id' | 'return_number' | 'created_at'>) => {
    try {
      await api.createSalesReturn(sReturn, currentUser.name);
      await loadAppData();
    } catch (err: any) {
      alert(`Error creating sales return: ${err.message}`);
    }
  };

  const handleCreatePurchase = async (purchase: Omit<Purchase, 'id' | 'purchase_number' | 'created_at'>) => {
    try {
      await api.createPurchase(purchase, currentUser.name);
      await loadAppData();
    } catch (err: any) {
      alert(`Error recording purchase bill: ${err.message}`);
    }
  };

  const handleCreatePurchaseReturn = async (pReturn: Omit<PurchaseReturn, 'id' | 'return_number' | 'created_at'>) => {
    try {
      await api.createPurchaseReturn(pReturn, currentUser.name);
      await loadAppData();
    } catch (err: any) {
      alert(`Error creating purchase return: ${err.message}`);
    }
  };

  const handleCreateCustomer = async (customer: Omit<Customer, 'id' | 'customer_code' | 'created_at'>) => {
    try {
      await api.createCustomer(customer, currentUser.name);
      await loadAppData();
    } catch (err: any) {
      alert(`Error saving customer: ${err.message}`);
    }
  };

  const handleReceivePayment = async (customer_id: string, amount: number, paymentMode: string, notes: string) => {
    try {
      const customer = customers.find(c => c.id === customer_id);
      await api.createPayment({
        type: 'customer_payment', party_id: customer_id, party_name: customer?.name || '',
        amount, payment_mode: paymentMode as any, payment_date: new Date().toISOString().split('T')[0], notes,
        created_by: currentUser.name
      }, currentUser.name);
      await loadAppData();
    } catch (err: any) {
      alert(`Error recording payment: ${err.message}`);
    }
  };

  const handleCreateSupplier = async (supplier: Omit<Supplier, 'id' | 'created_at'>) => {
    try {
      await api.createSupplier(supplier, currentUser.name);
      await loadAppData();
    } catch (err: any) {
      alert(`Error saving supplier: ${err.message}`);
    }
  };

  const handlePaySupplier = async (supplier_id: string, amount: number, paymentMode: string, notes: string) => {
    try {
      const supplier = suppliers.find(s => s.id === supplier_id);
      await api.createPayment({
        type: 'supplier_payment', party_id: supplier_id, party_name: supplier?.name || '',
        amount, payment_mode: paymentMode as any, payment_date: new Date().toISOString().split('T')[0], notes,
        created_by: currentUser.name
      }, currentUser.name);
      await loadAppData();
    } catch (err: any) {
      alert(`Error recording vendor payment: ${err.message}`);
    }
  };

  const handleCreateEmployee = async (emp: Omit<Employee, 'id' | 'employee_code'>) => {
    try {
      await api.createEmployee(emp, currentUser.name);
      await loadAppData();
    } catch (err: any) {
      alert(`Error saving staff: ${err.message}`);
    }
  };

  const handleMarkAttendance = async (records: { employee_id: string; status: 'present' | 'absent' | 'half_day' | 'leave'; notes: string }[], date: string) => {
    try {
      const recs = records.map((r) => ({
        id: 'att-' + Math.random().toString(36).substr(2, 6),
        employee_id: r.employee_id,
        employee_name: employees.find(e => e.id === r.employee_id)?.name || 'Staff',
        date,
        status: r.status,
        remarks: r.notes
      }));
      await api.recordAttendance(recs as AttendanceRecord[], currentUser.name);
      await loadAppData();
    } catch (err: any) {
      alert(`Error marking attendance: ${err.message}`);
    }
  };

  const handleCreatePayroll = async (payrollData: any) => {
    try {
      await api.generateSalarySlip({
        pay_period: payrollData.month_year,
        employee_id: payrollData.employee_id,
        allowances: 0,
        bonus: payrollData.bonus,
        deductions: payrollData.deductions,
        advance: 0,
        user_name: currentUser.name
      });
      await loadAppData();
    } catch (err: any) {
      alert(`Error generating payroll: ${err.message}`);
    }
  };

  const handleUpdateSettings = async (newSettings: BusinessSettings) => {
    try {
      await api.updateSettings(newSettings, currentUser.name);
      setSettings(newSettings);
      await loadAppData();
    } catch (err: any) {
      alert(`Error saving settings: ${err.message}`);
    }
  };

  const handleCreateUser = async (user: { name: string; username: string; email: string; role: UserRole; phone?: string }) => {
    try {
      await api.createUser(user, currentUser.name);
      await loadAppData();
    } catch (err: any) {
      alert(`Error creating user: ${err.message}`);
    }
  };

  const handleUpdateUser = async (id: string, updates: Partial<Pick<User, 'role' | 'permissions' | 'active'>>) => {
    try {
      await api.updateUser(id, updates, currentUser.name);
      await loadAppData();
    } catch (err: any) {
      alert(`Error updating user: ${err.message}`);
    }
  };

  const handleResetLogin = async (id: string) => {
    try {
      const result = await api.resetUserLogin(id, currentUser.name);
      alert(result.message);
      await loadAppData();
    } catch (err: any) {
      alert(`Error resetting login: ${err.message}`);
    }
  };

  // Convert salary slips to Payroll-like interface for EmployeesView
  const payrollsAdapted = salaries.map(s => ({
    id: s.id,
    employee_id: s.employee_id,
    employee_name: s.employee_name,
    month_year: s.pay_period,
    total_working_days: s.working_days,
    present_days: s.present_days,
    half_days: 0,
    absent_days: s.absent_days,
    base_salary: s.basic_salary,
    calculated_salary: s.gross_salary,
    bonus: s.bonus,
    deductions: s.deductions,
    net_salary: s.net_salary,
    payment_date: s.payment_date || new Date().toISOString().split('T')[0],
    payment_status: s.payment_status as 'paid' | 'pending',
    payment_mode: 'bank_transfer' as const
  }));

  const lowStockCount = tyres.filter(t => t.current_stock <= t.min_stock_level).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">

      {/* Top Navigation */}
      <Navbar
        currentRole={currentUser.role}
        onRoleChange={(role) => {
          const match = users.find(u => u.role === role);
          if (match) handleSwitchUser(match.id);
        }}
        onSearch={() => {}}
        onOpenQuickAction={handleQuickAction}
        lowStockCount={lowStockCount}
        onNavigateToLowStock={() => setCurrentTab('inventory')}
      />

      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar Menu */}
        <Sidebar
          activeTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          userRole={currentUser.role}
          permissions={permissions}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 overflow-y-auto bg-slate-950 pb-16">

          {!loading && (
            <>
              {currentTab === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  loading={loading}
                  onRefresh={loadAppData}
                  onRestock={() => setCurrentTab('purchases')}
                  onQuickAction={handleQuickAction}
                />
              )}

              {currentTab === 'master' && (
                <TyreMasterView
                  tyres={tyres}
                  categories={categories}
                  brands={brands}
                  models={tyreModels}
                  sizes={tyreSizes}
                  settings={settings}
                  onAddTyre={handleAddTyre}
                  onUpdateTyre={handleUpdateTyre}
                  onAddCategory={handleAddCategory}
                />
              )}

              {currentTab === 'masterdata' && (
                <MasterDataView
                  brands={brands}
                  categories={categories}
                  sizes={tyreSizes}
                  models={tyreModels}
                  onAddBrand={handleAddBrand}
                  onUpdateBrand={handleUpdateBrand}
                  onDeleteBrand={handleDeleteBrand}
                  onAddCategory={handleAddCategory}
                  onUpdateCategory={handleUpdateCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onAddSize={handleAddSize}
                  onUpdateSize={handleUpdateSize}
                  onDeleteSize={handleDeleteSize}
                  onAddModel={handleAddModel}
                  onUpdateModel={handleUpdateModel}
                  onDeleteModel={handleDeleteModel}
                />
              )}

              {currentTab === 'inventory' && (
                <InventoryView
                  tyres={tyres}
                  onAdjustStock={handleAdjustStock}
                />
              )}

              {currentTab === 'movements' && (
                <InventoryMovementView
                  movements={movements}
                />
              )}

              {currentTab === 'sales' && (
                <SalesInvoicesView
                  invoices={invoices}
                  returns={salesReturns}
                  tyres={tyres}
                  customers={customers}
                  settings={settings}
                  onCreateInvoice={handleCreateInvoice}
                  onCancelInvoice={handleCancelInvoice}
                  onCreateSalesReturn={handleCreateSalesReturn}
                  onCreateCustomer={handleCreateCustomer}
                  onViewInvoiceModal={(invoice) => setPrintingInvoice(invoice)}
                />
              )}

              {currentTab === 'purchases' && (
                <PurchasesView
                  purchases={purchases}
                  returns={purchaseReturns}
                  tyres={tyres}
                  suppliers={suppliers}
                  onCreatePurchase={handleCreatePurchase}
                  onCreatePurchaseReturn={handleCreatePurchaseReturn}
                />
              )}

              {currentTab === 'customers' && (
                <CustomersView
                  customers={customers}
                  invoices={invoices}
                  onCreateCustomer={handleCreateCustomer}
                  onReceivePayment={handleReceivePayment}
                />
              )}

              {currentTab === 'suppliers' && (
                <SuppliersView
                  suppliers={suppliers}
                  purchases={purchases}
                  onCreateSupplier={handleCreateSupplier}
                  onPaySupplier={handlePaySupplier}
                />
              )}

              {(currentTab === 'employees' || currentTab === 'attendance' || currentTab === 'salary') && (
                <EmployeesView
                  employees={employees}
                  attendance={attendance}
                  payrolls={payrollsAdapted}
                  onCreateEmployee={handleCreateEmployee}
                  onMarkAttendance={handleMarkAttendance}
                  onCreatePayroll={handleCreatePayroll}
                />
              )}

              {currentTab === 'reports' && (
                <ReportsView
                  tyres={tyres}
                  invoices={invoices}
                  purchases={purchases}
                  customers={customers}
                  suppliers={suppliers}
                />
              )}

              {currentTab === 'users' && (
                <UsersRolesView
                  users={users}
                  onCreateUser={handleCreateUser}
                  onUpdateUser={handleUpdateUser}
                  onResetLogin={handleResetLogin}
                />
              )}

              {currentTab === 'data' && (
                <DataManagementView
                  currentUserName={currentUser.name}
                  onImportComplete={loadAppData}
                />
              )}

              {currentTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  currentUserRole={currentUser.role}
                />
              )}

              {currentTab === 'audit' && (
                <AuditLogsView
                  logs={auditLogs}
                />
              )}
            </>
          )}

          {loading && (
            <div className="p-8 text-center text-xs font-mono text-amber-400 animate-pulse">
              Syncing Tyre Shop Database & Inventory Registers...
            </div>
          )}

        </main>

      </div>

      {/* Invoice Print & Download Modal */}
      {printingInvoice && (
        <InvoicePrintModal
          invoice={printingInvoice}
          settings={settings}
          onClose={() => setPrintingInvoice(null)}
        />
      )}

    </div>
  );
}
