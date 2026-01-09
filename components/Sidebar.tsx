import React, { useContext } from 'react';
import { 
  UserCheck, BedDouble, Tags, Users, 
  Settings as SettingsIcon, ChevronRight, ChevronLeft, X, ShieldAlert, Database
} from 'lucide-react';
import { BillingContext, AuthContext, UIContext, SettingsContext } from '../App';
import { ViewType } from '../types';

const Sidebar: React.FC = () => {
  const billing = useContext(BillingContext);
  const auth = useContext(AuthContext);
  const ui = useContext(UIContext);
  const settingsCtx = useContext(SettingsContext);

  if (!billing || !auth || !ui || !settingsCtx) return null;
  const { settings } = settingsCtx;
  const { isSidebarCollapsed, setSidebarCollapsed } = ui;

  const mainNav = [
    { id: 'outpatient', label: 'Outpatient', icon: UserCheck, role: 'any' },
    { id: 'inpatient', label: 'Inpatient', icon: BedDouble, role: 'any' },
    { id: 'pricing', label: 'Inventory', icon: Tags, role: 'any' },
    { id: 'patients', label: 'Patients', icon: Users, role: 'any' },
  ];

  const handleNavClick = (view: ViewType) => {
    billing.setCurrentView(view);
    ui.setSidebarOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {ui.isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-fade-in"
          onClick={() => ui.setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={`
        fixed lg:static top-0 left-0 h-full bg-background border-r border-border flex flex-col z-[70] transition-all duration-300 ease-in-out
        ${ui.isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isSidebarCollapsed ? 'w-20' : 'w-72'}
      `}>
        <button 
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-10 bg-card border border-border rounded-full items-center justify-center text-muted-foreground hover:text-primary transition-all z-20 shadow-md hover:scale-110 active:scale-95"
        >
          {isSidebarCollapsed ? <ChevronRight size={14} strokeWidth={3} /> : <ChevronLeft size={14} strokeWidth={3} />}
        </button>

        <div className={`p-8 flex items-center border-b border-border/50 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => handleNavClick('outpatient')}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg shrink-0 bg-primary shadow-primary/30`}>
              <Database className="text-primary-foreground" size={24} strokeWidth={2.5} />
            </div>
            {!isSidebarCollapsed && (
              <div className="animate-fade-in">
                <h1 className="text-lg font-black tracking-tight leading-none uppercase text-foreground">{settings.appName}</h1>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">{settings.appSubtitle}</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => ui.setSidebarOpen(false)}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        </div>

        <div className={`flex-1 overflow-y-auto no-scrollbar py-6 ${isSidebarCollapsed ? 'px-2' : 'px-6'} space-y-10`}>
          <div>
            {!isSidebarCollapsed && (
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-4 mb-6 opacity-60">Terminal Navigation</h3>
            )}
            <div className="space-y-2">
              {mainNav.map((item) => {
                const Icon = item.icon;
                const isActive = billing.currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id as ViewType)}
                    className={`
                      w-full flex items-center rounded-2xl transition-all group relative
                      ${isSidebarCollapsed ? 'justify-center p-4' : 'justify-between px-5 py-3.5'}
                      ${isActive 
                        ? 'bg-primary text-primary-foreground font-black shadow-lg shadow-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-surface-light font-bold'}
                    `}
                    title={isSidebarCollapsed ? item.label : ''}
                  >
                    <div className="flex items-center gap-4">
                      <Icon size={20} strokeWidth={isActive ? 3 : 2} className="shrink-0" />
                      {!isSidebarCollapsed && (
                        <span className="text-[13px] tracking-tight">{item.label}</span>
                      )}
                    </div>
                    {isActive && !isSidebarCollapsed && <ChevronRight size={16} strokeWidth={3} />}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            {!isSidebarCollapsed && (
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-4 mb-6 opacity-60">System Core</h3>
            )}
            <div className="space-y-2">
              <button
                onClick={() => handleNavClick('settings')}
                className={`
                  w-full flex items-center rounded-2xl transition-all font-bold
                  ${isSidebarCollapsed ? 'justify-center p-4' : 'gap-4 px-5 py-3.5'}
                  ${billing.currentView === 'settings' 
                    ? 'bg-primary text-primary-foreground font-black' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-surface-light'}
                `}
                title={isSidebarCollapsed ? 'Configuration' : ''}
              >
                <SettingsIcon size={20} className="shrink-0" />
                {!isSidebarCollapsed && <span className="text-[13px] tracking-tight">System Settings</span>}
              </button>
            </div>
          </div>
        </div>

        <div className={`p-6 transition-all duration-300 ${isSidebarCollapsed ? 'px-2' : 'px-6'}`}>
          <div className={`
            bg-card border border-border rounded-2xl transition-all duration-300 overflow-hidden shadow-sm
            ${isSidebarCollapsed ? 'p-2 opacity-80' : 'p-4 opacity-100'}
          `}>
            <div className={`flex items-center gap-4 group ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors bg-primary/10 border-primary/20`}>
                <ShieldAlert size={16} className="text-primary" />
              </div>
              
              {!isSidebarCollapsed && (
                <>
                  <div className="flex-1 min-w-0 animate-fade-in">
                    <h4 className="text-sm font-black truncate text-foreground leading-none">{auth.user?.fullName}</h4>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;