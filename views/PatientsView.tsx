
import React, { useState } from 'react';
import { Users, Search, PlusCircle, User, Phone, Calendar, ArrowRight } from 'lucide-react';
import { MOCK_PATIENTS } from '../constants';

const PatientsView: React.FC = () => {
  const [patients] = useState(MOCK_PATIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black">PATIENT REGISTRY</h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Universal Patient Master Record</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary text-primary-foreground rounded-xl px-5 py-2.5 text-xs font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-primary/30 active:scale-95 transition-all uppercase tracking-widest"
        >
          <PlusCircle size={16} /> Register New
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-primary rounded-3xl p-8 shadow-2xl animate-scale-in">
          <h3 className="text-lg font-black mb-6">NEW PATIENT ENROLLMENT</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Full Name</label>
              <input type="text" placeholder="John Smith" className="w-full bg-input border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Age</label>
              <input type="number" placeholder="45" className="w-full bg-input border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-bold" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-muted-foreground uppercase">Contact Number</label>
              <input type="text" placeholder="+880 1..." className="w-full bg-input border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-all font-bold" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setShowForm(false)} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">Cancel</button>
            <button className="bg-primary text-primary-foreground rounded-xl px-8 py-3 text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20">Save Record</button>
          </div>
        </div>
      )}

      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Search patients by name, ID or mobile number..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-card border border-border rounded-3xl pl-14 pr-6 py-5 outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all font-bold"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(patient => (
          <div key={patient.id} className="bg-card border border-border rounded-[2rem] p-6 hover:border-primary transition-all group shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 rounded-2xl bg-surface-light flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                <User className="text-muted-foreground group-hover:text-primary transition-colors" size={28} />
              </div>
              <span className="text-[10px] font-black text-muted-foreground/30 font-mono tracking-tighter">ID: #{patient.id.toString().padStart(5, '0')}</span>
            </div>
            
            <h4 className="text-lg font-black tracking-tight mb-4 group-hover:text-primary transition-colors">{patient.name}</h4>
            
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-xs font-bold">
                <Calendar size={14} className="text-muted-foreground" />
                <span>Age: {patient.age} years</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <Phone size={14} className="text-muted-foreground" />
                <span>{patient.phone}</span>
              </div>
            </div>

            <button className="w-full bg-surface-light group-hover:bg-primary group-hover:text-primary-foreground py-3 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
              View Case History <ArrowRight size={12} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-light flex items-center justify-center mx-auto mb-4 opacity-30">
              <Users size={32} />
            </div>
            <p className="text-muted-foreground font-bold uppercase text-xs">No patients found in master index</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientsView;