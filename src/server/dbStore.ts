import fs from 'fs';
import path from 'path';
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
  User,
  DashboardStats,
  Permission,
  MasterListItem,
  TyreModel
} from '../types.js';

const DB_FILE = path.join(process.cwd(), 'data', 'crm_database.json');

export interface DatabaseSchema {
  users: User[];
  tyre_categories: MasterListItem[];
  tyre_brands: MasterListItem[];
  tyre_sizes: MasterListItem[];
  tyre_models: TyreModel[];
  tyres: Tyre[];
  inventory_movements: InventoryMovement[];
  suppliers: Supplier[];
  purchases: Purchase[];
  purchase_returns: PurchaseReturn[];
  customers: Customer[];
  sales_invoices: SalesInvoice[];
  sales_returns: SalesReturn[];
  payments: Payment[];
  employees: Employee[];
  attendance: AttendanceRecord[];
  salaries: SalarySlip[];
  audit_logs: AuditLog[];
  settings: BusinessSettings;
}

const DEFAULT_SETTINGS: BusinessSettings = {
  business_name: 'Apex Tyre Care & Alignment Hub',
  logo: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=150&auto=format&fit=crop&q=80',
  address: 'Plot 42, GT Road, Industrial Area Phase 1',
  phone: '+91 98765 43210',
  email: 'support@apextyres.com',
  gstin: '07AAAAA0000A1Z5',
  state: 'Delhi (07)',
  pin_code: '110020',
  invoice_prefix: 'INV-2026-',
  starting_number: 1001,
  invoice_footer: 'Thank you for choosing Apex Tyre Care! Drive Safe & Check Tyre Pressure Monthly.',
  terms_and_conditions: '1. Warranty as per manufacturer terms.\n2. Goods once sold cannot be taken back without valid GST invoice.\n3. Payment due within 15 days for credit customers.',
  default_min_stock: 5,
  allow_negative_stock: false,
  low_stock_threshold: 5,
  gst_rates: [0, 5, 12, 18, 28],
  default_gst_rate: 28,
  tax_calculation_method: 'exclusive'
};

