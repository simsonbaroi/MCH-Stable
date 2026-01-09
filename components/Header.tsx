import React, { useState, useEffect, useContext, useRef } from 'react';
import { Sun, Moon, Bell, Search, Settings, Menu, TrendingUp, Clock, X, Database, ShieldCheck } from 'lucide-react';
import { SettingsContext, UIContext, BillingContext, AuthContext } from '../App';

const Header: React.FC = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-GB'));
  const [showPriceUpdates, setShowPriceUpdates] = useState(false);
  const settingsCtx = useContext(SettingsContext);
  const ui = useContext(UIContext);
  const billing = useContext(BillingContext);
  const auth = useContext(AuthContext);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-GB'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowPriceUpdates(false);
      }
    };
    if (showPriceUpdates) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPriceUpdates]);

  if (!settingsCtx || !ui || !billing || !auth) return null;
  const { settings, updateSettings } = settingsCtx;

  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  const recentPriceUpdates = settings.inventory
    .filter(item => item.updatedAt && (now - item.updatedAt < SEVEN_DAYS_MS))
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  return (
    <header className="h-[70px] md:h-[80px] border-b border-border flex items-center px-4 md:px-8 bg-background/80 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        <button 
          onClick={() => ui.setSidebarOpen(true)}
          className={`lg:hidden p-2.5 rounded-xl border shadow-sm transition-all active:scale-95 bg-primary/10 border-primary/20 text-primary`}
        >
          <Menu size={20} strokeWidth={2.5} />
        </button>

        <div className="hidden lg:flex items-center gap-4 bg-surface-light/50 px-4 py-2 rounded-2xl border border-border">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse bg-primary`} />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">SQLite Engine: Online</span>
          </div>
          <div className="w-[1px] h-3 bg-border" />
          <div className="flex items-center gap-2">
            <Database size={12} className="text-primary" />
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{settings.inventory.length} Records</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6">
        <div className={`font-mono font-black text-sm md:text-xl tracking-widest px-2 md:px-4 flex items-center border-x border-border/50 h-full transition-colors text-primary`}>
          {time}
        </div>

        <div className="flex items-center gap-3 relative" ref={notificationRef}>
          <button 
            onClick={() => updateSettings({ isDarkMode: !settings.isDarkMode })}
            className={`group relative flex h-9 w-16 items-center rounded-full bg-muted border border-border p-1 transition-all duration-300 hover:border-primary/50`}
            title="Toggle Theme"
          >
            <div className={`
              flex h-7 w-7 items-center justify-center rounded-full transition-all duration-500 shadow-md
              ${settings.isDarkMode 
                ? 'translate-x-7 bg-primary text-primary-foreground' 
                : 'translate-x-0 bg-white border border-border text-primary'}
            `}>
              {settings.isDarkMode ? <Moon size={14} strokeWidth={3} /> : <Sun size={14} strokeWidth={3} />}
            </div>
          </button>
          
          <button 
            onClick={() => setShowPriceUpdates(!showPriceUpdates)}
            className={`p-2 md:p-2.5 rounded-xl border shadow-sm transition-all active:scale-95 relative
              ${showPriceUpdates ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:text-primary'}
            `}
          >
             <Bell size={18} />
             {recentPriceUpdates.length > 0 && (
               <div className={`absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] text-white text-[9px] font-black rounded-full border-2 border-background animate-scale-in bg-accent-red`}>
                 {recentPriceUpdates.length}
               </div>
             )}
          </button>

          {showPriceUpdates && (
            <div className="absolute right-0 top-full mt-4 w-[320px] bg-card border border-border rounded-[2rem] shadow-2xl animate-scale-in overflow-hidden z-50">
              <div className="p-6 bg-surface-light border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className="text-primary" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest">Price Registry Updates</h3>
                </div>
                <button onClick={() => setShowPriceUpdates(false)} className="text-muted-foreground hover:text-foreground p-1">
                  <X size={14} />
                </button>
              </div>
              <div className="max-h-[400px] overflow-y-auto no-scrollbar p-2">
                {recentPriceUpdates.length === 0 ? (
                  <div className="py-12 px-8 text-center space-y-3">
                    <Clock size={32} className="mx-auto text-muted-foreground opacity-20" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">No price adjustments recorded in the last 7 days.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {recentPriceUpdates.map((update) => (
                      <div key={update.id} className="p-4 rounded-2xl hover:bg-surface-light transition-colors border border-transparent hover:border-border">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-black truncate max-w-[180px]">{update.name}</p>
                          <p className={`text-xs font-mono font-black text-primary`}>৳{update.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                          <span className={`bg-primary/10 text-primary px-1.5 py-0.5 rounded-md`}>{update.category}</span>
                          <span className="flex items-center gap-1 opacity-60">
                            <Clock size={8} />
                            {new Date(update.updatedAt || 0).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <button 
            onClick={() => billing.setCurrentView('settings')}
            className={`p-2 md:p-2.5 rounded-xl border transition-all active:scale-95 flex items-center gap-2
              ${billing.currentView === 'settings' 
                ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' 
                : 'bg-card border-border text-primary hover:bg-primary/5 shadow-sm'}`}
          >
             <ShieldCheck size={18} className={billing.currentView === 'settings' ? 'animate-pulse' : ''} />
             <span className="hidden md:block text-[10px] font-black uppercase tracking-widest">Console</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;