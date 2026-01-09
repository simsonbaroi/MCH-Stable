import { InventoryItem } from '../types';

export const OXYGEN_GASES_REGISTRY: Partial<InventoryItem>[] = [
  { name: "O2 (2L or .45m / Per Hour)", price: 130.0, type: "Gas", category: "HALO, O2, NO2, ETC." },
  { name: "ISO Per Minute", price: 35.0, type: "Gas", category: "HALO, O2, NO2, ETC." },
  { name: "N2O (Per 15 Minutes)", price: 230.0, type: "Gas", category: "HALO, O2, NO2, ETC." },
  { name: "Dry N2O Short", price: 140.0, type: "Gas", category: "HALO, O2, NO2, ETC." },
  { name: "Dry N2O Long", price: 300.0, type: "Gas", category: "HALO, O2, NO2, ETC." },
  { name: "Halothane (Per Session)", price: 570.0, type: "Gas", category: "HALO, O2, NO2, ETC." },
  { name: "Isoflurane Per Hour", price: 2100.0, type: "Gas", category: "HALO, O2, NO2, ETC." }
];