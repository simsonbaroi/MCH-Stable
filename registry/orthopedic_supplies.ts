import { InventoryItem } from '../types';

export const ORTHO_SUPPLIES_REGISTRY: Partial<InventoryItem>[] = [
  // CASTING & PLASTER
  { name: "Gypsona Plaster (India) 6”", price: 230.0, type: "Supply", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Gypsona Plaster (India) 4”", price: 230.0, type: "Supply", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Plaster of Paris (China) 6”", price: 160.0, type: "Supply", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Cast Padding 6”", price: 160.0, type: "Supply", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Fiberglass Casting Material 4”", price: 1450.0, type: "Supply", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Casting Tape", price: 250.0, type: "Supply", category: "ORTHOPEDIC, S. ROLL, ETC." },

  // SPLINTS & BRACES
  { name: "Knee splints (Foreign/Local)", price: 1000.0, type: "Support", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Clavicle splints", price: 1500.0, type: "Support", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Cervical collar", price: 580.0, type: "Support", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Knee Brace", price: 300.0, type: "Support", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Arm sling with straps", price: 900.0, type: "Support", category: "ORTHOPEDIC, S. ROLL, ETC." },

  // IMPLANTS - PLATES
  { name: "Slef Compression plate Narrow (4-5 Holes)", price: 14500.0, type: "Implant", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Slef Compression plate Narrow (6-7 Holes)", price: 1700.0, type: "Implant", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Slef Compression plate Broad (14 Holes)", price: 3900.0, type: "Implant", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Small Fragment plates (4-5 Holes)", price: 1500.0, type: "Implant", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "T-Buttress Plates", price: 1800.0, type: "Implant", category: "ORTHOPEDIC, S. ROLL, ETC." },
  
  // IMPLANTS - SCREWS & NAILS
  { name: "Compression screws 4.5mm", price: 300.0, type: "Implant", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Cancellous screws 6.5mm", price: 500.0, type: "Implant", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Canulated compression Hip Screw", price: 1100.0, type: "Implant", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Interlocking Femoral/Tibial Nail", price: 2400.0, type: "Implant", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Kuntscher nails", price: 1300.0, type: "Implant", category: "ORTHOPEDIC, S. ROLL, ETC." },
  
  // PROSTHESES
  { name: "Austin Moore hip prostheses (Regular)", price: 5100.0, type: "Prosthesis", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Austin Moore hip prostheses (Long stem)", price: 6500.0, type: "Prosthesis", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Total hip prosthesis (Talwader)", price: 18000.0, type: "Prosthesis", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Bipolar Hip Prosthesis (India)", price: 13000.0, type: "Prosthesis", category: "ORTHOPEDIC, S. ROLL, ETC." },

  // DEPOSITS
  { name: "Orth-Fix Enternal Fixator Deposit", price: 22000.0, type: "Deposit", category: "ORTHOPEDIC, S. ROLL, ETC." },
  { name: "Croner Enternal Fixator Deposit", price: 13000.0, type: "Deposit", category: "ORTHOPEDIC, S. ROLL, ETC." }
];