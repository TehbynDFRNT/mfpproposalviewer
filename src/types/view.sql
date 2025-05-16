/* 026_full_proposal_snapshot_with_margins_and_fixed_costs.sql
   –– drop & recreate view, pull latest electrical row per customer,
       and order columns by presentation group */

DROP VIEW IF EXISTS proposal_snapshot_v CASCADE;

CREATE VIEW proposal_snapshot_v AS
WITH
  target AS (
    SELECT * 
      FROM pool_projects
  ),

  /* helper: parse concrete_cuts (id:qty,id:qty → JSON array) */
  cuts AS (
    SELECT
      pj.id AS project_id,
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'cut_id',     cc.id,
          'cut_type',   cc.cut_type,
          'unit_price', cc.price,
          'quantity',   ct.qty
        )
        ORDER BY cc.cut_type
      ) AS concrete_cuts_json
    FROM   target pj
    LEFT   JOIN LATERAL (
              SELECT
                split_part(tok, ':', 1)::uuid AS cut_id,
                split_part(tok, ':', 2)::int  AS qty
              FROM   unnest(string_to_array(coalesce(pj.concrete_cuts, ''), ',')) AS tok
              WHERE  pj.concrete_cuts <> ''
            ) ct        ON TRUE
    LEFT   JOIN concrete_cuts cc  ON cc.id = ct.cut_id
    GROUP  BY pj.id
  ),

  /* pick the most recent electrical row for each customer */
  elec AS (
    SELECT DISTINCT ON (per.customer_id)
         per.customer_id,
         per.standard_power,
         per.fence_earthing,
         per.heat_pump_circuit,
         per.total_cost
    FROM   pool_electrical_requirements per
    ORDER  BY per.customer_id, per.updated_at DESC
  ),

  /* ── pick the most recent heating options per customer (pool heat + blanket roller) ── */
  heat AS (
    SELECT DISTINCT ON (pho.customer_id)
      pho.customer_id,
      pho.include_heat_pump,
      pho.include_blanket_roller,
      pho.heat_pump_id,
      pho.blanket_roller_id,
      pho.heat_pump_cost,
      pho.blanket_roller_cost,
      pho.total_cost      AS heating_total_cost,
      pho.total_margin    AS heating_total_margin
    FROM   pool_heating_options pho
    ORDER  BY pho.customer_id, pho.updated_at DESC
  ),

  /* helper: aggregate fixed costs into JSON array (static) */
  fixed AS (
    SELECT
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'id',    f.id,
          'name',  f.name,
          'price', f.price
        )
        ORDER BY f.display_order
      ) AS fixed_costs_json
    FROM fixed_costs f
  )
  /* ── pick the latest water‐feature row per customer ── */
,pwf_latest AS (
  SELECT DISTINCT ON (pwf.customer_id)
       pwf.customer_id
     , pwf.water_feature_size
     , pwf.front_finish
     , pwf.sides_finish
     , pwf.top_finish
     , pwf.back_cladding_needed
     , pwf.led_blade
     , pwf.total_cost    AS water_feature_total_cost
  FROM   pool_water_features pwf
  ORDER  BY pwf.customer_id, pwf.updated_at DESC
)

,videos_by_type AS (
  SELECT
    v.pool_project_id,
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'video_type', v.video_type,
        'video_path', v.video_path,
        'created_at', v.created_at
      )
      ORDER BY v.created_at DESC
    ) AS videos_json
    FROM "3d" AS v
    GROUP BY v.pool_project_id
)

/* ── pick the most recent change request per proposal status ── */
, change_req_latest AS (
    SELECT DISTINCT ON (cr.pool_proposal_status_id)
      cr.pool_proposal_status_id,
      cr.change_request_json
    FROM change_requests cr
    ORDER BY cr.pool_proposal_status_id, cr.created_at DESC
  )
  
