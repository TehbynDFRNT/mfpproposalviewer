'use client';

import { useMemo } from 'react';
import type { ProposalSnapshot } from '@/types/snapshot';
import { usePriceCalculator } from '@/hooks/use-price-calculator';

interface PriceDebugPanelProps {
  snapshotData: ProposalSnapshot;
}

export default function PriceDebugPanel({ snapshotData }: PriceDebugPanelProps) {
  const { fmt, breakdown, grandTotal } = usePriceCalculator(snapshotData);

  // Create grouped data for easy display of price components
  const priceData = useMemo(() => {
    return {
      basePool: {
        title: "Base Pool Price Components",
        items: [
          { label: "Pool Shell Cost (spec_buy_inc_gst)", value: snapshotData.spec_buy_inc_gst || 0 },
          { label: "Fixed Costs (hardcoded)", value: breakdown.fixedCosts },
          { label: "Beam (pc_beam)", value: snapshotData.pc_beam || 0 },
          { label: "Coping Supply (pc_coping_supply)", value: snapshotData.pc_coping_supply || 0 },
          { label: "Coping Lay (pc_coping_lay)", value: snapshotData.pc_coping_lay || 0 },
          { label: "Salt Bags (pc_salt_bags)", value: snapshotData.pc_salt_bags || 0 },
          { label: "Trucked Water (pc_trucked_water)", value: snapshotData.pc_trucked_water || 0 },
          { label: "Miscellaneous (pc_misc)", value: snapshotData.pc_misc || 0 },
          { label: "Pea Gravel (pc_pea_gravel)", value: snapshotData.pc_pea_gravel || 0 },
          { label: "Install Fee (pc_install_fee)", value: snapshotData.pc_install_fee || 0 },
        ],
        subtotal: { label: "Base Cost (Before Margin)", value: breakdown.baseCost },
        margin: snapshotData.pool_margin_pct || 0,
        total: { label: "Base Pool Price (After Margin)", value: breakdown.basePoolPrice }
      },
      installation: {
        title: "Installation Costs",
        items: [
          { label: "Crane Cost (crane_cost)", value: snapshotData.crane_cost || 0 },
          { label: "Bobcat Cost (bobcat_cost)", value: snapshotData.bobcat_cost || 0 },
          { label: "Excavation (dig_excavation_rate × dig_excavation_hours)", 
            value: (snapshotData.dig_excavation_rate || 0) * (snapshotData.dig_excavation_hours || 0),
            detail: `${fmt(snapshotData.dig_excavation_rate)} × ${snapshotData.dig_excavation_hours} hours` },
          { label: "Truck (dig_truck_rate × dig_truck_hours × dig_truck_qty)", 
            value: (snapshotData.dig_truck_rate || 0) * (snapshotData.dig_truck_hours || 0) * (snapshotData.dig_truck_qty || 0),
            detail: `${fmt(snapshotData.dig_truck_rate)} × ${snapshotData.dig_truck_hours} hours × ${snapshotData.dig_truck_qty} trucks` },
          { label: "Traffic Control (traffic_control_cost)", value: snapshotData.traffic_control_cost || 0 },
          { label: "Custom Site Requirements", 
            value: snapshotData.site_requirements_data 
              ? (typeof snapshotData.site_requirements_data === 'string'
                 ? JSON.parse(snapshotData.site_requirements_data)
                 : snapshotData.site_requirements_data).reduce((sum: number, item: any) => sum + (Number(item.price) || 0), 0)
              : 0 },
          { label: "Electrical (elec_total_cost) [Has Built-in Margin]", value: snapshotData.elec_total_cost || 0 },
        ],
        subtotal: { label: "Site Prep Costs (Before Margin, Excl. Electrical)", 
          value: breakdown.sitePrepCosts - (snapshotData.elec_total_cost || 0) },
        margin: snapshotData.pool_margin_pct || 0,
        total: { label: "Installation Total (After Margin, Incl. Electrical)", value: breakdown.installationTotal }
      },
      filtration: {
        title: "Filtration & Equipment",
        items: [
          { label: "Pump (pump_price_inc_gst)", value: snapshotData.pump_price_inc_gst || 0 },
          { label: "Filter (filter_price_inc_gst)", value: snapshotData.filter_price_inc_gst || 0 },
          { label: "Sanitiser (sanitiser_price_inc_gst)", value: snapshotData.sanitiser_price_inc_gst || 0 },
          { label: "Light (light_price_inc_gst)", value: snapshotData.light_price_inc_gst || 0 },
          { label: "Handover Kit Components", 
            value: ((snapshotData.handover_components || [])
              .reduce((sum, c) => sum + (c.hk_component_price_inc_gst || 0) * (c.hk_component_quantity || 0), 0)),
            detail: (snapshotData.handover_components || []).map(c => 
              `${c.hk_component_name} (${c.hk_component_price_inc_gst} × ${c.hk_component_quantity})`).join(', ') },
        ],
        subtotal: { label: "Filtration Base Cost (Before Margin)", value: breakdown.filtrationBaseCost },
        margin: snapshotData.pool_margin_pct || 0,
        total: { label: "Filtration Total (After Margin)", value: breakdown.filtrationTotal }
      },
      concrete: {
        title: "Concrete & Paving (Margin Included)",
        items: [
          { label: "Concrete Cuts (concrete_cuts_cost)", value: snapshotData.concrete_cuts_cost || 0 },
          { label: "Extra Paving (extra_paving_cost)", value: snapshotData.extra_paving_cost || 0 },
          { label: "Existing Paving (existing_paving_cost)", value: snapshotData.existing_paving_cost || 0 },
          { label: "Extra Concreting (extra_concreting_saved_total)", value: snapshotData.extra_concreting_saved_total || 0 },
          { label: "Concrete Pump (concrete_pump_total_cost)", value: snapshotData.concrete_pump_total_cost || 0 },
          { label: "UF Strips (uf_strips_cost)", value: snapshotData.uf_strips_cost || 0 },
        ],
        total: { label: "Concrete & Paving Total (Margin Included)", value: breakdown.concreteTotal }
      },
      fencing: {
        title: "Fencing (Margin Included)",
        items: [
          { label: "Fencing Total (fencing_total_cost)", value: snapshotData.fencing_total_cost || 0 },
        ],
        total: { 
          label: "Fencing Total (Margin Included)", 
          value: breakdown.fencingTotal
        }
      },
      waterFeature: {
        title: "Water Feature (Margin Included)",
        items: [
          { label: "Water Feature Total (water_feature_total_cost)", value: snapshotData.water_feature_total_cost || 0 },
        ],
        total: { 
          label: "Water Feature Total (Margin Included)", 
          value: breakdown.waterFeatureTotal
        }
      },
      retainingWalls: {
        title: "Retaining Walls (Margin Included)",
        items: [
          { label: "Retaining Wall 1 (retaining_wall1_total_cost)", value: snapshotData.retaining_wall1_total_cost || 0 },
          { label: "Retaining Wall 2 (retaining_wall2_total_cost)", value: snapshotData.retaining_wall2_total_cost || 0 },
          { label: "Retaining Wall 3 (retaining_wall3_total_cost)", value: snapshotData.retaining_wall3_total_cost || 0 },
          { label: "Retaining Wall 4 (retaining_wall4_total_cost)", value: snapshotData.retaining_wall4_total_cost || 0 },
        ],
        total: { 
          label: "Retaining Walls Total (Margin Included)", 
          value: breakdown.retainingWallTotal 
        }
      },
      extras: {
        title: "Extras & Add-ons (Margin Included)",
        items: [
          { label: "Cleaner", 
            value: snapshotData.cleaner_included ? 
              ((snapshotData.cleaner_price || 0) + (snapshotData.cleaner_margin || 0)) : 0,
            detail: snapshotData.cleaner_included ? 
              `Included: ${fmt(snapshotData.cleaner_price)} + ${fmt(snapshotData.cleaner_margin)} margin` : "Not included" },
          { label: "Heat Pump", 
            value: snapshotData.include_heat_pump ? (snapshotData.heat_pump_rrp || 0) : 0,
            detail: snapshotData.include_heat_pump ? `Included at ${fmt(snapshotData.heat_pump_rrp)}` : "Not included" },
          { label: "Blanket & Roller", 
            value: snapshotData.include_blanket_roller ? (snapshotData.blanket_roller_rrp || 0) : 0,
            detail: snapshotData.include_blanket_roller ? `Included at ${fmt(snapshotData.blanket_roller_rrp)}` : "Not included" },
        ],
        total: { label: "Extras Total (Margin Included)", value: breakdown.extrasTotal }
      }
    };
  }, [snapshotData, breakdown, fmt]);

  const renderSection = (section: any) => (
    <div className="mb-6 bg-white p-4 rounded shadow" key={section.title}>
      <h3 className="text-lg font-bold text-gray-900 mb-3">{section.title}</h3>
      <table className="min-w-full">
        <tbody>
          {section.items.map((item: any, index: number) => (
            <tr key={index} className={index % 2 ? 'bg-gray-50' : 'bg-white'}>
              <td className="py-2 px-3 text-sm">{item.label}</td>
              <td className="py-2 px-3 text-sm text-right font-mono">{fmt(item.value)}</td>
              {item.detail && (
                <td className="py-2 px-3 text-xs text-gray-500 italic">{item.detail}</td>
              )}
            </tr>
          ))}
          {section.subtotal && (
            <tr className="border-t border-gray-300 bg-gray-100">
              <td className="py-2 px-3 text-sm font-semibold">{section.subtotal.label}</td>
              <td className="py-2 px-3 text-sm text-right font-mono font-semibold">{fmt(section.subtotal.value)}</td>
              <td className="py-2 px-3 text-xs text-gray-500 italic"></td>
            </tr>
          )}
          {section.margin !== undefined && (
            <tr className="bg-gray-100">
              <td className="py-2 px-3 text-sm">Margin Applied</td>
              <td className="py-2 px-3 text-sm text-right font-mono">{section.margin}%</td>
              <td className="py-2 px-3 text-xs text-gray-500 italic">Formula: Cost ÷ (1 - margin %)</td>
            </tr>
          )}
          {section.total && (
            <tr className="border-t border-gray-300 bg-gray-200 font-bold">
              <td className="py-2 px-3 text-sm">{section.total.label}</td>
              <td className="py-2 px-3 text-sm text-right font-mono">{fmt(section.total.value)}</td>
              <td className="py-2 px-3 text-xs text-gray-500 italic"></td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="mb-8">
      <div className="bg-black p-4 rounded-t text-white">
        <h2 className="text-xl font-bold">Price Calculator Debug</h2>
        <p className="text-sm opacity-80">Breakdown of all contributing values used in price calculations</p>
      </div>
      
      <div className="bg-gray-50 p-4 border-l border-r border-b border-gray-200 rounded-b">
        <div className="bg-white p-4 rounded shadow mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">GRAND TOTAL</h3>
              <p className="text-sm text-gray-500">Total Price Including All Components</p>
            </div>
            <div className="text-3xl font-bold text-black font-mono">{fmt(grandTotal)}</div>
          </div>
        </div>
        
        {renderSection(priceData.basePool)}
        {renderSection(priceData.installation)}
        {renderSection(priceData.filtration)}
        {renderSection(priceData.concrete)}
        {renderSection(priceData.fencing)}
        {renderSection(priceData.waterFeature)}
        {renderSection(priceData.retainingWalls)}
        {renderSection(priceData.extras)}
      </div>
    </div>
  );
}