/**
 * File: src/hooks/use-price-calculator.ts
 * 
 * Hook for handling price calculations throughout the proposal
 * Calculates various costs and prices based on pool specification data
 */
import { useMemo } from 'react';
import type { ProposalSnapshot } from '@/types/snapshot';

export interface PriceBreakdown {
  basePoolPrice: number;
  installationTotal: number;
  filtrationTotal: number;
  concreteTotal: number;
  fencingTotal: number;
  waterFeatureTotal: number;
  retainingWallTotal: number;
  extrasTotal: number;
  grandTotal: number;
  // Core cost details
  baseCost: number;
  fixedCosts: number;
  sitePrepCosts: number;
  filtrationBaseCost: number;
}

export interface DebugPriceTotals {
  basePoolTotal: number;
  siteRequirementsTotal: number;
  electricalTotal: number;
  concreteTotal: number;
  fencingTotal: number;
  waterFeatureTotal: number;
  retainingWallsTotal: number;
  extrasTotal: number;
  grandTotalCalculated: number;
}

export interface BasePoolBreakdown {
  poolShellCost: number;
  digCost: number;
  filtrationCost: number;
  individualCosts: number;
  fixedCostsTotal: number;
  craneAllowance: number;
  totalBeforeMargin: number;
  poolShellPrice: number;
  digPrice: number;
  filtrationPrice: number;
  individualCostsPrice: number;
  fixedCostsPrice: number;
  craneAllowancePrice: number;
}

export interface SiteRequirementsBreakdown {
  craneCost: number;
  bobcatCost: number;
  trafficControlCost: number;
  customRequirementsCost: number;
  totalBeforeMargin: number;
  cranePrice: number;
  bobcatPrice: number;
  trafficControlPrice: number;
  customRequirementsPrice: number;
}

export interface PriceCalculatorResult {
  fmt: (n: number | null | undefined) => string;
  grandTotal: number;
  totals: DebugPriceTotals;
  basePoolBreakdown: BasePoolBreakdown;
  siteRequirementsBreakdown: SiteRequirementsBreakdown;
}

/**
 * Hook for calculating all price components for a proposal
 * 
 * @param snapshot - The proposal snapshot containing all pricing data
 * @returns Formatted prices, grand total, and detailed breakdown
 */
