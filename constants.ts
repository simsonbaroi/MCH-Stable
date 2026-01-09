import { InventoryItem, Patient } from './types';

// Strict Category List based on Hospital Bill Form + OPD requirements
export const SYSTEM_CATEGORIES = [
  "BLOOD",
  "LABORATORY",
  "LIMB AND BRACE",
  "FOOD",
  "HALO, O2, NO2, ETC.",
  "ORTHOPEDIC, S. ROLL, ETC.",
  "SURGERY, O.R. & DELIVERY",
  "REGISTRATION FEES",
  "PHARMACY",
  "PHYSICAL THERAPY",
  "IV.'S",
  "PLASTER/MILK",
  "PROCEDURES",
  "SEAT & AD. FEE",
  "X-RAY",
  "LOST LAUNDRY",
  "TRAVEL",
  "OTHER"
];

// Mock inventory cleared to allow user to start with a fresh registry
export const MOCK_INVENTORY: Record<string, InventoryItem[]> = {};

export const MOCK_PATIENTS: Patient[] = [];