/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/lib/types/snapshot.ts
 * Type definition for data returned from the proposal_snapshot_v SQL view
 * Used by: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/lib/getProposalSnapshot.server.ts
 */
export interface ProposalSnapshot {
  /* 01–10: CORE PROJECT & CUSTOMER */
  project_id: string;
  owner1: string;
  owner2: string | null; // owner2 can be null
  email: string;
  phone: string;
  home_address: string;
  site_address: string;
  proposal_name: string;
  installation_area: string;
  resident_homeowner: boolean; 
  created_at: string; // From pj.created_at (Timestamptz converted to string)
  updated_at: string; // From pj.updated_at (Timestamptz converted to string)
  pool_color: string | null; // Pool color selection
  
  /* BASE POOL PRICE (Pool-spec + individual pool costs + excavation) */
  // Pool specification (dimensions + base buy-prices)
  spec_name: string;
  spec_range: string;
  spec_width_m: number;
  spec_length_m: number;
  spec_depth_shallow_m: number;
  spec_depth_deep_m: number;
  spec_buy_inc_gst: number;
  spec_buy_ex_gst: number;

  // Individual pool costs
  pc_beam: number;
  pc_coping_supply: number;
  pc_coping_lay: number;
  pc_salt_bags: number;
  pc_trucked_water: number;
  pc_misc: number;
  pc_pea_gravel: number;
  pc_install_fee: number;

  // Excavation (from dig_types via pool_dig_type_matches)
  dig_name: string;
  dig_excavation_rate: number;
  dig_excavation_hours: number;
  dig_truck_rate: number;
  dig_truck_hours: number;
  dig_truck_qty: number;
  
  // Fixed Costs (Standard Across ALL Quotes)
  fixed_costs_json: Array<{
    id: string;
    name: string;
    price: string;
    display_order: number;
    created_at: string;
  }>;
  
  // Optional pool margin (% by specification)
  pool_margin_pct: number;
  
  /* INSTALLATION (Electrical + traffic + bobcat + crane + custom) */
  // Custom site equipment
  crane_cost: number;
  crn_name: string;
  bobcat_cost: number;
  bob_size_category: string;
  bob_day_code: string;

  // Traffic control (stored or fallback level 1)
  traffic_control_cost: number;
  tc_name: string;

  // Electrical requirements (flags + lookup rates + stored total)
  elec_standard_power_flag: boolean;
  elec_fence_earthing_flag: boolean;
  elec_heat_pump_circuit_flag: boolean;
  elec_standard_power_rate: number | null; // SQL may return NULL due to CASE or LEFT JOIN
  elec_fence_earthing_rate: number | null; // SQL may return NULL
  elec_heat_pump_circuit_rate: number | null; // SQL may return NULL
  elec_total_cost: number;

  //Custom Requirements
  site_requirements_data: string; // From pj.site_requirements_data (Type assumed string, could be JSON string)
  site_requirements_notes: string; // Formerly site_requirement_notes
  
  /* CONCRETE & PAVING */
  // Concrete cuts
  concrete_cuts_cost: number;
  concrete_cuts_json: any[];
  
  // Extra paving
  epc_category: string;
  extra_paving_name: string;        // human-readable extra paving type
  epc_paver_cost: number;
  epc_wastage_cost: number;
  epc_margin_cost: number;
  extra_paving_sqm: number;
  extra_paving_cost: number;
  
  // Existing concrete paving
  existing_paving_category: string;
  existing_paving_name: string;     // human-readable existing paving type
  existing_paving_sqm: number;
  existing_paving_cost: number;
  
  // Extra concreting
  extra_concreting_type: string;
  extra_concreting_name: string;    // human-readable extra concreting type
  extra_concreting_base_price: number;
  extra_concreting_margin: number;
  extra_concreting_unit_price: number;
  extra_concreting_sqm: number;
  // extra_concreting_calc_total and extra_concreting_saved_total removed.
  extra_concreting_cost: number; // Replaces extra_concreting_calc_total and extra_concreting_saved_total, matches SQL extra_concreting_cost
  
