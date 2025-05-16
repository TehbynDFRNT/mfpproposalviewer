/**
 * File: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/lib/types/snapshot.ts
 * Type definition for data returned from the proposal_snapshot_v SQL view
 * Used by: /Users/tehbynnova/Code/MyProjects/Web/mfp/src/app/lib/getProposalSnapshot.server.ts
 */
export interface ProposalSnapshot {
  /* 01–10: CORE PROJECT & CUSTOMER */
  project_id: string;
  owner1: string;
  owner2?: string;
  email: string;
  phone: string;
  home_address: string;
  site_address: string;
  proposal_name: string;
  installation_area: string;
  resident_homeowner: boolean;
  
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
  fixed_costs_json: any[];
  
  // Optional pool margin (% by specification)
  pool_margin_pct: number;
  
  /* INSTALLATION (Electrical + traffic + bobcat + crane + custom) */
  // Custom site equipment
  crane_cost: number;
  crn_name: string;
  bobcat_cost: number;
  bob_size_category: string;

  // Traffic control (stored or fallback level 1)
  traffic_control_cost: number;
  tc_name: string;

  // Electrical requirements (flags + lookup rates + stored total)
  elec_standard_power_flag: boolean;
  elec_fence_earthing_flag: boolean;
  elec_heat_pump_circuit_flag: boolean;
  elec_standard_power_rate?: number;
  elec_fence_earthing_rate?: number;
  elec_heat_pump_circuit_rate?: number;
  elec_total_cost: number;

  //Custom Requirements

  site_requirements_data:  string;
  site_requirement_notes: string;
  
  /* CONCRETE & PAVING */
  // Concrete cuts
  concrete_cuts_cost: number;
  concrete_cuts_json: any[];
  
  // Extra paving
  epc_category: string;
  epc_paver_cost: number;
  epc_wastage_cost: number;
  epc_margin_cost: number;
  extra_paving_sqm: number;
  extra_paving_cost: number;
  
  // Existing concrete paving
  existing_paving_category: string;
  existing_paving_sqm: number;
  existing_paving_cost: number;
  
  // Extra concreting
  extra_concreting_type: string;
  extra_concreting_base_price: number;
  extra_concreting_margin: number;
  extra_concreting_unit_price: number;
  extra_concreting_sqm: number;
  extra_concreting_calc_total: number;
  extra_concreting_saved_total: number;
  
  // Concrete pump
  concrete_pump_needed: boolean;
  concrete_pump_quantity: number | null;
  concrete_pump_total_cost: number;
  
  // Under-fence concrete strips
  uf_strips_cost: number;
  uf_strips_raw: string;
  
  /* FRAMELESS-GLASS FENCING */
  glass_linear_meters: number | null;
  glass_fence_cost: number | null;
  glass_gates: number | null;
  glass_gate_cost: number | null;
  glass_simple_panels: number | null;
  glass_complex_panels: number | null;
  glass_earthing_required: boolean | null;
  glass_earthing_cost: number | null;
  glass_fence_total_cost: number | null;
  
  /* FLAT-TOP METAL FENCING */
  metal_linear_meters: number | null;
  metal_fence_cost: number | null;
  metal_gates: number | null;
  metal_gate_cost: number | null;
  metal_simple_panels: number | null;
  metal_complex_panels: number | null;
  metal_earthing_required: boolean | null;
  metal_earthing_cost: number | null;
  metal_fence_total_cost: number | null;
  
  /* COMPOSITE FENCING TOTAL */
  fencing_total_cost: number | null;
  
  /* FILTRATION PACKAGE & HANDOVER KIT */
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
  retaining_wall1_type: string;
  retaining_wall1_height1: number;
  retaining_wall1_height2: number;
  retaining_wall1_length: number;
  retaining_wall1_total_cost: number;
  retaining_wall2_type?: string;
  retaining_wall2_height1?: number;
  retaining_wall2_height2?: number;
  retaining_wall2_length?: number;
  retaining_wall2_total_cost?: number;
  retaining_wall3_type?: string;
  retaining_wall3_height1?: number;
  retaining_wall3_height2?: number;
  retaining_wall3_length?: number;
  retaining_wall3_total_cost?: number;
  retaining_wall4_type?: string;
  retaining_wall4_height1?: number;
  retaining_wall4_height2?: number;
  retaining_wall4_length?: number;
  retaining_wall4_total_cost?: number;
  
  /* EXTRAS & UPGRADES */
  // Pool cleaner
  cleaner_included: boolean;
  cleaner_model_number: string;
  cleaner_name: string;
  cleaner_price: number;
  cleaner_margin: number;
  
  // Heating options
  include_heat_pump: boolean;
  include_blanket_roller: boolean;
  
  // Heat pump product details
  heat_pump_sku: string;
  heat_pump_description: string;
  heat_pump_cost: number;
  heat_pump_margin: number;
  heat_pump_rrp: number;
  heat_pump_install_cost: number;
  heat_pump_install_inclusions: string;
  
  // Blanket-roller product details
  blanket_roller_sku: string;
  blanket_roller_description: string;
  blanket_roller_cost: number;
  blanket_roller_margin: number;
  blanket_roller_rrp: number;
  br_install_cost: number;
  br_install_inclusions: string;
  
  // Totals from the quote
  heating_total_cost: number;
  heating_total_margin: number;
  
  // Added by getProposalSnapshot function
  timestamp: string;

  /* 3D VIDEOS & VISUALS */
  videos_json?: Array<{
    video_type: string;
    video_path: string;
    created_at: string;
  }>;

  /* Proposal Status Fields (from pool_proposal_status table) */
  proposal_status?: string;
  render_ready?: boolean;
  last_viewed?: string;
  accepted_datetime?: string;
  accepted_ip?: string;
  last_change_requested?: string;
  version?: number;
  pin?: string;
  
  /* Latest Change Request JSON (from the most recent change request) */
  change_request_json?: any;

  /* Change Request History (aggregated from change_requests table) */
  change_requests_json?: Array<{
    id: string;
    payload: any;
    created_at: string;
  }>;
}