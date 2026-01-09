
import React, { useContext } from 'react';
import { 
  TrendingUp, Users, Activity, CreditCard, PlusCircle, 
  ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import { BillingContext } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const MOCK_STATS = [
  { name: 'Mon', total: 45000 },
  { name: 'Tue', total: 52000 },
  { name: 'Wed', total: 38000 },
  { name: 'Thu', total: 61000 },
  { name: 'Fri', total: 48000 },
  { name: 'Sat', total: 25000 },
  { name: 'Sun', total: 18000 },
];

const HomeView: React.FC = () => {
  const billing = useContext(BillingContext);
  if (!billing) return null;

  return (
    <div className="space-y-10 animate-fade-in max-w-7xl mx-auto py-4">
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase mb-1">HOSPITAL OVERVIEW</h2>
          <p className="text-muted-foreground font-bold tracking-tight opacity-70">Real-time revenue cycle performance and facility status.</p>
        </div>
        <button 
          onClick={() => billing.setCurrentView('outpatient')}
          className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black flex items-center gap-3 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] active:scale-95 transition-all text-xs uppercase tracking-widest"
        >
          <PlusCircle size={20} strokeWidth={3} /> NEW OPD BILL
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Total Revenue', value: '৳ 2.4M', icon: CreditCard, color: 'text-primary' },
              { label: 'Total Patients', value: '1,284', icon: Users, color: 'text-primary' },
              { label: 'Bed Occupancy', value: '84%', icon: Activity, color: 'text-primary' },
              { label: 'Average Ticket', value: '৳ 1,850', icon: TrendingUp, color: 'text-primary' },
            ].map((stat, i) => (
              <div key={i} className="bg-card border border-border rounded-[2rem] p-8 flex items-center gap-6 group hover:border-primary/40 transition-all shadow-sm">
                <div className={`w-16 h-16 rounded-2xl bg-surface-light flex items-center justify-center shrink-0 border border-border group-hover:border-primary/20 transition-all ${stat.color}`}>
                  <stat.icon size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mb-2">{stat.label}</p>
                  <h4 className="text-3xl font-black tracking-tighter">{stat.value}</h4>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="bg-card border border-border rounded-[2.5rem] p-10 shadow-sm">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-black text-xl uppercase tracking-tight">Weekly Revenue Distribution</h3>
              <select className="bg-surface-light border border-border rounded-xl px-5 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary transition-all">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_STATS}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 11, fontWeight: 800}} dy={15} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--surface-light))'}} 
                    contentStyle={{background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '16px', fontWeight: 'bold'}}
                  />
                  <Bar dataKey="total" radius={[12, 12, 0, 0]}>
                    {MOCK_STATS.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 3 ? 'hsl(var(--primary))' : 'hsl(var(--primary)/0.3)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          <div className="bg-primary text-primary-foreground rounded-[2.5rem] p-10 shadow-2xl shadow-primary/10 relative overflow-hidden group">
            <Zap className="absolute -right-6 -bottom-6 w-48 h-48 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700" />
            <h3 className="text-2xl font-black mb-3 tracking-tighter uppercase">QUICK ACTIONS</h3>
            <p className="text-sm font-bold opacity-80 mb-8 leading-snug">Instantly navigate to core revenue terminals.</p>
            
            <div className="space-y-3 relative z-10">
              {[
                { label: 'Outpatient Billing', view: 'outpatient' },
                { label: 'Inpatient Care Units', view: 'inpatient' },
                { label: 'Manage Price Lists', view: 'pricing' },
              ].map((item, i) => (
                <button 
                  key={i} 
                  onClick={() => billing.setCurrentView(item.view as any)}
                  className="w-full bg-white/10 hover:bg-white/20 p-5 rounded-2xl flex items-center justify-between group/btn transition-all border border-white/5"
                >
                  <span className="font-black text-[13px] tracking-tight uppercase">{item.label}</span>
                  <ArrowRight size={20} className="group-hover/btn:translate-x-1.5 transition-transform" strokeWidth={3} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-[2.5rem] p-10 flex flex-col items-center text-center shadow-sm">
            <div className="w-20 h-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(var(--primary-rgb),0.05)]">
              <ShieldCheck className="text-primary" size={40} strokeWidth={2} />
            </div>
            <h4 className="font-black text-lg tracking-tight mb-2 uppercase">System Status: Active</h4>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-60">
              Database synchronized <br/>Backup: 12m ago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeView;
