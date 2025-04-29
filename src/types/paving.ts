// src/types/paving.ts
export interface PavingLine {
  id: string;
  category: string;
  areaM2: number;
  unitCost: number;
  totalCost: number;
}

/**
 * Some cards only need a *metric* summary – no id/category.
 * Keep it simple so the old UI keeps compiling.
 */
export interface PavingMetric {
  /* ---- legacy card fields ---- */
  name    : string;
  benefit?: string;
  cost    : number;

  /* ---- newer numeric summary (optional) ---- */
  areaM2?   : number;
  ratePerM2?: number;
  totalCost?: number;
}