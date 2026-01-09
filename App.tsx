import React, { useState, useEffect, createContext, useContext, useCallback, useRef } from 'react';
import { 
  InventoryItem, BillItem, ViewType, User, AuthContextType, 
  Settings, BillingContextType, TerminalButton 
} from './types';
import { MOCK_INVENTORY, SYSTEM_CATEGORIES } from './constants';
import { INITIAL_REGISTRY_DATA } from './registryData';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import OutpatientView from './views/OutpatientView';
import InpatientView from './views/InpatientView';
import PricingView from './views/PricingView';
import PatientsView from './views/PatientsView';
import SettingsView from './views/SettingsView';
import { X, CheckCircle2, AlertCircle, UserCheck, BedDouble, Users, ShoppingCart, Database, Zap, ShieldAlert, RefreshCw } from 'lucide-react';

// ============= SQLITE SERVICE =============

declare var initSqlJs: any;

class SQLiteEngine {
  public db: any = null;
  private SQL: any = null;
  private isInitialized = false;
  private persistTimeout: any = null;

  async init() {
    if (this.isInitialized) return;
    
    try {
      this.SQL = await initSqlJs({
        locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
      });

      const savedBuffer = await this.loadFromIndexedDB();
      if (savedBuffer) {
        this.db = new this.SQL.Database(new Uint8Array(savedBuffer));
      } else {
        this.db = new this.SQL.Database();
        this.createSchema();
        this.seedInitialData();
      }
      
      this.isInitialized = true;
    } catch (err) {
      console.error("SQL_INIT_CRITICAL_FAILURE", err);
    }
  }

