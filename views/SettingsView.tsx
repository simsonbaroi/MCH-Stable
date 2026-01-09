import React, { useContext, useState, useRef } from 'react';
import { 
  Settings as SettingsIcon, Palette, Trash2, Plus, RotateCcw, 
  Layers, Check, Pencil, ShieldCheck,
  LayoutGrid, LayoutList, X, AlertTriangle, Pipette, Lock, Unlock, GripVertical, Download, Upload, FileJson, Database, Terminal, Search, Monitor, RefreshCw
} from 'lucide-react';
import { SettingsContext, UIContext, AuthContext, BillingContext } from '../App';
import { TerminalButton, Settings } from '../types';

const THEME_PRESETS = [
  { id: 'preset1', name: 'Preset 1', label: 'Emerald Clinical', color: '#10b981' },
  { id: 'preset2', name: 'Preset 2', label: 'Cobalt Surgical', color: '#3b82f6' },
  { id: 'preset3', name: 'Preset 3', label: 'Amethyst Ward', color: '#8b5cf6' },
  { id: 'preset4', name: 'Preset 4', label: 'Rose Trauma', color: '#f43f5e' },
  { id: 'preset5', name: 'Preset 5', label: 'Amber Alert', color: '#f59e0b' },
  { id: 'preset6', name: 'Preset 6', label: 'Slate Registry', color: '#64748b' },
];

