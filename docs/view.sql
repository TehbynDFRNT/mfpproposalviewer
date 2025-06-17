-- View: public.proposal_snapshot_v

DROP VIEW public.proposal_snapshot_v;

CREATE OR REPLACE VIEW public.proposal_snapshot_v
 AS  WITH target AS (
         SELECT pool_projects.id,
            pool_projects.owner1,
            pool_projects.owner2,
            pool_projects.phone,
            pool_projects.email,
            pool_projects.home_address,
            pool_projects.site_address,
            pool_projects.installation_area,
            pool_projects.resident_homeowner,
            pool_projects.proposal_name,
            pool_projects.created_at,
            pool_projects.updated_at,
            pool_projects.pool_specification_id,
            pool_projects.pool_color,
            pool_projects.site_requirements_data,
            pool_projects.site_requirements_notes,
            pool_projects.render_ready
           FROM pool_projects
        ), cuts AS (
         SELECT pcs.pool_project_id AS project_id,
            json_agg(json_build_object('cut_id', cc.id, 'cut_type', cc.cut_type, 'unit_price', cc.price, 'quantity', ct.qty) ORDER BY cc.cut_type) AS concrete_cuts_json
           FROM pool_concrete_selections pcs
             LEFT JOIN LATERAL ( SELECT split_part(tok.tok, ':'::text, 1)::uuid AS cut_id,
                    split_part(tok.tok, ':'::text, 2)::integer AS qty
                   FROM unnest(string_to_array(COALESCE(pcs.concrete_cuts, ''::text), ','::text)) tok(tok)
                  WHERE pcs.concrete_cuts <> ''::text) ct ON true
             LEFT JOIN concrete_cuts cc ON cc.id = ct.cut_id
          GROUP BY pcs.pool_project_id
        ), elec AS (
         SELECT DISTINCT ON (per.customer_id) per.customer_id,
            per.standard_power,
            per.fence_earthing,
            per.heat_pump_circuit,
            per.total_cost
           FROM pool_electrical_requirements per
          ORDER BY per.customer_id, per.updated_at DESC
        ), project_filtration AS (
         SELECT pool_projects.id AS project_id,
            COALESCE(ppfp.filtration_package_id, spec_1.default_filtration_package_id) AS filtration_package_id
           FROM pool_projects
             LEFT JOIN pool_specifications spec_1 ON spec_1.id = pool_projects.pool_specification_id
             LEFT JOIN pool_project_filtration_packages ppfp ON ppfp.pool_project_id = pool_projects.id
        ), heat AS (
         SELECT DISTINCT ON (pho.customer_id) pho.customer_id,
            pho.include_heat_pump,
            pho.include_blanket_roller,
            pho.heat_pump_id,
            pho.blanket_roller_id,
            pho.heat_pump_cost,
            pho.blanket_roller_cost,
            pho.heat_pump_installation_cost,
            pho.blanket_roller_installation_cost,
            pho.total_cost AS heating_total_cost,
            pho.total_margin AS heating_total_margin
           FROM pool_heating_options pho
          ORDER BY pho.customer_id, pho.updated_at DESC
        ), fixed AS (
         SELECT json_agg(json_build_object('id', f.id, 'name', f.name, 'price', f.price) ORDER BY f.display_order) AS fixed_costs_json
           FROM fixed_costs f
        ), retaining_walls AS (
         SELECT pool_retaining_walls.pool_project_id,
            json_agg(json_build_object('wall_type', pool_retaining_walls.wall_type, 'height1', pool_retaining_walls.height1, 'height2', pool_retaining_walls.height2, 'length', pool_retaining_walls.length, 'total_cost', pool_retaining_walls.total_cost) ORDER BY pool_retaining_walls.id) AS retaining_walls_json
           FROM pool_retaining_walls
          GROUP BY pool_retaining_walls.pool_project_id
        ), equipment AS (
         SELECT pool_equipment_selections.pool_project_id,
            pool_equipment_selections.crane_id,
            pool_equipment_selections.traffic_control_id,
            pool_equipment_selections.bobcat_id
           FROM pool_equipment_selections
        ), paving AS (
         SELECT pool_paving_selections.pool_project_id,
            pool_paving_selections.extra_paving_category,
            pool_paving_selections.extra_paving_square_meters,
            pool_paving_selections.extra_paving_total_cost,
            pool_paving_selections.existing_concrete_paving_category,
            pool_paving_selections.existing_concrete_paving_square_meters,
            pool_paving_selections.existing_concrete_paving_total_cost,
            pool_paving_selections.extra_concreting_type,
            pool_paving_selections.extra_concreting_square_meters,
            pool_paving_selections.extra_concreting_total_cost
           FROM pool_paving_selections
        ), fence_strips AS (                                             -- ⬅ enrich strip_data
         SELECT
           fs.pool_project_id,
           jsonb_agg(
             jsonb_build_object(
               'id',         elem ->> 'id',
               'length',     (elem ->> 'length')::numeric,
               'type',       ufs.type,
               'unit_cost',  ufs.cost,
               'unit_margin',ufs.margin
             )
             ORDER BY ufs.display_order
           )                             AS strip_data_enriched,
           fs.total_cost
         FROM pool_fence_concrete_strips               fs
         LEFT JOIN LATERAL
           jsonb_array_elements(
             CASE jsonb_typeof(fs.strip_data)
               WHEN 'array'  THEN fs.strip_data
               WHEN 'string' THEN (fs.strip_data #>> '{}')::jsonb
               ELSE '[]'::jsonb
             END
           ) AS elem
         ON TRUE
         LEFT JOIN under_fence_concrete_strips         ufs
           ON ufs.id = (elem ->> 'id')::uuid
         GROUP BY fs.pool_project_id,
                  fs.total_cost
        ), concrete_selections AS (
         SELECT pool_concrete_selections.pool_project_id,
            pool_concrete_selections.concrete_pump_needed,
            pool_concrete_selections.concrete_pump_quantity,
            pool_concrete_selections.concrete_pump_total_cost,
            pool_concrete_selections.concrete_cuts,
            pool_concrete_selections.concrete_cuts_cost
           FROM pool_concrete_selections
        ), pwf_latest AS (
         SELECT DISTINCT ON (pwf.customer_id) pwf.customer_id,
            pwf.water_feature_size,
            pwf.front_finish,
            pwf.sides_finish,
            pwf.top_finish,
            pwf.back_cladding_needed,
            pwf.led_blade,
            pwf.total_cost AS water_feature_total_cost
           FROM pool_water_features pwf
          ORDER BY pwf.customer_id, pwf.updated_at DESC
        ), videos_by_type AS (
         SELECT v.pool_project_id,
            json_agg(json_build_object('video_type', v.video_type, 'video_path', v.video_path, 'created_at', v.created_at) ORDER BY v.created_at DESC) AS videos_json
           FROM "3d" v
          GROUP BY v.pool_project_id
        ), change_req_latest AS (
         SELECT DISTINCT ON (cr.pool_proposal_status_id) cr.pool_proposal_status_id,
            cr.change_request_json
           FROM change_requests cr
          ORDER BY cr.pool_proposal_status_id, cr.created_at DESC
        ), extras AS (
         SELECT pge.pool_project_id,
            json_agg(json_build_object('id', pge.id, 'general_extra_id', pge.general_extra_id, 'name', pge.name, 'sku', pge.sku, 'type', pge.type, 'description', pge.description, 'quantity', pge.quantity, 'cost', pge.cost, 'margin', pge.margin, 'rrp', pge.rrp, 'total_cost', pge.total_cost, 'total_margin', pge.total_margin, 'total_rrp', pge.total_rrp) ORDER BY pge.name) AS selected_extras_json,
            sum(pge.total_cost) AS extras_total_cost,
            sum(pge.total_margin) AS extras_total_margin,
            sum(pge.total_rrp) AS extras_total_rrp
           FROM pool_general_extras pge
          GROUP BY pge.pool_project_id
        ), fencing_pricebook AS (
         SELECT json_agg(json_build_object('id', fc.id, 'item', fc.item, 'type', fc.type, 'unit_price', fc.unit_price, 'category', fc.category) ORDER BY fc.display_order) AS fencing_costs_json
           FROM fencing_costs fc
        ), discounts AS (
         SELECT pd.pool_project_id,
            json_agg(
                json_build_object(
                    'id', pd.id,
                    'discount_promotion_uuid', pd.discount_promotion_uuid,
                    'discount_name', dp.discount_name,
                    'discount_type', dp.discount_type,
                    'dollar_value', dp.dollar_value,
                    'percentage_value', dp.percentage_value,
                    'created_at', pd.created_at
                ) ORDER BY pd.created_at
            ) AS applied_discounts_json
           FROM pool_discounts pd
           JOIN discount_promotions dp ON dp.uuid = pd.discount_promotion_uuid
          GROUP BY pd.pool_project_id
        )
 SELECT pj.id AS project_id,
    pj.owner1,
    pj.owner2,
    pj.email,
    pj.phone,
    pj.home_address,
    pj.site_address,
    pj.proposal_name,
    pj.installation_area,
    pj.resident_homeowner,
    pj.created_at,
    pj.updated_at,
    pj.pool_color,
    spec.name AS spec_name,
    spec.range AS spec_range,
    spec.width AS spec_width_m,
    spec.length AS spec_length_m,
    spec.depth_shallow AS spec_depth_shallow_m,
    spec.depth_deep AS spec_depth_deep_m,
    spec.buy_price_inc_gst AS spec_buy_inc_gst,
    spec.buy_price_ex_gst AS spec_buy_ex_gst,
    pc.beam AS pc_beam,
    pc.coping_supply AS pc_coping_supply,
    pc.coping_lay AS pc_coping_lay,
    pc.salt_bags AS pc_salt_bags,
    pc.trucked_water AS pc_trucked_water,
    pc.misc AS pc_misc,
    pc.pea_gravel AS pc_pea_gravel,
    pc.install_fee AS pc_install_fee,
    dig.name AS dig_name,
    dig.excavation_hourly_rate AS dig_excavation_rate,
    dig.excavation_hours AS dig_excavation_hours,
    dig.truck_hourly_rate AS dig_truck_rate,
    dig.truck_hours AS dig_truck_hours,
    dig.truck_quantity AS dig_truck_qty,
    fixed.fixed_costs_json,
    pm.margin_percentage AS pool_margin_pct,
    crn.price AS crane_cost,
    crn.name AS crn_name,
    bob.price AS bobcat_cost,
    bob.size_category AS bob_size_category,
    bob.day_code AS bob_day_code,
    tc.price AS traffic_control_cost,
    tc.name AS tc_name,
    pj.site_requirements_data,
    pj.site_requirements_notes,
    pf.filtration_package_id,
    fp.name AS filtration_package_name,
    fc_pump.name AS pump_name,
    fc_pump.model_number AS pump_model,
    fc_pump.price_inc_gst AS pump_price_inc_gst,
    fc_filter.name AS filter_name,
    fc_filter.model_number AS filter_model,
    fc_filter.price_inc_gst AS filter_price_inc_gst,
    fc_sanitiser.name AS sanitiser_name,
    fc_sanitiser.model_number AS sanitiser_model,
    fc_sanitiser.price_inc_gst AS sanitiser_price_inc_gst,
    fc_light.name AS light_name,
    fc_light.model_number AS light_model,
    fc_light.price_inc_gst AS light_price_inc_gst,
    hk.name AS handover_package_name,
    COALESCE(hk_comps.handover_components, '[]'::json) AS handover_components,
    con.concrete_cuts_cost,
    cuts.concrete_cuts_json,
    epc.category    AS epc_category,
    epc.category    AS extra_paving_name,        -- human-readable extra paving
    epc.paver_cost AS epc_paver_cost,
    epc.wastage_cost AS epc_wastage_cost,
    epc.margin_cost AS epc_margin_cost,
    pav.extra_paving_square_meters AS extra_paving_sqm,
    pav.extra_paving_total_cost AS extra_paving_cost,
    pav.existing_concrete_paving_category AS existing_paving_category,
    epc2.category   AS existing_paving_name,     -- human-readable existing paving
    pav.existing_concrete_paving_square_meters AS existing_paving_sqm,
    pav.existing_concrete_paving_total_cost AS existing_paving_cost,
    pav.extra_concreting_type,
    ec.type         AS extra_concreting_name,    -- human-readable extra concreting
    ec.price AS extra_concreting_base_price,
    ec.margin AS extra_concreting_margin,
    ec.price + ec.margin AS extra_concreting_unit_price,
    pav.extra_concreting_square_meters AS extra_concreting_sqm,
    pav.extra_concreting_total_cost AS extra_concreting_cost,
    pav.extra_concrete_finish_one,
    pav.extra_concrete_finish_two,
    pav.coping_category,
    pav.grout_colour,
    pav.recess_drainage,
    con.concrete_pump_needed,
    con.concrete_pump_quantity AS concrete_pump_hours,
    con.concrete_pump_total_cost,
    fs.strip_data_enriched AS uf_strips_data,
    fs.total_cost AS uf_strips_cost,
    gf.glass_linear_meters,
    gf.glass_gates,
    gf.glass_simple_panels,
    gf.glass_complex_panels,
    gf.glass_earthing_required,
    gf.glass_total_cost,
    mf.metal_linear_meters,
    mf.metal_gates,
    mf.metal_simple_panels,
    mf.metal_complex_panels,
    mf.metal_earthing_required,
    mf.metal_total_cost,
    gf.glass_linear_meters * fg_fence.unit_price + gf.glass_gates::numeric * fg_gate.unit_price +
        CASE
            WHEN gf.glass_earthing_required THEN fg_earth.unit_price
            ELSE 0::numeric
        END + mf.metal_linear_meters * fm_fence.unit_price + mf.metal_gates::numeric * fm_gate.unit_price +
        CASE
            WHEN mf.metal_earthing_required THEN fm_earth.unit_price
            ELSE 0::numeric
        END AS fencing_total_cost,
    pwf_latest.water_feature_size,
    pwf_latest.front_finish AS water_feature_front_finish,
    pwf_latest.sides_finish AS water_feature_sides_finish,
    pwf_latest.top_finish AS water_feature_top_finish,
    pwf_latest.back_cladding_needed AS water_feature_back_cladding_needed,
    pwf_latest.led_blade AS water_feature_led_blade,
    pwf_latest.water_feature_total_cost,
    extras.selected_extras_json,
    extras.extras_total_cost,
    extras.extras_total_margin,
    extras.extras_total_rrp,
    rw.retaining_walls_json,
    pcs2.include_cleaner AS cleaner_included,
    plc.name AS cleaner_name,
    plc.price AS cleaner_unit_price,
    plc.margin AS cleaner_margin,
    plc.cost_price AS cleaner_cost_price,
    heat_opt.include_heat_pump,
    heat_opt.include_blanket_roller,
    hp.hp_sku AS heat_pump_sku,
    hp.hp_description AS heat_pump_description,
    heat_opt.heat_pump_cost,
    heat_opt.heat_pump_installation_cost,
    hp.margin AS heat_pump_margin,
    hp.rrp AS heat_pump_rrp,
    hi_hp.installation_cost AS heat_pump_install_cost_reference,
    hi_hp.installation_inclusions AS heat_pump_install_inclusions,
    br.sku AS blanket_roller_sku,
    br.description AS blanket_roller_description,
    heat_opt.blanket_roller_cost,
    heat_opt.blanket_roller_installation_cost,
    br.margin AS blanket_roller_margin,
    br.rrp AS blanket_roller_rrp,
    hi_br.installation_cost AS br_install_cost_reference,
    hi_br.installation_inclusions AS br_install_inclusions,
    heat_opt.heating_total_cost,
    heat_opt.heating_total_margin,
    fencing_pricebook.fencing_costs_json,
    elec.standard_power AS elec_standard_power_flag,
    elec.fence_earthing AS elec_fence_earthing_flag,
    elec.heat_pump_circuit AS elec_heat_pump_circuit_flag,
        CASE
            WHEN elec.standard_power THEN std.rate
            ELSE NULL::numeric
        END AS elec_standard_power_rate,
        CASE
            WHEN elec.fence_earthing THEN fe.rate
            ELSE NULL::numeric
        END AS elec_fence_earthing_rate,
        CASE
            WHEN elec.heat_pump_circuit THEN elec_hp.rate
            ELSE NULL::numeric
        END AS elec_heat_pump_circuit_rate,
    elec.total_cost AS elec_total_cost,
    videos_by_type.videos_json,
    pps.status AS proposal_status,
    pps.render_ready,
    pps.last_viewed,
    pps.accepted_datetime,
    pps.accepted_ip,
    pps.last_change_requested,
    pps.version,
    pps.pin,
    crl.change_request_json,
    disc.applied_discounts_json
   FROM target pj
     LEFT JOIN concrete_selections con ON con.pool_project_id = pj.id
     LEFT JOIN pool_paving_selections pav ON pav.pool_project_id = pj.id
     LEFT JOIN fence_strips fs ON fs.pool_project_id = pj.id
     LEFT JOIN retaining_walls rw ON rw.pool_project_id = pj.id
     LEFT JOIN equipment eq ON eq.pool_project_id = pj.id
     LEFT JOIN crane_costs crn ON crn.id = eq.crane_id
     LEFT JOIN bobcat_costs bob ON bob.id = eq.bobcat_id
     LEFT JOIN traffic_control_costs tc ON tc.id = eq.traffic_control_id
     LEFT JOIN pool_specifications spec ON spec.id = pj.pool_specification_id
     LEFT JOIN project_filtration pf ON pf.project_id = pj.id
     LEFT JOIN filtration_packages fp ON fp.id = pf.filtration_package_id
     LEFT JOIN filtration_components fc_pump ON fc_pump.id = fp.pump_id
     LEFT JOIN filtration_components fc_filter ON fc_filter.id = fp.filter_id
     LEFT JOIN filtration_components fc_sanitiser ON fc_sanitiser.id = fp.sanitiser_id
     LEFT JOIN filtration_components fc_light ON fc_light.id = fp.light_id
     LEFT JOIN handover_kit_packages hk ON hk.id = fp.handover_kit_id
     LEFT JOIN LATERAL ( SELECT json_agg(json_build_object('hk_component_name', fc_hk.name, 'hk_component_model', fc_hk.model_number, 'hk_component_price_inc_gst', fc_hk.price_inc_gst, 'hk_component_quantity', hkpc.quantity) ORDER BY hkpc.id) AS handover_components
           FROM handover_kit_package_components hkpc
             JOIN filtration_components fc_hk ON fc_hk.id = hkpc.component_id
          WHERE hkpc.package_id = hk.id) hk_comps ON true
     LEFT JOIN pool_costs pc ON pc.pool_id = spec.id
     LEFT JOIN pool_dig_type_matches pdtm ON pdtm.pool_id = pj.pool_specification_id
     LEFT JOIN dig_types dig ON dig.id = pdtm.dig_type_id
     LEFT JOIN extra_paving_costs epc  ON epc.id  = pav.extra_paving_category
     -- add normalized lookup for existing paving
     LEFT JOIN extra_paving_costs epc2 ON nullif(pav.existing_concrete_paving_category, '')::uuid = epc2.id
     LEFT JOIN extra_concreting ec ON ec.id = NULLIF(pav.extra_concreting_type, '')::uuid
     LEFT JOIN pwf_latest ON pwf_latest.customer_id = pj.id
     LEFT JOIN LATERAL ( SELECT f.linear_meters AS glass_linear_meters,
            f.gates AS glass_gates,
            f.simple_panels AS glass_simple_panels,
            f.complex_panels AS glass_complex_panels,
            f.earthing_required AS glass_earthing_required,
            f.total_cost AS glass_total_cost
           FROM frameless_glass_fencing f
          WHERE f.customer_id = pj.id
          ORDER BY f.updated_at DESC
         LIMIT 1) gf ON true
     LEFT JOIN LATERAL ( SELECT m.linear_meters AS metal_linear_meters,
            m.gates AS metal_gates,
            m.simple_panels AS metal_simple_panels,
            m.complex_panels AS metal_complex_panels,
            m.earthing_required AS metal_earthing_required,
            m.total_cost AS metal_total_cost
           FROM flat_top_metal_fencing m
          WHERE m.customer_id = pj.id
          ORDER BY m.updated_at DESC
         LIMIT 1) mf ON true
     LEFT JOIN fencing_costs fg_fence ON fg_fence.category::text = 'Fencing'::text AND fg_fence.item::text = 'Frameless Glass'::text
     LEFT JOIN fencing_costs fg_gate ON fg_gate.category::text = 'Gates'::text AND fg_gate.item::text = 'Frameless Glass Gate'::text
     LEFT JOIN fencing_costs fm_fence ON fm_fence.category::text = 'Fencing'::text AND fm_fence.item::text = 'Flat Top Metal'::text
     LEFT JOIN fencing_costs fm_gate ON fm_gate.category::text = 'Gates'::text AND fm_gate.item::text = 'Flat Top Metal Gate'::text
     LEFT JOIN fencing_costs fg_earth ON fg_earth.category::text = 'Earthing'::text AND fg_earth.item::text = 'Earthing (FG)'::text
     LEFT JOIN fencing_costs fm_earth ON fm_earth.category::text = 'Earthing'::text AND fm_earth.item::text = 'Earthing (FTM)'::text
     LEFT JOIN pool_cleaner_selections pcs2 ON pcs2.pool_id = spec.id
     LEFT JOIN pool_cleaners plc ON plc.id = pcs2.pool_cleaner_id
     LEFT JOIN heat heat_opt ON heat_opt.customer_id = pj.id
     LEFT JOIN heat_pump_products hp ON hp.id = heat_opt.heat_pump_id
     LEFT JOIN blanket_rollers br ON br.id = heat_opt.blanket_roller_id
     LEFT JOIN heating_installations hi_hp ON hi_hp.installation_type = 'Heat Pump'::text AND heat_opt.include_heat_pump = true
     LEFT JOIN heating_installations hi_br ON hi_br.installation_type = 'Blanket & Roller'::text AND heat_opt.include_blanket_roller = true
     LEFT JOIN elec ON elec.customer_id = pj.id
     LEFT JOIN electrical_costs std ON lower(std.description::text) = 'standard power'::text
     LEFT JOIN electrical_costs fe ON lower(fe.description::text) = 'add on fence earthing'::text
     LEFT JOIN electrical_costs elec_hp ON lower(elec_hp.description::text) = 'heat pump circuit'::text
     LEFT JOIN pool_margins pm ON pm.pool_id = spec.id
     LEFT JOIN fixed ON true
     LEFT JOIN cuts ON cuts.project_id = pj.id
     LEFT JOIN videos_by_type ON videos_by_type.pool_project_id = pj.id
     LEFT JOIN pool_proposal_status pps ON pps.pool_project_id = pj.id
     LEFT JOIN change_req_latest crl ON crl.pool_proposal_status_id = pps.pool_project_id
     LEFT JOIN extras ON extras.pool_project_id = pj.id
     LEFT JOIN discounts disc ON disc.pool_project_id = pj.id
     CROSS JOIN fencing_pricebook;