  private createSchema() {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS registry (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        type TEXT,
        strength TEXT,
        category TEXT,
        updatedAt INTEGER
      );
      CREATE TABLE IF NOT EXISTS categories (
        name TEXT PRIMARY KEY
      );
      CREATE TABLE IF NOT EXISTS terminal_buttons (
        id TEXT PRIMARY KEY,
        label TEXT,
        targetTerminal TEXT,
        mappedCategory TEXT
      );
    `);
  }

  public seedInitialData() {
    try {
      this.db.run("BEGIN TRANSACTION");
      this.db.run("DELETE FROM categories");
      this.db.run("DELETE FROM registry");
      this.db.run("DELETE FROM terminal_buttons");

      // Seed empty categories for structural definition
      SYSTEM_CATEGORIES.forEach(cat => {
        this.db.run("INSERT OR IGNORE INTO categories (name) VALUES (?)", [cat]);
      });

      // Seed the registry data
      const stmt = this.db.prepare(`
        INSERT INTO registry (id, name, price, type, strength, category, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      
      // CRITICAL FIX: Ignore IDs from seed files and generate a guaranteed unique sequence
      // to avoid 'UNIQUE constraint failed' if mock files have overlapping IDs.
      INITIAL_REGISTRY_DATA.forEach((item, index) => {
        stmt.run([
          index + 1, 
          item.name, 
          item.price || 0, 
          item.type || 'Service', 
          item.strength || '', 
          item.category, 
          Date.now()
        ]);
      });
      stmt.free();

      const ipdButtons = [
        { label: "BLOOD", cat: "BLOOD" },
        { label: "LABORATORY", cat: "LABORATORY" },
        { label: "LIMB AND BRACE", cat: "LIMB AND BRACE" },
        { label: "FOOD", cat: "FOOD" },
        { label: "HALO, O2, NO2, ETC.", cat: "HALO, O2, NO2, ETC." },
        { label: "ORTHOPEDIC, S. ROLL, ETC.", cat: "ORTHOPEDIC, S. ROLL, ETC." },
        { label: "SURGERY, O.R. & DELIVERY", cat: "SURGERY, O.R. & DELIVERY" },
        { label: "REGISTRATION FEES", cat: "REGISTRATION FEES" },
        { label: "DISCHARGE MEDICINE", cat: "PHARMACY" }, // Unified
        { label: "MEDICINE", cat: "PHARMACY" },           // Renamed from Routine Medicine + Unified
        { label: "PHYSICAL THERAPY", cat: "PHYSICAL THERAPY" },
        { label: "IV.'S", cat: "IV.'S" },
        { label: "PLASTER/MILK", cat: "PLASTER/MILK" },
        { label: "PROCEDURES", cat: "PROCEDURES" },
        { label: "SEAT & AD. FEE", cat: "SEAT & AD. FEE" },
        { label: "X-RAY", cat: "X-RAY" },
        { label: "LOST LAUNDRY", cat: "LOST LAUNDRY" },
        { label: "TRAVEL", cat: "TRAVEL" },
        { label: "OTHER", cat: "OTHER" }
      ];

      const opdButtons = [
        { label: "Registration, Medic & Dr. Fee", cat: "REGISTRATION FEES" },
        { label: "LAB", cat: "LABORATORY" },
        { label: "X-RAY", cat: "X-RAY" },
        { label: "MEDICINES", cat: "PHARMACY" }, // Unified
        { label: "OR", cat: "SURGERY, O.R. & DELIVERY" },
        { label: "PROCEDURES", cat: "PROCEDURES" },
        { label: "ORTHO", cat: "ORTHOPEDIC, S. ROLL, ETC." },
        { label: "LIMB AND BRACE", cat: "LIMB AND BRACE" },
        { label: "PT", cat: "PHYSICAL THERAPY" },
        { label: "O2", cat: "HALO, O2, NO2, ETC." },
        { label: "OTHERS", cat: "OTHER" }
      ];

      ipdButtons.forEach(btn => {
        this.db.run(`
          INSERT OR IGNORE INTO terminal_buttons (id, label, targetTerminal, mappedCategory)
          VALUES (?, ?, ?, ?)
        `, [`ipd-${btn.label.toLowerCase().replace(/[^a-z]/g, '')}`, btn.label, 'inpatient', btn.cat]);
      });

      opdButtons.forEach(btn => {
        this.db.run(`
          INSERT OR IGNORE INTO terminal_buttons (id, label, targetTerminal, mappedCategory)
          VALUES (?, ?, ?, ?)
        `, [`opd-${btn.label.toLowerCase().replace(/[^a-z]/g, '')}`, btn.label, 'outpatient', btn.cat]);
      });
      this.db.run("COMMIT");
    } catch (err) {
      try { this.db.run("ROLLBACK"); } catch (e) {}
      console.error("SEED_DATA_FATAL_ERROR", err);
    }
    this.persist(true);
  }

