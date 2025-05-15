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
  extrasTotal: number;
  grandTotal: number;
  // Sub-items for detailed breakdown
  baseCost: number;
  fixedCosts: number;
  sitePrepCosts: number;
  filtrationBaseCost: number;
  cleanerCost: number;
  heatPumpCost: number;
  blanketRollerCost: number;
}

export interface PriceCalculatorResult {
  fmt: (n: number) => string;
  breakdown: PriceBreakdown;
  grandTotal: number;
}

/**
 * Hook for calculating all price components for a proposal
 * 
 * @param snapshot - The proposal snapshot containing all pricing data
 * @returns Formatted prices, grand total, and detailed breakdown
 */
export function usePriceCalculator(snapshot: ProposalSnapshot): PriceCalculatorResult {
  return useMemo(() => {
    // Formatter for currency values
    const fmt = (n: number) => n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
    
    // Fixed costs used across all proposals
    const fixedCosts = 6285; // Sum of fixed costs data
    
    // Calculate base pool price with margin
    const individualPoolCosts = 
      snapshot.pc_beam + 
      snapshot.pc_coping_supply + 
      snapshot.pc_coping_lay + 
      snapshot.pc_salt_bags + 
      snapshot.pc_trucked_water + 
      snapshot.pc_misc + 
      snapshot.pc_pea_gravel + 
      snapshot.pc_install_fee;
    
    const baseCost = snapshot.spec_buy_inc_gst + individualPoolCosts + fixedCosts;
    const marginPercent = snapshot.pool_margin_pct || 0;
    
    // Apply margin formula: Cost ÷ (1 - margin %)
    const basePoolPrice = marginPercent > 0 
      ? baseCost / (1 - marginPercent/100) 
      : baseCost;
    
    // Calculate site preparation costs
    const sitePrepCosts = snapshot.crane_cost + 
      snapshot.bobcat_cost +
      (snapshot.dig_excavation_rate * snapshot.dig_excavation_hours) +
      (snapshot.dig_truck_rate * snapshot.dig_truck_hours * snapshot.dig_truck_qty) +
      snapshot.traffic_control_cost + 
      snapshot.elec_total_cost;
    
    // Apply margin to installation costs
    const installationTotal = marginPercent > 0 
      ? sitePrepCosts / (1 - marginPercent/100) 
      : sitePrepCosts;
    
    // Calculate filtration equipment with margin applied
    const filtrationBaseCost = 
      snapshot.fp_pump_price + 
      snapshot.fp_filter_price + 
      snapshot.fp_sanitiser_price + 
      snapshot.fp_light_price + 
      (snapshot.fp_handover_kit_price || 0);
    
    // Apply margin to filtration costs
    const filtrationTotal = marginPercent > 0 
      ? filtrationBaseCost / (1 - marginPercent/100) 
      : filtrationBaseCost;
    
    // Calculate concrete & paving costs
    const concreteTotal = (snapshot.concrete_cuts_cost || 0) + 
      (snapshot.extra_paving_cost || 0) + 
      (snapshot.existing_paving_cost || 0) + 
      (snapshot.extra_concreting_saved_total || 0) + 
      (snapshot.concrete_pump_total_cost || 0) + 
      (snapshot.uf_strips_cost || 0);
    
    // Fencing total from snapshot
    const fencingTotal = snapshot.fencing_total_cost || 0;
    
    // Water feature total from snapshot
    const waterFeatureTotal = snapshot.water_feature_total_cost || 0;
    
    // Calculate extras & add-ons
    const cleanerCost = snapshot.cleaner_cost_price || 0;
    const heatPumpCost = (snapshot.heat_pump_cost || 0) + (snapshot.heat_pump_install_cost || 0);
    const blanketRollerCost = (snapshot.blanket_roller_cost || 0) + (snapshot.br_install_cost || 0);
    const extrasTotal = cleanerCost + heatPumpCost + blanketRollerCost;
    
    // Calculate grand total of all components
    const grandTotal = basePoolPrice + 
      installationTotal + 
      filtrationTotal + 
      concreteTotal + 
      fencingTotal + 
      waterFeatureTotal + 
      extrasTotal;
    
    return {
      fmt,
      grandTotal,
      breakdown: {
        basePoolPrice,
        installationTotal,
        filtrationTotal,
        concreteTotal,
        fencingTotal,
        waterFeatureTotal,
        extrasTotal,
        grandTotal,
        // Sub-items
        baseCost,
        fixedCosts,
        sitePrepCosts,
        filtrationBaseCost,
        cleanerCost,
        heatPumpCost,
        blanketRollerCost
      }
    };
  }, [snapshot]);
}

