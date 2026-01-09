import { InventoryItem } from '../types';

export const ACCOMMODATION_REGISTRY: Partial<InventoryItem>[] = [
  { name: "Inpatient Admission Fee Ward", price: 260.0, type: "Per Visit", category: "SEAT & AD. FEE" },
  { name: "Inpatient Admission Fee Private", price: 870.0, type: "Per Visit", category: "SEAT & AD. FEE" },
  { name: "Bed Fee Ward", price: 420.0, type: "Per Day", category: "SEAT & AD. FEE" },
  { name: "Bed Fee Baby Ward", price: 350.0, type: "Per Day", category: "SEAT & AD. FEE" },
  { name: "Linen Fee Adult Linen", price: 660.0, type: "Per Visit", category: "SEAT & AD. FEE" },
  { name: "Linen Fee Baby Linen", price: 660.0, type: "Per Visit", category: "SEAT & AD. FEE" },
  { name: "Cabin Rent Private 1 (Non A/C)", price: 2500.0, type: "Per Day", category: "SEAT & AD. FEE" },
  { name: "Cabin Rent Private 2 (A/C)", price: 4500.0, type: "Per Day", category: "SEAT & AD. FEE" },
  { name: "Cabin Rent Private 3 (A/C, TV, Internet, Fridge)", price: 6050.0, type: "Per Day", category: "SEAT & AD. FEE" },
  { name: "Cabin Rent Baby Private (In addition to room)", price: 660.0, type: "Per Day", category: "SEAT & AD. FEE" },
  { name: "Visitation Fee OPD Doctor Visit", price: 350.0, type: "Per Visit", category: "SEAT & AD. FEE" },
  { name: "Visitation Fee OPD / Inpatient Doctor (Night Visit)", price: 450.0, type: "Per Visit", category: "SEAT & AD. FEE" },
  { name: "Visitation Fee OPD Private Consult", price: 1860.0, type: "Per Visit", category: "SEAT & AD. FEE" },
  { name: "Visitation Fee OPD Medic on On-Day", price: 150.0, type: "Per Visit", category: "SEAT & AD. FEE" },
  { name: "Visitation Fee OPD Medic Night", price: 220.0, type: "Per Visit", category: "SEAT & AD. FEE" },
  { name: "Visitation Fee OPD Medic on Off-Day", price: 220.0, type: "Per Visit", category: "SEAT & AD. FEE" },
  { name: "Visitation Fee Inpatient Ward Daily Visit", price: 250.0, type: "Per Day", category: "SEAT & AD. FEE" },
  { name: "Visitation Fee Inpatient Private Daily Visit", price: 550.0, type: "Per Day", category: "SEAT & AD. FEE" },
];