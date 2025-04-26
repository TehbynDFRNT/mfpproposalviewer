import { supabase } from './supabaseClient';
import type { ProposalData } from '@/types/proposal';

export async function getProposalData(customerUuid: string): Promise<ProposalData> {
  /* ────────────────────────────────────────────────────────────────
   * 1. Core project row  (has all the foreign-key IDs we need)
   * ──────────────────────────────────────────────────────────────── */
  const { data: project, error: projErr } = await supabase
    .from('pool_projects')
    .select('*')
    .eq('id', customerUuid)
    .single();

  if (projErr || !project) {
    throw new Error(`Could not load pool project: ${projErr?.message}`);
  }

  const specId = project.pool_specification_id;

  /* ────────────────────────────────────────────────────────────────
   * 2. Fetch EVERYTHING else in parallel
   * ──────────────────────────────────────────────────────────────── */
  const [
    { data: poolSpec },
    { data: poolCosts },
    { data: poolMargins },
    { data: filtrationPkg },
    { data: elecReq },
    { data: waterFeat },
    { data: fgFence },
    { data: ftFence },
    { data: fixedCosts },
    { data: craneCosts },
    { data: bobcatCosts },
    { data: trafficCosts },
    { data: concreteCuts },
    { data: extraPavingCosts },
    { data: retainingWalls }
  ] = await Promise.all([
    supabase.from('pool_specifications').select('*').eq('id', specId).single(),
    supabase.from('pool_costs'          ).select('*').eq('pool_id', specId).single(),
    supabase.from('pool_margins'        ).select('*').eq('pool_id', specId).single(),
    supabase.from('filtration_packages' ).select(`
        *,
        pump:pump_id(*),
        filter:filter_id(*),
        light:light_id(*),
        sanitiser:sanitiser_id(*),
        handover_kit:handover_kit_id(
          *,
          components:handover_kit_package_components(
            *,
            component:component_id(*)
          )
        )
      `).eq('id', project.default_filtration_package_id ??
                   project.pool_specification_id).single(),
    supabase.from('pool_electrical_requirements')
            .select('*')
            .eq('customer_id', project.id)
            .eq('pool_id', specId)
            .maybeSingle(),
    supabase.from('pool_water_features')
            .select('*')
            .eq('customer_id', project.id)
            .eq('pool_id', specId)
            .maybeSingle(),
    supabase.from('frameless_glass_fencing')
            .select('*')
            .eq('customer_id', project.id)
            .maybeSingle(),
    supabase.from('flat_top_metal_fencing')
            .select('*')
            .eq('customer_id', project.id)
            .maybeSingle(),
    supabase.from('fixed_costs').select('*').order('display_order'),
    supabase.from('crane_costs').select('*'),
    supabase.from('bobcat_costs').select('*'),
    supabase.from('traffic_control_costs').select('*'),
    supabase.from('concrete_cuts').select('*'),
    supabase.from('extra_paving_costs').select('*'),
    supabase.from('retaining_walls').select('*')
  ]);

  /* helpers */
  const lookup = <T extends { id: string }>(rows: T[] | null, id?: string | null) =>
    rows?.find(r => r.id === id) ?? null;

  /* parse concrete-cut pair “uuid:qty” → row + qty */
  const concreteCut = (() => {
    if (!project.concrete_cuts) return null;
    const [cutId, qtyStr] = project.concrete_cuts.split(':');
    const row = lookup(concreteCuts, cutId);
    const qty = +qtyStr;
    return row && qty
      ? {
          quantity: qty,
          cutType: row.cut_type,
          costPerCut: row.price,
          totalCost: qty * row.price
        }
      : null;
  })();

  /* under-fence strips JSON → rate/length/total */
  const ufc = (() => {
    if (!project.under_fence_concrete_strips_data) return null;
    try {
      const arr = JSON.parse(project.under_fence_concrete_strips_data) as
        Array<{ id: string; length: number }>;
      const totalLen = arr.reduce((t, x) => t + x.length, 0);
      return {
        lengthMeters: totalLen,
        ratePerLm: project.ufc_rate ?? 0,
        totalCost: project.under_fence_concrete_strips_cost ?? 0
      };
    } catch {
      return null;
    }
  })();

  /* ────────────────────────────────────────────────────────────────
   * 3. Map to ProposalData (all fields covered)
   * ──────────────────────────────────────────────────────────────── */
  const viewModel: ProposalData = {
    /* -------------- CUSTOMER INFO ---------------- */
    customerInfo: {
      owner1:      project.owner1,
      owner2:      project.owner2,
      phoneNumber: project.phone,
      emailAddress: project.email,
      propertyDetails: { fullAddress: project.site_address }
    },

    /* -------------- POOL SELECTION --------------- */
    poolSelection: {
      pool: {
        name: poolSpec?.name ?? '',
        color: project.pool_color,
        dimensions: {
          lengthM:       poolSpec?.length        ?? 0,
          widthM:        poolSpec?.width         ?? 0,
          shallowDepthM: poolSpec?.depth_shallow ?? 0,
          deepDepthM:    poolSpec?.depth_deep    ?? 0
        }
      },
      fixedCosts: fixedCosts ?? [],
      individualCosts: [],                       // still no table – leave empty
      totalFixedCosts: (fixedCosts ?? []).reduce((t, c) => t + c.price, 0),
      totalIndividualCosts: 0,
      costSummary: { totalCost: poolCosts?.buy_price_inc_gst ?? 0 }
    },

    /* -------------- CONCRETE / PAVING ------------ */
    concreteAndPaving: {
      squareMeters:   project.extra_paving_square_meters,
      pavingCategory: lookup(extraPavingCosts, project.extra_paving_category)?.category,
      pavingCostSummary: {
        areaM2:    project.extra_paving_square_meters,
        ratePerM2: project.extra_paving_total_cost /
                   Math.max(project.extra_paving_square_meters || 1, 1),
        totalCost: project.extra_paving_total_cost
      },
      extraConcreting: {
        meterageM2:  project.extra_concreting_square_meters ?? 0,
        concreteType: project.extra_concreting_type ?? '',
        costSummary: {
          ratePerM2: project.extra_concreting_total_cost /
                     Math.max(project.extra_concreting_square_meters || 1, 1),
          totalCost: project.extra_concreting_total_cost ?? 0
        }
      },
      concretePump: {
        numberOfDaysRequired: project.concrete_pump_quantity ?? 0,
        totalCost: project.concrete_pump_total_cost
      },
      concreteCuts: concreteCut ?? undefined,
      underFenceConcreteStrips: ufc ?? undefined,
      sectionTotal:
        project.extra_paving_total_cost +
        project.extra_concreting_total_cost +
        project.concrete_pump_total_cost +
        (concreteCut?.totalCost ?? 0) +
        (ufc?.totalCost ?? 0)
    },

    /* -------------- SITE REQUIREMENTS ------------ */
    siteRequirements: {
      costSummary: { totalCost: project.site_requirements_total_cost ?? 0 },
      standardSiteRequirements: {
        craneSelection: {
          type: lookup(craneCosts, project.crane_id)?.name ?? '',
          cost: lookup(craneCosts, project.crane_id)?.price ?? 0
        },
        bobcatSelection: {
          type: lookup(bobcatCosts, project.bobcat_id)?.size_category ?? '',
          cost: lookup(bobcatCosts, project.bobcat_id)?.price ?? 0
        },
        trafficControl: {
          level: lookup(trafficCosts, project.traffic_control_id)?.name ?? '',
          cost:  lookup(trafficCosts, project.traffic_control_id)?.price ?? 0
        }
      },
      customSiteRequirements: project.site_requirements_data
    },

    /* -------------- ELECTRICAL ------------------- */
    electrical: {
      costSummary: { totalCost: elecReq?.total_cost ?? 0 },
      standardPower:      { isSelected: !!elecReq?.standard_power,      rate: 0 },
      addOnFenceEarthing: { isSelected: !!elecReq?.fence_earthing,      rate: 0 },
      heatPumpCircuit:    { isSelected: !!elecReq?.heat_pump_circuit,   rate: 0 }
    },

    /* -------------- FENCING ---------------------- */
    fencing: {
      fenceType: fgFence ? 'Frameless Glass' : 'Flat-Top Metal',
      totalFenceLengthM: fgFence?.linear_meters ?? ftFence?.linear_meters ?? 0,
      fenceLinearCost:   fgFence?.total_cost    ?? ftFence?.total_cost    ?? 0,
      gateSelection: {
        quantity:         fgFence?.gates  ?? ftFence?.gates  ?? 0,
        gateTotalCost:    fgFence?.total_cost ?? ftFence?.total_cost ?? 0,
        freeGateDiscount: 0
      },
      fgRetainingPanels: {
        simpleCount:  fgFence?.simple_panels  ?? 0,
        simpleCost:   0,
        complexCount: fgFence?.complex_panels ?? 0,
        complexCost:  0
      },
      earthingRequired: fgFence?.earthing_required ?? false,
      earthingCost:     0,
      costSummary:      { totalCost: fgFence?.total_cost ?? ftFence?.total_cost ?? 0 }
    },

    /* -------------- RETAINING WALLS -------------- */
    retainingWalls: {
      costSummary: { totalCost:
        project.retaining_wall1_total_cost +
        project.retaining_wall2_total_cost +
        project.retaining_wall3_total_cost +
        project.retaining_wall4_total_cost },
      walls: retainingWalls?.map(rw => ({
        wallType: rw.type,
        height1M: 0,
        lengthM:  0,
        baseRatePerM2:  rw.rate,
        extraRatePerM2: rw.extra_rate,
        calculation: { squareMeters: 0, totalCost: rw.total }
      })) ?? []
    },

    /* -------------- WATER FEATURE ---------------- */
    waterFeature: {
      size:               waterFeat?.water_feature_size ?? 'none',
      ledBladeSelection:  waterFeat ? `${waterFeat.led_blade} - ${waterFeat.total_cost}` : '',
      frontFinish:        waterFeat?.front_finish ?? '',
      sidesFinish:        waterFeat?.sides_finish ?? '',
      backCladdingNeeded: waterFeat?.back_cladding_needed ?? false,
      backCladdingCost:   waterFeat?.back_cladding_cost   ?? 0,
      costSummary:        { totalCost: waterFeat?.total_cost ?? 0 }
    },

    /* -------------- ADD-ONS ---------------------- */
    addOns: {
      costSummary: { totalCost: project.extras_total_cost ?? 0 }
    }
  };

  return viewModel;
}