SELECT
  /* ================================================== */
  /* 01–10: CORE PROJECT & CUSTOMER                   */
  /* ================================================== */
    pj.id                      AS project_id
  , pj.owner1
  , pj.owner2
  , pj.email
  , pj.phone
  , pj.home_address
  , pj.site_address
  , pj.proposal_name
  , pj.installation_area
  , pj.resident_homeowner

  /* ================================================== */
  /*          BASE POOL PRICE                          */
  /*   (Pool-spec + individual pool costs + excavation)*/
  /* ================================================== */
  -- Pool specification (dimensions + base buy-prices)
  , spec.name                  AS spec_name
  , spec.range                 AS spec_range
  , spec.width                 AS spec_width_m
  , spec.length                AS spec_length_m
  , spec.depth_shallow         AS spec_depth_shallow_m
  , spec.depth_deep            AS spec_depth_deep_m
  , spec.buy_price_inc_gst     AS spec_buy_inc_gst
  , spec.buy_price_ex_gst      AS spec_buy_ex_gst

  -- Individual pool costs
  , pc.beam                    AS pc_beam
  , pc.coping_supply           AS pc_coping_supply
  , pc.coping_lay              AS pc_coping_lay
  , pc.salt_bags               AS pc_salt_bags
  , pc.trucked_water           AS pc_trucked_water
  , pc.misc                    AS pc_misc
  , pc.pea_gravel              AS pc_pea_gravel
  , pc.install_fee             AS pc_install_fee

  -- Excavation (from dig_types via pool_dig_type_matches)
  , dig.name                   AS dig_name
  , dig.excavation_hourly_rate AS dig_excavation_rate
  , dig.excavation_hours       AS dig_excavation_hours
  , dig.truck_hourly_rate      AS dig_truck_rate
  , dig.truck_hours            AS dig_truck_hours
  , dig.truck_quantity         AS dig_truck_qty

  -- Fixed Costs (Standard Across ALL Quotes)
  , fixed.fixed_costs_json     AS fixed_costs_json

  -- Optional pool margin (% by specification)
  , pm.margin_percentage       AS pool_margin_pct

  /* ================================================== */
  /*          INSTALLATION                             */
  /*   (Electrical + traffic + bobcat + crane + custom)*/
  /* ================================================== */
  -- Custom site equipment
  , crn.price                  AS crane_cost
  , crn.name                   AS crn_name
  , bob.price                  AS bobcat_cost
  , bob.size_category          AS bob_size_category

  -- Traffic control (stored or fallback level 1)
  , tc.price                   AS traffic_control_cost
  , tc.name                    AS tc_name

  -- Site Requirement (Custom)
  , pj.site_requirements_data    AS site_requirements_data
  , pj.site_requirements_notes    AS site_requirements_notes

  /* ================================================== */
  /*          FILTRATION PACKAGE & HANDOVER KIT        */
  /* ================================================== */
  -- Package name
  , fp.name                      AS filtration_package_name

  -- Core package components
  , fc_pump.name                 AS pump_name
  , fc_pump.model_number         AS pump_model
  , fc_pump.price_inc_gst        AS pump_price_inc_gst

  , fc_filter.name               AS filter_name
  , fc_filter.model_number       AS filter_model
  , fc_filter.price_inc_gst      AS filter_price_inc_gst

  , fc_sanitiser.name            AS sanitiser_name
  , fc_sanitiser.model_number    AS sanitiser_model
  , fc_sanitiser.price_inc_gst   AS sanitiser_price_inc_gst

  , fc_light.name                AS light_name
  , fc_light.model_number        AS light_model
  , fc_light.price_inc_gst       AS light_price_inc_gst

  -- Handover‐kit package name
  , hk.name                      AS handover_package_name

  -- Aggregated JSON of all handover‐kit components
  , COALESCE(hk_comps.handover_components, '[]') AS handover_components

  -- Electrical requirements (flags + lookup rates + stored total)
  , elec.standard_power        AS elec_standard_power_flag
  , elec.fence_earthing        AS elec_fence_earthing_flag
  , elec.heat_pump_circuit     AS elec_heat_pump_circuit_flag
  , CASE WHEN elec.standard_power    THEN std.rate END AS elec_standard_power_rate
  , CASE WHEN elec.fence_earthing    THEN fe.rate  END AS elec_fence_earthing_rate
  , CASE WHEN elec.heat_pump_circuit THEN elec_hp.rate  END AS elec_heat_pump_circuit_rate
  , elec.total_cost             AS elec_total_cost

  /* ================================================== */
  /*       CONCRETE & PAVING                           */
  /* ================================================== */
  -- Concrete cuts
  , pj.concrete_cuts_cost       AS concrete_cuts_cost
  , cuts.concrete_cuts_json     AS concrete_cuts_json

  -- Extra paving
  , epc.category                AS epc_category
  , epc.paver_cost              AS epc_paver_cost
  , epc.wastage_cost            AS epc_wastage_cost
  , epc.margin_cost             AS epc_margin_cost
  , pj.extra_paving_square_meters AS extra_paving_sqm
  , pj.extra_paving_total_cost    AS extra_paving_cost

  -- Existing concrete paving
  , pj.existing_concrete_paving_category      AS existing_paving_category
  , pj.existing_concrete_paving_square_meters AS existing_paving_sqm
  , pj.existing_concrete_paving_total_cost    AS existing_paving_cost

  -- Extra concreting
  , pj.extra_concreting_type        AS extra_concreting_type
  , ec.price                        AS extra_concreting_base_price
  , ec.margin                       AS extra_concreting_margin
  , (ec.price + ec.margin)          AS extra_concreting_unit_price
  , pj.extra_concreting_square_meters AS extra_concreting_sqm
  , pj.extra_concreting_square_meters * (ec.price + ec.margin)
                                     AS extra_concreting_calc_total
  , pj.extra_concreting_total_cost  AS extra_concreting_saved_total

  -- Concrete pump
  , pj.concrete_pump_needed        AS concrete_pump_needed
  , pj.concrete_pump_quantity      AS concrete_pump_quantity
  , pj.concrete_pump_total_cost    AS concrete_pump_total_cost

  -- Under-fence concrete strips
  , pj.under_fence_concrete_strips_cost AS uf_strips_cost
  , pj.under_fence_concrete_strips_data AS uf_strips_raw

  /* ================================================== */
  /*            FRAMELESS‐GLASS FENCING                */
  /* ================================================== */
  , gf.glass_linear_meters
  , gf.glass_linear_meters * fg_fence.unit_price      AS glass_fence_cost
  , gf.glass_gates
  , gf.glass_gates * fg_gate.unit_price               AS glass_gate_cost
  , gf.glass_simple_panels
  , gf.glass_complex_panels
  , gf.glass_earthing_required
  , CASE WHEN gf.glass_earthing_required
         THEN fg_earth.unit_price
         ELSE 0 END                                   AS glass_earthing_cost
  , gf.glass_total_cost        AS glass_fence_total_cost

  /* ================================================== */
  /*           FLAT‐TOP METAL FENCING                  */
  /* ================================================== */
  , mf.metal_linear_meters
  , mf.metal_linear_meters * fm_fence.unit_price      AS metal_fence_cost
  , mf.metal_gates
  , mf.metal_gates * fm_gate.unit_price               AS metal_gate_cost
  , mf.metal_simple_panels
  , mf.metal_complex_panels
  , mf.metal_earthing_required
  , CASE WHEN mf.metal_earthing_required
         THEN fm_earth.unit_price
         ELSE 0 END                                   AS metal_earthing_cost
  , mf.metal_total_cost        AS metal_fence_total_cost
  
  /* composite fencing total */
  , (gf.glass_linear_meters * fg_fence.unit_price
   + gf.glass_gates * fg_gate.unit_price
   + CASE WHEN gf.glass_earthing_required THEN fg_earth.unit_price ELSE 0 END
   + mf.metal_linear_meters * fm_fence.unit_price
   + mf.metal_gates * fm_gate.unit_price
   + CASE WHEN mf.metal_earthing_required THEN fm_earth.unit_price ELSE 0 END
  ) AS fencing_total_cost

  /* ================================================== */
  /*          WATER FEATURE                            */
  /* ================================================== */
  -- now only the one "latest" water feature per project
  , pwf_latest.water_feature_size           AS water_feature_size
  , pwf_latest.front_finish                 AS water_feature_front_finish
  , pwf_latest.sides_finish                 AS water_feature_sides_finish
  , pwf_latest.top_finish                   AS water_feature_top_finish
  , pwf_latest.back_cladding_needed         AS water_feature_back_cladding_needed
  , pwf_latest.led_blade                    AS water_feature_led_blade
  , pwf_latest.water_feature_total_cost     AS water_feature_total_cost


  /* ================================================== */
  /*      RETAINING WALLS (up to 4 raw sets)          */
  /* ================================================== */
  , pj.retaining_wall1_type       AS retaining_wall1_type
  , pj.retaining_wall1_height1    AS retaining_wall1_height1
  , pj.retaining_wall1_height2    AS retaining_wall1_height2
  , pj.retaining_wall1_length     AS retaining_wall1_length
  , pj.retaining_wall1_total_cost AS retaining_wall1_total_cost
  , pj.retaining_wall2_type       AS retaining_wall2_type
  , pj.retaining_wall2_height1    AS retaining_wall2_height1
  , pj.retaining_wall2_height2    AS retaining_wall2_height2
  , pj.retaining_wall2_length     AS retaining_wall2_length
  , pj.retaining_wall2_total_cost AS retaining_wall2_total_cost
  , pj.retaining_wall3_type       AS retaining_wall3_type
  , pj.retaining_wall3_height1    AS retaining_wall3_height1
  , pj.retaining_wall3_height2    AS retaining_wall3_height2
  , pj.retaining_wall3_length     AS retaining_wall3_length
  , pj.retaining_wall3_total_cost AS retaining_wall3_total_cost
  , pj.retaining_wall4_type       AS retaining_wall4_type
  , pj.retaining_wall4_height1    AS retaining_wall4_height1
  , pj.retaining_wall4_height2    AS retaining_wall4_height2
  , pj.retaining_wall4_length     AS retaining_wall4_length
  , pj.retaining_wall4_total_cost AS retaining_wall4_total_cost

  /* ================================================== */
  /*          EXTRAS & UPGRADES                        */
  /* ================================================== */
  /* Pool cleaner */
  , pcs_cleaner.include_cleaner AS cleaner_included
  , pc_cleaner.model_number     AS cleaner_model_number
  , pc_cleaner.name             AS cleaner_name
  , pc_cleaner.price            AS cleaner_price
  , pc_cleaner.margin           AS cleaner_margin
  
  /* Heating options */
  , heat_opt.include_heat_pump      AS include_heat_pump
  , heat_opt.include_blanket_roller AS include_blanket_roller

  /* — heat pump product details (from compatibility join) */
  , hp.hp_sku                        AS heat_pump_sku
  , hp.hp_description                AS heat_pump_description
  , hp.cost                          AS heat_pump_cost
  , hp.margin                        AS heat_pump_margin
  , hp.rrp                           AS heat_pump_rrp
  , hi_hp.installation_cost          AS heat_pump_install_cost
  , hi_hp.installation_inclusions    AS heat_pump_install_inclusions

  /* — blanket-roller product details (from compatibility join) */
  , br.sku                           AS blanket_roller_sku
  , br.description                   AS blanket_roller_description
  , br.cost                          AS blanket_roller_cost
  , br.margin                        AS blanket_roller_margin
  , br.rrp                           AS blanket_roller_rrp
  , hi_br.installation_cost          AS br_install_cost
  , hi_br.installation_inclusions    AS br_install_inclusions

  /* — totals from the quote */
  , heat_opt.heating_total_cost     AS heating_total_cost
  , heat_opt.heating_total_margin   AS heating_total_margin

