import React, { useState } from 'react';
import { UserCheck, Plus, Calendar, CheckCircle2, XCircle, Clock, FileText, IndianRupee } from 'lucide-react';
import { Employee, AttendanceRecord, Payroll } from '../types.js';
import { formatCurrency, formatDate } from '../utils/formatters.js';

interface EmployeesViewProps {
  employees: Employee[];
  attendance: AttendanceRecord[];
  payrolls: Payroll[];
  onCreateEmployee: (employee: Omit<Employee, 'id' | 'employee_code'>) => void;
  onMarkAttendance: (records: { employee_id: string; status: 'present' | 'absent' | 'half_day' | 'leave'; notes: string }[], date: string) => void;
  onCreatePayroll: (payroll: Omit<Payroll, 'id' | 'created_at'>) => void;
}

export const EmployeesView: React.FC<EmployeesViewProps> = ({
  employees,
  attendance,
  payrolls,
  onCreateEmployee,
  onMarkAttendance,
  onCreatePayroll
}) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'attendance' | 'payroll'>('employees');
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

  // Employee Form
  const [empForm, setEmpForm] = useState({
    name: '',
    designation: 'technician' as Employee['designation'],
    mobile: '+91 ',
    email: '',
    address: '',
    salary: 22000,
    joining_date: new Date().toISOString().split('T')[0],
    bank_name: '',
    account_number: '',
    ifsc_code: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Attendance Date
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attMap, setAttMap] = useState<{ [empId: string]: 'present' | 'absent' | 'half_day' | 'leave' }>({});

  // Payroll Calculation Modal State
  const [payrollEmpId, setPayrollEmpId] = useState(employees[0]?.id || '');
  const [payrollMonth, setPayrollMonth] = useState('October 2024');
  const [workingDays, setWorkingDays] = useState(26);
  const [presentDays, setPresentDays] = useState(24);
  const [halfDays, setHalfDays] = useState(1);
  const [absentDays, setAbsentDays] = useState(1);
  const [bonus, setBonus] = useState(1000);
  const [deductions, setDeductions] = useState(0);

  const handleEmpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateEmployee(empForm);
    setIsEmpModalOpen(false);
  };

  const handleSaveAttendance = () => {
    const records = employees.map(emp => ({
      employee_id: emp.id,
      status: attMap[emp.id] || 'present',
      notes: 'Daily shift attendance'
    }));
    onMarkAttendance(records, attDate);
    alert('Daily shop attendance saved successfully!');
  };

  const calculatePayroll = () => {
    const emp = employees.find(e => e.id === payrollEmpId);
    if (!emp) return { baseSalary: 0, perDayRate: 0, netSalary: 0 };

    const perDayRate = emp.salary / (workingDays || 26);
    const effectivePresent = presentDays + (halfDays * 0.5);
    const calculatedBase = effectivePresent * perDayRate;
    const netSalary = calculatedBase + bonus - deductions;

    return { baseSalary: calculatedBase, perDayRate, netSalary, monthlySalary: emp.salary };
  };

  const handlePayrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === payrollEmpId);
    if (!emp) return;

    const calc = calculatePayroll();

    onCreatePayroll({
      employee_id: emp.id,
      employee_name: emp.name,
      month_year: payrollMonth,
      total_working_days: workingDays,
      present_days: presentDays,
      half_days: halfDays,
      absent_days: absentDays,
      base_salary: emp.salary,
      calculated_salary: calc.baseSalary,
      bonus,
      deductions,
      net_salary: calc.netSalary,
      payment_date: new Date().toISOString().split('T')[0],
      payment_status: 'paid',
      payment_mode: 'bank_transfer'
    });

    setIsPayrollModalOpen(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <UserCheck className="w-6 h-6 text-amber-400" />
            Employees, Attendance & Payroll
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage shop technicians, wheel alignment specialists, daily attendance register, and salary calculations.
          </p>
        </div>

        <button
          onClick={() => setIsEmpModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Employee</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-slate-800 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('employees')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'employees' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Staff Roster ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'attendance' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Daily Attendance Register
        </button>
        <button
          onClick={() => setActiveTab('payroll')}
          className={`pb-3 transition-colors border-b-2 ${
            activeTab === 'payroll' ? 'border-amber-400 text-amber-400 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Monthly Payroll & Salary Slips ({payrolls.length})
        </button>
      </div>

      {/* Content Tabs */}
      {activeTab === 'employees' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Employee Name</th>
                <th className="px-4 py-3">Designation / Role</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3 text-right">Monthly Salary</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {employees.map(e => (
                <tr key={e.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono font-bold text-amber-400">{e.employee_code}</td>
                  <td className="px-4 py-3 font-semibold text-white">{e.name}</td>
                  <td className="px-4 py-3 text-slate-300 capitalize">{e.designation.replace('_', ' ')}</td>
                  <td className="px-4 py-3 font-mono text-slate-400">{e.mobile}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(e.salary)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-sm font-bold text-white">Mark Shop Staff Attendance</h2>
              <p className="text-xs text-slate-400">Record daily present, absent, half-day, or leave status.</p>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="date"
                value={attDate}
                onChange={(e) => setAttDate(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200"
              />
              <button
                onClick={handleSaveAttendance}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow"
              >
                Save Attendance
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {employees.map(emp => {
              const currentStatus = attMap[emp.id] || 'present';
              return (
                <div key={emp.id} className="p-3 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <div className="font-bold text-white text-xs">{emp.name}</div>
                    <div className="text-[10px] text-slate-400">{emp.designation.replace('_', ' ')} | {emp.employee_code}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    {(['present', 'half_day', 'absent', 'leave'] as const).map(st => (
                      <button
                        key={st}
                        onClick={() => setAttMap({ ...attMap, [emp.id]: st })}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                          currentStatus === st
                            ? (st === 'present' ? 'bg-emerald-500 text-slate-950 font-bold' : (st === 'half_day' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-rose-500 text-white font-bold'))
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}
                      >
                        {st.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsPayrollModalOpen(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-extrabold shadow"
            >
              + Process Monthly Salary Slip
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3 text-center">Working Days</th>
                  <th className="px-4 py-3 text-center">Present / Half / Absent</th>
                  <th className="px-4 py-3 text-right">Monthly Base</th>
                  <th className="px-4 py-3 text-right">Net Salary Paid</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {payrolls.map(p => (
                  <tr key={p.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-semibold text-white">{p.employee_name}</td>
                    <td className="px-4 py-3 text-amber-400 font-mono font-bold">{p.month_year}</td>
                    <td className="px-4 py-3 text-center font-mono">{p.total_working_days} days</td>
                    <td className="px-4 py-3 text-center font-mono text-slate-300">
                      <span className="text-emerald-400 font-bold">{p.present_days}P</span> / <span className="text-amber-400">{p.half_days}H</span> / <span className="text-rose-400">{p.absent_days}A</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono">{formatCurrency(p.base_salary)}</td>
                    <td className="px-4 py-3 text-right font-mono font-extrabold text-emerald-400">{formatCurrency(p.net_salary)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase">
                        PAID
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              New Employee Registration
            </h2>

            <form onSubmit={handleEmpSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={empForm.name}
                  onChange={(e) => setEmpForm({ ...empForm, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Designation / Role</label>
                <select
                  value={empForm.designation}
                  onChange={(e) => setEmpForm({ ...empForm, designation: e.target.value as Employee['designation'] })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                >
                  <option value="technician">Technician / Fitter</option>
                  <option value="manager">Manager</option>
                  <option value="sales_executive">Sales Executive</option>
                  <option value="accountant">Billing / Accountant</option>
                  <option value="storekeeper">Storekeeper</option>
                  <option value="helper">Helper</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={empForm.mobile}
                    onChange={(e) => setEmpForm({ ...empForm, mobile: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    required
                    value={empForm.salary}
                    onChange={(e) => setEmpForm({ ...empForm, salary: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button type="button" onClick={() => setIsEmpModalOpen(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg shadow">Save Staff Member</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calculate Salary Modal */}
      {isPayrollModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Generate Monthly Salary Slip
            </h2>

            <form onSubmit={handlePayrollSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Select Employee</label>
                  <select
                    value={payrollEmpId}
                    onChange={(e) => setPayrollEmpId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                  >
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.designation})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Month & Year</label>
                  <input
                    type="text"
                    value={payrollMonth}
                    onChange={(e) => setPayrollMonth(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-bold text-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div>
                  <label className="block text-slate-400 mb-1">Working Days</label>
                  <input
                    type="number"
                    value={workingDays}
                    onChange={(e) => setWorkingDays(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-center"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Present</label>
                  <input
                    type="number"
                    value={presentDays}
                    onChange={(e) => setPresentDays(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-center text-emerald-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Half Days</label>
                  <input
                    type="number"
                    value={halfDays}
                    onChange={(e) => setHalfDays(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-center text-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Absent</label>
                  <input
                    type="number"
                    value={absentDays}
                    onChange={(e) => setAbsentDays(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-center text-rose-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Bonus / Incentive (₹)</label>
                  <input
                    type="number"
                    value={bonus}
                    onChange={(e) => setBonus(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Deductions (₹)</label>
                  <input
                    type="number"
                    value={deductions}
                    onChange={(e) => setDeductions(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 flex justify-between items-center font-mono">
                <div>
                  <div className="text-slate-400 text-[10px]">Calculated Net Salary:</div>
                  <div className="text-lg font-bold text-emerald-400">{formatCurrency(calculatePayroll().netSalary)}</div>
                </div>
                <div className="text-right text-[10px] text-slate-400">
                  Rate/Day: {formatCurrency(calculatePayroll().perDayRate)}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsPayrollModalOpen(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold rounded-lg shadow">Generate Salary Slip & Mark Paid</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
