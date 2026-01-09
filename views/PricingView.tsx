import React, { useState, useContext, useMemo, useEffect, useCallback } from 'react';
import { Search, Filter, Edit3, Check, X, Plus, Trash2, Database, AlertCircle, ChevronDown } from 'lucide-react';
import { SettingsContext, UIContext } from '../App';
import { InventoryItem } from '../types';

const ITEMS_PER_PAGE = 50;

// Custom Debounce Hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Memoized Table Row to prevent re-rendering 1700+ rows
const RegistryRow = React.memo(({ 
  item, 
  isEditing, 
  onStartEdit, 
  onSaveEdit, 
  onCancelEdit, 
  onDeleteConfirm,
  isConfirmingDelete,
  setConfirmDeleteId,
  editForm,
  setEditForm,
  categories
}: {
  item: InventoryItem;
  isEditing: boolean;
  onStartEdit: (item: InventoryItem) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  onDeleteConfirm: (id: number) => void;
  isConfirmingDelete: boolean;
  setConfirmDeleteId: (id: number | null) => void;
  editForm: Partial<InventoryItem>;
  setEditForm: (form: Partial<InventoryItem>) => void;
  categories: string[];
}) => {
  return (
    <tr className="border-b border-border/50 hover:bg-surface-light/30 transition-colors group">
      <td className="px-8 py-5">
        {isEditing ? (
          <input 
            value={editForm.name}
            onChange={e => setEditForm({...editForm, name: e.target.value})}
            className="bg-background border border-primary rounded-lg px-3 py-2 text-sm font-bold outline-none w-full"
          />
        ) : (
          <>
            <div className="font-bold text-sm text-foreground">{item.name}</div>
            <div className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-50">{item.type} • ID:{item.id}</div>
          </>
        )}
      </td>
      <td className="px-8 py-5">
        {isEditing ? (
          <select 
            value={editForm.category}
            onChange={e => setEditForm({...editForm, category: e.target.value})}
            className="bg-background border border-primary rounded-lg px-3 py-2 text-sm font-bold outline-none"
          >
            {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        ) : (
          <span className="text-[9px] font-black text-accent-blue bg-accent-blue/10 px-3 py-1 rounded-full border border-accent-blue/20 uppercase tracking-widest">
            {item.category}
          </span>
        )}
      </td>
      <td className="px-8 py-5 text-right">
        {isEditing ? (
          <input 
            type="number"
            value={editForm.price}
            onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value)})}
            className="w-24 bg-background border border-primary rounded-lg px-2 py-2 text-right font-mono font-bold text-primary outline-none"
          />
        ) : (
          <span className={`font-mono font-bold tracking-tighter ${item.price > 0 ? 'text-primary text-xl' : 'text-muted-foreground/30 text-xs uppercase'}`}>
            {item.price > 0 ? `৳${item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 'Pending'}
          </span>
        )}
      </td>
      <td className="px-8 py-5 text-right min-w-[120px]">
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <button onClick={onSaveEdit} className="p-2.5 bg-primary/20 text-primary rounded-xl hover:bg-primary hover:text-white transition-all"><Check size={18} /></button>
              <button onClick={onCancelEdit} className="p-2.5 bg-destructive/10 text-destructive rounded-xl hover:bg-destructive hover:text-white transition-all"><X size={18} /></button>
            </>
          ) : isConfirmingDelete ? (
            <div className="flex items-center gap-1 animate-scale-in">
               <button onClick={() => onDeleteConfirm(item.id)} className="bg-destructive text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">CONFIRM</button>
               <button onClick={() => setConfirmDeleteId(null)} className="p-2 text-muted-foreground"><X size={16} /></button>
            </div>
          ) : (
            <>
              <button onClick={() => onStartEdit(item)} className="p-2.5 text-muted-foreground hover:bg-surface-light hover:text-primary rounded-xl transition-all"><Edit3 size={18} /></button>
              <button onClick={() => setConfirmDeleteId(item.id)} className="p-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-xl transition-all"><Trash2 size={18} /></button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
});

const PricingView: React.FC = () => {
  const settingsCtx = useContext(SettingsContext);
  const ui = useContext(UIContext);
  
  if (!settingsCtx || !ui) return null;
  const { settings, updateSettings, db } = settingsCtx;

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300); // 300ms debounce
  const [filterCat, setFilterCat] = useState('All');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<InventoryItem>>({});
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [visibleItemsCount, setVisibleItemsCount] = useState(ITEMS_PER_PAGE);
  const [newItem, setNewItem] = useState({ 
    name: '', 
    price: '', 
    category: settings.categories[0] || '', 
    type: 'Service' 
  });

  const categories = useMemo(() => 
    ['All', ...settings.categories].sort()
  , [settings.categories]);

  // Filtering is expensive for 1700+ items, so we memoize strictly on the debounced value
  const filteredItems = useMemo(() => {
    return settings.inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCat = filterCat === 'All' || item.category === filterCat;
      return matchesSearch && matchesCat;
    });
  }, [settings.inventory, debouncedSearch, filterCat]);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice(0, visibleItemsCount);
  }, [filteredItems, visibleItemsCount]);

  useEffect(() => {
    setVisibleItemsCount(ITEMS_PER_PAGE);
  }, [debouncedSearch, filterCat]);

  const loadMore = useCallback(() => {
    setVisibleItemsCount(prev => prev + ITEMS_PER_PAGE);
  }, []);

  const handleAddItem = () => {
    if (!newItem.name || !newItem.price || !newItem.category) return;
    const item: InventoryItem = {
      id: Date.now(),
      name: newItem.name,
      price: parseFloat(newItem.price),
      category: newItem.category,
      type: newItem.type,
      updatedAt: Date.now()
    };
    
    // Immediate DB Persistence
    db.upsertItem(item);
    
    // UI Update
    updateSettings(prev => ({ inventory: [...prev.inventory, item] }));
    setNewItem({ ...newItem, name: '', price: '' });
    setShowAddForm(false);
    ui.notify("Registry entry created");
  };

  const handleDeleteItem = (id: number) => {
    db.deleteItem(id);
    updateSettings(prev => ({
      inventory: prev.inventory.filter(item => item.id !== id)
    }));
    setConfirmDeleteId(null);
    ui.notify("Registry record purged", "error");
  };

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditForm(item);
  };

  const saveEdit = () => {
    if (!editingId || !editForm.name || editForm.price === undefined) return;
    
    const updatedItem = { ...editForm as InventoryItem, updatedAt: Date.now() };
    db.upsertItem(updatedItem);

    updateSettings(prev => ({
      inventory: prev.inventory.map(item => 
        item.id === editingId ? updatedItem : item
      )
    }));
    setEditingId(null);
    ui.notify("Registry data updated");
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter uppercase">MASTER REGISTRY</h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-70">
            {settings.inventory.length > 1500 ? 'LARGE DATASET MODE ACTIVE' : 'Central Authority for Prices'}
          </p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-primary text-primary-foreground rounded-2xl px-6 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all"
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />}
          {showAddForm ? 'Close Editor' : 'Register New Entry'}
        </button>
      </div>

      {showAddForm && (
        <div className="bg-card border border-primary/30 rounded-[2.5rem] p-8 shadow-2xl animate-scale-in">
          <div className="flex items-center gap-3 mb-6">
            <Database className="text-primary" size={20} />
            <h3 className="text-lg font-black uppercase tracking-tight">NEW REGISTRY ENTRY</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Descriptor / Item Name</label>
              <input 
                placeholder="e.g. Paracetamol 500mg" 
                value={newItem.name} 
                onChange={e => setNewItem({...newItem, name: e.target.value})}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Base Rate (৳)</label>
              <input 
                type="number"
                placeholder="0.00" 
                value={newItem.price} 
                onChange={e => setNewItem({...newItem, price: e.target.value})}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-mono font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Assigned Category</label>
              <select 
                value={newItem.category} 
                onChange={e => setNewItem({...newItem, category: e.target.value})}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-bold"
              >
                {settings.categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAddForm(false)} className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
            <button onClick={handleAddItem} className="bg-primary text-primary-foreground rounded-xl px-10 py-3 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">Submit to Registry</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text"
            placeholder="Search registry index..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl pl-14 pr-6 py-4 outline-none focus:border-primary transition-all font-bold text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <select 
            value={filterCat}
            onChange={e => setFilterCat(e.target.value)}
            className="w-full bg-card border border-border rounded-2xl pl-14 pr-6 py-4 outline-none appearance-none focus:border-primary transition-all font-bold text-sm"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
           <span className="text-[10px] font-black text-primary uppercase tracking-widest">Total Indexed</span>
           <span className="text-2xl font-black text-primary font-mono">{filteredItems.length}</span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface-light/50 border-b border-border">
                <th className="text-left px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">ENTRY IDENTIFIER</th>
                <th className="text-left px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">CATEGORY MAP</th>
                <th className="text-right px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">BASE RATE</th>
                <th className="text-right px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">MANAGEMENT</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map(item => (
                <RegistryRow 
                  key={item.id}
                  item={item}
                  isEditing={editingId === item.id}
                  onStartEdit={startEdit}
                  onSaveEdit={saveEdit}
                  onCancelEdit={() => setEditingId(null)}
                  onDeleteConfirm={handleDeleteItem}
                  isConfirmingDelete={confirmDeleteId === item.id}
                  setConfirmDeleteId={setConfirmDeleteId}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  categories={categories}
                />
              ))}
            </tbody>
          </table>
          {filteredItems.length === 0 && (
            <div className="py-20 text-center space-y-4">
              <AlertCircle className="mx-auto text-muted-foreground/20" size={48} />
              <p className="text-sm font-black text-muted-foreground uppercase tracking-[0.2em]">Zero entries matching this query in the registry.</p>
            </div>
          )}

          {filteredItems.length > visibleItemsCount && (
            <div className="p-8 flex justify-center bg-surface-light/30 border-t border-border">
              <button 
                onClick={loadMore}
                className="flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
              >
                Load More Results <ChevronDown size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingView;