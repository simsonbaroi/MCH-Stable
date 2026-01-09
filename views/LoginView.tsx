
import React, { useState, useContext } from 'react';
import { Lock, ChevronRight, ShieldCheck, Activity, MapPin, UserCog, ShieldAlert, Key, UserCircle2 } from 'lucide-react';
import { AuthContext, UIContext } from '../App';

const LoginView: React.FC<{ onLogin: (pass: string, isAdmin: boolean) => void }> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const auth = useContext(AuthContext);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    onLogin(password, isAdminMode);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-background overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-1/4 -left-1/4 w-1/2 h-1/2 blur-[160px] rounded-full transition-all duration-1000 ${isAdminMode ? 'bg-amber-500/20' : 'bg-primary/20'}`} />
        <div className={`absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 blur-[160px] rounded-full transition-all duration-1000 ${isAdminMode ? 'bg-orange-500/10' : 'bg-emerald-500/10'}`} />
      </div>

      <div className="max-w-md w-full relative z-10 space-y-8">
        {/* Branding */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="flex justify-center">
            <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-700 ${isAdminMode ? 'bg-amber-500 rotate-12' : 'bg-primary'}`}>
              {isAdminMode ? <ShieldAlert className="text-white" size={40} /> : <Activity className="text-white" size={40} strokeWidth={2.5} />}
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground leading-none">MCH TERMINAL</h1>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] mt-2 opacity-60">Revenue & Registry Management</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-3 p-1.5 bg-card border border-border rounded-[2rem]">
          <button 
            type="button"
            onClick={() => { setIsAdminMode(false); setPassword(''); }}
            className={`flex flex-col items-center gap-2 py-4 rounded-2xl transition-all ${!isAdminMode ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:bg-surface-light'}`}
          >
            <UserCircle2 size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Cashier</span>
          </button>
          <button 
            type="button"
            onClick={() => { setIsAdminMode(true); setPassword(''); }}
            className={`flex flex-col items-center gap-2 py-4 rounded-2xl transition-all ${isAdminMode ? 'bg-amber-500 text-white shadow-lg' : 'text-muted-foreground hover:bg-surface-light'}`}
          >
            <UserCog size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest">Admin</span>
          </button>
        </div>

        {/* Login Form */}
        <div className={`bg-card border border-border rounded-[2.5rem] p-8 md:p-10 shadow-2xl transition-all duration-500 ${isAdminMode ? 'border-amber-500/30 ring-1 ring-amber-500/10' : ''}`}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <h2 className={`text-xs font-black uppercase tracking-widest ${isAdminMode ? 'text-amber-500' : 'text-primary'}`}>
                  {isAdminMode ? 'ROOT SECURITY CLEARANCE' : 'STAFF AUTHENTICATION'}
                </h2>
                <Lock size={14} className="opacity-30" />
              </div>
              
              <div className="relative group">
                <Key className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${isAdminMode ? 'text-amber-500' : 'text-primary'} opacity-40 group-focus-within:opacity-100`} size={20} />
                <input 
                  autoFocus
                  type="password" 
                  placeholder={isAdminMode && !auth?.adminKeyExists ? "SET MASTER KEY..." : "ENTER PASSWORD"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-surface-light border-2 rounded-2xl pl-14 pr-6 py-5 outline-none transition-all font-black text-lg tracking-[0.2em] placeholder:tracking-normal placeholder:font-bold placeholder:opacity-30
                    ${isAdminMode ? 'border-amber-500/20 focus:border-amber-500' : 'border-border focus:border-primary'}`}
                />
              </div>
            </div>

            <button 
              type="submit"
              className={`w-full font-black rounded-2xl py-5 text-[11px] uppercase tracking-[0.3em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3
                ${isAdminMode 
                  ? 'bg-amber-500 text-white shadow-amber-500/20' 
                  : 'bg-primary text-primary-foreground shadow-primary/20'}`}
            >
              {isAdminMode && !auth?.adminKeyExists ? "Initialize System Core" : "Authorize Access"} 
              <ChevronRight size={16} strokeWidth={3} />
            </button>
          </form>

          {isAdminMode && !auth?.adminKeyExists && (
            <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl text-center">
               <p className="text-[9px] text-amber-500 font-black uppercase tracking-widest leading-relaxed">
                 Infrastructure Setup: The first password entered in Admin Mode will be encrypted as the Master Registry Key.
               </p>
            </div>
          )}
        </div>

        <div className="text-center opacity-40 space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">
            SECURE RELATIONAL TERMINAL // PERSISTENCE: SQLite
          </p>
          <div className="flex justify-center gap-4">
             <div className="w-1 h-1 rounded-full bg-primary" />
             <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
             <div className="w-1 h-1 rounded-full bg-primary" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;
