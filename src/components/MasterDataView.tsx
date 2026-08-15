import React, { useState } from 'react';
import { Layers, Plus, Pencil, Trash2, CheckCircle2, XCircle, Tag, BookOpen, Ruler } from 'lucide-react';
import { MasterListItem, TyreModel } from '../types.js';

interface MasterDataViewProps {
  brands: MasterListItem[];
  categories: MasterListItem[];
  sizes: MasterListItem[];
  models: TyreModel[];
  onAddBrand: (name: string) => void;
  onUpdateBrand: (id: string, updates: Partial<Pick<MasterListItem, 'name' | 'active'>>) => void;
  onDeleteBrand: (id: string) => void;
  onAddCategory: (name: string) => void;
  onUpdateCategory: (id: string, updates: Partial<Pick<MasterListItem, 'name' | 'active'>>) => void;
  onDeleteCategory: (id: string) => void;
  onAddSize: (name: string) => void;
  onUpdateSize: (id: string, updates: Partial<Pick<MasterListItem, 'name' | 'active'>>) => void;
  onDeleteSize: (id: string) => void;
  onAddModel: (brand: string, name: string) => void;
  onUpdateModel: (id: string, updates: Partial<Pick<TyreModel, 'name' | 'active' | 'brand'>>) => void;
  onDeleteModel: (id: string) => void;
}

type Tab = 'brands' | 'models' | 'sizes' | 'categories';

