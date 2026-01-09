import React, { useState } from 'react';
import { ArrowLeft, FlaskConical, ChevronDown, Check, Plus, Minus, Banknote } from 'lucide-react';
import { InventoryItem, BillItem } from '../types';

interface DosagePanelProps {
  item: InventoryItem;
  onClose: () => void;
  onAddToBill: (billItem: BillItem) => void;
}

const DosagePanel: React.FC<DosagePanelProps> = ({ item, onClose, onAddToBill }) => {
  const [doseQty, setDoseQty] = useState('1.0');
  const [doseType, setDoseType] = useState(item.type || 'Tablet');
  const [doseFreq, setDoseFreq] = useState('3');
  const [doseDays, setDoseDays] = useState('7');
  const [serviceQty, setServiceQty] = useState('1');
  const [unitPrice, setUnitPrice] = useState(item.price.toString());
  
  const isMedicine = ['Medicine', 'Discharge Medicine', 'MEDICINE, ORS & ANESTHESIA, KET, SPINAL', 'DISCHARGE MEDICINE'].includes(item.category) || 
                     ['Tablet', 'Capsule', 'Injection', 'Syrup'].includes(item.type);

  const calculateTotal = () => {
    const price = parseFloat(unitPrice) || 0;
    if (isMedicine) {
      const q = parseFloat(doseQty) || 0;
      const f = parseInt(doseFreq) || 0;
      const d = parseInt(doseDays) || 0;
      return q * f * d * price;
    }
    return (parseFloat(serviceQty) || 0) * price;
  };

  const calculateUnits = () => {
    if (isMedicine) {
      const q = parseFloat(doseQty) || 0;
      const f = parseInt(doseFreq) || 0;
      const d = parseInt(doseDays) || 0;
      return q * f * d;
    }
    return parseFloat(serviceQty) || 0;
  };

  const handleAdd = () => {
    const subtotal = calculateTotal();
    const qty = calculateUnits();
    const price = parseFloat(unitPrice) || 0;
    
    onAddToBill({
      ...item,
      price: price,
      qty,
      subtotal,
      dosage: isMedicine ? {
        qty: doseQty,
        freq: doseFreq,
        days: doseDays,
        route: doseType
      } : undefined
    });
    onClose();
  };

  const Counter = ({ value, onChange, label, step = 1, min = 0 }: any) => (
    <div className="space-y-1">
      <label className="text-[7px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest block px-1">{label}</label>
      <div className="flex items-center bg-surface-light border border-border rounded-xl p-1 overflow-hidden group focus-within:border-primary transition-all">
        <button 
          type="button"
          onClick={() => onChange(Math.max(min, parseFloat(value) - step).toString())}
          className="p-2 md:p-2.5 bg-card hover:bg-primary hover:text-white text-muted-foreground rounded-lg transition-all active:scale-90"
        >
          <Minus size={14} strokeWidth={3} />
        </button>
        <input 
          type="number" 
          value={value} 
          onChange={e => onChange(e.target.value)}
          className="w-full bg-transparent text-center font-black text-sm md:text-base outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button 
          type="button"
          onClick={() => onChange((parseFloat(value) + step).toString())}
          className="p-2 md:p-2.5 bg-card hover:bg-primary hover:text-white text-muted-foreground rounded-lg transition-all active:scale-90"
        >
          <Plus size={14} strokeWidth={3} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="animate-scale-in w-full">
      <div className="bg-card border border-primary/30 rounded-2xl p-4 md:p-6 shadow-xl relative overflow-hidden ring-1 ring-primary/10">
        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-2xl rounded-full -mr-12 -mt-12 pointer-events-none" />

        <div className="flex flex-col gap-4 md:gap-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="bg-primary/10 p-2 rounded-xl shrink-0">
                 <FlaskConical className="text-primary w-4 h-4 md:w-5 md:h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm md:text-lg font-black tracking-tight truncate leading-tight uppercase">
                  {item.name}
                </h4>
                <p className="text-[7px] md:text-[8px] font-black text-primary uppercase tracking-[0.2em] mt-0.5">Configuration Portal</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 bg-surface-light border border-border rounded-lg hover:text-primary transition-all active:scale-90 text-muted-foreground"
            >
              <ArrowLeft size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="col-span-full md:col-span-2 space-y-1">
              <label className="text-[7px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest block px-1">Set Unit Price (৳)</label>
              <div className="relative group">
                <Banknote className="absolute left-4 top-1/2 -translate-y-1/2 text-primary opacity-40 group-focus-within:opacity-100" size={18} />
                <input 
                  type="number"
                  value={unitPrice}
                  onChange={e => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-surface-light border border-border rounded-xl pl-12 pr-4 py-3 md:py-3.5 focus:border-primary outline-none transition-all font-mono font-black text-sm md:text-base text-primary"
                />
              </div>
            </div>

            {!isMedicine && (
              <div className="col-span-full md:col-span-2">
                <Counter label="Quantity Units" value={serviceQty} onChange={setServiceQty} min={1} />
              </div>
            )}

            {isMedicine && (
              <>
                <Counter label="Dose Qty" value={doseQty} onChange={setDoseQty} step={0.5} min={0.5} />
                <div className="space-y-1">
                  <label className="text-[7px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest block px-1">Route</label>
                  <div className="relative">
                    <select 
                      value={doseType} onChange={e => setDoseType(e.target.value)}
                      className="w-full bg-surface-light border border-border rounded-xl px-3 py-3 md:py-3.5 focus:border-primary outline-none transition-all font-black text-sm md:text-base appearance-none"
                    >
                      <option value="Tablet">Tablet</option>
                      <option value="Capsule">Capsule</option>
                      <option value="Injection">Injection</option>
                      <option value="Oral">Oral</option>
                      <option value="IV">IV</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[7px] md:text-[9px] font-black text-muted-foreground uppercase tracking-widest block px-1">Frequency</label>
                  <div className="relative">
                    <select 
                      value={doseFreq} onChange={e => setDoseFreq(e.target.value)}
                      className="w-full bg-surface-light border border-border rounded-xl px-3 py-3 md:py-3.5 focus:border-primary outline-none transition-all font-black text-sm md:text-base appearance-none"
                    >
                      <option value="1">QD (Once)</option>
                      <option value="2">BID (Twice)</option>
                      <option value="3">TID (Thrice)</option>
                      <option value="4">QID (Four)</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <Counter label="Days" value={doseDays} onChange={setDoseDays} min={1} />
              </>
            )}
          </div>

          <div className="pt-3 border-t border-border flex justify-end">
            <button 
              onClick={handleAdd}
              className="w-full md:w-auto bg-primary text-primary-foreground font-black rounded-xl px-12 md:px-16 py-4 flex items-center justify-center gap-3 hover:shadow-lg active:scale-95 transition-all uppercase text-[11px] md:text-xs tracking-[0.3em]"
            >
              <Check size={20} strokeWidth={3} />
              COMMIT TO BILL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DosagePanel;