function generateInitialData(): DatabaseSchema {
  const users: User[] = [
    { id: 'usr-1', name: 'Rajesh Sharma', username: 'rajesh', email: 'owner@apextyres.com', role: 'admin', phone: '9876543210', active: true, permissions: {} },
    { id: 'usr-2', name: 'Vikram Singh', username: 'vikram', email: 'manager@apextyres.com', role: 'manager', phone: '9876543211', active: true, permissions: {} },
    { id: 'usr-3', name: 'Priya Verma', username: 'priya', email: 'accounts@apextyres.com', role: 'accountant', phone: '9876543212', active: true, permissions: {} },
    { id: 'usr-4', name: 'Amit Kumar', username: 'amit', email: 'sales@apextyres.com', role: 'sales', phone: '9876543213', active: true, permissions: {} },
    { id: 'usr-5', name: 'Suresh Tech', username: 'suresh', email: 'store@apextyres.com', role: 'storekeeper', phone: '9876543214', active: true, permissions: {} }
  ];

  const tyre_categories: MasterListItem[] = [
    { id: 'cat-1', name: 'Car Tyre', active: true },
    { id: 'cat-2', name: 'SUV Tyre', active: true },
    { id: 'cat-3', name: 'Commercial Tyre', active: true },
    { id: 'cat-4', name: 'Truck Tyre', active: true },
    { id: 'cat-5', name: 'Bus Tyre', active: true },
    { id: 'cat-6', name: 'Bike Tyre', active: true },
    { id: 'cat-7', name: 'Scooter Tyre', active: true },
    { id: 'cat-8', name: 'Agricultural Tyre', active: true },
    { id: 'cat-9', name: 'Other', active: true }
  ];

  const tyre_brands: MasterListItem[] = [
    { id: 'brand-1', name: 'MRF', active: true },
    { id: 'brand-2', name: 'CEAT', active: true },
    { id: 'brand-3', name: 'Apollo', active: true },
    { id: 'brand-4', name: 'Bridgestone', active: true },
    { id: 'brand-5', name: 'Michelin', active: true },
    { id: 'brand-6', name: 'Goodyear', active: true },
    { id: 'brand-7', name: 'Yokohama', active: true }
  ];

  const tyre_sizes: MasterListItem[] = [
    { id: 'size-1', name: '90/90 R12', active: true },
    { id: 'size-2', name: '145/80 R12', active: true },
    { id: 'size-3', name: '155/65 R13', active: true },
    { id: 'size-4', name: '165/70 R14', active: true },
    { id: 'size-5', name: '175/65 R15', active: true },
    { id: 'size-6', name: '185/65 R15', active: true },
    { id: 'size-7', name: '195/55 R16', active: true },
    { id: 'size-8', name: '205/55 R16', active: true },
    { id: 'size-9', name: '215/60 R17', active: true }
  ];

  const tyre_models: TyreModel[] = [
    { id: 'model-1', brand: 'MRF', name: 'ZVTV', active: true },
    { id: 'model-2', brand: 'MRF', name: 'Perfinza', active: true },
    { id: 'model-3', brand: 'MRF', name: 'Wanderer', active: true },
    { id: 'model-4', brand: 'MRF', name: 'ZVT V', active: true },
    { id: 'model-5', brand: 'CEAT', name: 'Milaze', active: true },
    { id: 'model-6', brand: 'CEAT', name: 'SecuraDrive', active: true },
    { id: 'model-7', brand: 'CEAT', name: 'SportDrive', active: true },
    { id: 'model-8', brand: 'Apollo', name: 'Alnac 4G', active: true },
    { id: 'model-9', brand: 'Apollo', name: 'Amazer 4G', active: true },
    { id: 'model-10', brand: 'Bridgestone', name: 'Turanza', active: true },
    { id: 'model-11', brand: 'Bridgestone', name: 'Ecopia', active: true },
    { id: 'model-12', brand: 'Michelin', name: 'Primacy 4', active: true },
    { id: 'model-13', brand: 'Goodyear', name: 'Assurance', active: true },
    { id: 'model-14', brand: 'Yokohama', name: 'Earth-1 E400', active: true }
  ];

  const tyres: Tyre[] = [
    {
      id: 'tyre-101',
      brand: 'MRF',
      model: 'ZVT V',
      size: '145/80 R12',
      category: 'Car Tyre',
      vehicle_type: 'Hatchback (Alto, Eeco)',
      season: 'All-Season',
      pattern: 'Symmetric Rib',
      speed_rating: 'T (190 km/h)',
      load_index: '74',
      purchase_price: 2150,
      selling_price: 2650,
      min_selling_price: 2500,
      gst_rate: 28,
      opening_stock: 50,
      current_stock: 42,
      min_stock_level: 10,
      max_stock_level: 100,
      description: 'Long life radial tyre designed for city hatchbacks.',
      is_active: true,
      created_at: '2026-01-10T10:00:00Z',
      updated_at: '2026-08-10T10:00:00Z'
    },
    {
      id: 'tyre-102',
      brand: 'MRF',
      model: 'ZVTV',
      size: '175/65 R15',
      category: 'Car Tyre',
      vehicle_type: 'Sedan (Honda City, Dzire)',
      season: 'All-Season',
      pattern: 'Asymmetric Premium',
      speed_rating: 'H (210 km/h)',
      load_index: '84',
      purchase_price: 4200,
      selling_price: 5200,
      min_selling_price: 4900,
      gst_rate: 28,
      opening_stock: 40,
      current_stock: 3, // Low stock on purpose for testing threshold
      min_stock_level: 8,
      max_stock_level: 80,
      description: 'Superior grip and wet braking stability for premium sedans.',
      is_active: true,
      created_at: '2026-01-10T10:00:00Z',
      updated_at: '2026-08-11T12:00:00Z'
    },
    {
      id: 'tyre-103',
      brand: 'CEAT',
      model: 'Milaze X3',
      size: '155/65 R13',
      category: 'Car Tyre',
      vehicle_type: 'Hatchback (WagonR, Santro)',
      season: 'All-Season',
      pattern: 'High Mileage Tread',
      speed_rating: 'T (190 km/h)',
      load_index: '73',
      purchase_price: 2400,
      selling_price: 3100,
      min_selling_price: 2950,
      gst_rate: 28,
      opening_stock: 60,
      current_stock: 48,
      min_stock_level: 12,
      max_stock_level: 120,
      description: 'Guaranteed 1,00,000 km durability with high puncture resistance.',
      is_active: true,
      created_at: '2026-01-12T10:00:00Z',
      updated_at: '2026-08-11T14:00:00Z'
    },
    {
      id: 'tyre-104',
      brand: 'Apollo',
      model: 'Alnac 4G',
      size: '185/65 R15',
      category: 'Car Tyre',
      vehicle_type: 'Premium Hatch (i20, Baleno)',
      season: 'All-Season',
      pattern: 'Quiet Drive Tread',
      speed_rating: 'V (240 km/h)',
      load_index: '88',
      purchase_price: 4500,
      selling_price: 5600,
      min_selling_price: 5350,
      gst_rate: 28,
      opening_stock: 35,
      current_stock: 28,
      min_stock_level: 6,
      max_stock_level: 60,
      description: 'High speed directional stability and reduced cabin road noise.',
      is_active: true,
      created_at: '2026-01-15T10:00:00Z',
      updated_at: '2026-08-11T15:00:00Z'
    },
    {
      id: 'tyre-105',
      brand: 'Bridgestone',
      model: 'Turanza T005',
      size: '215/60 R17',
      category: 'SUV Tyre',
      vehicle_type: 'Compact SUV (Creta, Seltos)',
      season: 'All-Season',
      pattern: 'Luxury Touring',
      speed_rating: 'H (210 km/h)',
      load_index: '96',
      purchase_price: 7800,
      selling_price: 9800,
      min_selling_price: 9300,
      gst_rate: 28,
      opening_stock: 20,
      current_stock: 14,
      min_stock_level: 4,
      max_stock_level: 40,
      description: 'Luxury high performance SUV tyre with extreme wet weather safety.',
      is_active: true,
      created_at: '2026-02-01T10:00:00Z',
      updated_at: '2026-08-10T09:00:00Z'
    },
    {
      id: 'tyre-106',
      brand: 'Michelin',
      model: 'Primacy 4ST',
      size: '205/55 R16',
      category: 'Car Tyre',
      vehicle_type: 'Executive Sedan (Civic, Elantra, Octavia)',
      season: 'Summer',
      pattern: 'Silent Tread Tech',
      speed_rating: 'W (270 km/h)',
      load_index: '91',
      purchase_price: 8500,
      selling_price: 10800,
      min_selling_price: 10200,
      gst_rate: 28,
      opening_stock: 15,
      current_stock: 11,
      min_stock_level: 4,
      max_stock_level: 30,
      description: 'Ultra premium comfortable drive with maximum braking efficiency.',
      is_active: true,
      created_at: '2026-02-10T10:00:00Z',
      updated_at: '2026-08-11T11:00:00Z'
    },
    {
      id: 'tyre-107',
      brand: 'CEAT',
      model: 'Gripp X3',
      size: '90/90 R12',
      category: 'Scooter Tyre',
      vehicle_type: 'Scooter (Activa, Jupiter)',
      season: 'All-Season',
      pattern: 'Deep Angular Grooves',
      speed_rating: 'J (100 km/h)',
      load_index: '54',
      purchase_price: 1100,
      selling_price: 1450,
      min_selling_price: 1380,
      gst_rate: 28,
      opening_stock: 80,
      current_stock: 65,
      min_stock_level: 15,
      max_stock_level: 150,
      description: 'High traction dual-compound rubber for urban scooters.',
      is_active: true,
      created_at: '2026-02-15T10:00:00Z',
      updated_at: '2026-08-11T16:00:00Z'
    },
    {
      id: 'tyre-108',
      brand: 'Yokohama',
      model: 'Earth-1 E400',
      size: '195/55 R16',
      category: 'Car Tyre',
      vehicle_type: 'Hatch / Sedan (i20, City)',
      season: 'All-Season',
      pattern: 'Orange Oil Compound',
      speed_rating: 'V (240 km/h)',
      load_index: '87',
      purchase_price: 5200,
      selling_price: 6600,
      min_selling_price: 6300,
      gst_rate: 28,
      opening_stock: 25,
      current_stock: 2, // Low stock
      min_stock_level: 5,
      max_stock_level: 50,
      description: 'Specially engineered for Indian road conditions with sidewall protection.',
      is_active: true,
      created_at: '2026-03-01T10:00:00Z',
      updated_at: '2026-08-12T09:00:00Z'
    }
  ];

  const suppliers: Supplier[] = [
    {
      id: 'sup-1',
      name: 'MRF Regional Depot - North Zone',
      contact_person: 'Ramesh Agarwal',
      mobile: '+91 98111 22334',
      email: 'northdepot@mrfmail.com',
      address: 'Warehouse A4, Transport Nagar, Delhi',
      gstin: '07AAACM1234F1Z1',
      payment_terms: '15 Days Credit',
      opening_balance: 0,
      outstanding_balance: 145000,
      created_at: '2026-01-01T10:00:00Z'
    },
    {
      id: 'sup-2',
      name: 'CEAT India Wholesale Distributors',
      contact_person: 'Sanjay Deshmukh',
      mobile: '+91 98222 33445',
      email: 'sales@ceatdistributors.com',
      address: '22 GT Karnal Road, Outer Ring, Delhi',
      gstin: '07BBBCD5678G1Z2',
      payment_terms: 'Cash / 7 Days',
      opening_balance: 0,
      outstanding_balance: 68000,
      created_at: '2026-01-05T10:00:00Z'
    },
    {
      id: 'sup-3',
      name: 'Apollo Tyres Regional Logistics',
      contact_person: 'Anil Gupta',
      mobile: '+91 98333 44556',
      email: 'delhi.hub@apollotyres.com',
      address: 'Sector 18, Udyog Vihar, Gurugram',
      gstin: '06CCCAP9988H1Z3',
      payment_terms: '30 Days Credit',
      opening_balance: 0,
      outstanding_balance: 0,
      created_at: '2026-01-10T10:00:00Z'
    }
  ];

  const customers: Customer[] = [
    {
      id: 'cust-1',
      customer_code: 'CUST-1001',
      name: 'Sunil Transport Fleet Pvt Ltd',
      mobile: '+91 99100 88221',
      email: 'sunil@suniltransport.com',
      address: 'D-12 Okhla Industrial Area Phase 3, New Delhi',
      gstin: '07AABCS1234D1Z9',
      vehicle_number: 'DL 01 AA 9988',
      vehicle_model: 'Commercial Fleet',
      customer_type: 'fleet',
      credit_limit: 250000,
      outstanding_balance: 42000,
      created_at: '2026-01-15T10:00:00Z'
    },
    {
      id: 'cust-2',
      customer_code: 'CUST-1002',
      name: 'Rohan Malhotra',
      mobile: '+91 98188 55443',
      email: 'rohan.m@gmail.com',
      address: 'House 402, Block B, Vasant Kunj, New Delhi',
      gstin: '',
      vehicle_number: 'DL 08 CZ 1234',
      vehicle_model: 'Honda City ZXi',
      customer_type: 'retail',
      credit_limit: 0,
      outstanding_balance: 0,
      created_at: '2026-02-01T10:00:00Z'
    },
    {
      id: 'cust-3',
      customer_code: 'CUST-1003',
      name: 'Metro Motors & Service Hub',
      mobile: '+91 98711 00998',
      email: 'service@metromotors.in',
      address: 'Main Mathura Road, Badarpur, New Delhi',
      gstin: '07AAFFM4321E1Z0',
      vehicle_number: 'DL 03 EB 5678',
      vehicle_model: 'Dealer / Garage',
      customer_type: 'dealer',
      credit_limit: 150000,
      outstanding_balance: 28600,
      created_at: '2026-02-10T10:00:00Z'
    }
  ];

  const inventory_movements: InventoryMovement[] = [
    {
      id: 'mov-1',
      date: '2026-08-01T10:00:00Z',
      ref_number: 'OP-STOCK-01',
      transaction_type: 'opening_stock',
      tyre_id: 'tyre-101',
      tyre_name: 'MRF ZVT V 145/80 R12',
      qty_in: 50,
      qty_out: 0,
      balance: 50,
      user_id: 'usr-1',
      user_name: 'Rajesh Sharma',
      remarks: 'Initial system opening balance'
    },
    {
      id: 'mov-2',
      date: '2026-08-05T11:30:00Z',
      ref_number: 'PUR-2026-001',
      transaction_type: 'purchase',
      tyre_id: 'tyre-102',
      tyre_name: 'MRF ZVTV 175/65 R15',
      qty_in: 15,
      qty_out: 0,
      balance: 15,
      user_id: 'usr-5',
      user_name: 'Suresh Tech',
      remarks: 'Stock inward from MRF Regional Depot'
    },
    {
      id: 'mov-3',
      date: '2026-08-10T14:15:00Z',
      ref_number: 'INV-2026-1001',
      transaction_type: 'sale',
      tyre_id: 'tyre-102',
      tyre_name: 'MRF ZVTV 175/65 R15',
      qty_in: 0,
      qty_out: 4,
      balance: 11,
      user_id: 'usr-4',
      user_name: 'Amit Kumar',
      remarks: 'Billed on Invoice INV-2026-1001 to Rohan Malhotra'
    },
    {
      id: 'mov-4',
      date: '2026-08-11T16:00:00Z',
      ref_number: 'INV-2026-1002',
      transaction_type: 'sale',
      tyre_id: 'tyre-102',
      tyre_name: 'MRF ZVTV 175/65 R15',
      qty_in: 0,
      qty_out: 8,
      balance: 3,
      user_id: 'usr-4',
      user_name: 'Amit Kumar',
      remarks: 'Billed on Invoice INV-2026-1002 to Sunil Transport'
    }
  ];

  const purchases: Purchase[] = [
    {
      id: 'pur-1',
      purchase_number: 'PUR-2026-001',
      purchase_date: '2026-08-05',
      supplier_id: 'sup-1',
      supplier_name: 'MRF Regional Depot - North Zone',
      supplier_invoice_number: 'MRF/DEL/8841',
      items: [
        {
          id: 'pitem-1',
          tyre_id: 'tyre-102',
          tyre_name: 'MRF ZVTV 175/65 R15',
          size: '175/65 R15',
          quantity: 15,
          purchase_rate: 4200,
          discount: 0,
          gst_rate: 28,
          taxable_amount: 63000,
          gst_amount: 17640,
          total_amount: 80640
        }
      ],
      subtotal: 63000,
      discount: 0,
      taxable_amount: 63000,
      gst_amount: 17640,
      grand_total: 80640,
      payment_status: 'partial',
      payment_mode: 'bank_transfer',
      amount_paid: 40000,
      balance_due: 40640,
      notes: 'Standard batch shipment received in good condition.',
      created_by: 'Suresh Tech',
      created_at: '2026-08-05T11:30:00Z'
    }
  ];

  const sales_invoices: SalesInvoice[] = [
    {
      id: 'inv-1001',
      invoice_number: 'INV-2026-1001',
      invoice_date: '2026-08-10',
      due_date: '2026-08-10',
      customer_id: 'cust-2',
      customer_name: 'Rohan Malhotra',
      customer_mobile: '+91 98188 55443',
      customer_address: 'House 402, Block B, Vasant Kunj, New Delhi',
      customer_gstin: '',
      customer_type: 'retail',
      is_interstate: false,
      items: [
        {
          id: 'sitem-1',
          tyre_id: 'tyre-102',
          tyre_name: 'MRF ZVTV 175/65 R15',
          size: '175/65 R15',
          quantity: 4,
          selling_price: 5200,
          discount: 200,
          taxable_amount: 16093.75,
          gst_rate: 28,
          gst_amount: 4506.25,
          total_amount: 20600
        }
      ],
      subtotal: 20800,
      discount: 200,
      taxable_amount: 16093.75,
      cgst: 2253.125,
      sgst: 2253.125,
      igst: 0,
      total_gst: 4506.25,
      grand_total: 20600,
      amount_paid: 20600,
      balance_due: 0,
      payment_status: 'paid',
      payment_mode: 'upi',
      notes: 'Includes wheel balancing & tubeless valve fitment.',
      created_by: 'Amit Kumar',
      created_at: '2026-08-10T14:15:00Z'
    },
    {
      id: 'inv-1002',
      invoice_number: 'INV-2026-1002',
      invoice_date: '2026-08-11',
      due_date: '2026-08-25',
      customer_id: 'cust-1',
      customer_name: 'Sunil Transport Fleet Pvt Ltd',
      customer_mobile: '+91 99100 88221',
      customer_address: 'D-12 Okhla Industrial Area Phase 3, New Delhi',
      customer_gstin: '07AABCS1234D1Z9',
      customer_type: 'fleet',
      is_interstate: false,
      items: [
        {
          id: 'sitem-2',
          tyre_id: 'tyre-102',
          tyre_name: 'MRF ZVTV 175/65 R15',
          size: '175/65 R15',
          quantity: 8,
          selling_price: 5200,
          discount: 1600,
          taxable_amount: 31250,
          gst_rate: 28,
          gst_amount: 8750,
          total_amount: 40000
        }
      ],
      subtotal: 41600,
      discount: 1600,
      taxable_amount: 31250,
      cgst: 4375,
      sgst: 4375,
      igst: 0,
      total_gst: 8750,
      grand_total: 40000,
      amount_paid: 10000,
      balance_due: 30000,
      payment_status: 'partial',
      payment_mode: 'credit',
      notes: 'Credit term 15 days as per agreement.',
      created_by: 'Amit Kumar',
      created_at: '2026-08-11T16:00:00Z'
    }
  ];

  const employees: Employee[] = [
    {
      id: 'emp-101',
      employee_code: 'EMP-01',
      name: 'Rajesh Sharma',
      mobile: '+91 98765 43210',
      email: 'owner@apextyres.com',
      address: '22 Civil Lines, New Delhi',
      joining_date: '2020-01-01',
      designation: 'owner',
      salary: 120000,
      bank_name: 'HDFC Bank',
      account_number: '5010022334455',
      ifsc_code: 'HDFC0001234',
      status: 'active'
    },
    {
      id: 'emp-102',
      employee_code: 'EMP-02',
      name: 'Vikram Singh',
      mobile: '+91 98765 43211',
      email: 'vikram@apextyres.com',
      address: 'B-14 Janakpuri, New Delhi',
      joining_date: '2022-03-15',
      designation: 'manager',
      salary: 45000,
      bank_name: 'ICICI Bank',
      account_number: '001105012345',
      ifsc_code: 'ICIC0000011',
      status: 'active'
    },
    {
      id: 'emp-103',
      employee_code: 'EMP-03',
      name: 'Priya Verma',
      mobile: '+91 98765 43212',
      email: 'priya@apextyres.com',
      address: 'Sector 4, Rohini, Delhi',
      joining_date: '2023-06-01',
      designation: 'accountant',
      salary: 32000,
      bank_name: 'Axis Bank',
      account_number: '9180100334455',
      ifsc_code: 'UTIB0000918',
      status: 'active'
    },
    {
      id: 'emp-104',
      employee_code: 'EMP-04',
      name: 'Amit Kumar',
      mobile: '+91 98765 43213',
      email: 'amit@apextyres.com',
      address: 'Pocket 2, Dwarka, Delhi',
      joining_date: '2023-09-10',
      designation: 'sales_executive',
      salary: 26000,
      bank_name: 'State Bank of India',
      account_number: '334455667788',
      ifsc_code: 'SBIN0000456',
      status: 'active'
    },
    {
      id: 'emp-105',
      employee_code: 'EMP-05',
      name: 'Suresh Tech',
      mobile: '+91 98765 43214',
      email: 'suresh@apextyres.com',
      address: 'Lajpat Nagar 2, Delhi',
      joining_date: '2024-01-05',
      designation: 'technician',
      salary: 22000,
      bank_name: 'Punjab National Bank',
      account_number: '012300011223',
      ifsc_code: 'PUNB0012300',
      status: 'active'
    }
  ];

  const todayStr = '2026-08-12';
  const attendance: AttendanceRecord[] = [
    { id: 'att-1', employee_id: 'emp-101', employee_name: 'Rajesh Sharma', date: todayStr, status: 'present', remarks: 'On time' },
    { id: 'att-2', employee_id: 'emp-102', employee_name: 'Vikram Singh', date: todayStr, status: 'present', remarks: 'Morning shift' },
    { id: 'att-3', employee_id: 'emp-103', employee_name: 'Priya Verma', date: todayStr, status: 'present', remarks: 'Accounts desk' },
    { id: 'att-4', employee_id: 'emp-104', employee_name: 'Amit Kumar', date: todayStr, status: 'present', remarks: 'Sales counter' },
    { id: 'att-5', employee_id: 'emp-105', employee_name: 'Suresh Tech', date: todayStr, status: 'present', remarks: 'Alignment bay' }
  ];

  const salaries: SalarySlip[] = [
    {
      id: 'sal-2026-07-102',
      pay_period: '2026-07',
      employee_id: 'emp-102',
      employee_name: 'Vikram Singh',
      designation: 'Manager',
      basic_salary: 30000,
      allowances: 15000,
      overtime: 2000,
      bonus: 1000,
      gross_salary: 48000,
      deductions: 2000,
      advance: 0,
      leave_deduction: 0,
      net_salary: 46000,
      working_days: 26,
      present_days: 26,
      absent_days: 0,
      payment_status: 'paid',
      payment_date: '2026-08-01',
      generated_at: '2026-07-31T18:00:00Z'
    }
  ];

  const audit_logs: AuditLog[] = [
    {
      id: 'log-1',
      timestamp: '2026-08-01T10:00:00Z',
      user_name: 'Rajesh Sharma',
      user_role: 'admin',
      action: 'System Initialized',
      module: 'Settings',
      new_value: 'Apex Tyre Care & Alignment Hub initialized with default master catalogue.'
    },
    {
      id: 'log-2',
      timestamp: '2026-08-10T14:15:00Z',
      user_name: 'Amit Kumar',
      user_role: 'sales',
      action: 'Create Invoice',
      module: 'Sales & Invoices',
      new_value: 'Generated Invoice INV-2026-1001 for ₹20,600 (Rohan Malhotra)'
    },
    {
      id: 'log-3',
      timestamp: '2026-08-11T16:00:00Z',
      user_name: 'Amit Kumar',
      user_role: 'sales',
      action: 'Create Invoice',
      module: 'Sales & Invoices',
      new_value: 'Generated Invoice INV-2026-1002 for ₹40,000 (Sunil Transport)'
    }
  ];

  return {
    users,
    tyre_categories,
    tyre_brands,
    tyre_sizes,
    tyre_models,
    tyres,
    inventory_movements,
    suppliers,
    purchases,
    purchase_returns: [],
    customers,
    sales_invoices,
    sales_returns: [],
    payments: [],
    employees,
    attendance,
    salaries,
    audit_logs,
    settings: DEFAULT_SETTINGS
  };
}

