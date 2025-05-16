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

export interface PriceCalculatorResult {
  fmt: (n: number | null | undefined) => string;
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
    // Formatter for currency values with null/undefined safety
    const fmt = (n: number | null | undefined) => {
      // Handle null/undefined values
      if (n === null || n === undefined) return '$0.00';
      return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
    };
    
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
    
    // Calculate custom site requirements total cost
    const customSiteRequirementsCost = snapshot.site_requirements_data
      ? (typeof snapshot.site_requirements_data === 'string'
         ? JSON.parse(snapshot.site_requirements_data)
         : snapshot.site_requirements_data).reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0)
      : 0;
    
    // Calculate site preparation costs (excluding electrical which already has margin)
    const sitePrepCostsNoElectrical = snapshot.crane_cost + 
      snapshot.bobcat_cost +
      (snapshot.dig_excavation_rate * snapshot.dig_excavation_hours) +
      (snapshot.dig_truck_rate * snapshot.dig_truck_hours * snapshot.dig_truck_qty) +
      snapshot.traffic_control_cost +
      customSiteRequirementsCost;
    
    // Define the total site prep costs including electrical (for the breakdown)
    const sitePrepCosts = sitePrepCostsNoElectrical + snapshot.elec_total_cost;
    
    // Apply margin to non-electrical installation costs only
    const sitePrepWithMargin = marginPercent > 0 
      ? sitePrepCostsNoElectrical / (1 - marginPercent/100) 
      : sitePrepCostsNoElectrical;
      
    // Add the electrical costs (which already include margin) to get total installation cost
    const installationTotal = sitePrepWithMargin + snapshot.elec_total_cost;
    
    // Calculate filtration equipment with margin applied
    const filtrationBaseCost = 
      snapshot.pump_price_inc_gst + 
      snapshot.filter_price_inc_gst + 
      snapshot.sanitiser_price_inc_gst + 
      snapshot.light_price_inc_gst + 
      // Calculate handover kit cost from its components
      ((snapshot.handover_components || [])
        .reduce((sum, c) => sum + c.hk_component_price_inc_gst * c.hk_component_quantity, 0));
    
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
    
    // Calculate the total cost of all retaining walls (handling optional values properly for TypeScript)
    const retainingWallTotal = [
      snapshot.retaining_wall1_total_cost || 0,
      snapshot.retaining_wall2_total_cost || 0,
      snapshot.retaining_wall3_total_cost || 0,
      snapshot.retaining_wall4_total_cost || 0
    ].reduce((sum, cost) => sum + cost, 0);
    
    // Calculate extras & add-ons using RRP values directly for the total
    // No funny business - just summing the RRPs for included items
    const cleanerRrp = snapshot.cleaner_included ? 
      ((snapshot.cleaner_price || 0) + (snapshot.cleaner_margin || 0)) : 0;
    const heatPumpRrp = snapshot.include_heat_pump ? 
      (snapshot.heat_pump_rrp || 0) : 0;
    const blanketRollerRrp = snapshot.include_blanket_roller ? 
      (snapshot.blanket_roller_rrp || 0) : 0;
    const extrasTotal = cleanerRrp + heatPumpRrp + blanketRollerRrp;
    
    // Calculate grand total of all components
    const grandTotal = basePoolPrice + 
      installationTotal + 
      filtrationTotal + 
      concreteTotal + 
      fencingTotal + 
      waterFeatureTotal + 
      retainingWallTotal +
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
        retainingWallTotal,
        extrasTotal,
        grandTotal,
        // Core cost details
        baseCost,
        fixedCosts,
        sitePrepCosts,
        filtrationBaseCost
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
  // Formatter for currency values with null/undefined safety
  const fmt = (n: number | null | undefined) => {
    // Handle null/undefined values
    if (n === null || n === undefined) return '$0.00';
    return n.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' });
  };
  
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
  
  // Calculate custom site requirements total cost
  const customSiteRequirementsCost = snapshot.site_requirements_data
    ? (typeof snapshot.site_requirements_data === 'string'
       ? JSON.parse(snapshot.site_requirements_data)
       : snapshot.site_requirements_data).reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0)
    : 0;
      
  // Calculate site preparation costs (excluding electrical which already has margin)
  const sitePrepCostsNoElectrical = snapshot.crane_cost + 
    snapshot.bobcat_cost +
    (snapshot.dig_excavation_rate * snapshot.dig_excavation_hours) +
    (snapshot.dig_truck_rate * snapshot.dig_truck_hours * snapshot.dig_truck_qty) +
    snapshot.traffic_control_cost +
    customSiteRequirementsCost;
  
  // Define the total site prep costs including electrical (for the breakdown)
  const sitePrepCosts = sitePrepCostsNoElectrical + snapshot.elec_total_cost;
  
  // Apply margin to non-electrical installation costs only
  const sitePrepWithMargin = marginPercent > 0 
    ? sitePrepCostsNoElectrical / (1 - marginPercent/100) 
    : sitePrepCostsNoElectrical;
    
  // Add the electrical costs (which already include margin) to get total installation cost
  const installationTotal = sitePrepWithMargin + snapshot.elec_total_cost;
  
  const filtrationBaseCost = 
    snapshot.pump_price_inc_gst + 
    snapshot.filter_price_inc_gst + 
    snapshot.sanitiser_price_inc_gst + 
    snapshot.light_price_inc_gst + 
    // Calculate handover kit cost from its components
    ((snapshot.handover_components || [])
      .reduce((sum, c) => sum + c.hk_component_price_inc_gst * c.hk_component_quantity, 0));
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
  
  // Calculate the total cost of all retaining walls (handling optional values properly for TypeScript)
  const retainingWallTotal = [
    snapshot.retaining_wall1_total_cost || 0,
    snapshot.retaining_wall2_total_cost || 0,
    snapshot.retaining_wall3_total_cost || 0,
    snapshot.retaining_wall4_total_cost || 0
  ].reduce((sum, cost) => sum + cost, 0);
  
  // Calculate extras & add-ons using RRP values directly for the total
  // No funny business - just summing the RRPs for included items
  const cleanerRrp = snapshot.cleaner_included ? 
    ((snapshot.cleaner_price || 0) + (snapshot.cleaner_margin || 0)) : 0;
  const heatPumpRrp = snapshot.include_heat_pump ? 
    (snapshot.heat_pump_rrp || 0) : 0;
  const blanketRollerRrp = snapshot.include_blanket_roller ? 
    (snapshot.blanket_roller_rrp || 0) : 0;
  const extrasTotal = cleanerRrp + heatPumpRrp + blanketRollerRrp;
  
  const grandTotal = basePoolPrice + 
    installationTotal + 
    filtrationTotal + 
    concreteTotal + 
    fencingTotal + 
    waterFeatureTotal + 
    retainingWallTotal +
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
      retainingWallTotal: retainingWallTotal || 0, // Ensure it's always a number
      extrasTotal,
      grandTotal,
      // Core cost details
      baseCost,
      fixedCosts,
      sitePrepCosts,
      filtrationBaseCost
    }
  };
}