
export interface InventoryItem {
  id: number;
  name: string;
  price: number;
  type: string;
  strength?: string;
  category: string; // References the category name
  updatedAt?: number; // Timestamp of the last price/record update
}

export interface TerminalButton {
  id: string;
  label: string;
  targetTerminal: 'inpatient' | 'outpatient';
  mappedCategory: string; // The category it pulls items from
}

export interface BillItem extends InventoryItem {
  qty: number;
  subtotal: number;
  dosage?: {
    qty: string;
    freq: string;
    days: string;
    route: string;
  };
}

export interface Patient {
  id: number;
  name: string;
  age: number;
  phone: string;
}

export type ViewType = 'outpatient' | 'inpatient' | 'pricing' | 'patients' | 'settings';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'billing_clerk';
}

export interface AuthContextType {
  user: User | null;
  role: 'admin' | 'billing_clerk';
  isLoading: boolean;
  signOut: () => Promise<void>;
  login: (user: User) => void;
  adminKeyExists: boolean;
  setAdminKey: (key: string) => void;
  verifyAdminKey: (key: string) => boolean;
}

export interface Settings {
  appName: string;
  appSubtitle: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor: string;
  backgroundColor: string;
  cardColor: string;
  fontFamily: string;
  isDarkMode: boolean;
  inventory: InventoryItem[];
  categories: string[]; // Independent category list
  terminalButtons: TerminalButton[]; // Custom button layouts
  requireLogin: boolean; // Toggle for the login screen requirement
}

export interface BillingContextType {
  bill: BillItem[];
  addToBill: (item: BillItem) => void;
  removeFromBill: (index: number) => void;
  clearBill: () => void;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
}