  // Extra concrete finish options
  extra_concrete_finish_one: string | null; // Options: "Brushed - Ready for Future Paving", "Brushed - Second Pour", "Second Pour", "Smooth - Ready for Imitation Turf", "Smooth - Second Pour"
  extra_concrete_finish_two: string | null; // Options: "Brushed - Ready for Future Paving", "Brushed - Second Pour", "Second Pour", "Smooth - Ready for Imitation Turf", "Smooth - Second Pour"
  
  // Included coping options
  coping_category: string | null; // Options: "Cat1", "Cat2", "Cat3", "Cat4"
  grout_colour: string | null; // Options: "White", "Grey", "Custom"
  recess_drainage: string | null; // Options: "Yes", "No"
  
  // Concrete pump
  concrete_pump_needed: boolean;
  // concrete_pump_quantity renamed to concrete_pump_hours
  concrete_pump_hours: number | null; // Formerly concrete_pump_quantity
  concrete_pump_total_cost: number;
  
  // Extra concrete pump
  extra_concrete_pump: boolean;
  extra_concrete_pump_quantity: number | null;
  extra_concrete_pump_total_cost: number;
  
  // Under-fence concrete strips (enriched with type and cost data)
  uf_strips_data: Array<{
    id: string;
    length: number;
    type: string;
    unit_cost: number;
    unit_margin: number;
  }> | null; // Enriched strip data from fence_strips CTE
  uf_strips_cost: number;
  
  /* FRAMELESS-GLASS FENCING */
  glass_linear_meters: number | null;
  // Redundant/intermediate cost fields (glass_fence_cost, glass_gate_cost, glass_earthing_cost) removed.
  // These are not direct outputs from the SQL view. The view provides glass_total_cost.
  glass_gates: number | null;
  glass_simple_panels: number | null;
  glass_complex_panels: number | null;
  glass_earthing_required: boolean | null;
  // glass_fence_total_cost renamed to glass_total_cost
  glass_total_cost: number | null; // Formerly glass_fence_total_cost, matches SQL
  
  /* FLAT-TOP METAL FENCING */
  metal_linear_meters: number | null;
  // Redundant/intermediate cost fields (metal_fence_cost, metal_gate_cost, metal_earthing_cost) removed.
  metal_gates: number | null;
  metal_simple_panels: number | null;
  metal_complex_panels: number | null;
  metal_earthing_required: boolean | null;
  // metal_fence_total_cost renamed to metal_total_cost
  metal_total_cost: number | null; // Formerly metal_fence_total_cost, matches SQL
  
  /* COMPOSITE FENCING TOTAL */
  fencing_total_cost: number | null;
  
  /* FILTRATION PACKAGE & HANDOVER KIT */
  filtration_package_id: string | null; // Added from SQL (pf.filtration_package_id - UUID as string), can be null
  filtration_package_name: string;
  pump_name: string;
  pump_model: string;
  pump_price_inc_gst: number;
  filter_name: string;
  filter_model: string;
  filter_price_inc_gst: number;
  sanitiser_name: string;
  sanitiser_model: string;
  sanitiser_price_inc_gst: number;
  light_name: string;
  light_model: string;
  light_price_inc_gst: number;
  handover_package_name: string;
  handover_components: Array<{
    hk_component_name: string;
    hk_component_model: string;
    hk_component_price_inc_gst: number;
    hk_component_quantity: number;
  }>;
  
  /* WATER FEATURE */
  water_feature_size: string;
  water_feature_front_finish: string;
  water_feature_sides_finish: string;
  water_feature_top_finish: string;
  water_feature_back_cladding_needed: boolean;
  water_feature_led_blade: string;
  water_feature_total_cost: number;
  
  /* RETAINING WALLS (up to 4 raw sets) */
  // Individual retaining_wallX fields (retaining_wall1_type, etc.) removed.
  // Replaced by retaining_walls_json to match SQL view structure.
  retaining_walls_json: Array<{ 
    wall_type: string;
    height1: number;
    height2: number | null; // height2 can be null
    length: number;
    total_cost: number;
  }> | null; // This field can be null if no retaining walls (due to LEFT JOIN)
  