  private async loadFromIndexedDB(): Promise<ArrayBuffer | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open("MCH_SQLITE_STORE", 1);
      request.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        db.createObjectStore("files");
      };
      request.onsuccess = (e: any) => {
        const db = e.target.result;
        const tx = db.transaction("files", "readonly");
        const store = tx.objectStore("files");
        const getReq = store.get("mch_main.sqlite");
        getReq.onsuccess = () => resolve(getReq.result);
        getReq.onerror = () => resolve(null);
      };
      request.onerror = () => resolve(null);
    });
  }

  async persist(immediate = false) {
    if (!this.db) return;
    if (this.persistTimeout) clearTimeout(this.persistTimeout);
    
    const save = async () => {
      const binaryArray = this.db.export();
      return new Promise((resolve) => {
        const request = indexedDB.open("MCH_SQLITE_STORE", 1);
        request.onsuccess = (e: any) => {
          const db = e.target.result;
          const tx = db.transaction("files", "readwrite");
          const store = tx.objectStore("files");
          store.put(binaryArray, "mch_main.sqlite");
          tx.oncomplete = () => resolve(true);
        };
      });
    };

    if (immediate) {
      await save();
    } else {
      this.persistTimeout = setTimeout(save, 5000); 
    }
  }

  async importDatabase(buffer: ArrayBuffer) {
    if (!this.SQL) return;
    this.db = new this.SQL.Database(new Uint8Array(buffer));
    await this.persist(true);
    return true;
  }

  query(sql: string, params: any[] = []) {
    const stmt = this.db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  }

  run(sql: string, params: any[] = []) {
    this.db.run(sql, params);
    this.persist();
  }

  upsertRegistryItem(item: InventoryItem) {
    this.db.run(`
      INSERT INTO registry (id, name, price, type, strength, category, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        name=excluded.name,
        price=excluded.price,
        type=excluded.type,
        strength=excluded.strength,
        category=excluded.category,
        updatedAt=excluded.updatedAt
    `, [item.id, item.name, item.price, item.type, item.strength || '', item.category, item.updatedAt || Date.now()]);
    this.persist();
  }

  deleteRegistryItem(id: number) {
    this.db.run("DELETE FROM registry WHERE id = ?", [id]);
    this.persist();
  }

  syncRegistry(items: InventoryItem[]) {
    try {
      this.db.run("BEGIN TRANSACTION");
      this.db.run("DELETE FROM registry");
      const stmt = this.db.prepare("INSERT INTO registry (id, name, price, type, strength, category, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)");
      items.forEach(item => {
        stmt.run([item.id, item.name, item.price, item.type, item.strength || '', item.category, item.updatedAt || Date.now()]);
      });
      stmt.free();
      this.db.run("COMMIT");
    } catch (err) {
      try { this.db.run("ROLLBACK"); } catch (e) {}
      console.error("SYNC_REGISTRY_ERROR", err);
    }
    this.persist();
  }

  syncCategories(cats: string[]) {
    try {
      this.db.run("BEGIN TRANSACTION");
      this.db.run("DELETE FROM categories");
      const stmt = this.db.prepare("INSERT INTO categories (name) VALUES (?)");
      cats.forEach(c => stmt.run([c]));
      stmt.free();
      this.db.run("COMMIT");
    } catch (err) {
      try { this.db.run("ROLLBACK"); } catch (e) {}
      console.error("SYNC_CATEGORIES_ERROR", err);
    }
    this.persist();
  }

  syncButtons(btns: TerminalButton[]) {
    try {
      this.db.run("BEGIN TRANSACTION");
      this.db.run("DELETE FROM terminal_buttons");
      const stmt = this.db.prepare("INSERT INTO terminal_buttons (id, label, targetTerminal, mappedCategory) VALUES (?, ?, ?, ?)");
      btns.forEach(b => stmt.run([b.id, b.label, b.targetTerminal, b.mappedCategory]));
      stmt.free();
      this.db.run("COMMIT");
    } catch (err) {
      try { this.db.run("ROLLBACK"); } catch (e) {}
      console.error("SYNC_BUTTONS_ERROR", err);
    }
    this.persist();
  }

  getRegistry(): InventoryItem[] { return this.query("SELECT * FROM registry") as any; }
  getCategories(): string[] { return this.query("SELECT name FROM categories").map((r: any) => r.name); }
  getButtons(): TerminalButton[] { return this.query("SELECT * FROM terminal_buttons") as any; }
  
  exportFile() {
    const binaryArray = this.db.export();
    const blob = new Blob([binaryArray], { type: "application/x-sqlite3" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mch_main.sqlite";
    a.click();
    URL.revokeObjectURL(url);
  }
}

const sqlite = new SQLiteEngine();

// ============= CONTEXTS =============

export interface UIContextType {
  isSidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isBillDrawerOpen: boolean;
  setBillDrawerOpen: (open: boolean) => void;
  notify: (msg: string, type?: 'success' | 'error') => void;
  lastSync: number;
}

export const AuthContext = createContext<AuthContextType | null>(null);
export const SettingsContext = createContext<{ 
  settings: Settings; 
  updateSettings: (updates: Partial<Settings> | ((prev: Settings) => Partial<Settings>)) => void;
  resetSettings: () => void;
  importSettings: (data: Settings) => void;
  db: {
    runQuery: (sql: string) => any[];
    exportSqlite: () => void;
    importSqlite: (file: File) => Promise<void>;
    reseedDefaults: () => Promise<void>;
    upsertItem: (item: InventoryItem) => void;
    deleteItem: (id: number) => void;
  }
} | null>(null);
export const BillingContext = createContext<BillingContextType | null>(null);
export const UIContext = createContext<UIContextType | null>(null);

const DEFAULT_SETTINGS: Settings = {
  appName: 'MCH CASHIER',
  appSubtitle: 'BILLING SYSTEM',
  primaryColor: '#10b981',
  backgroundColor: '#050505',
  cardColor: '#121214',
  fontFamily: 'Plus Jakarta Sans',
  isDarkMode: true,
  inventory: [], 
  categories: [], 
  terminalButtons: [], 
  requireLogin: false,
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user] = useState<User>({ 
    id: '0', 
    email: 'admin@mch.local', 
    fullName: 'Cashier', 
    role: 'admin' 
  });

  const auth: AuthContextType = {
    user,
    role: 'admin',
    isLoading: false,
    adminKeyExists: true,
    signOut: async () => { console.log("Sign out disabled"); },
    login: () => {},
    setAdminKey: () => {},
    verifyAdminKey: () => true
  };

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

const hexToRgbComponents = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
};

