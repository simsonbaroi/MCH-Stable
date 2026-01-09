import { InventoryItem } from './types';
import { BLOOD_REGISTRY } from './registry/blood';
import { LAB_REGISTRY } from './registry/laboratory';
import { LIMB_BRACE_REGISTRY } from './registry/limb_brace';
import { FOOD_REGISTRY } from './registry/food';
import { OXYGEN_GASES_REGISTRY } from './registry/oxygen_gases';
import { ORTHO_SUPPLIES_REGISTRY } from './registry/orthopedic_supplies';
import { SURGERY_OR_REGISTRY } from './registry/surgery_or';
import { REGISTRATION_REGISTRY } from './registry/registration_fees';
import { PHARMACY_REGISTRY } from './registry/pharmacy_meds';
import { PT_REGISTRY } from './registry/physical_therapy';
import { IV_FLUIDS_REGISTRY } from './registry/iv_fluids';
import { PROCEDURES_REGISTRY } from './registry/procedures';
import { ACCOMMODATION_REGISTRY } from './registry/accommodation';
import { XRAY_REGISTRY } from './registry/xray';
import { PROF_FEES_REGISTRY } from './registry/professional_fees';
import { MISC_REGISTRY } from './registry/miscellaneous';

/**
 * MASTER HOSPITAL REGISTRY SEED DATA
 * Aggregates all modular department files.
 * This structure allows for segmented price management per button category.
 */

export const INITIAL_REGISTRY_DATA: Partial<InventoryItem>[] = [
  ...BLOOD_REGISTRY,
  ...LAB_REGISTRY,
  ...LIMB_BRACE_REGISTRY,
  ...FOOD_REGISTRY,
  ...OXYGEN_GASES_REGISTRY,
  ...ORTHO_SUPPLIES_REGISTRY,
  ...SURGERY_OR_REGISTRY,
  ...REGISTRATION_REGISTRY,
  ...PHARMACY_REGISTRY,
  ...PT_REGISTRY,
  ...IV_FLUIDS_REGISTRY,
  ...PROCEDURES_REGISTRY,
  ...ACCOMMODATION_REGISTRY,
  ...XRAY_REGISTRY,
  ...PROF_FEES_REGISTRY,
  ...MISC_REGISTRY
].map(item => ({
  ...item,
  strength: item.strength || "",
  updatedAt: Date.now()
}));

export const MOCK_PATIENTS = [];