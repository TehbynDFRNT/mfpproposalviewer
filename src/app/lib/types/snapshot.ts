// src/app/lib/types/snapshot.ts
import type { Tables }   from './database.generated';
import type { Camelize } from './camelize';          // <-- NEW
// Fields mirror get_proposal_snapshot RPC camelCase JSON payload

/**
 * What the RPC returns under `poolSpecification`:
 *  - nested `dimensions`
 *  - optional `description`
 *  - chosen `color`
 */
export type PoolSpecification = {
  name: string;
  dimensions: {
    lengthM: number;
    widthM: number;
    shallowDepthM: number;
    deepDepthM: number;
  };
  color: string;
  /** Marketing copy – will be populated from a lookup table (may be null for now) */
  description?: string | null;
  /** CDN path or local asset for the main "hero" image */
  heroImageUrl?: string | null;
  /** CDN path or local asset for the plan / layout image */
  layoutImageUrl?: string | null;
};

/**
 * What the RPC returns under `fencing`:
 */
export type FencingPackage = {
  fenceType: 'flatTopMetal' | 'framelessGlass';
  totalFenceLengthM: number;
  fenceLinearCost: number;

  gateSelection: {
    quantity: number;
    gateTotalCost: number;
    freeGateDiscount: number;
  };

  fgRetainingPanels: {
    simpleCount: number;
    simpleCost: number;
    complexCount: number;
    complexCost: number;
  };

  earthingRequired: boolean;
  earthingCost: number;

  costSummary: {
    totalCost: number;
  };
};

/* ───────────────────────────────
 * Camel-cased aliases for DB rows
 * ─────────────────────────────── */
type PoolProject = Camelize<Tables<'pool_projects'>>;
type PoolCosts   = Camelize<Tables<'pool_costs'>>;
type PoolMargins = Camelize<Tables<'pool_margins'>>;
type FixedCost   = Camelize<Tables<'fixed_costs'>>;   // used in withTotals()

/**
 * Mirrors the camelCase JSON from get_proposal_snapshot RPC
 */
export interface Snapshot {
  /** raw pool_projects row */
  poolProject: PoolProject;

  /** nested pool spec */
  poolSpecification: PoolSpecification;

  /** cost & margin tables */
  poolCosts:   PoolCosts   | null;
  poolMargins: PoolMargins | null;

  /** filtration package (raw row) */
  filtrationPackage: Tables<'filtration_packages'> | null;

  /** electrical requirements (raw row) */
  electricalRequirements: Tables<'pool_electrical_requirements'> | null;

  /** water feature (raw row) */
  waterFeature: Tables<'pool_water_features'> | null;

  /** assembled fencing data */
  fencing: FencingPackage | null;

  /** fixed costs list */
  fixedCosts: FixedCost[];

  /** static reference tables */
  referenceTables: {
    craneCosts: Tables<'crane_costs'>[];
    bobcatCosts: Tables<'bobcat_costs'>[];
    trafficControlCosts: Tables<'traffic_control_costs'>[];
    concreteCuts: Tables<'concrete_cuts'>[];
    extraPavingCosts: Tables<'extra_paving_costs'>[];
    retainingWalls: Tables<'retaining_walls'>[];
  };

  /** ISO timestamp of snapshot */
  timestamp: string;
}

/* ───────────────────────────────
 * Derived financial helpers
 * ─────────────────────────────── */

/** Re-usable money figures other cards may need */
export interface ComputedTotals {
  /** Fixed + variable + shell (GST-inc) cost figure                */
  basePoolCost: number;
  /** Customer-visible price: Cost ÷ (1 − margin %)                 */
  basePoolPrice: number;
}

/** Enriched snapshot shape returned by `withTotals()` */
export type SnapshotWithTotals = Snapshot & { totals: ComputedTotals };

/**
 * Attach cost/price totals to a freshly-fetched snapshot.
 * Call this **once** in `getProposalSnapshot.ts` right after the RPC.
 */
export function withTotals(snapshot: Snapshot): SnapshotWithTotals {
  const { poolCosts, fixedCosts, poolMargins } = snapshot;

  /* 1️⃣  Fixed costs */
  const fixedSum = fixedCosts.reduce((sum, f) => sum + (f.price ?? 0), 0);

  /* 2️⃣  Variable pool costs */
  const variableSum = poolCosts
    ? (poolCosts.beam ?? 0) +
      (poolCosts.misc ?? 0) +
      (poolCosts.saltBags ?? 0) +
      (poolCosts.copingLay ?? 0) +
      (poolCosts.peaGravel ?? 0) +
      (poolCosts.installFee ?? 0) +
      (poolCosts.copingSupply ?? 0) +
      (poolCosts.truckedWater ?? 0)
    : 0;

  /* 3️⃣  Pool shell cost – assumes `installFee` holds the shell value */
  const shellCost = poolCosts?.installFee ?? 0;

  const basePoolCost = fixedSum + variableSum + shellCost;

  const marginPct = poolMargins?.marginPercentage ?? 0;
  const basePoolPrice =
    marginPct >= 100
      ? 0
      : Number((basePoolCost / (1 - marginPct / 100)).toFixed(2));

  return {
    ...snapshot,
    totals: { basePoolCost, basePoolPrice },
  };
}
