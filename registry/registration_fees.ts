import { InventoryItem } from '../types';

export const REGISTRATION_REGISTRY: Partial<InventoryItem>[] = [
  { name: "Registration Fee New", type: "Visit", category: "REGISTRATION FEES", price: 200.00 },
  { name: "Registration Fee", type: "Visit", category: "REGISTRATION FEES", price: 100.00 },
  { name: "OPD Medic On-Day", type: "Visit", category: "REGISTRATION FEES", price: 150.00 },
  { name: "OPD Medic Night/Off-Day", type: "Visit", category: "REGISTRATION FEES", price: 220.00 }, 
  { name: "Dr. Fee", type: "Visit", category: "REGISTRATION FEES", price: 350.00 },
  { name: "Dr. Fee (Night/Off-Day)", type: "Visit", category: "REGISTRATION FEES", price: 450.00 },
  { name: "OPD Private Consult", type: "Visit", category: "REGISTRATION FEES", price: 1860.00 },
];