/* ================================================== */
/*          3D VIDEOS & RENDERING                      */
/* ================================================== */
    , videos_by_type.videos_json        AS videos_json

    /* ── pull in our new, normalized proposal status */
    , pps.status                        AS proposal_status
    , pps.render_ready                  AS render_ready
    , pps.last_viewed                   AS last_viewed
    , pps.accepted_datetime             AS accepted_datetime
    , pps.accepted_ip                   AS accepted_ip
    , pps.last_change_requested         AS last_change_requested
    , pps.version                       AS version
    , pps.pin                           AS pin
    , crl.change_request_json           AS change_request_json

/* ====================BegintheJoiiins================================= */
FROM target pj
  LEFT JOIN pool_specifications       spec ON spec.id             = pj.pool_specification_id
  LEFT JOIN filtration_packages       fp   ON fp.id               = spec.default_filtration_package_id
  LEFT JOIN filtration_components     fc_pump     ON fc_pump.id      = fp.pump_id
  LEFT JOIN filtration_components     fc_filter   ON fc_filter.id    = fp.filter_id
  LEFT JOIN filtration_components     fc_sanitiser ON fc_sanitiser.id = fp.sanitiser_id
  LEFT JOIN filtration_components     fc_light    ON fc_light.id     = fp.light_id

  LEFT JOIN handover_kit_packages     hk   ON hk.id               = fp.handover_kit_id

  LEFT JOIN LATERAL (
    SELECT
      JSON_AGG(
        JSON_BUILD_OBJECT(
          'hk_component_name',         fc_hk.name,
          'hk_component_model',        fc_hk.model_number,
          'hk_component_price_inc_gst',fc_hk.price_inc_gst,
          'hk_component_quantity',     hkpc.quantity
        )
        ORDER BY hkpc.id
      ) AS handover_components
    FROM handover_kit_package_components hkpc
    JOIN filtration_components fc_hk
      ON fc_hk.id = hkpc.component_id
    WHERE hkpc.package_id = hk.id
  ) AS hk_comps ON TRUE
  
  LEFT JOIN pool_costs                pc   ON pc.pool_id          = spec.id
  LEFT JOIN pool_dig_type_matches     pdtm ON pdtm.pool_id         = pj.pool_specification_id
  LEFT JOIN dig_types                 dig  ON dig.id               = pdtm.dig_type_id

  LEFT JOIN bobcat_costs              bob  ON bob.id              = pj.bobcat_id
  LEFT JOIN pool_crane_selections     pcs  ON pcs.pool_id          = pj.id
  LEFT JOIN crane_costs               crn  ON crn.id              = COALESCE(pcs.crane_id, pj.crane_id)
  LEFT JOIN traffic_control_costs     tc   ON tc.id               = COALESCE(
                                                         pj.traffic_control_id,
                                                         (SELECT id FROM traffic_control_costs
                                                            ORDER BY display_order
                                                            LIMIT 1)
                                                       )


  LEFT JOIN extra_paving_costs        epc  ON epc.id               = pj.extra_paving_category
  LEFT JOIN extra_concreting          ec   ON lower(replace(ec.type,' ','-')) = lower(pj.extra_concreting_type)
  -- replace the simple water-features join with our "latest" CTE
  LEFT JOIN pwf_latest                ON pwf_latest.customer_id = pj.id

  /* ── frameless-glass fencing as one-row lateral ── */
  LEFT JOIN LATERAL (
    SELECT
      f.linear_meters     AS glass_linear_meters,
      f.gates             AS glass_gates,
      f.simple_panels     AS glass_simple_panels,
      f.complex_panels    AS glass_complex_panels,
      f.earthing_required AS glass_earthing_required,
      f.total_cost        AS glass_total_cost
    FROM frameless_glass_fencing f
    WHERE f.customer_id = pj.id
    ORDER BY f.updated_at DESC
    LIMIT 1
  ) AS gf ON TRUE

  /* ── flat-top metal fencing as one-row lateral ── */
  LEFT JOIN LATERAL (
    SELECT
      m.linear_meters     AS metal_linear_meters,
      m.gates             AS metal_gates,
      m.simple_panels     AS metal_simple_panels,
      m.complex_panels    AS metal_complex_panels,
      m.earthing_required AS metal_earthing_required,
      m.total_cost        AS metal_total_cost
    FROM flat_top_metal_fencing m
    WHERE m.customer_id = pj.id
    ORDER BY m.updated_at DESC
    LIMIT 1
  ) AS mf ON TRUE

  /* ── bring in fence rates (unit prices) */
  LEFT JOIN fencing_costs fg_fence
    ON fg_fence.category = 'Fencing'
   AND fg_fence.item     = 'Frameless Glass'

  LEFT JOIN fencing_costs fg_gate
    ON fg_gate.category = 'Gates'
   AND fg_gate.item     = 'Frameless Glass Gate'

  LEFT JOIN fencing_costs fm_fence
    ON fm_fence.category = 'Fencing'
   AND fm_fence.item     = 'Flat Top Metal'

  LEFT JOIN fencing_costs fm_gate
    ON fm_gate.category = 'Gates'
   AND fm_gate.item     = 'Flat Top Metal Gate'

  LEFT JOIN fencing_costs fg_earth
    ON fg_earth.category = 'Earthing'
   AND fg_earth.item     = 'Earthing (FG)'

  LEFT JOIN fencing_costs fm_earth
    ON fm_earth.category = 'Earthing'
   AND fm_earth.item     = 'Earthing (FTM)'

  /* ── pool_cleaner_selections → pool_cleaners via LATERAL join to ensure one row ────── */
  LEFT JOIN LATERAL (
    SELECT
      include_cleaner,
      pool_cleaner_id
    FROM pool_cleaner_selections
    WHERE customer_id = pj.id
    ORDER BY updated_at DESC   -- get the latest selection
    LIMIT 1
  ) AS pcs_cleaner ON TRUE

  LEFT JOIN pool_cleaners pc_cleaner
    ON pc_cleaner.id = pcs_cleaner.pool_cleaner_id

  /* ── latest heating options per project ─────────────────────────────────── */
  LEFT JOIN heat                      heat_opt   ON heat_opt.customer_id     = pj.id

  /* ── map via pool_spec → compatibility → heat pump ─────────────────────── */
  LEFT JOIN LATERAL (
    SELECT heat_pump_id
      FROM heat_pump_pool_compatibility
     WHERE pool_model = spec.name
     LIMIT 1
  ) AS hpc ON TRUE

  LEFT JOIN heat_pump_products        hp         ON hp.id                    = hpc.heat_pump_id

  /* ── look up one blanket-roller by pool_model → spec.name ───────────────────────── */
  LEFT JOIN LATERAL (
    SELECT
      id,
      sku,
      description,
      rrp,
      trade   AS cost,
      margin
    FROM blanket_rollers
    WHERE pool_model = spec.name
    LIMIT 1
  ) AS br ON TRUE

  /* ── bring in the two static installation lines ─────────────────────────────── */
  LEFT JOIN heating_installations     hi_hp      ON hi_hp.installation_type = 'Heat Pump'
                                                  AND heat_opt.include_heat_pump = true

  LEFT JOIN heating_installations     hi_br      ON hi_br.installation_type = 'Blanket & Roller'
                                                  AND heat_opt.include_blanket_roller = true

  /* electrical via most-recent CTE + lookup rates */
  LEFT JOIN elec                     ON elec.customer_id      = pj.id
  LEFT JOIN electrical_costs std     ON lower(std.description) = 'standard power'
  LEFT JOIN electrical_costs fe      ON lower(fe.description)  = 'add on fence earthing'
  LEFT JOIN electrical_costs elec_hp ON lower(elec_hp.description) = 'heat pump circuit'

  /* pool_margins by specification */
  LEFT JOIN pool_margins             pm   ON pm.pool_id          = spec.id

  /* static fixed costs JSON */
  LEFT JOIN fixed                    ON TRUE

  /* attach the cuts JSON */
  LEFT JOIN cuts                     ON cuts.project_id       = pj.id

  
  LEFT JOIN videos_by_type ON videos_by_type.pool_project_id = pj.id
  LEFT JOIN pool_proposal_status pps ON pps.pool_project_id  = pj.id
  LEFT JOIN change_req_latest    crl ON crl.pool_proposal_status_id = pps.pool_project_id
;
