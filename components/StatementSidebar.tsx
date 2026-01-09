import React, { useContext, useState } from 'react';
import { X, Printer, Calculator, Activity, CheckCircle2, ChevronDown } from 'lucide-react';
import { BillingContext, UIContext } from '../App';

interface StatementSidebarProps {
  className?: string;
}

const StatementSidebar: React.FC<StatementSidebarProps> = ({ className }) => {
  const billing = useContext(BillingContext);
  const ui = useContext(UIContext);
  const [isCommitted, setIsCommitted] = useState(false);

  if (!billing || !ui) return null;

  const total = billing.bill.reduce((sum, item) => sum + item.subtotal, 0);
  const categories = Array.from(new Set(billing.bill.map(item => item.category))).sort();

  const handleGenerateInvoice = () => {
    setIsCommitted(true);
    ui.notify(`Statement Finalized${total > 0 ? `: ৳${total.toFixed(2)}` : ''}`);
    setTimeout(() => {
      billing.clearBill();
      setIsCommitted(false);
      ui.setBillDrawerOpen(false);
    }, 2000);
  };

  const content = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <div className="flex items-center gap-3">
          <Calculator className="text-primary w-5 h-5" />
          <h3 className="text-xl font-bold tracking-tight text-foreground">Bill Summary</h3>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={billing.clearBill} 
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive"
          >
            Clear All
          </button>
          <button 
            onClick={() => ui.setBillDrawerOpen(false)} 
            className="p-1 md:hidden text-muted-foreground"
          >
            <ChevronDown size={24} />
          </button>
        </div>
      </div>

      {/* Bill Items Scrollable Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pr-1 min-h-[100px]">
        {billing.bill.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 py-8">
            <Calculator className="w-16 h-16 text-muted-foreground/10 mb-6" strokeWidth={1} />
            <p className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] leading-relaxed max-w-[200px]">
              Empty Statement Index. Select items to proceed.
            </p>
          </div>
        ) : (
          categories.map(cat => (
            <div key={cat} className="mb-6 animate-fade-in">
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-4 border-b border-primary/10 pb-1">{cat}</h4>
              <div className="space-y-4">
                {billing.bill.filter(item => item.category === cat).map((item, idx) => (
                  <div key={`${item.id}-${idx}`} className="group flex justify-between items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black truncate text-foreground">{item.name}</p>
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                        {item.qty} units {item.price > 0 ? `@ ৳${item.price.toFixed(0)}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.subtotal > 0 && (
                        <span className="text-xs font-mono font-bold text-foreground">৳{item.subtotal.toFixed(0)}</span>
                      )}
                      <button 
                        onClick={() => billing.removeFromBill(billing.bill.indexOf(item))} 
                        className="p-1 text-muted-foreground hover:text-destructive transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Summary */}
      <div className="pt-6 mt-4 space-y-4 border-t border-border shrink-0 bg-card pb-12 md:pb-6">
        <div className="flex justify-between items-end">
          <span className="font-black text-xs md:text-sm uppercase tracking-widest text-muted-foreground">Grand Total:</span>
          <div className="flex items-center gap-1">
             <span className="text-primary text-2xl md:text-3xl font-black">৳</span>
             <span className="font-mono font-black text-3xl md:text-4xl text-primary tracking-tighter">
               {total > 0 ? total.toLocaleString('en-IN', { minimumFractionDigits: 0 }) : '0'}
             </span>
          </div>
        </div>

        <button 
          className={`w-full font-black rounded-2xl py-5 md:py-6 text-[12px] md:text-sm transition-all flex items-center justify-center gap-3 uppercase tracking-[0.3em] disabled:opacity-20 disabled:cursor-not-allowed group shadow-lg 
            ${isCommitted ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-primary text-primary-foreground shadow-primary/30'}`}
          disabled={billing.bill.length === 0 || isCommitted}
          onClick={handleGenerateInvoice}
        >
          {isCommitted ? (
            <>Committed <CheckCircle2 size={20} strokeWidth={3} className="animate-scale-in" /></>
          ) : (
            <>Checkout <Printer size={20} strokeWidth={3} /></>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 opacity-50 pb-4">
          <Activity size={12} className="text-primary" />
          <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">Validated Terminal Session</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className={`hidden lg:flex bg-card border border-border rounded-[2.5rem] p-8 flex-col shadow-2xl overflow-hidden ${className || 'sticky top-[100px] h-[calc(100vh-160px)]'}`}>
        {content}
      </aside>

      {/* Mobile Drawer */}
      <div className={`
        fixed inset-0 z-[120] md:hidden transition-all duration-500 ease-in-out
        ${ui.isBillDrawerOpen ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => ui.setBillDrawerOpen(false)} />
        <div className="absolute inset-x-0 bottom-0 top-[10%] bg-card border-t border-border rounded-t-[3rem] p-8 pb-safe shadow-2xl overflow-hidden flex flex-col">
          <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-8 shrink-0" />
          {content}
        </div>
      </div>
    </>
  );
};

export default StatementSidebar;