const SettingsView: React.FC = () => {
  const settingsCtx = useContext(SettingsContext);
  const auth = useContext(AuthContext);
  const ui = useContext(UIContext);
  const billing = useContext(BillingContext);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  if (!settingsCtx || !ui || !auth || !billing) return null;
  const { settings, updateSettings, resetSettings, importSettings, db } = settingsCtx;

  const [activeTab, setActiveTab] = useState<'categories' | 'buttons' | 'appearance' | 'database' | 'system'>('categories');
  const [newCatName, setNewCatName] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM registry LIMIT 10;');
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [queryError, setQueryError] = useState<string | null>(null);
  
  const runSql = () => {
    try {
      const results = db.runQuery(sqlQuery);
      setQueryResults(results);
      setQueryError(null);
      ui.notify("SQL Query Executed");
    } catch (e: any) {
      setQueryError(e.message);
      setQueryResults([]);
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      ui.notify("Mounting Database Binary...");
      await db.importSqlite(file);
    } catch (err: any) {
      ui.notify("Import Failed: Invalid SQLite Binary", "error");
      console.error(err);
    }
  };

  const addCategory = () => {
    const trimmed = newCatName.trim();
    if (!trimmed || settings.categories.includes(trimmed)) return;
    updateSettings(prev => ({ categories: [...prev.categories, trimmed] }));
    setNewCatName('');
    ui.notify("Category Registered");
  };

  const executeDelete = (cat: string) => {
    updateSettings(prev => ({
      categories: prev.categories.filter(c => c !== cat),
      inventory: prev.inventory.filter(i => i.category !== cat),
      terminalButtons: prev.terminalButtons.filter(b => b.mappedCategory !== cat)
    }));
    setConfirmDelete(null);
    ui.notify("Category Purged");
  };

  const addButton = (terminal: 'outpatient' | 'inpatient') => {
    const id = `${terminal}-${Date.now()}`;
    const newBtn: TerminalButton = {
      id,
      label: 'New Button',
      targetTerminal: terminal,
      mappedCategory: settings.categories[0] || 'Uncategorized'
    };
    updateSettings(prev => ({ terminalButtons: [...prev.terminalButtons, newBtn] }));
  };

  const removeButton = (id: string) => {
    updateSettings(prev => ({ terminalButtons: prev.terminalButtons.filter(b => b.id !== id) }));
  };

  const updateButton = (id: string, updates: Partial<TerminalButton>) => {
    updateSettings(prev => ({
      terminalButtons: prev.terminalButtons.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary/10 rounded-lg"><ShieldCheck className="text-primary" size={24} /></div>
             <h2 className="text-4xl font-black tracking-tighter uppercase text-foreground">SYSTEM CONFIGURATION</h2>
          </div>
          <p className="text-muted-foreground font-bold tracking-tight opacity-70">Infrastructure & System Orchestration</p>
        </div>
        <div className="flex items-center gap-3 relative">
          {showResetConfirm ? (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/50 p-2 rounded-xl animate-scale-in">
              <span className="text-[9px] font-black text-destructive uppercase tracking-widest px-2">Wipe Registry?</span>
              <button onClick={resetSettings} className="bg-destructive text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase">YES</button>
              <button onClick={() => setShowResetConfirm(false)} className="bg-muted text-muted-foreground px-3 py-1.5 rounded-lg text-[9px] font-black uppercase">NO</button>
            </div>
          ) : (
            <button onClick={() => setShowResetConfirm(true)} className="px-6 py-3 bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <RotateCcw size={14} /> Factory Reset
            </button>
          )}
        </div>
      </div>

      <div className="bg-card border border-border rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
        <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-surface-light/30 shrink-0">
          {[
            { id: 'system', label: 'System', icon: Monitor, desc: 'Identity' },
            { id: 'categories', label: 'Categories', icon: LayoutList, desc: 'Registry Headers' },
            { id: 'buttons', label: 'Terminals', icon: LayoutGrid, desc: 'Tile Mapping' },
            { id: 'appearance', label: 'Appearance', icon: Palette, desc: 'Interface CSS' },
            { id: 'database', label: 'SQLite DB', icon: Database, desc: 'Relational Core' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-4 px-8 py-8 text-left transition-all border-l-4
                ${activeTab === tab.id ? 'bg-primary/5 border-primary text-primary' : 'border-transparent text-muted-foreground hover:bg-surface-light'}
              `}
            >
              <tab.icon size={20} className={activeTab === tab.id ? 'animate-pulse' : ''} />
              <div>
                <p className="text-xs font-black uppercase tracking-widest">{tab.label}</p>
                <p className="text-[10px] opacity-60 font-bold">{tab.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[750px] no-scrollbar">
          
          {activeTab === 'system' && (
            <div className="space-y-10 animate-fade-in">
               <div className="space-y-8">
                  <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2"><Monitor className="text-primary" size={20} /> IDENTITY</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Application Name</label>
                      <input 
                        value={settings.appName}
                        onChange={e => updateSettings({ appName: e.target.value })}
                        className="w-full bg-surface-light border border-border rounded-2xl px-5 py-4 font-black text-foreground outline-none focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Terminal Subtitle</label>
                      <input 
                        value={settings.appSubtitle}
                        onChange={e => updateSettings({ appSubtitle: e.target.value })}
                        className="w-full bg-surface-light border border-border rounded-2xl px-5 py-4 font-black text-foreground outline-none focus:border-primary transition-all"
                      />
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="space-y-10 animate-fade-in">
               <div className="space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2"><LayoutList className="text-primary" size={20} /> MASTER HEADERS</h3>
                  <div className="bg-surface-light p-6 rounded-3xl border border-border flex gap-4">
                     <input placeholder="New Category..." value={newCatName} onChange={e => setNewCatName(e.target.value)} className="flex-1 bg-card border border-border rounded-xl px-4 py-3 text-sm outline-none font-bold" />
                     <button onClick={addCategory} className="bg-primary text-primary-foreground font-black uppercase tracking-widest rounded-xl px-6"><Plus size={18} /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {settings.categories.map(cat => (
                        <div key={cat} className={`bg-surface-light border rounded-2xl p-5 flex items-center justify-between group border-border hover:border-primary/40`}>
                           <div className="flex-1">
                              <p className="font-bold text-sm">{cat}</p>
                              <p className="text-[9px] font-black uppercase text-muted-foreground opacity-50">
                                 {settings.inventory.filter(i => i.category === cat).length} ITEMS INDEXED
                              </p>
                           </div>
                           <button onClick={() => setConfirmDelete(cat)} className="p-3 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={18} /></button>
                        </div>
                     ))}
                  </div>
                  {confirmDelete && (
                    <div className="fixed inset-0 z-[120] bg-black/80 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                       <div className="bg-card border border-destructive/50 rounded-[3rem] p-12 max-w-md w-full text-center space-y-8 animate-scale-in shadow-2xl">
                          <div className="w-20 h-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto"><AlertTriangle size={40} /></div>
                          <div>
                             <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">Purge Category?</h4>
                             <p className="text-xs font-bold text-muted-foreground leading-relaxed">This will delete <b>{confirmDelete}</b> and remove all associated items from the registry. This action cannot be undone.</p>
                          </div>
                          <div className="flex gap-4">
                             <button onClick={() => executeDelete(confirmDelete)} className="flex-1 bg-destructive text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest">WIPE DATA</button>
                             <button onClick={() => setConfirmDelete(null)} className="flex-1 bg-surface-light text-foreground font-black py-4 rounded-2xl text-xs uppercase tracking-widest">CANCEL</button>
                          </div>
                       </div>
                    </div>
                  )}
               </div>
            </div>
          )}

          {activeTab === 'buttons' && (
            <div className="space-y-10 animate-fade-in">
               <div className="space-y-8">
                  <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2"><LayoutGrid className="text-primary" size={20} /> TERMINAL TILE MAPPING</h3>
                  
                  {['outpatient', 'inpatient'].map(terminal => (
                    <div key={terminal} className="space-y-4">
                       <div className="flex justify-between items-end px-2">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">{terminal} Terminal Configuration</h4>
                          <button onClick={() => addButton(terminal as any)} className="text-primary text-[10px] font-black uppercase flex items-center gap-1 hover:underline"><Plus size={12} /> Add Tile</button>
                       </div>
                       <div className="bg-surface-light/50 border border-border rounded-[2.5rem] p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                          {settings.terminalButtons.filter(b => b.targetTerminal === terminal).map(btn => (
                            <div key={btn.id} className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4 group">
                               <GripVertical className="text-muted-foreground/30 shrink-0 cursor-grab" size={20} />
                               <div className="flex-1 space-y-3">
                                  <input 
                                    value={btn.label}
                                    onChange={e => updateButton(btn.id, { label: e.target.value })}
                                    className="w-full bg-surface-light border border-border rounded-xl px-3 py-1.5 text-xs font-black uppercase outline-none focus:border-primary"
                                  />
                                  <select 
                                    value={btn.mappedCategory}
                                    onChange={e => updateButton(btn.id, { mappedCategory: e.target.value })}
                                    className="w-full bg-surface-light border border-border rounded-xl px-3 py-1.5 text-[10px] font-bold text-muted-foreground outline-none"
                                  >
                                    {settings.categories.map(c => <option key={c} value={c}>{c}</option>)}
                                  </select>
                               </div>
                               <button onClick={() => removeButton(btn.id)} className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="space-y-10 animate-fade-in">
               <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-2"><Terminal className="text-primary" size={20} /> SQLITE INTERFACE</h3>
                    <div className="flex gap-3">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept=".sqlite,.db" 
                        className="hidden" 
                      />
                      <button 
                        onClick={() => db.reseedDefaults()}
                        className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <RefreshCw size={14} /> Re-seed Defaults
                      </button>
                      <button 
                        onClick={handleRestoreClick}
                        className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <Upload size={14} /> Restore .sqlite
                      </button>
                      <button 
                        onClick={() => db.exportSqlite()}
                        className="flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all"
                      >
                        <Download size={14} /> Download .sqlite
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-zinc-950 rounded-[2rem] border border-zinc-800 p-6 shadow-2xl">
                     <div className="flex items-center gap-2 mb-4 text-zinc-500 font-mono text-[10px]">
                        <div className="w-2 h-2 rounded-full bg-primary" /> WASM_VM ACTIVE // RUNTIME: RELATIONAL_VFS
                     </div>
                     <textarea 
                        value={sqlQuery}
                        onChange={e => setSqlQuery(e.target.value)}
                        className="w-full bg-transparent text-primary font-mono text-sm h-32 outline-none resize-none border-b border-zinc-800 pb-4 mb-4"
                     />
                     <div className="flex justify-between items-center">
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Type raw SQL above and execute</p>
                        <button onClick={runSql} className="bg-primary text-primary-foreground font-black uppercase tracking-widest px-8 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Execute Query</button>
                     </div>
                  </div>

                  {queryError && (
                    <div className="bg-destructive/10 border border-destructive/30 p-4 rounded-2xl flex items-center gap-3 text-destructive animate-scale-in">
                       <AlertTriangle size={16} />
                       <p className="font-mono text-xs">{queryError}</p>
                    </div>
                  )}

                  <div className="bg-card border border-border rounded-[2rem] overflow-hidden">
                    <div className="p-4 bg-surface-light border-b border-border flex justify-between items-center">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Result Output ({queryResults.length} rows)</h4>
                    </div>
                    <div className="overflow-x-auto max-h-96 no-scrollbar">
                       {queryResults.length > 0 ? (
                         <table className="w-full text-left font-mono text-xs">
                            <thead className="bg-surface-light/50 sticky top-0">
                               <tr>
                                  {Object.keys(queryResults[0]).map(k => (
                                    <th key={k} className="px-4 py-3 border-b border-border text-primary uppercase">{k}</th>
                                  ))}
                               </tr>
                            </thead>
                            <tbody>
                               {queryResults.map((row, i) => (
                                 <tr key={i} className="hover:bg-primary/5 transition-colors border-b border-border/50">
                                    {Object.values(row).map((v: any, j) => (
                                      <td key={j} className="px-4 py-2 border-r border-border/50 whitespace-nowrap">{String(v)}</td>
                                    ))}
                                 </tr>
                               ))}
                            </tbody>
                         </table>
                       ) : (
                         <div className="py-20 text-center space-y-3">
                            <Search className="mx-auto text-muted-foreground/20" size={32} />
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">No data in current projection</p>
                         </div>
                       )}
                    </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-12 animate-fade-in">
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b border-border pb-4">
                  <Palette className="text-primary" size={20} />
                  <h3 className="text-xl font-black uppercase tracking-tight text-foreground">THEME PRESETS</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {THEME_PRESETS.map((preset) => (
                    <button key={preset.id} onClick={() => updateSettings({ primaryColor: preset.color })} className={`relative group border-2 rounded-2xl p-4 flex flex-col items-center gap-3 transition-all duration-300 ${settings.primaryColor.toLowerCase() === preset.color.toLowerCase() ? 'border-primary bg-primary/5' : 'border-border bg-surface-light hover:border-primary/40'}`}>
                      <div className="w-10 h-10 rounded-xl shadow-lg transition-transform group-hover:scale-110" style={{ backgroundColor: preset.color }} />
                      <div className="text-center">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-50 mb-0.5">{preset.name}</p>
                        <p className="text-[11px] font-black text-foreground">{preset.label}</p>
                      </div>
                      {settings.primaryColor.toLowerCase() === preset.color.toLowerCase() && <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full"><Check size={10} strokeWidth={4} /></div>}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;