const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isDbReady, setIsDbReady] = useState(false);
  const [lastSync, setLastSync] = useState(Date.now());
  const initialLoadRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      await sqlite.init();
      setSettings(prev => ({
        ...prev,
        inventory: sqlite.getRegistry(),
        categories: sqlite.getCategories(),
        terminalButtons: sqlite.getButtons(),
        ...JSON.parse(localStorage.getItem('mch_ui_settings') || '{}')
      }));
      setIsDbReady(true);
      setLastSync(Date.now());
      initialLoadRef.current = true;
    };
    load();
  }, []);

  useEffect(() => {
    if (!isDbReady) return;
    
    if (settings.isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }

    const root = document.documentElement;
    const rgb = hexToRgbComponents(settings.primaryColor);
    root.style.setProperty('--primary-rgb', rgb);
    root.style.setProperty('--primary', settings.primaryColor);
    root.style.setProperty('--primary-foreground', settings.isDarkMode ? '#050505' : '#ffffff');
    
    const uiSettings = {
      primaryColor: settings.primaryColor,
      fontFamily: settings.fontFamily,
      isDarkMode: settings.isDarkMode,
      requireLogin: settings.requireLogin,
      appName: settings.appName,
      appSubtitle: settings.appSubtitle
    };
    localStorage.setItem('mch_ui_settings', JSON.stringify(uiSettings));

    if (initialLoadRef.current) {
      const timeoutId = setTimeout(() => {
        sqlite.syncCategories(settings.categories);
        sqlite.syncButtons(settings.terminalButtons);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
    
    setLastSync(Date.now());
  }, [settings.categories, settings.terminalButtons, settings.primaryColor, settings.fontFamily, settings.isDarkMode, settings.requireLogin, isDbReady]);

  const updateSettings = useCallback((updates: Partial<Settings> | ((prev: Settings) => Partial<Settings>)) => {
    setSettings(prev => {
      const nextUpdates = typeof updates === 'function' ? updates(prev) : updates;
      return { ...prev, ...nextUpdates };
    });
  }, []);

  const resetSettings = useCallback(() => {
    localStorage.clear();
    indexedDB.deleteDatabase("MCH_SQLITE_STORE");
    window.location.reload();
  }, []);

  const importSqliteFile = async (file: File) => {
    setIsDbReady(false);
    const buffer = await file.arrayBuffer();
    await sqlite.importDatabase(buffer);
    window.location.reload();
  };

  const reseedDefaults = async () => {
    setIsDbReady(false);
    await sqlite.seedInitialData();
    window.location.reload();
  };

  if (!isDbReady) return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center gap-6">
       <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center animate-pulse">
          <Database className="text-primary" size={40} />
       </div>
       <div className="text-center">
          <h2 className="text-2xl font-black uppercase tracking-widest text-foreground">SQLite Engine</h2>
          <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Registry Optimizing...</p>
       </div>
    </div>
  );

  return (
    <SettingsContext.Provider value={{ 
      settings, updateSettings, resetSettings, 
      importSettings: (d) => setSettings(d),
      db: {
        runQuery: (sql) => sqlite.query(sql),
        exportSqlite: () => sqlite.exportFile(),
        importSqlite: importSqliteFile,
        reseedDefaults,
        upsertItem: (item) => sqlite.upsertRegistryItem(item),
        deleteItem: (id) => sqlite.deleteRegistryItem(id)
      }
    }}>
      <div style={{ fontFamily: settings.fontFamily }} data-last-sync={lastSync}>
        {children}
      </div>
    </SettingsContext.Provider>
  );
};

// Helper to identify "Exclusivity Groups" for Registration, Medic, and Doctor fees.
const getExclusivityGroup = (name: string): 'REGISTRATION' | 'MEDIC' | 'DOCTOR' | null => {
  const n = name.toLowerCase();
  
  if (n.includes('private consult')) return null;
  
  if (n.includes('registration fee')) return 'REGISTRATION';
  if (n.includes('medic')) return 'MEDIC';
  if (n.includes('dr. fee') || n.includes('doctor visit')) return 'DOCTOR';
  
  return null;
};

const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bill, setBill] = useState<BillItem[]>([]);
  const [currentView, setCurrentView] = useState<ViewType>('outpatient');

  const addToBill = useCallback((item: BillItem) => {
    setBill(prev => {
      const group = getExclusivityGroup(item.name);
      let nextBill = [...prev];
      
      if (group) {
        nextBill = nextBill.filter(bi => getExclusivityGroup(bi.name) !== group);
      }
      
      return [...nextBill, item];
    });
  }, []);

  const removeFromBill = useCallback((idx: number) => {
    setBill(p => p.filter((_, i) => i !== idx));
  }, []);

  const clearBill = useCallback(() => setBill([]), []);

  return (
    <BillingContext.Provider value={{ 
      bill, 
      addToBill, 
      removeFromBill,
      clearBill, 
      currentView, 
      setCurrentView
    }}>
      {children}
    </BillingContext.Provider>
  );
};