/**
 * Helper function for one-off price calculations without React hooks
 * Useful for direct imports in non-component code
 * 
 * @param snapshot - The proposal snapshot containing all pricing data
 * @returns Price calculation result (same as the hook)
 */
export function calculatePrices(snapshot: ProposalSnapshot): PriceCalculatorResult {
  // Reuse the same implementation as the hook's useMemo
  const fmt = (n: number) => n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
  
  const fixedCosts = 6285;
  
  const individualPoolCosts = 
    snapshot.pc_beam + 
    snapshot.pc_coping_supply + 
    snapshot.pc_coping_lay + 
    snapshot.pc_salt_bags + 
    snapshot.pc_trucked_water + 
    snapshot.pc_misc + 
    snapshot.pc_pea_gravel + 
    snapshot.pc_install_fee;
  
  const baseCost = snapshot.spec_buy_inc_gst + individualPoolCosts + fixedCosts;
  const marginPercent = snapshot.pool_margin_pct || 0;
  const basePoolPrice = marginPercent > 0 
    ? baseCost / (1 - marginPercent/100) 
    : baseCost;
  
  const sitePrepCosts = snapshot.crane_cost + 
    snapshot.bobcat_cost +
    (snapshot.dig_excavation_rate * snapshot.dig_excavation_hours) +
    (snapshot.dig_truck_rate * snapshot.dig_truck_hours * snapshot.dig_truck_qty) +
    snapshot.traffic_control_cost + 
    snapshot.elec_total_cost;
  const installationTotal = marginPercent > 0 
    ? sitePrepCosts / (1 - marginPercent/100) 
    : sitePrepCosts;
  
  const filtrationBaseCost = 
    snapshot.fp_pump_price + 
    snapshot.fp_filter_price + 
    snapshot.fp_sanitiser_price + 
    snapshot.fp_light_price + 
    (snapshot.fp_handover_kit_price || 0);
  const filtrationTotal = marginPercent > 0 
    ? filtrationBaseCost / (1 - marginPercent/100) 
    : filtrationBaseCost;
  
  const concreteTotal = (snapshot.concrete_cuts_cost || 0) + 
    (snapshot.extra_paving_cost || 0) + 
    (snapshot.existing_paving_cost || 0) + 
    (snapshot.extra_concreting_saved_total || 0) + 
    (snapshot.concrete_pump_total_cost || 0) + 
    (snapshot.uf_strips_cost || 0);
  
  const fencingTotal = snapshot.fencing_total_cost || 0;
  const waterFeatureTotal = snapshot.water_feature_total_cost || 0;
  
  const cleanerCost = snapshot.cleaner_cost_price || 0;
  const heatPumpCost = (snapshot.heat_pump_cost || 0) + (snapshot.heat_pump_install_cost || 0);
  const blanketRollerCost = (snapshot.blanket_roller_cost || 0) + (snapshot.br_install_cost || 0);
  const extrasTotal = cleanerCost + heatPumpCost + blanketRollerCost;
  
  const grandTotal = basePoolPrice + 
    installationTotal + 
    filtrationTotal + 
    concreteTotal + 
    fencingTotal + 
    waterFeatureTotal + 
    extrasTotal;
  
  return {
    fmt,
    grandTotal,
    breakdown: {
      basePoolPrice,
      installationTotal,
      filtrationTotal,
      concreteTotal,
      fencingTotal,
      waterFeatureTotal,
      extrasTotal,
      grandTotal,
      // Sub-items
      baseCost,
      fixedCosts,
      sitePrepCosts,
      filtrationBaseCost,
      cleanerCost,
      heatPumpCost,
      blanketRollerCost
    }
  };
}