import { useState, useContext, useMemo, useEffect } from 'react';
import { BillingContext, SettingsContext, UIContext } from '../App';
import DosagePanel from '../components/DosagePanel';
import StatementSidebar from '../components/StatementSidebar';
import { InventoryItem } from '../types';
import { X } from 'lucide-react';

const getCategoryMeta = () => {
  return { 
    color: 'text-primary', 
    bg: 'bg-primary/5', 
    border: 'border-primary/20', 
    hover: 'hover:border-primary/50 hover:bg-primary/10', 
    shadow: 'shadow-primary/5' 
  };
};

const isMedicineItem = (item: InventoryItem) => {
  const medicineCategories = ['MEDICINE, ORS & ANESTHESIA, KET, SPINAL', 'DISCHARGE MEDICINE'];
  const medicineTypes = ['Tablet', 'Capsule', 'Injection', 'Syrup'];
  return medicineCategories.includes(item.category) || medicineTypes.includes(item.type);
};

const OutpatientView: React.FC = () => {
  const billing = useContext(BillingContext);
  const settingsCtx = useContext(SettingsContext);
  const ui = useContext(UIContext);

  if (!billing || !settingsCtx || !ui) return null;
  const { settings } = settingsCtx;

  const buttons = useMemo(() => {
    return settings.terminalButtons.filter(b => b.targetTerminal === 'outpatient');
  }, [settings.terminalButtons]);

  const [isFocused, setIsFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  const activeBtn = buttons[activeIndex];
  
  const nextCategory = () => {
    setActiveIndex(prev => (prev + 1) % buttons.length);
    setSelectedItem(null);
  };
  const prevCategory = () => {
    setActiveIndex(prev => (prev - 1 + buttons.length) % buttons.length);
    setSelectedItem(null);
  };

  const goToCategory = (index: number) => {
    setActiveIndex(index);
    setIsFocused(true);
    setSelectedItem(null);
  };

  const handleItemClick = (item: InventoryItem) => {
    if (isMedicineItem(item)) {
      setSelectedItem(item);
    } else {
      const existingIdx = billing.bill.findIndex(bi => bi.id === item.id);
      if (existingIdx > -1) {
        billing.removeFromBill(existingIdx);
        ui.notify(`${item.name} removed from statement`);
      } else {
        billing.addToBill({
          ...item,
          qty: 1,
          subtotal: item.price
        });
        ui.notify(`${item.name} added to statement`);
      }
    }
  };

  const currentItems = useMemo(() => {
    if (!activeBtn) return [];
    return settings.inventory.filter(item => 
      item.category === activeBtn.mappedCategory &&
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activeBtn, searchQuery, settings.inventory]);

  useEffect(() => {
    if (!isFocused) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevCategory();
      if (e.key === 'ArrowRight') nextCategory();
      if (e.key === 'Escape') {
        if (selectedItem) setSelectedItem(null);
        else setIsFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [buttons.length, isFocused, selectedItem]);

  const prevIdx = (activeIndex - 1 + buttons.length) % buttons.length;
  const nextIdx = (activeIndex + 1) % buttons.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5 animate-fade-in max-w-7xl mx-auto">
      <div className="lg:col-span-8 space-y-3 md:space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-4">
            {isFocused && (
              <button 
                onClick={() => selectedItem ? setSelectedItem(null) : setIsFocused(false)}
                className="px-4 py-2 bg-surface-light border border-border rounded-xl hover:text-primary transition-all active:scale-95 text-[11px] font-black uppercase tracking-widest"
              >
                BACK
              </button>
            )}
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight leading-none text-foreground">
                OUTPATIENT <span className="text-muted-foreground font-light text-sm md:text-xl">TERM</span>
              </h2>
              <p className="text-[8px] md:text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-0.5">
                {selectedItem ? 'DOSAGE CONFIGURATION' : isFocused ? `INDEX: ${activeBtn?.label}` : 'SELECT CATEGORY'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => ui.setBillDrawerOpen(true)}
            className="lg:hidden relative px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-xl active:scale-95 text-[10px] font-black uppercase tracking-widest"
          >
            BILL
            {billing.bill.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 bg-primary text-white rounded-full text-[8px]">
                {billing.bill.length}
              </span>
            )}
          </button>
        </div>

        {!isFocused ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5 md:gap-4 animate-scale-in">
            {buttons.map((btn, idx) => {
              const itemCount = settings.inventory.filter(i => i.category === btn.mappedCategory).length;
              const meta = getCategoryMeta();
              return (
                <button
                  key={btn.id}
                  onClick={() => goToCategory(idx)}
                  className={`bg-card border ${meta.border} rounded-xl md:rounded-2xl p-4 md:p-5 flex flex-col items-center justify-center text-center gap-2.5 group ${meta.hover} transition-all shadow-sm ${meta.shadow} active:scale-95`}
                >
                  <div className="min-w-0 w-full">
                    <h3 className={`text-[10px] md:text-[11px] font-black uppercase tracking-widest mb-1 ${meta.color} leading-snug line-clamp-2`}>{btn.label}</h3>
                    <div className="inline-block px-2 py-1 bg-primary/10 rounded-md border border-primary/10 text-[7px] font-black uppercase tracking-[0.15em] text-primary">
                      {itemCount} Units
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2 md:space-y-3 animate-scale-in">
            <div className="bg-card border border-border rounded-xl md:rounded-2xl p-2 md:p-3 relative overflow-hidden shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] text-primary opacity-80 px-1">
                  CATEGORY HUB
                </h3>
                <button 
                  onClick={() => { setIsFocused(false); setSelectedItem(null); }}
                  className="p-1 text-muted-foreground hover:text-primary transition-all"
                >
                  <X size={16} strokeWidth={3} />
                </button>
              </div>

              <div className="relative h-12 md:h-14 flex items-center justify-center">
                <div className="grid grid-cols-3 w-full h-full items-center">
                  <button 
                    onClick={prevCategory} 
                    className="flex justify-center opacity-30 hover:opacity-100 transition-all scale-90 active:scale-75"
                  >
                    <span className="text-[9px] md:text-[11px] font-black uppercase text-primary truncate px-2 tracking-widest">
                      {buttons[prevIdx]?.label}
                    </span>
                  </button>

                  <div className="h-full flex flex-col items-center justify-center text-center border-x border-border px-2 md:px-6">
                    <h4 className="font-black text-base md:text-2xl uppercase text-primary leading-none tracking-tight truncate w-full">
                      {activeBtn?.label}
                    </h4>
                    <p className="text-[7px] md:text-[9px] font-black text-muted-foreground uppercase tracking-[0.3em] mt-1 opacity-70">
                      {settings.inventory.filter(i => i.category === activeBtn?.mappedCategory).length} INDEXED
                    </p>
                  </div>

                  <button 
                    onClick={nextCategory} 
                    className="flex justify-center opacity-30 hover:opacity-100 transition-all scale-90 active:scale-75"
                  >
                    <span className="text-[9px] md:text-[11px] font-black uppercase text-primary truncate px-2 tracking-widest">
                      {buttons[nextIdx]?.label}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {selectedItem ? (
              <div className="animate-fade-in-down pb-4">
                <DosagePanel 
                  item={selectedItem} 
                  onClose={() => setSelectedItem(null)} 
                  onAddToBill={(bi) => billing.addToBill(bi)} 
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between border-b border-border pb-1.5 md:pb-2 px-1">
                  <h3 className="text-sm md:text-lg font-black uppercase tracking-tight text-primary leading-none">{activeBtn?.label}</h3>
                  <div className="relative w-full max-w-[130px] md:max-w-xs">
                    <input 
                      type="text" 
                      placeholder="SEARCH INDEX..." 
                      value={searchQuery} 
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-[10px] md:text-xs font-bold outline-none focus:border-primary transition-all text-foreground uppercase tracking-widest"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[400px] md:max-h-[500px] overflow-y-auto pr-1 no-scrollbar pb-16 md:pb-10">
                  {currentItems.map(item => {
                    const isInBill = billing.bill.some(bi => bi.id === item.id);
                    const isMedicine = isMedicineItem(item);
                    return (
                      <button 
                        key={item.id} 
                        onClick={() => handleItemClick(item)} 
                        className={`bg-card border rounded-xl p-3 md:p-4 flex justify-between items-center group active:bg-surface-light transition-all text-left shadow-sm active:scale-[0.98] 
                          ${isInBill ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-border hover:border-primary/40'}
                        `}
                      >
                        <div className="min-w-0 pr-4">
                          <p className={`font-bold text-xs md:text-sm truncate uppercase tracking-tight transition-colors ${isInBill ? 'text-primary' : 'group-hover:text-primary text-foreground'}`}>{item.name}</p>
                          <p className="text-[8px] md:text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">{item.type} {item.strength ? `• ${item.strength}` : ''}</p>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          {item.price > 0 && (
                            <span className="text-[11px] font-mono font-black text-muted-foreground/60 tracking-tighter">৳{item.price.toFixed(0)}</span>
                          )}
                          <div className={`px-3 py-1.5 rounded-lg transition-all text-[9px] font-black uppercase tracking-widest
                            ${isInBill && !isMedicine 
                              ? 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-white' 
                              : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'}
                          `}>
                            {isInBill && !isMedicine ? 'REMOVE' : isMedicine ? 'CONFIG' : 'ADD'}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="lg:col-span-4 h-full">
        <StatementSidebar />
      </div>
    </div>
  );
};

export default OutpatientView;