  /* EXTRAS & UPGRADES */
  // Pool cleaner
  cleaner_included: boolean;
  // cleaner_model_number removed; not directly available in the SQL view's selected fields for cleaner.
  cleaner_name: string;
  // cleaner_price renamed to cleaner_unit_price
  cleaner_unit_price: number; // Formerly cleaner_price, matches SQL
  cleaner_margin: number;
  cleaner_cost_price: number; // Added from SQL (plc.cost_price)
  
  // Heating options
  include_heat_pump: boolean;
  include_blanket_roller: boolean;
  
  // Heat pump product details
  heat_pump_sku: string;
  heat_pump_description: string;
  heat_pump_cost: number; // Matches heat_opt.heat_pump_cost from SQL
  // heat_pump_install_cost split into heat_pump_installation_cost and heat_pump_install_cost_reference
  heat_pump_installation_cost: number; // Matches heat_opt.heat_pump_installation_cost from SQL
  heat_pump_margin: number;
  heat_pump_rrp: number;
  heat_pump_install_cost_reference: number | null; // Added from SQL (hi_hp.installation_cost), can be null
  heat_pump_install_inclusions: string | null; // Type changed to string | null, as it can be null from LEFT JOIN
  
  // Blanket-roller product details
  blanket_roller_sku: string;
  blanket_roller_description: string;
  blanket_roller_cost: number; // Matches heat_opt.blanket_roller_cost from SQL
  // br_install_cost split into blanket_roller_installation_cost and br_install_cost_reference
  blanket_roller_installation_cost: number; // Matches heat_opt.blanket_roller_installation_cost from SQL
  blanket_roller_margin: number;
  blanket_roller_rrp: number;
  br_install_cost_reference: number | null; // Added from SQL (hi_br.installation_cost), can be null
  br_install_inclusions: string | null; // Type changed to string | null, as it can be null from LEFT JOIN
  
  // Totals from the quote
  heating_total_cost: number;
  heating_total_margin: number;
  
  /* FENCING PRICE BOOK */
  // Full lookup for fencing unit prices from the database
  fencing_costs_json: Array<{
    id: string;
    item: string;
    type: string;
    unit_price: number;
    category: string;
  }>;
  
  /* GENERAL EXTRAS */
  selected_extras_json: Array<{
    id: string;
    general_extra_id: string;
    name: string;
    sku: string;
    type: string;
    description: string;
    quantity: number;
    cost: number;
    margin: number;
    rrp: number;
    total_cost: number;
    total_margin: number;
    total_rrp: number;
  }> | null;
  extras_total_cost: number | null;
  extras_total_margin: number | null;
  extras_total_rrp: number | null;
  
  // timestamp field removed. It was noted as "Added by getProposalSnapshot function"
  // and is not part of the proposal_snapshot_v SQL view, aligning with the objective
  // to match the SQL view for a 1:1 data object.

  /* 3D VIDEOS & VISUALS */
  videos_json: Array<{ // Type changed from optional to nullable, can be null due to LEFT JOIN
    video_type: string;
    video_path: string;
    created_at: string;
  }> | null;

  /* Proposal Status Fields (from pool_proposal_status table) */
  // Fields from pps (LEFT JOIN) changed from optional to nullable for accurate SQL type mapping
  proposal_status: string | null;
  render_ready: boolean | null; // From pps.render_ready
  last_viewed: string | null;
  accepted_datetime: string | null;
  accepted_ip: string | null;
  last_change_requested: string | null;
  version: number | null;
  pin: string | null;
  
  /* Latest Change Request JSON (from the most recent change request) */
  change_request_json: any | null; // Type changed from optional to nullable, can be null due to LEFT JOIN

  /* APPLIED DISCOUNTS */
  // Discounts applied to this pool project from pool_discounts joined with discount_promotions
  applied_discounts_json: Array<{
    id: string;
    discount_promotion_uuid: string;
    discount_name: string;
    discount_type: 'dollar' | 'percentage';
    dollar_value: number | null;
    percentage_value: number | null;
    created_at: string;
  }> | null; // Can be null if no discounts are applied

  // change_requests_json field (and its comment block) removed.
  // This field is not present in the proposal_snapshot_v SQL view.
}