// Generic list editor shared by Brands, Sizes and Categories -- all three
// are plain named master lists with add / rename / activate / delete.
const SimpleListEditor: React.FC<{
  label: string;
  placeholder: string;
  items: MasterListItem[];
  onAdd: (name: string) => void;
  onUpdate: (id: string, updates: Partial<Pick<MasterListItem, 'name' | 'active'>>) => void;
  onDelete: (id: string) => void;
}> = ({ label, placeholder, items, onAdd, onUpdate, onDelete }) => {
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const submitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName('');
  };

  const startEdit = (item: MasterListItem) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const submitEdit = (id: string) => {
    if (editName.trim()) onUpdate(id, { name: editName.trim() });
    setEditingId(null);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={submitAdd} className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
        />
        <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-extrabold">
          <Plus className="w-4 h-4" /> Add {label}
        </button>
      </form>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] font-semibold">
            <tr>
              <th className="px-4 py-2.5">{label} Name</th>
              <th className="px-4 py-2.5 text-center">Status</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {items.length === 0 && (
              <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-500">No {label.toLowerCase()}s yet.</td></tr>
            )}
            {items.map(item => (
              <tr key={item.id} className={`hover:bg-slate-800/50 ${!item.active ? 'opacity-50' : ''}`}>
                <td className="px-4 py-2.5 font-semibold">
                  {editingId === item.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && submitEdit(item.id)}
                      onBlur={() => submitEdit(item.id)}
                      className="bg-slate-800 border border-amber-500/60 rounded px-2 py-1 text-slate-100"
                    />
                  ) : item.name}
                </td>
                <td className="px-4 py-2.5 text-center">
                  <button
                    onClick={() => onUpdate(item.id, { active: !item.active })}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${item.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}
                  >
                    {item.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                    {item.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-2.5 text-right space-x-2">
                  <button onClick={() => startEdit(item)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => onDelete(item.id)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  brands, categories, sizes, models,
  onAddBrand, onUpdateBrand, onDeleteBrand,
  onAddCategory, onUpdateCategory, onDeleteCategory,
  onAddSize, onUpdateSize, onDeleteSize,
  onAddModel, onUpdateModel, onDeleteModel
}) => {
  const [tab, setTab] = useState<Tab>('brands');
  const [modelBrand, setModelBrand] = useState('');
  const [modelName, setModelName] = useState('');
  const [editingModelId, setEditingModelId] = useState<string | null>(null);
  const [editModelName, setEditModelName] = useState('');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'brands', label: 'Brands', icon: <Tag className="w-3.5 h-3.5" /> },
    { id: 'models', label: 'Tyre Models', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'sizes', label: 'Tyre Sizes', icon: <Ruler className="w-3.5 h-3.5" /> },
    { id: 'categories', label: 'Categories', icon: <Layers className="w-3.5 h-3.5" /> }
  ];

  const submitAddModel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modelBrand || !modelName.trim()) return;
    onAddModel(modelBrand, modelName.trim());
    setModelName('');
  };

  const modelsByBrand = brands.map(b => ({
    brand: b,
    items: models.filter(m => m.brand === b.name)
  }));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 text-slate-100">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Layers className="w-6 h-6 text-amber-400" />
          Master Data
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Brands, Tyre Models, Sizes and Categories that power every dropdown in the CRM. Nothing here is hardcoded -- add, rename, deactivate, or delete freely.
        </p>
      </div>

      <div className="flex gap-2 border-b border-slate-800">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors ${
              tab === t.id ? 'border-amber-500 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'brands' && (
        <SimpleListEditor
          label="Brand"
          placeholder="e.g. Pirelli"
          items={brands}
          onAdd={onAddBrand}
          onUpdate={onUpdateBrand}
          onDelete={onDeleteBrand}
        />
      )}

      {tab === 'sizes' && (
        <SimpleListEditor
          label="Size"
          placeholder="e.g. 225/45 R17"
          items={sizes}
          onAdd={onAddSize}
          onUpdate={onUpdateSize}
          onDelete={onDeleteSize}
        />
      )}

      {tab === 'categories' && (
        <SimpleListEditor
          label="Category"
          placeholder="e.g. Racing Tyre"
          items={categories}
          onAdd={onAddCategory}
          onUpdate={onUpdateCategory}
          onDelete={onDeleteCategory}
        />
      )}

      {tab === 'models' && (
        <div className="space-y-4">
          <form onSubmit={submitAddModel} className="flex gap-2">
            <select
              value={modelBrand}
              onChange={(e) => setModelBrand(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
            >
              <option value="">Select Brand...</option>
              {brands.filter(b => b.active).map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
            </select>
            <input
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g. ZVTV"
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200"
            />
            <button type="submit" className="flex items-center gap-1 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-extrabold">
              <Plus className="w-4 h-4" /> Add Model
            </button>
          </form>

          <div className="space-y-4">
            {modelsByBrand.map(({ brand, items }) => (
              <div key={brand.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="bg-slate-800/80 px-4 py-2 text-xs font-bold text-amber-400 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" /> {brand.name}
                  <span className="text-slate-500 font-normal">({items.length} model{items.length !== 1 ? 's' : ''})</span>
                </div>
                {items.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-500">No models added for this brand yet.</div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {items.map(m => (
                        <tr key={m.id} className={`hover:bg-slate-800/50 ${!m.active ? 'opacity-50' : ''}`}>
                          <td className="px-4 py-2 font-semibold w-full">
                            {editingModelId === m.id ? (
                              <input
                                autoFocus
                                value={editModelName}
                                onChange={(e) => setEditModelName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { onUpdateModel(m.id, { name: editModelName }); setEditingModelId(null); } }}
                                onBlur={() => { onUpdateModel(m.id, { name: editModelName }); setEditingModelId(null); }}
                                className="bg-slate-800 border border-amber-500/60 rounded px-2 py-1 text-slate-100"
                              />
                            ) : m.name}
                          </td>
                          <td className="px-4 py-2 text-center whitespace-nowrap">
                            <button
                              onClick={() => onUpdateModel(m.id, { active: !m.active })}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${m.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}
                            >
                              {m.active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                              {m.active ? 'Active' : 'Inactive'}
                            </button>
                          </td>
                          <td className="px-4 py-2 text-right whitespace-nowrap space-x-2">
                            <button onClick={() => { setEditingModelId(m.id); setEditModelName(m.name); }} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => onDeleteModel(m.id)} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