export class DBStore {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to parse DB file, regenerating default data:', e);
    }
    const initial = generateInitialData();
    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave?: DatabaseSchema) {
    try {
      const data = dataToSave || this.data;
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to write DB file:', e);
    }
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }

  public logAudit(user_name: string, user_role: string, action: string, module: string, previous_value?: string, new_value?: string) {
    const log: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      user_name,
      user_role,
      action,
      module,
      previous_value,
      new_value
    };
    this.data.audit_logs.unshift(log);
    this.saveData();
  }

  // Settings
  public getSettings(): BusinessSettings {
    return this.data.settings;
  }

  public updateSettings(settings: BusinessSettings, user_name: string = 'Admin'): BusinessSettings {
    const old = JSON.stringify(this.data.settings);
    this.data.settings = { ...this.data.settings, ...settings };
    this.logAudit(user_name, 'admin', 'Update Settings', 'Settings', old, JSON.stringify(this.data.settings));
    this.saveData();
    return this.data.settings;
  }

  // Dashboard Stats
  public getDashboardStats(): DashboardStats {
    const todayStr = new Date().toISOString().split('T')[0];
    const tyres = this.data.tyres.filter(t => t.is_active);

    const total_tyres_in_stock = tyres.reduce((acc, t) => acc + t.current_stock, 0);
    const total_inventory_value = tyres.reduce((acc, t) => acc + (t.current_stock * t.purchase_price), 0);

    const low_stock_threshold = this.data.settings.low_stock_threshold || 5;
    const low_stock_items = tyres.filter(t => t.current_stock <= (t.min_stock_level || low_stock_threshold));
    const low_stock_count = low_stock_items.length;

    // Today stock-out: items whose stock became 0 today or currently 0
    const today_stock_out_items = tyres.filter(t => t.current_stock === 0);
    const today_stock_out_count = today_stock_out_items.length;

    // Today sales
    const todayInvoices = this.data.sales_invoices.filter(inv => inv.invoice_date.startsWith(todayStr) && inv.payment_status !== 'cancelled');
    const today_sales = todayInvoices.reduce((acc, inv) => acc + inv.grand_total, 0);

    // Today sales profit calculation: sum(qty * (selling_price - purchase_price))
    let today_profit = 0;
    todayInvoices.forEach(inv => {
      inv.items.forEach(item => {
        const tyre = tyres.find(t => t.id === item.tyre_id);
        const pPrice = tyre ? tyre.purchase_price : (item.selling_price * 0.75);
        today_profit += item.quantity * (item.selling_price - pPrice);
      });
    });

    // Today purchase
    const todayPurchases = this.data.purchases.filter(p => p.purchase_date.startsWith(todayStr));
    const today_purchase = todayPurchases.reduce((acc, p) => acc + p.grand_total, 0);

    // Receivables & Payables
    const outstanding_receivables = this.data.customers.reduce((acc, c) => acc + (c.outstanding_balance || 0), 0);
    const outstanding_payables = this.data.suppliers.reduce((acc, s) => acc + (s.outstanding_balance || 0), 0);

    // Brand-wise Stock
    const brandMap: { [brand: string]: { quantity: number; value: number } } = {};
    this.data.tyre_brands.filter(b => b.active).forEach(b => { brandMap[b.name] = { quantity: 0, value: 0 }; });
    tyres.forEach(t => {
      if (!brandMap[t.brand]) brandMap[t.brand] = { quantity: 0, value: 0 };
      brandMap[t.brand].quantity += t.current_stock;
      brandMap[t.brand].value += t.current_stock * t.purchase_price;
    });
    const brand_wise_stock = Object.keys(brandMap).map(brand => ({
      brand,
      quantity: brandMap[brand].quantity,
      value: brandMap[brand].value
    }));

    // Size-wise Stock
    const sizeMap: { [size: string]: { quantity: number; value: number; is_low: boolean } } = {};
    tyres.forEach(t => {
      if (!sizeMap[t.size]) sizeMap[t.size] = { quantity: 0, value: 0, is_low: false };
      sizeMap[t.size].quantity += t.current_stock;
      sizeMap[t.size].value += t.current_stock * t.purchase_price;
      if (t.current_stock <= t.min_stock_level) {
        sizeMap[t.size].is_low = true;
      }
    });
    const size_wise_stock = Object.keys(sizeMap).map(size => ({
      size,
      quantity: sizeMap[size].quantity,
      value: sizeMap[size].value,
      is_low: sizeMap[size].is_low
    }));

    // Sales chart: last 7 days sales
    const sales_chart: Array<{ date: string; sales: number; profit: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      const dayInvs = this.data.sales_invoices.filter(inv => inv.invoice_date.startsWith(ds) && inv.payment_status !== 'cancelled');
      const daySales = dayInvs.reduce((acc, inv) => acc + inv.grand_total, 0);
      let dayProf = 0;
      dayInvs.forEach(inv => {
        inv.items.forEach(item => {
          const tyre = tyres.find(t => t.id === item.tyre_id);
          const pPrice = tyre ? tyre.purchase_price : (item.selling_price * 0.75);
          dayProf += item.quantity * (item.selling_price - pPrice);
        });
      });
      sales_chart.push({
        date: ds.substring(5), // MM-DD
        sales: daySales,
        profit: dayProf
      });
    }

    return {
      total_tyres_in_stock,
      total_inventory_value,
      low_stock_count,
      today_stock_out_count,
      today_sales,
      today_purchase,
      today_profit,
      outstanding_receivables,
      outstanding_payables,
      brand_wise_stock,
      size_wise_stock,
      low_stock_items,
      today_stock_out_items,
      sales_chart
    };
  }

  // Tyres Master & Inventory
  public getTyres(): Tyre[] {
    return this.data.tyres;
  }

  public getTyreById(id: string): Tyre | undefined {
    return this.data.tyres.find(t => t.id === id);
  }

  public createTyre(tyreData: Omit<Tyre, 'id' | 'created_at' | 'updated_at'>, user_name: string = 'Admin'): Tyre {
    // Check duplicate tyre (same brand + model + size)
    if (this.data.tyres.some(t =>
      t.brand.toLowerCase() === tyreData.brand.toLowerCase() &&
      t.model.toLowerCase() === tyreData.model.toLowerCase() &&
      t.size.toLowerCase() === tyreData.size.toLowerCase()
    )) {
      throw new Error(`A tyre with brand "${tyreData.brand}", model "${tyreData.model}" and size "${tyreData.size}" already exists.`);
    }

    const id = 'tyre-' + Date.now();
    const newTyre: Tyre = {
      ...tyreData,
      id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.data.tyres.unshift(newTyre);

    // Initial stock movement record if opening stock > 0
    if (newTyre.opening_stock > 0) {
      const mov: InventoryMovement = {
        id: 'mov-' + Date.now(),
        date: new Date().toISOString(),
        ref_number: 'OP-STOCK-' + id.substring(5),
        transaction_type: 'opening_stock',
        tyre_id: id,
        tyre_name: `${newTyre.brand} ${newTyre.model} ${newTyre.size}`,
        qty_in: newTyre.opening_stock,
        qty_out: 0,
        balance: newTyre.opening_stock,
        user_id: 'usr-1',
        user_name,
        remarks: 'Initial opening stock upon creation'
      };
      this.data.inventory_movements.unshift(mov);
    }

    this.logAudit(user_name, 'admin', 'Add Tyre Master', 'Tyre Master', undefined, `${newTyre.brand} ${newTyre.model} ${newTyre.size}`);
    this.saveData();
    return newTyre;
  }

  public updateTyre(id: string, updates: Partial<Tyre>, user_name: string = 'Admin'): Tyre {
    const idx = this.data.tyres.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Tyre not found');

    const prev = { ...this.data.tyres[idx] };
    this.data.tyres[idx] = {
      ...this.data.tyres[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };

    this.logAudit(user_name, 'admin', 'Update Tyre Master', 'Tyre Master', `${prev.brand} ${prev.model}, Price: ${prev.selling_price}`, `${this.data.tyres[idx].brand} ${this.data.tyres[idx].model}, Price: ${this.data.tyres[idx].selling_price}`);
    this.saveData();
    return this.data.tyres[idx];
  }

  // Stock Adjustment
  public adjustStock(tyre_id: string, qtyChange: number, type: 'stock_adjustment' | 'damaged' | 'lost' | 'manual_correction', remarks: string, user_name: string = 'Manager') {
    const tyre = this.getTyreById(tyre_id);
    if (!tyre) throw new Error('Tyre not found');

    const newStock = tyre.current_stock + qtyChange;
    if (newStock < 0 && !this.data.settings.allow_negative_stock) {
      throw new Error(`Insufficient stock. Cannot adjust stock below 0. Current: ${tyre.current_stock}`);
    }

    tyre.current_stock = newStock;
    tyre.updated_at = new Date().toISOString();

    const mov: InventoryMovement = {
      id: 'mov-' + Date.now(),
      date: new Date().toISOString(),
      ref_number: 'ADJ-' + Date.now().toString().slice(-6),
      transaction_type: type,
      tyre_id: tyre.id,
      tyre_name: `${tyre.brand} ${tyre.model} ${tyre.size}`,
      qty_in: qtyChange > 0 ? qtyChange : 0,
      qty_out: qtyChange < 0 ? Math.abs(qtyChange) : 0,
      balance: newStock,
      user_id: 'usr-2',
      user_name,
      remarks
    };
    this.data.inventory_movements.unshift(mov);

    this.logAudit(user_name, 'manager', 'Adjust Stock', 'Inventory', `Stock was ${tyre.current_stock - qtyChange}`, `New stock is ${newStock} (${remarks})`);
    this.saveData();
    return tyre;
  }

  // Purchases & Purchase Return
  public createPurchase(purchaseData: Omit<Purchase, 'id' | 'purchase_number' | 'created_at'>, user_name: string = 'Storekeeper'): Purchase {
    const purchase_number = 'PUR-2026-' + (this.data.purchases.length + 101);
    const id = 'pur-' + Date.now();

    const newPurchase: Purchase = {
      ...purchaseData,
      id,
      purchase_number,
      created_at: new Date().toISOString()
    };

    // ATOMIC TRANSACTION: Increase stock for each item
    newPurchase.items.forEach(item => {
      const tyre = this.getTyreById(item.tyre_id);
      if (tyre) {
        tyre.current_stock += item.quantity;
        tyre.updated_at = new Date().toISOString();

        // Record Movement
        const mov: InventoryMovement = {
          id: 'mov-' + Date.now() + '-' + Math.floor(Math.random() * 100),
          date: newPurchase.purchase_date,
          ref_number: purchase_number,
          transaction_type: 'purchase',
          tyre_id: tyre.id,
          tyre_name: `${tyre.brand} ${tyre.model} ${tyre.size}`,
          qty_in: item.quantity,
          qty_out: 0,
          balance: tyre.current_stock,
          user_id: 'usr-5',
          user_name,
          remarks: `Purchased from ${newPurchase.supplier_name} (Inv: ${newPurchase.supplier_invoice_number})`
        };
        this.data.inventory_movements.unshift(mov);
      }
    });

    // Update supplier outstanding balance if partial / unpaid
    const supplier = this.data.suppliers.find(s => s.id === newPurchase.supplier_id);
    if (supplier) {
      supplier.outstanding_balance += newPurchase.balance_due;
    }

    this.data.purchases.unshift(newPurchase);
    this.logAudit(user_name, 'storekeeper', 'Create Purchase', 'Purchases', undefined, `Created ${purchase_number} total ₹${newPurchase.grand_total}`);
    this.saveData();
    return newPurchase;
  }

  public createPurchaseReturn(returnData: Omit<PurchaseReturn, 'id' | 'return_number' | 'created_at'>, user_name: string = 'Storekeeper'): PurchaseReturn {
    const return_number = 'PRET-2026-' + (this.data.purchase_returns.length + 101);
    const id = 'pret-' + Date.now();

    const newReturn: PurchaseReturn = {
      ...returnData,
      id,
      return_number,
      created_at: new Date().toISOString()
    };

    // Decrease stock
    newReturn.items.forEach(item => {
      const tyre = this.getTyreById(item.tyre_id);
      if (tyre) {
        tyre.current_stock = Math.max(0, tyre.current_stock - item.quantity);
        tyre.updated_at = new Date().toISOString();

        const mov: InventoryMovement = {
          id: 'mov-' + Date.now() + '-' + Math.floor(Math.random() * 100),
          date: newReturn.return_date,
          ref_number: return_number,
          transaction_type: 'purchase_return',
          tyre_id: tyre.id,
          tyre_name: tyre.brand + ' ' + tyre.model,
          qty_in: 0,
          qty_out: item.quantity,
          balance: tyre.current_stock,
          user_id: 'usr-5',
          user_name,
          remarks: `Returned to ${newReturn.supplier_name}: ${newReturn.reason}`
        };
        this.data.inventory_movements.unshift(mov);
      }
    });

    // Update supplier balance
    const supplier = this.data.suppliers.find(s => s.id === newReturn.supplier_id);
    if (supplier) {
      supplier.outstanding_balance = Math.max(0, supplier.outstanding_balance - newReturn.total_refund);
    }

    this.data.purchase_returns.unshift(newReturn);
    this.logAudit(user_name, 'storekeeper', 'Purchase Return', 'Purchases', undefined, `Processed Purchase Return ${return_number} for ₹${newReturn.total_refund}`);
    this.saveData();
    return newReturn;
  }

  // Sales & Invoices (ATOMIC INVENTORY DEDUCTION)
  public createSalesInvoice(invoiceData: Omit<SalesInvoice, 'id' | 'invoice_number' | 'created_at'>, user_name: string = 'Sales Executive'): SalesInvoice {
    // 1. VALIDATION: Check stock for all requested tyres
    for (const item of invoiceData.items) {
      const tyre = this.getTyreById(item.tyre_id);
      if (!tyre) {
        throw new Error(`Tyre item not found: ${item.tyre_name}`);
      }
      if (tyre.current_stock < item.quantity && !this.data.settings.allow_negative_stock) {
        throw new Error(`Insufficient stock for "${tyre.brand} ${tyre.model} (${tyre.size})". Requested: ${item.quantity}, Available: ${tyre.current_stock} units.`);
      }
    }

    // Generate Invoice Number
    const prefix = this.data.settings.invoice_prefix || 'INV-2026-';
    const nextNo = (this.data.settings.starting_number || 1000) + this.data.sales_invoices.length + 1;
    const invoice_number = `${prefix}${nextNo}`;
    const id = 'inv-' + Date.now();

    const newInvoice: SalesInvoice = {
      ...invoiceData,
      id,
      invoice_number,
      created_at: new Date().toISOString()
    };

    // 2. ATOMIC TRANSACTION: Deduct Stock and record inventory movements
    newInvoice.items.forEach(item => {
      const tyre = this.getTyreById(item.tyre_id)!;
      tyre.current_stock -= item.quantity;
      tyre.updated_at = new Date().toISOString();

      const mov: InventoryMovement = {
        id: 'mov-' + Date.now() + '-' + Math.floor(Math.random() * 100),
        date: newInvoice.invoice_date,
        ref_number: invoice_number,
        transaction_type: 'sale',
        tyre_id: tyre.id,
        tyre_name: `${tyre.brand} ${tyre.model} ${tyre.size}`,
        qty_in: 0,
        qty_out: item.quantity,
        balance: tyre.current_stock,
        user_id: 'usr-4',
        user_name,
        remarks: `Billed to ${newInvoice.customer_name}`
      };
      this.data.inventory_movements.unshift(mov);
    });

    // 3. Update customer outstanding balance if credit/partial
    if (newInvoice.customer_id) {
      const customer = this.data.customers.find(c => c.id === newInvoice.customer_id);
      if (customer) {
        customer.outstanding_balance += newInvoice.balance_due;
      }
    }

    this.data.sales_invoices.unshift(newInvoice);
    this.logAudit(user_name, 'sales', 'Create Sales Invoice', 'Sales & Invoices', undefined, `Generated ${invoice_number} for ₹${newInvoice.grand_total} (${newInvoice.customer_name})`);
    this.saveData();
    return newInvoice;
  }

  // Cancel Invoice & Restore Inventory
  public cancelSalesInvoice(invoice_id: string, reason: string = 'Cancelled by user', user_name: string = 'Admin'): SalesInvoice {
    const inv = this.data.sales_invoices.find(i => i.id === invoice_id);
    if (!inv) throw new Error('Invoice not found');
    if (inv.payment_status === 'cancelled') throw new Error('Invoice is already cancelled');

    inv.payment_status = 'cancelled';

    // ATOMIC RESTORE INVENTORY
    inv.items.forEach(item => {
      const tyre = this.getTyreById(item.tyre_id);
      if (tyre) {
        tyre.current_stock += item.quantity;
        tyre.updated_at = new Date().toISOString();

        const mov: InventoryMovement = {
          id: 'mov-' + Date.now() + '-' + Math.floor(Math.random() * 100),
          date: new Date().toISOString(),
          ref_number: inv.invoice_number + '-CANCEL',
          transaction_type: 'manual_correction',
          tyre_id: tyre.id,
          tyre_name: `${tyre.brand} ${tyre.model} ${tyre.size}`,
          qty_in: item.quantity,
          qty_out: 0,
          balance: tyre.current_stock,
          user_id: 'usr-1',
          user_name,
          remarks: `Stock restored from cancelled invoice ${inv.invoice_number}`
        };
        this.data.inventory_movements.unshift(mov);
      }
    });

    // Revert customer outstanding balance
    if (inv.customer_id && inv.balance_due > 0) {
      const customer = this.data.customers.find(c => c.id === inv.customer_id);
      if (customer) {
        customer.outstanding_balance = Math.max(0, customer.outstanding_balance - inv.balance_due);
      }
    }

    this.logAudit(user_name, 'admin', 'Cancel Sales Invoice', 'Sales & Invoices', `Status: ${inv.payment_status}`, `Cancelled ${inv.invoice_number} Reason: ${reason}`);
    this.saveData();
    return inv;
  }

  // Sales Return
  public createSalesReturn(returnData: Omit<SalesReturn, 'id' | 'return_number' | 'created_at'>, user_name: string = 'Manager'): SalesReturn {
    const return_number = 'SRET-2026-' + (this.data.sales_returns.length + 101);
    const id = 'sret-' + Date.now();

    const newReturn: SalesReturn = {
      ...returnData,
      id,
      return_number,
      created_at: new Date().toISOString()
    };

    // Restore stock
    newReturn.items.forEach(item => {
      const tyre = this.getTyreById(item.tyre_id);
      if (tyre) {
        tyre.current_stock += item.quantity;
        tyre.updated_at = new Date().toISOString();

        const mov: InventoryMovement = {
          id: 'mov-' + Date.now() + '-' + Math.floor(Math.random() * 100),
          date: newReturn.return_date,
          ref_number: return_number,
          transaction_type: 'sales_return',
          tyre_id: tyre.id,
          tyre_name: tyre.brand + ' ' + tyre.model,
          qty_in: item.quantity,
          qty_out: 0,
          balance: tyre.current_stock,
          user_id: 'usr-2',
          user_name,
          remarks: `Customer Return (${newReturn.customer_name}): ${newReturn.reason}`
        };
        this.data.inventory_movements.unshift(mov);
      }
    });

    // Reduce customer balance
    if (newReturn.customer_id) {
      const customer = this.data.customers.find(c => c.id === newReturn.customer_id);
      if (customer) {
        customer.outstanding_balance = Math.max(0, customer.outstanding_balance - newReturn.total_refund);
      }
    }

    this.data.sales_returns.unshift(newReturn);
    this.logAudit(user_name, 'manager', 'Sales Return', 'Sales & Invoices', undefined, `Processed Sales Return ${return_number} for ₹${newReturn.total_refund}`);
    this.saveData();
    return newReturn;
  }

  // Customer Management
  public createCustomer(custData: Omit<Customer, 'id' | 'customer_code' | 'created_at'>, user_name: string = 'Sales'): Customer {
    const customer_code = 'CUST-' + (1001 + this.data.customers.length);
    const newCust: Customer = {
      ...custData,
      id: 'cust-' + Date.now(),
      customer_code,
      outstanding_balance: custData.outstanding_balance || 0,
      created_at: new Date().toISOString()
    };
    this.data.customers.unshift(newCust);
    this.logAudit(user_name, 'sales', 'Add Customer', 'Customers', undefined, `${newCust.name} (${customer_code})`);
    this.saveData();
    return newCust;
  }

  public getCustomerHistory(customer_id: string) {
    const customer = this.data.customers.find(c => c.id === customer_id);
    if (!customer) throw new Error('Customer not found');

    const invoices = this.data.sales_invoices.filter(i => i.customer_id === customer_id);
    const returns = this.data.sales_returns.filter(r => r.customer_id === customer_id);
    const payments = this.data.payments.filter(p => p.party_id === customer_id);

    const total_purchases_amount = invoices.reduce((acc, i) => acc + (i.payment_status !== 'cancelled' ? i.grand_total : 0), 0);

    return {
      customer,
      total_invoices: invoices.length,
      total_purchases_amount,
      outstanding_balance: customer.outstanding_balance,
      invoices,
      returns,
      payments
    };
  }

  // Supplier Management
  public createSupplier(supData: Omit<Supplier, 'id' | 'created_at'>, user_name: string = 'Admin'): Supplier {
    const newSup: Supplier = {
      ...supData,
      id: 'sup-' + Date.now(),
      outstanding_balance: supData.opening_balance || 0,
      created_at: new Date().toISOString()
    };
    this.data.suppliers.unshift(newSup);
    this.logAudit(user_name, 'admin', 'Add Supplier', 'Suppliers', undefined, newSup.name);
    this.saveData();
    return newSup;
  }

  public getSupplierHistory(supplier_id: string) {
    const supplier = this.data.suppliers.find(s => s.id === supplier_id);
    if (!supplier) throw new Error('Supplier not found');

    const purchases = this.data.purchases.filter(p => p.supplier_id === supplier_id);
    const returns = this.data.purchase_returns.filter(r => r.supplier_id === supplier_id);
    const payments = this.data.payments.filter(p => p.party_id === supplier_id);

    return {
      supplier,
      purchases,
      returns,
      payments
    };
  }

  // Record Payments
  public createPayment(paymentData: Omit<Payment, 'id' | 'payment_number'>, user_name: string = 'Accountant'): Payment {
    const payment_number = 'PAY-' + Date.now().toString().slice(-6);
    const payment: Payment = {
      ...paymentData,
      id: 'pay-' + Date.now(),
      payment_number
    };

    if (payment.type === 'customer_payment') {
      const cust = this.data.customers.find(c => c.id === payment.party_id);
      if (cust) {
        cust.outstanding_balance = Math.max(0, cust.outstanding_balance - payment.amount);
      }
    } else {
      const sup = this.data.suppliers.find(s => s.id === payment.party_id);
      if (sup) {
        sup.outstanding_balance = Math.max(0, sup.outstanding_balance - payment.amount);
      }
    }

    this.data.payments.unshift(payment);
    this.logAudit(user_name, 'accountant', 'Record Payment', 'Payments', undefined, `Received ₹${payment.amount} for ${payment.party_name}`);
    this.saveData();
    return payment;
  }

  // Employees, Attendance, Payroll
  public createEmployee(empData: Omit<Employee, 'id' | 'employee_code'>, user_name: string = 'Admin'): Employee {
    const employee_code = 'EMP-' + (this.data.employees.length + 1).toString().padStart(2, '0');
    const emp: Employee = {
      ...empData,
      id: 'emp-' + Date.now(),
      employee_code
    };
    this.data.employees.unshift(emp);
    this.logAudit(user_name, 'admin', 'Add Employee', 'Employees', undefined, `${emp.name} (${employee_code})`);
    this.saveData();
    return emp;
  }

  public recordAttendance(records: AttendanceRecord[], user_name: string = 'Manager') {
    records.forEach(rec => {
      const existingIdx = this.data.attendance.findIndex(a => a.employee_id === rec.employee_id && a.date === rec.date);
      if (existingIdx !== -1) {
        this.data.attendance[existingIdx] = { ...this.data.attendance[existingIdx], ...rec };
      } else {
        this.data.attendance.unshift({ ...rec, id: 'att-' + Date.now() + '-' + Math.floor(Math.random() * 100) });
      }
    });
    this.logAudit(user_name, 'manager', 'Record Attendance', 'Attendance', undefined, `Marked attendance for ${records.length} employees on ${records[0]?.date}`);
    this.saveData();
    return this.data.attendance;
  }

  public generateSalarySlip(payPeriod: string, employee_id: string, allowances: number, bonus: number, deductions: number, advance: number, user_name: string = 'Accountant'): SalarySlip {
    const emp = this.data.employees.find(e => e.id === employee_id);
    if (!emp) throw new Error('Employee not found');

    const basic_salary = emp.salary;
    const gross_salary = basic_salary + allowances + bonus;
    const net_salary = Math.max(0, gross_salary - (deductions + advance));

    const slip: SalarySlip = {
      id: `sal-${payPeriod}-${emp.employee_code}`,
      pay_period: payPeriod,
      employee_id: emp.id,
      employee_name: emp.name,
      designation: emp.designation,
      basic_salary,
      allowances,
      overtime: 0,
      bonus,
      gross_salary,
      deductions,
      advance,
      leave_deduction: 0,
      net_salary,
      working_days: 26,
      present_days: 26,
      absent_days: 0,
      payment_status: 'paid',
      payment_date: new Date().toISOString().split('T')[0],
      generated_at: new Date().toISOString()
    };

    const existingIdx = this.data.salaries.findIndex(s => s.pay_period === payPeriod && s.employee_id === employee_id);
    if (existingIdx !== -1) {
      this.data.salaries[existingIdx] = slip;
    } else {
      this.data.salaries.unshift(slip);
    }

    this.logAudit(user_name, 'accountant', 'Generate Salary Slip', 'Salary / Payroll', undefined, `Generated Slip for ${emp.name} (${payPeriod}): Net ₹${net_salary}`);
    this.saveData();
    return slip;
  }

  // Users & Roles (Admin -> Users & Roles)
  public getUsers(): User[] {
    return this.data.users;
  }

  public createUser(userData: { name: string; username: string; email: string; role: User['role']; phone?: string; permissions?: Partial<Record<Permission, boolean>> }, user_name: string = 'Admin'): User {
    if (this.data.users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
      throw new Error('Username already exists');
    }
    const newUser: User = {
      id: 'usr-' + Date.now(),
      name: userData.name,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      phone: userData.phone || '',
      active: true,
      permissions: userData.permissions || {}
    };
    this.data.users.unshift(newUser);
    this.logAudit(user_name, 'admin', 'Create User', 'Users & Roles', undefined, `${newUser.name} (${newUser.username}) as ${newUser.role}`);
    this.saveData();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<Pick<User, 'role' | 'permissions' | 'active' | 'name' | 'email' | 'phone'>>, user_name: string = 'Admin'): User {
    const user = this.data.users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    const prevRole = user.role;
    const prevActive = user.active;
    Object.assign(user, updates);
    if (updates.role && updates.role !== prevRole) {
      this.logAudit(user_name, 'admin', 'Change User Role', 'Users & Roles', prevRole, updates.role);
    }
    if (typeof updates.active === 'boolean' && updates.active !== prevActive) {
      this.logAudit(user_name, 'admin', updates.active ? 'Activate User' : 'Deactivate User', 'Users & Roles', String(prevActive), String(updates.active));
    }
    if (updates.permissions) {
      this.logAudit(user_name, 'admin', 'Update Permissions', 'Users & Roles', undefined, `${user.name}: ${JSON.stringify(updates.permissions)}`);
    }
    this.saveData();
    return user;
  }

  public resetUserLogin(id: string, user_name: string = 'Admin'): { message: string } {
    const user = this.data.users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    this.logAudit(user_name, 'admin', 'Reset Login', 'Users & Roles', undefined, `Login reset for ${user.name}`);
    this.saveData();
    return { message: `Login credentials reset for ${user.name}. They will be prompted to set a new password on next sign-in.` };
  }

  // ---- Master Data: Brands / Categories / Sizes / Models ----
  // Generic helpers over a MasterListItem[] collection.
  private createMasterItem(list: MasterListItem[], name: string, label: string, idPrefix: string, user_name: string): MasterListItem {
    const trimmed = name.trim();
    if (!trimmed) throw new Error(`${label} name is required`);
    if (list.some(i => i.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`${label} "${trimmed}" already exists`);
    }
    const item: MasterListItem = { id: `${idPrefix}-${Date.now()}`, name: trimmed, active: true };
    list.unshift(item);
    this.logAudit(user_name, 'admin', `Add ${label}`, 'Master Data', undefined, trimmed);
    this.saveData();
    return item;
  }

  private updateMasterItem(list: MasterListItem[], id: string, updates: Partial<Pick<MasterListItem, 'name' | 'active'>>, label: string, user_name: string): MasterListItem {
    const item = list.find(i => i.id === id);
    if (!item) throw new Error(`${label} not found`);
    const prevName = item.name;
    Object.assign(item, updates);
    this.logAudit(user_name, 'admin', `Update ${label}`, 'Master Data', prevName, item.name + (updates.active === false ? ' (Deactivated)' : updates.active === true ? ' (Activated)' : ''));
    this.saveData();
    return item;
  }

  private deleteMasterItem(list: MasterListItem[], id: string, label: string, inUse: boolean, user_name: string): void {
    const item = list.find(i => i.id === id);
    if (!item) throw new Error(`${label} not found`);
    if (inUse) throw new Error(`Cannot delete "${item.name}" - it is used by existing tyres. Deactivate it instead.`);
    const idx = list.indexOf(item);
    list.splice(idx, 1);
    this.logAudit(user_name, 'admin', `Delete ${label}`, 'Master Data', item.name, undefined);
    this.saveData();
  }

  public getBrands(): MasterListItem[] { return this.data.tyre_brands; }
  public createBrand(name: string, user_name: string = 'Admin'): MasterListItem {
    return this.createMasterItem(this.data.tyre_brands, name, 'Brand', 'brand', user_name);
  }
  public updateBrand(id: string, updates: Partial<Pick<MasterListItem, 'name' | 'active'>>, user_name: string = 'Admin'): MasterListItem {
    return this.updateMasterItem(this.data.tyre_brands, id, updates, 'Brand', user_name);
  }
  public deleteBrand(id: string, user_name: string = 'Admin'): void {
    const brand = this.data.tyre_brands.find(b => b.id === id);
    const inUse = !!brand && this.data.tyres.some(t => t.brand === brand.name);
    this.deleteMasterItem(this.data.tyre_brands, id, 'Brand', inUse, user_name);
  }

  public getCategories(): MasterListItem[] { return this.data.tyre_categories; }
  public createCategory(name: string, user_name: string = 'Admin'): MasterListItem {
    return this.createMasterItem(this.data.tyre_categories, name, 'Category', 'cat', user_name);
  }
  public updateCategory(id: string, updates: Partial<Pick<MasterListItem, 'name' | 'active'>>, user_name: string = 'Admin'): MasterListItem {
    return this.updateMasterItem(this.data.tyre_categories, id, updates, 'Category', user_name);
  }
  public deleteCategory(id: string, user_name: string = 'Admin'): void {
    const cat = this.data.tyre_categories.find(c => c.id === id);
    const inUse = !!cat && this.data.tyres.some(t => t.category === cat.name);
    this.deleteMasterItem(this.data.tyre_categories, id, 'Category', inUse, user_name);
  }

  public getSizes(): MasterListItem[] { return this.data.tyre_sizes; }
  public createSize(name: string, user_name: string = 'Admin'): MasterListItem {
    return this.createMasterItem(this.data.tyre_sizes, name, 'Tyre Size', 'size', user_name);
  }
  public updateSize(id: string, updates: Partial<Pick<MasterListItem, 'name' | 'active'>>, user_name: string = 'Admin'): MasterListItem {
    return this.updateMasterItem(this.data.tyre_sizes, id, updates, 'Tyre Size', user_name);
  }
  public deleteSize(id: string, user_name: string = 'Admin'): void {
    const size = this.data.tyre_sizes.find(s => s.id === id);
    const inUse = !!size && this.data.tyres.some(t => t.size === size.name);
    this.deleteMasterItem(this.data.tyre_sizes, id, 'Tyre Size', inUse, user_name);
  }

  public getModels(): TyreModel[] { return this.data.tyre_models; }
  public createModel(brand: string, name: string, user_name: string = 'Admin'): TyreModel {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Model name is required');
    if (!brand) throw new Error('A brand must be selected for this model');
    if (this.data.tyre_models.some(m => m.brand === brand && m.name.toLowerCase() === trimmed.toLowerCase())) {
      throw new Error(`Model "${trimmed}" already exists under ${brand}`);
    }
    const model: TyreModel = { id: 'model-' + Date.now(), brand, name: trimmed, active: true };
    this.data.tyre_models.unshift(model);
    this.logAudit(user_name, 'admin', 'Add Tyre Model', 'Master Data', undefined, `${brand} - ${trimmed}`);
    this.saveData();
    return model;
  }
  public updateModel(id: string, updates: Partial<Pick<TyreModel, 'name' | 'active' | 'brand'>>, user_name: string = 'Admin'): TyreModel {
    const model = this.data.tyre_models.find(m => m.id === id);
    if (!model) throw new Error('Tyre Model not found');
    const prevName = `${model.brand} - ${model.name}`;
    Object.assign(model, updates);
    this.logAudit(user_name, 'admin', 'Update Tyre Model', 'Master Data', prevName, `${model.brand} - ${model.name}`);
    this.saveData();
    return model;
  }
  public deleteModel(id: string, user_name: string = 'Admin'): void {
    const model = this.data.tyre_models.find(m => m.id === id);
    if (!model) throw new Error('Tyre Model not found');
    const inUse = this.data.tyres.some(t => t.brand === model.brand && t.model === model.name);
    if (inUse) throw new Error(`Cannot delete "${model.name}" - it is used by existing tyres. Deactivate it instead.`);
    const idx = this.data.tyre_models.indexOf(model);
    this.data.tyre_models.splice(idx, 1);
    this.logAudit(user_name, 'admin', 'Delete Tyre Model', 'Master Data', `${model.brand} - ${model.name}`, undefined);
    this.saveData();
  }
}

export const db = new DBStore();
