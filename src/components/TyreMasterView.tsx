import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  CheckCircle2, 
  XCircle, 
  Tag, 
  FolderPlus,
  Boxes
} from 'lucide-react';
import { Tyre, TyreCategory, MasterListItem, TyreModel, BusinessSettings } from '../types.js';
import { formatCurrency } from '../utils/formatters.js';

interface TyreMasterViewProps {
  tyres: Tyre[];
  categories: MasterListItem[];
  brands: MasterListItem[];
  models: TyreModel[];
  sizes: MasterListItem[];
  settings: BusinessSettings;
  onAddTyre: (tyre: Omit<Tyre, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateTyre: (id: string, updates: Partial<Tyre>) => void;
  onAddCategory: (category: string) => void;
}

export const TyreMasterView: React.FC<TyreMasterViewProps> = ({
  tyres,
  categories,
  brands,
  models,
  sizes,
  settings,
  onAddTyre,
  onUpdateTyre,
  onAddCategory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingTyre, setEditingTyre] = useState<Tyre | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form State
  const [formData, setFormData] = useState<Omit<Tyre, 'id' | 'created_at' | 'updated_at'>>({
    brand: 'MRF',
    model: '',
    size: '175/65 R15',
    category: 'Car Tyre',
    vehicle_type: 'Passenger Car',
    season: 'All-Season',
    pattern: 'Symmetric Rib',
    speed_rating: 'H (210 km/h)',
    load_index: '84',
    purchase_price: 3500,
    selling_price: 4500,
    min_selling_price: 4200,
    gst_rate: settings.default_gst_rate,
    opening_stock: 10,
    current_stock: 10,
    min_stock_level: 5,
    max_stock_level: 50,
    description: '',
    is_active: true
  });

  const brandsList = brands.filter(b => b.active).map(b => b.name);
  const activeCategories = categories.filter(c => c.active);
  const activeSizes = sizes.filter(sz => sz.active);
  const modelsForBrand = (brand: string) => models.filter(m => m.brand === brand && m.active);

  const filteredTyres = tyres.filter(t => {
    const matchesSearch = 
      t.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.size.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === 'All' || t.brand === selectedBrand;
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesBrand && matchesCategory;
  });

  const handleOpenAddModal = () => {
    setEditingTyre(null);
    setFormData({
      brand: 'MRF',
      model: '',
      size: '175/65 R15',
      category: 'Car Tyre',
      vehicle_type: 'Passenger Car',
      season: 'All-Season',
      pattern: 'Standard Radial',
      speed_rating: 'H (210 km/h)',
      load_index: '84',
      purchase_price: 3000,
      selling_price: 4000,
      min_selling_price: 3800,
      gst_rate: settings.default_gst_rate,
      opening_stock: 10,
      current_stock: 10,
      min_stock_level: 5,
      max_stock_level: 50,
      description: '',
      is_active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tyre: Tyre) => {
    setEditingTyre(tyre);
    setFormData({ ...tyre });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTyre) {
      onUpdateTyre(editingTyre.id, formData);
    } else {
      onAddTyre(formData);
    }
    setIsModalOpen(false);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCategoryName.trim()) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
      setIsCategoryModalOpen(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-100">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Tyre Master Catalogue
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage complete product specifications, pricing, speed ratings, and stock limits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold text-amber-400 transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ Custom Category</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Tyre</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by brand, model or size..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">Brand:</span>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
          >
            <option value="All">All Brands</option>
            {brandsList.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
          >
            <option value="All">All Categories</option>
            {activeCategories.map(c => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tyre Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
              <tr>
                <th className="px-4 py-3">Brand & Model</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Purchase Price</th>
                <th className="px-4 py-3 text-right">Selling Price</th>
                <th className="px-4 py-3 text-center">GST %</th>
                <th className="px-4 py-3 text-center">Current Stock</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filteredTyres.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500 italic">
                    No tyres found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredTyres.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3 font-semibold">
                      <div className="text-white text-sm">{t.brand} {t.model}</div>
                      <div className="text-[10px] text-slate-400">{t.vehicle_type} • {t.speed_rating}</div>
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-100">{t.size}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700 text-[10px]">
                        {t.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-300">{formatCurrency(t.purchase_price)}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{formatCurrency(t.selling_price)}</td>
                    <td className="px-4 py-3 text-center font-mono text-slate-400">{t.gst_rate}%</td>
                    <td className="px-4 py-3 text-center font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        t.current_stock === 0 ? 'bg-rose-500/20 text-rose-400' : (t.current_stock <= t.min_stock_level ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400')
                      }`}>
                        {t.current_stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {t.is_active ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleOpenEditModal(t)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors"
                        title="Edit Tyre Specs"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Tyre Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white">
                {editingTyre ? 'Edit Tyre Master Record' : 'Create New Tyre Specification'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Section 1: Basic Info */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                <h3 className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                  Basic Product Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Brand</label>
                    <select
                      required
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value, model: '' })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    >
                      <option value="">Select Brand...</option>
                      {brandsList.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Model Pattern</label>
                    <select
                      required
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      disabled={!formData.brand}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 disabled:opacity-50"
                    >
                      <option value="">{formData.brand ? 'Select Model...' : 'Select a Brand first'}</option>
                      {modelsForBrand(formData.brand).map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Tyre Size</label>
                    <select
                      required
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200 font-mono"
                    >
                      <option value="">Select Size...</option>
                      {activeSizes.map(sz => <option key={sz.id} value={sz.name}>{sz.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    >
                      {activeCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 2: Technical Specs */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                <h3 className="font-bold text-blue-400 uppercase tracking-wider text-[10px]">
                  Technical Specifications & Ratings
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Vehicle Type</label>
                    <input
                      type="text"
                      value={formData.vehicle_type}
                      onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Season Rating</label>
                    <select
                      value={formData.season}
                      onChange={(e) => setFormData({ ...formData, season: e.target.value as any })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    >
                      <option value="All-Season">All-Season</option>
                      <option value="Summer">Summer</option>
                      <option value="Winter">Winter</option>
                      <option value="All-Terrain">All-Terrain</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Speed Rating</label>
                    <input
                      type="text"
                      value={formData.speed_rating}
                      onChange={(e) => setFormData({ ...formData, speed_rating: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Pricing & GST */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                <h3 className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                  Commercial Pricing & GST Tax Rates
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">Purchase Rate (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.purchase_price}
                      onChange={(e) => setFormData({ ...formData, purchase_price: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Standard Selling Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formData.selling_price}
                      onChange={(e) => setFormData({ ...formData, selling_price: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Min Selling Price (₹)</label>
                    <input
                      type="number"
                      value={formData.min_selling_price}
                      onChange={(e) => setFormData({ ...formData, min_selling_price: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">GST Rate (%)</label>
                    <select
                      value={formData.gst_rate}
                      onChange={(e) => setFormData({ ...formData, gst_rate: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    >
                      {settings.gst_rates.map(rate => (
                        <option key={rate} value={rate}>{rate}%{rate === settings.default_gst_rate ? ' (Default)' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: Inventory Thresholds */}
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 space-y-3">
                <h3 className="font-bold text-rose-400 uppercase tracking-wider text-[10px]">
                  Stock Quantities & Reorder Thresholds
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {!editingTyre && (
                    <div>
                      <label className="block text-slate-400 mb-1">Opening Stock</label>
                      <input
                        type="number"
                        value={formData.opening_stock}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setFormData({ ...formData, opening_stock: val, current_stock: val });
                        }}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-slate-400 mb-1">Min Stock Threshold</label>
                    <input
                      type="number"
                      value={formData.min_stock_level}
                      onChange={(e) => setFormData({ ...formData, min_stock_level: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Max Stock Limit</label>
                    <input
                      type="number"
                      value={formData.max_stock_level}
                      onChange={(e) => setFormData({ ...formData, max_stock_level: Number(e.target.value) })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Active Status</label>
                    <select
                      value={formData.is_active ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'true' })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-200"
                    >
                      <option value="true">Active Catalogue</option>
                      <option value="false">Inactive / Discontinued</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-extrabold shadow-md shadow-amber-500/20"
                >
                  {editingTyre ? 'Save Changes' : 'Create Tyre Master'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Custom Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-amber-400" />
              Add Custom Tyre Category
            </h2>
            <form onSubmit={handleAddCategorySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Electric Vehicle Tyre, Earthmover Tyre"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 text-slate-950 font-bold rounded-lg"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
