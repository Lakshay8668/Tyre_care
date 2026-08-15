import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import * as XLSX from 'xlsx';
import { db } from './src/server/dbStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '25mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Auth endpoints
  app.post('/api/auth/login', (req, res) => {
    const { email, role } = req.body;
    const users = db.getRawData().users;
    const user = users.find(u => u.email === email || u.role === role) || users[0];
    res.json({ user, token: 'session-' + user.id });
  });

  app.get('/api/auth/me', (req, res) => {
    const user = db.getRawData().users[0];
    res.json({ user });
  });

  // Dashboard Stats
  app.get('/api/dashboard/stats', (req, res) => {
    try {
      const stats = db.getDashboardStats();
      res.json(stats);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Tyre Master & Inventory
  app.get('/api/tyres', (req, res) => {
    try {
      const tyres = db.getTyres();
      res.json(tyres);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ---- Master Data: Brands / Categories / Sizes / Models ----
  app.get('/api/master/brands', (req, res) => res.json(db.getBrands()));
  app.post('/api/master/brands', (req, res) => {
    try { res.json(db.createBrand(req.body.name, req.body.user_name)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.put('/api/master/brands/:id', (req, res) => {
    try { res.json(db.updateBrand(req.params.id, req.body, req.body.user_name)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.delete('/api/master/brands/:id', (req, res) => {
    try { db.deleteBrand(req.params.id, req.query.user_name as string); res.json({ success: true }); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  app.get('/api/master/categories', (req, res) => res.json(db.getCategories()));
  app.post('/api/master/categories', (req, res) => {
    try { res.json(db.createCategory(req.body.name, req.body.user_name)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.put('/api/master/categories/:id', (req, res) => {
    try { res.json(db.updateCategory(req.params.id, req.body, req.body.user_name)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.delete('/api/master/categories/:id', (req, res) => {
    try { db.deleteCategory(req.params.id, req.query.user_name as string); res.json({ success: true }); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  app.get('/api/master/sizes', (req, res) => res.json(db.getSizes()));
  app.post('/api/master/sizes', (req, res) => {
    try { res.json(db.createSize(req.body.name, req.body.user_name)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.put('/api/master/sizes/:id', (req, res) => {
    try { res.json(db.updateSize(req.params.id, req.body, req.body.user_name)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.delete('/api/master/sizes/:id', (req, res) => {
    try { db.deleteSize(req.params.id, req.query.user_name as string); res.json({ success: true }); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  app.get('/api/master/models', (req, res) => res.json(db.getModels()));
  app.post('/api/master/models', (req, res) => {
    try { res.json(db.createModel(req.body.brand, req.body.name, req.body.user_name)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.put('/api/master/models/:id', (req, res) => {
    try { res.json(db.updateModel(req.params.id, req.body, req.body.user_name)); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });
  app.delete('/api/master/models/:id', (req, res) => {
    try { db.deleteModel(req.params.id, req.query.user_name as string); res.json({ success: true }); }
    catch (e: any) { res.status(400).json({ error: e.message }); }
  });

  app.get('/api/tyres/search', (req, res) => {
    const q = (req.query.q as string || '').toLowerCase().trim();
    const tyres = db.getTyres().filter(t => 
      t.brand.toLowerCase().includes(q) ||
      t.model.toLowerCase().includes(q) ||
      t.size.toLowerCase().includes(q)
    );
    res.json(tyres);
  });

  app.post('/api/tyres', (req, res) => {
    try {
      const newTyre = db.createTyre(req.body, req.body.user_name || 'Admin');
      res.status(201).json(newTyre);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/tyres/:id', (req, res) => {
    try {
      const updated = db.updateTyre(req.params.id, req.body, req.body.user_name || 'Admin');
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Inventory Movements & Adjustments
  app.get('/api/inventory/movements', (req, res) => {
    res.json(db.getRawData().inventory_movements);
  });

  app.post('/api/inventory/adjust', (req, res) => {
    try {
      const { tyre_id, qtyChange, type, remarks, user_name } = req.body;
      const tyre = db.adjustStock(tyre_id, Number(qtyChange), type, remarks, user_name);
      res.json(tyre);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Purchases & Purchase Returns
  app.get('/api/purchases', (req, res) => {
    res.json(db.getRawData().purchases);
  });

  app.get('/api/purchases/returns', (req, res) => {
    res.json(db.getRawData().purchase_returns);
  });

  app.post('/api/purchases', (req, res) => {
    try {
      const purchase = db.createPurchase(req.body, req.body.user_name || 'Storekeeper');
      res.status(201).json(purchase);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/purchases/returns', (req, res) => {
    try {
      const pReturn = db.createPurchaseReturn(req.body, req.body.user_name || 'Storekeeper');
      res.status(201).json(pReturn);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Sales & Invoices
  app.get('/api/invoices', (req, res) => {
    res.json(db.getRawData().sales_invoices);
  });

  app.get('/api/invoices/returns', (req, res) => {
    res.json(db.getRawData().sales_returns);
  });

  app.get('/api/invoices/:id', (req, res) => {
    const inv = db.getRawData().sales_invoices.find(i => i.id === req.params.id);
    if (!inv) return res.status(404).json({ error: 'Invoice not found' });
    res.json(inv);
  });

  app.post('/api/invoices', (req, res) => {
    try {
      const invoice = db.createSalesInvoice(req.body, req.body.user_name || 'Sales Executive');
      res.status(201).json(invoice);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/invoices/:id/cancel', (req, res) => {
    try {
      const cancelled = db.cancelSalesInvoice(req.params.id, req.body.reason, req.body.user_name || 'Admin');
      res.json(cancelled);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/invoices/returns', (req, res) => {
    try {
      const sReturn = db.createSalesReturn(req.body, req.body.user_name || 'Manager');
      res.status(201).json(sReturn);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Customers
  app.get('/api/customers', (req, res) => {
    res.json(db.getRawData().customers);
  });

  app.post('/api/customers', (req, res) => {
    try {
      const customer = db.createCustomer(req.body, req.body.user_name || 'Sales');
      res.status(201).json(customer);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get('/api/customers/:id/history', (req, res) => {
    try {
      const history = db.getCustomerHistory(req.params.id);
      res.json(history);
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  });

  // Suppliers
  app.get('/api/suppliers', (req, res) => {
    res.json(db.getRawData().suppliers);
  });

  app.post('/api/suppliers', (req, res) => {
    try {
      const supplier = db.createSupplier(req.body, req.body.user_name || 'Admin');
      res.status(201).json(supplier);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get('/api/suppliers/:id/history', (req, res) => {
    try {
      const history = db.getSupplierHistory(req.params.id);
      res.json(history);
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  });

  // Payments
  app.get('/api/payments', (req, res) => {
    res.json(db.getRawData().payments);
  });

  app.post('/api/payments', (req, res) => {
    try {
      const payment = db.createPayment(req.body, req.body.user_name || 'Accountant');
      res.status(201).json(payment);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Employee, Attendance, Salary
  app.get('/api/employees', (req, res) => {
    res.json(db.getRawData().employees);
  });

  app.post('/api/employees', (req, res) => {
    try {
      const emp = db.createEmployee(req.body, req.body.user_name || 'Admin');
      res.status(201).json(emp);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get('/api/attendance', (req, res) => {
    res.json(db.getRawData().attendance);
  });

  app.post('/api/attendance', (req, res) => {
    try {
      const attendance = db.recordAttendance(req.body.records, req.body.user_name || 'Manager');
      res.json(attendance);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.get('/api/salaries', (req, res) => {
    res.json(db.getRawData().salaries);
  });

  app.post('/api/salaries/generate', (req, res) => {
    try {
      const { pay_period, employee_id, allowances, bonus, deductions, advance, user_name } = req.body;
      const slip = db.generateSalarySlip(pay_period, employee_id, Number(allowances || 0), Number(bonus || 0), Number(deductions || 0), Number(advance || 0), user_name);
      res.json(slip);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Audit Logs
  app.get('/api/audit-logs', (req, res) => {
    res.json(db.getRawData().audit_logs);
  });

  // Settings
  // Users & Roles
  app.get('/api/users', (req, res) => {
    try {
      res.json(db.getUsers());
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post('/api/users', (req, res) => {
    try {
      const { user_name, ...userData } = req.body;
      const user = db.createUser(userData, user_name);
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.put('/api/users/:id', (req, res) => {
    try {
      const { user_name, ...updates } = req.body;
      const user = db.updateUser(req.params.id, updates, user_name);
      res.json(user);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  app.post('/api/users/:id/reset-login', (req, res) => {
    try {
      const result = db.resetUserLogin(req.params.id, req.body?.user_name);
      res.json(result);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // ---- Data Management: Export ----
  const sendXlsx = (res: any, filename: string, sheetName: string, rows: any[]) => {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  };

  app.get('/api/export/database', (req, res) => {
    const data = db.getRawData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="tyre-shop-crm-backup-${new Date().toISOString().split('T')[0]}.json"`);
    res.send(JSON.stringify(data, null, 2));
  });

  app.get('/api/export/inventory', (req, res) => {
    const rows = db.getRawData().tyres.map(t => ({
      Brand: t.brand, Model: t.model, Size: t.size, Category: t.category,
      'Purchase Price': t.purchase_price, 'Selling Price': t.selling_price,
      'GST %': t.gst_rate, 'Current Stock': t.current_stock, 'Min Stock': t.min_stock_level,
      'Max Stock': t.max_stock_level, Active: t.is_active ? 'Yes' : 'No'
    }));
    sendXlsx(res, 'inventory-export.xlsx', 'Inventory', rows);
  });

  app.get('/api/export/customers', (req, res) => {
    const rows = db.getRawData().customers.map(c => ({
      'Customer Code': c.customer_code, Name: c.name, Mobile: c.mobile, Email: c.email, Address: c.address,
      GSTIN: c.gstin, 'Vehicle Number': c.vehicle_number, 'Vehicle Model': c.vehicle_model,
      'Customer Type': c.customer_type, 'Credit Limit': c.credit_limit, 'Outstanding Balance': c.outstanding_balance
    }));
    sendXlsx(res, 'customers-export.xlsx', 'Customers', rows);
  });

  app.get('/api/export/suppliers', (req, res) => {
    const rows = db.getRawData().suppliers.map(s => ({
      Name: s.name, 'Contact Person': s.contact_person, Mobile: s.mobile, Email: s.email, Address: s.address,
      GSTIN: s.gstin, 'Payment Terms': s.payment_terms, 'Outstanding Balance': s.outstanding_balance
    }));
    sendXlsx(res, 'suppliers-export.xlsx', 'Suppliers', rows);
  });

  app.get('/api/export/sales', (req, res) => {
    const rows = db.getRawData().sales_invoices.map(i => ({
      'Invoice Number': i.invoice_number, Date: i.invoice_date, Customer: i.customer_name,
      Subtotal: i.subtotal, 'GST Amount': i.total_gst, 'Grand Total': i.grand_total,
      'Payment Mode': i.payment_mode, 'Payment Status': i.payment_status
    }));
    sendXlsx(res, 'sales-export.xlsx', 'Sales', rows);
  });

  app.get('/api/export/invoices', (req, res) => {
    const rows = db.getRawData().sales_invoices.map(i => ({
      'Invoice Number': i.invoice_number, Date: i.invoice_date, Customer: i.customer_name,
      Items: i.items.map(it => `${it.tyre_name} x${it.quantity}`).join('; '),
      'Grand Total': i.grand_total, Status: i.payment_status
    }));
    sendXlsx(res, 'invoices-export.xlsx', 'Invoices', rows);
  });

  app.get('/api/export/purchases', (req, res) => {
    const rows = db.getRawData().purchases.map(p => ({
      'Purchase Number': p.purchase_number, Date: p.purchase_date, Supplier: p.supplier_name,
      'Invoice Number': p.supplier_invoice_number, Subtotal: p.subtotal, 'GST Amount': p.gst_amount,
      'Grand Total': p.grand_total, 'Payment Status': p.payment_status
    }));
    sendXlsx(res, 'purchases-export.xlsx', 'Purchases', rows);
  });

  // ---- Data Management: Import Templates ----
  app.get('/api/import/template/tyres', (req, res) => {
    sendXlsx(res, 'tyre-import-template.xlsx', 'Tyres', [{
      Brand: 'MRF', Model: 'ZVTV', Size: '185/65 R15',
      Category: 'Car Tyre', 'Vehicle Type': 'Sedan', Pattern: 'Symmetric Rib', 'Speed Rating': 'H (210 km/h)',
      'Load Index': '88', 'Purchase Price': 3500, 'Selling Price': 4500,
      'GST %': 28, 'Opening Stock': 10, 'Min Stock Level': 5, 'Max Stock Level': 50, Description: 'Sample row - replace with your data'
    }]);
  });

  app.get('/api/import/template/customers', (req, res) => {
    sendXlsx(res, 'customer-import-template.xlsx', 'Customers', [{
      Name: 'Sample Customer', Mobile: '9999999999', Email: 'sample@customer.com', Address: 'Sample Address',
      GSTIN: '', 'Vehicle Number': 'DL01AB1234', 'Vehicle Model': 'Honda City', 'Customer Type': 'retail',
      'Credit Limit': 0, 'Opening Balance': 0
    }]);
  });

  app.get('/api/import/template/suppliers', (req, res) => {
    sendXlsx(res, 'supplier-import-template.xlsx', 'Suppliers', [{
      Name: 'Sample Supplier', 'Contact Person': 'Contact Name', Mobile: '9999999999', Email: 'sample@supplier.com',
      Address: 'Sample Address', GSTIN: '06AAAAA0000A1Z5', 'Payment Terms': '15 Days Credit', 'Opening Balance': 0
    }]);
  });

  // ---- Data Management: Import ----
  const parseUploadedWorkbook = (file_base64: string): any[] => {
    const buffer = Buffer.from(file_base64, 'base64');
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    return XLSX.utils.sheet_to_json(sheet);
  };

  app.post('/api/import/tyres', (req, res) => {
    try {
      const rows = parseUploadedWorkbook(req.body.file_base64);
      const user_name = req.body.user_name || 'Admin';
      let created = 0;
      const errors: string[] = [];
      rows.forEach((row: any, idx: number) => {
        try {
          db.createTyre({
            brand: String(row['Brand'] || '').trim(),
            model: String(row['Model'] || '').trim(),
            size: String(row['Size'] || '').trim(),
            category: String(row['Category'] || 'Car Tyre'),
            vehicle_type: String(row['Vehicle Type'] || ''),
            season: 'All-Season',
            pattern: String(row['Pattern'] || ''),
            speed_rating: String(row['Speed Rating'] || ''),
            load_index: String(row['Load Index'] || ''),
            purchase_price: Number(row['Purchase Price']) || 0,
            selling_price: Number(row['Selling Price']) || 0,
            min_selling_price: Number(row['Selling Price']) || 0,
            gst_rate: Number(row['GST %']) || 28,
            opening_stock: Number(row['Opening Stock']) || 0,
            current_stock: Number(row['Opening Stock']) || 0,
            min_stock_level: Number(row['Min Stock Level']) || 5,
            max_stock_level: Number(row['Max Stock Level']) || 50,
            description: String(row['Description'] || ''),
            is_active: true
          } as any, user_name);
          created++;
        } catch (e: any) {
          errors.push(`Row ${idx + 2}: ${e.message}`);
        }
      });
      res.json({ total: rows.length, created, skipped: rows.length - created, errors });
    } catch (e: any) {
      res.status(400).json({ error: `Could not read file: ${e.message}` });
    }
  });

  app.post('/api/import/customers', (req, res) => {
    try {
      const rows = parseUploadedWorkbook(req.body.file_base64);
      const user_name = req.body.user_name || 'Admin';
      let created = 0;
      const errors: string[] = [];
      rows.forEach((row: any, idx: number) => {
        try {
          db.createCustomer({
            name: String(row['Name'] || '').trim(),
            mobile: String(row['Mobile'] || '').trim(),
            email: String(row['Email'] || ''),
            address: String(row['Address'] || ''),
            gstin: String(row['GSTIN'] || ''),
            vehicle_number: String(row['Vehicle Number'] || ''),
            vehicle_model: String(row['Vehicle Model'] || ''),
            customer_type: (String(row['Customer Type'] || 'retail')) as any,
            credit_limit: Number(row['Credit Limit']) || 0,
            outstanding_balance: Number(row['Opening Balance']) || 0
          } as any, user_name);
          created++;
        } catch (e: any) {
          errors.push(`Row ${idx + 2}: ${e.message}`);
        }
      });
      res.json({ total: rows.length, created, skipped: rows.length - created, errors });
    } catch (e: any) {
      res.status(400).json({ error: `Could not read file: ${e.message}` });
    }
  });

  app.post('/api/import/suppliers', (req, res) => {
    try {
      const rows = parseUploadedWorkbook(req.body.file_base64);
      const user_name = req.body.user_name || 'Admin';
      let created = 0;
      const errors: string[] = [];
      rows.forEach((row: any, idx: number) => {
        try {
          db.createSupplier({
            name: String(row['Name'] || '').trim(),
            contact_person: String(row['Contact Person'] || ''),
            mobile: String(row['Mobile'] || '').trim(),
            email: String(row['Email'] || ''),
            address: String(row['Address'] || ''),
            gstin: String(row['GSTIN'] || ''),
            payment_terms: String(row['Payment Terms'] || '15 Days Credit'),
            opening_balance: Number(row['Opening Balance']) || 0,
            outstanding_balance: Number(row['Opening Balance']) || 0
          } as any, user_name);
          created++;
        } catch (e: any) {
          errors.push(`Row ${idx + 2}: ${e.message}`);
        }
      });
      res.json({ total: rows.length, created, skipped: rows.length - created, errors });
    } catch (e: any) {
      res.status(400).json({ error: `Could not read file: ${e.message}` });
    }
  });

  app.get('/api/settings', (req, res) => {
    res.json(db.getSettings());
  });

  app.put('/api/settings', (req, res) => {
    try {
      const updated = db.updateSettings(req.body, req.body.user_name || 'Admin');
      res.json(updated);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  });

  // Reports API
  app.get('/api/reports/sales', (req, res) => {
    const invoices = db.getRawData().sales_invoices.filter(i => i.payment_status !== 'cancelled');
    res.json(invoices);
  });

  app.get('/api/reports/purchases', (req, res) => {
    res.json(db.getRawData().purchases);
  });

  app.get('/api/reports/inventory', (req, res) => {
    const tyres = db.getTyres();
    const stats = tyres.map(t => ({
      brand: t.brand,
      model: t.model,
      size: t.size,
      category: t.category,
      purchase_price: t.purchase_price,
      selling_price: t.selling_price,
      current_stock: t.current_stock,
      inventory_value: t.current_stock * t.purchase_price,
      status: t.current_stock === 0 ? 'Out of Stock' : (t.current_stock <= t.min_stock_level ? 'Low Stock' : 'In Stock')
    }));
    res.json(stats);
  });

  // Vite Integration
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Tyre Shop CRM Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