export function usePriceCalculator(snapshot: ProposalSnapshot | null | undefined): PriceCalculatorResult {
  return useMemo(() => {
    console.log('💰 usePriceCalculator called', { 
      snapshot: !!snapshot, 
      snapshotKeys: snapshot ? Object.keys(snapshot).slice(0, 10) : [],
      spec_buy_inc_gst: snapshot?.spec_buy_inc_gst,
      fixed_costs_json: snapshot?.fixed_costs_json
    });
    
    // Handle null/undefined snapshot
    if (!snapshot) {
      return {
        fmt: (n: number | null | undefined) => {
          if (n === null || n === undefined) return '$0.00';
          return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
        },
        grandTotal: 0,
        totals: {
          basePoolTotal: 0,
          siteRequirementsTotal: 0,
          electricalTotal: 0,
          concreteTotal: 0,
          fencingTotal: 0,
          waterFeatureTotal: 0,
          retainingWallsTotal: 0,
          extrasTotal: 0,
          grandTotalCalculated: 0
        },
        basePoolBreakdown: {
          poolShellCost: 0,
          digCost: 0,
          filtrationCost: 0,
          individualCosts: 0,
          fixedCostsTotal: 0,
          craneAllowance: 0,
          totalBeforeMargin: 0,
          poolShellPrice: 0,
          digPrice: 0,
          filtrationPrice: 0,
          individualCostsPrice: 0,
          fixedCostsPrice: 0,
          craneAllowancePrice: 0,
        },
        siteRequirementsBreakdown: {
          craneCost: 0,
          bobcatCost: 0,
          trafficControlCost: 0,
          customRequirementsCost: 0,
          totalBeforeMargin: 0,
          cranePrice: 0,
          bobcatPrice: 0,
          trafficControlPrice: 0,
          customRequirementsPrice: 0,
        }
      };
    }
    // Formatter for currency values with null/undefined safety
    const fmt = (n: number | null | undefined) => {
      // Handle null/undefined values
      if (n === null || n === undefined) return '$0.00';
      return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
    };
    
    // Calculate fixed costs total from snapshot
    const fixedCostsTotal = (snapshot.fixed_costs_json || []).reduce((sum: number, fc: any) => sum + parseFloat(fc.price || '0'), 0);
    
    // Calculate totals for each section using correct debug panel logic
    const basePoolTotal = ((
      (snapshot.spec_buy_inc_gst || 0) +
      ((snapshot.dig_excavation_rate || 0) * (snapshot.dig_excavation_hours || 0) + (snapshot.dig_truck_rate || 0) * (snapshot.dig_truck_hours || 0) * (snapshot.dig_truck_qty || 0)) +
      ((snapshot.pump_price_inc_gst || 0) + (snapshot.filter_price_inc_gst || 0) + (snapshot.sanitiser_price_inc_gst || 0) + (snapshot.light_price_inc_gst || 0) + ((snapshot.handover_components || []).reduce((sum: number, c: any) => sum + (c.hk_component_price_inc_gst || 0) * (c.hk_component_quantity || 0), 0))) +
      ((snapshot.pc_beam || 0) + (snapshot.pc_coping_supply || 0) + (snapshot.pc_coping_lay || 0) + (snapshot.pc_salt_bags || 0) + (snapshot.pc_trucked_water || 0) + (snapshot.pc_misc || 0) + (snapshot.pc_pea_gravel || 0) + (snapshot.pc_install_fee || 0)) +
      fixedCostsTotal +
      700 // Standard crane allowance
    ) / (1 - (snapshot.pool_margin_pct || 0) / 100));

    const siteRequirementsTotal = ((snapshot.crane_cost || 0) > 700 ? (snapshot.crane_cost || 0) - 700 : 0) + (snapshot.bobcat_cost || 0) + (snapshot.traffic_control_cost || 0) + (snapshot.site_requirements_data 
      ? (typeof snapshot.site_requirements_data === 'string'
         ? JSON.parse(snapshot.site_requirements_data)
         : snapshot.site_requirements_data).reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0)
      : 0);

    const electricalTotal = snapshot.elec_total_cost || 0;

    const concreteTotal = (snapshot.concrete_cuts_cost || 0) + (snapshot.extra_paving_cost || 0) + (snapshot.existing_paving_cost || 0) + (snapshot.extra_concreting_cost || 0) + (snapshot.concrete_pump_total_cost || 0) + (snapshot.uf_strips_cost || 0);

    const fencingTotal = (snapshot.glass_total_cost || 0) + (snapshot.metal_total_cost || 0);

    const waterFeatureTotal = snapshot.water_feature_total_cost || 0;

    const retainingWallsTotal = (snapshot.retaining_walls_json || []).reduce((sum: number, wall: any) => sum + (wall.total_cost || 0), 0);

    const extrasTotal = (snapshot.cleaner_included ? (snapshot.cleaner_unit_price || 0) : 0) + (snapshot.include_heat_pump ? ((snapshot.heat_pump_rrp || 0) + (snapshot.heat_pump_installation_cost || 0)) : 0) + (snapshot.include_blanket_roller ? ((snapshot.blanket_roller_rrp || 0) + (snapshot.blanket_roller_installation_cost || 0)) : 0) + (snapshot.extras_total_rrp || 0);

    const grandTotalCalculated = basePoolTotal + siteRequirementsTotal + electricalTotal + concreteTotal + fencingTotal + waterFeatureTotal + retainingWallsTotal + extrasTotal;
    
    // Calculate individual component costs and prices
    const poolShellCost = snapshot.spec_buy_inc_gst || 0;
    const digCost = (snapshot.dig_excavation_rate || 0) * (snapshot.dig_excavation_hours || 0) + (snapshot.dig_truck_rate || 0) * (snapshot.dig_truck_hours || 0) * (snapshot.dig_truck_qty || 0);
    const filtrationCost = (snapshot.pump_price_inc_gst || 0) + (snapshot.filter_price_inc_gst || 0) + (snapshot.sanitiser_price_inc_gst || 0) + (snapshot.light_price_inc_gst || 0) + ((snapshot.handover_components || []).reduce((sum: number, c: any) => sum + (c.hk_component_price_inc_gst || 0) * (c.hk_component_quantity || 0), 0));
    const individualCosts = (snapshot.pc_beam || 0) + (snapshot.pc_coping_supply || 0) + (snapshot.pc_coping_lay || 0) + (snapshot.pc_salt_bags || 0) + (snapshot.pc_trucked_water || 0) + (snapshot.pc_misc || 0) + (snapshot.pc_pea_gravel || 0) + (snapshot.pc_install_fee || 0);
    const craneAllowance = 700;
    const totalBeforeMargin = poolShellCost + digCost + filtrationCost + individualCosts + fixedCostsTotal + craneAllowance;
    const marginMultiplier = 1 / (1 - (snapshot.pool_margin_pct || 0) / 100);
    
    const basePoolBreakdown: BasePoolBreakdown = {
      poolShellCost,
      digCost,
      filtrationCost,
      individualCosts,
      fixedCostsTotal,
      craneAllowance,
      totalBeforeMargin,
      poolShellPrice: poolShellCost * marginMultiplier,
      digPrice: digCost * marginMultiplier,
      filtrationPrice: filtrationCost * marginMultiplier,
      individualCostsPrice: individualCosts * marginMultiplier,
      fixedCostsPrice: fixedCostsTotal * marginMultiplier,
      craneAllowancePrice: craneAllowance * marginMultiplier,
    };

    // Calculate site requirements breakdown
    const craneCost = (snapshot.crane_cost || 0) > 700 ? (snapshot.crane_cost || 0) - 700 : 0;
    const bobcatCost = snapshot.bobcat_cost || 0;
    const trafficControlCost = snapshot.traffic_control_cost || 0;
    const customRequirementsCost = snapshot.site_requirements_data 
      ? (typeof snapshot.site_requirements_data === 'string'
         ? JSON.parse(snapshot.site_requirements_data)
         : snapshot.site_requirements_data).reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0)
      : 0;
    const siteRequirementsTotalBeforeMargin = craneCost + bobcatCost + trafficControlCost + customRequirementsCost;

    const siteRequirementsBreakdown: SiteRequirementsBreakdown = {
      craneCost,
      bobcatCost,
      trafficControlCost,
      customRequirementsCost,
      totalBeforeMargin: siteRequirementsTotalBeforeMargin,
      cranePrice: craneCost * marginMultiplier,
      bobcatPrice: bobcatCost * marginMultiplier,
      trafficControlPrice: trafficControlCost * marginMultiplier,
      customRequirementsPrice: customRequirementsCost * marginMultiplier,
    };
    
    console.log('💰 usePriceCalculator results', {
      basePoolTotal,
      siteRequirementsTotal,
      grandTotalCalculated,
      fixedCostsTotal
    });
    
    return {
      fmt,
      grandTotal: grandTotalCalculated,
      totals: {
        basePoolTotal,
        siteRequirementsTotal,
        electricalTotal,
        concreteTotal,
        fencingTotal,
        waterFeatureTotal,
        retainingWallsTotal,
        extrasTotal,
        grandTotalCalculated
      },
      basePoolBreakdown,
      siteRequirementsBreakdown
    };
  }, [snapshot]);
}