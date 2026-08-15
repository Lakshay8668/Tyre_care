import React, { useState } from 'react';
import { Settings, Building2, FileText, Shield, Database, Save, CheckCircle2, RefreshCw, Percent, X, Plus } from 'lucide-react';
import { BusinessSettings, UserRole } from '../types.js';

interface SettingsViewProps {
  settings: BusinessSettings;
  onUpdateSettings: (settings: BusinessSettings) => void;
  currentUserRole: UserRole;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  currentUserRole
}) => {
  const [formData, setFormData] = useState<BusinessSettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [newRate, setNewRate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const addGstRate = () => {
    const rate = Number(newRate);
    if (Number.isNaN(rate) || rate < 0 || rate > 100) return;
    if (formData.gst_rates.includes(rate)) { setNewRate(''); return; }
    setFormData({ ...formData, gst_rates: [...formData.gst_rates, rate].sort((a, b) => a - b) });
    setNewRate('');
  };

  const removeGstRate = (rate: number) => {
    if (formData.gst_rates.length <= 1) return;
    const nextRates = formData.gst_rates.filter(r => r !== rate);
    setFormData({
      ...formData,
      gst_rates: nextRates,
      default_gst_rate: formData.default_gst_rate === rate ? nextRates[nextRates.length - 1] : formData.default_gst_rate
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-amber-400" />
            Shop & GST System Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure dealership details, GST registration info, tax invoice numbering, and stock thresholds.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Business Details Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Building2 className="w-4 h-4 text-amber-400" />
            Dealership & GST Profile
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Business Name / Trade Name</label>
              <input
                type="text"
                required
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">GSTIN (15 Digit Number)</label>
              <input
                type="text"
                required
                value={formData.gstin}
                onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Phone / WhatsApp Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Contact Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 mb-1">Shop Address</label>
              <textarea
                rows={2}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">State / Place of Supply</label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">PIN Code</label>
              <input
                type="text"
                value={formData.pin_code}
                onChange={(e) => setFormData({ ...formData, pin_code: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* GST / Tax Configuration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Percent className="w-4 h-4 text-amber-400" />
            GST / Tax Configuration
          </h2>
          <p className="text-[11px] text-slate-500 -mt-2">
            These rates feed the GST dropdown on every tyre in Tyre Master -- nothing is hardcoded. CGST + SGST is charged when the customer's state matches your business state above; IGST applies for interstate sales.
          </p>

          <div>
            <label className="block text-slate-400 mb-2 text-xs">Available GST Rate Slabs (%)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.gst_rates.map(rate => (
                <span key={rate} className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-full pl-3 pr-1.5 py-1 text-xs font-mono text-amber-400">
                  {rate}%
                  <button
                    type="button"
                    onClick={() => removeGstRate(rate)}
                    disabled={formData.gst_rates.length <= 1}
                    className="p-0.5 rounded-full hover:bg-slate-700 disabled:opacity-30 text-slate-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={newRate}
                onChange={(e) => setNewRate(e.target.value)}
                placeholder="Add rate, e.g. 3"
                className="w-40 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono"
              />
              <button type="button" onClick={addGstRate} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 rounded-lg text-xs font-bold">
                <Plus className="w-3.5 h-3.5" /> Add Slab
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
            <div>
              <label className="block text-slate-400 mb-1">Default GST Rate for New Tyres</label>
              <select
                value={formData.default_gst_rate}
                onChange={(e) => setFormData({ ...formData, default_gst_rate: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
              >
                {formData.gst_rates.map(rate => <option key={rate} value={rate}>{rate}%</option>)}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Tax Calculation Method</label>
              <select
                value={formData.tax_calculation_method}
                onChange={(e) => setFormData({ ...formData, tax_calculation_method: e.target.value as 'exclusive' | 'inclusive' })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              >
                <option value="exclusive">Exclusive (GST added on top of price)</option>
                <option value="inclusive">Inclusive (GST already included in price)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoice Customization */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <FileText className="w-4 h-4 text-amber-400" />
            Tax Invoice Series & Printing Setup
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Invoice Number Prefix (e.g., TS/2024-25/)</label>
              <input
                type="text"
                value={formData.invoice_prefix}
                onChange={(e) => setFormData({ ...formData, invoice_prefix: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Starting Invoice Serial Number</label>
              <input
                type="number"
                value={formData.starting_number}
                onChange={(e) => setFormData({ ...formData, starting_number: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 mb-1">Terms & Conditions (Printed at bottom of Invoice)</label>
              <textarea
                rows={3}
                value={formData.terms_and_conditions}
                onChange={(e) => setFormData({ ...formData, terms_and_conditions: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono text-[11px]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-400 mb-1">Invoice Footer Declaration</label>
              <input
                type="text"
                value={formData.invoice_footer}
                onChange={(e) => setFormData({ ...formData, invoice_footer: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
              />
            </div>
          </div>
        </div>

        {/* Inventory Rules */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-amber-400" />
            Inventory Control & Alert Rules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Default Low Stock Alert Threshold (Pcs)</label>
              <input
                type="number"
                value={formData.low_stock_threshold}
                onChange={(e) => setFormData({ ...formData, low_stock_threshold: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono"
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="allow_neg"
                checked={formData.allow_negative_stock}
                onChange={(e) => setFormData({ ...formData, allow_negative_stock: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="allow_neg" className="text-slate-300 font-medium">
                Allow Billing with Negative Stock Quantity
              </label>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-amber-500/20 text-xs transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save All Configuration</span>
          </button>
        </div>

      </form>

    </div>
  );
};