const Layout: React.FC = () => {
  const auth = useContext(AuthContext);
  const billing = useContext(BillingContext);
  const settingsCtx = useContext(SettingsContext);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isBillDrawerOpen, setBillDrawerOpen] = useState(false);
  const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null);
  const [lastSync, setLastSync] = useState(Date.now());

  if (!auth || !billing || !settingsCtx) return null;
  const { settings } = settingsCtx;

  useEffect(() => { setLastSync(Date.now()); }, [settings]);

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const renderView = () => {
    switch (billing.currentView) {
      case 'outpatient': return <OutpatientView />;
      case 'inpatient': return <InpatientView />;
      case 'pricing': return <PricingView />;
      case 'patients': return <PatientsView />;
      case 'settings': return <SettingsView />;
      default: return <OutpatientView />;
    }
  };

  return (
    <UIContext.Provider value={{ 
      isSidebarOpen, setSidebarOpen, 
      isSidebarCollapsed, setSidebarCollapsed,
      isBillDrawerOpen, setBillDrawerOpen,
      notify, lastSync
    }}>
      <div className="flex h-screen overflow-hidden bg-background text-foreground">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 no-scrollbar pb-10 md:pb-6">
            <div className="max-w-7xl mx-auto">{renderView()}</div>
          </main>
          {toast && (
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] animate-scale-in">
              <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border backdrop-blur-xl ${toast.type === 'success' ? 'bg-primary/20 border-primary/50 text-primary' : 'bg-destructive/20 border-destructive/50 text-destructive'}`}>
                {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                <span className="text-[10px] font-black uppercase tracking-widest">{toast.msg}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </UIContext.Provider>
  );
};

const App: React.FC = () => (
  <AuthProvider><SettingsProvider><BillingProvider><Layout /></BillingProvider></SettingsProvider></AuthProvider>
);
export default App;