# Quote Data Object Structure Documentation

## Overview

This document outlines the structure of the main `quote` JSON object used for generating pool construction proposals. The object consolidates customer information, pool specifications, site details, construction elements (concrete, fencing, etc.), optional add-ons, and comprehensive cost summaries.

A key feature of this structure is the **standardized `costSummary` object** present within each major cost-contributing section. This provides a consistent way to track the total cost and total margin for each part of the quote, simplifying backend calculations. A final `quoteTotalSummary` object aggregates these individual summaries for the overall quote totals.

## Top-Level Structure

The root `quote` object contains the following primary keys:

*   `quoteId`: (String) A unique identifier for this specific quote.
*   `dateCreated`: (String) The date the quote was created (format: DD/MM/YYYY).
*   `customerInfo`: (Object) Contains details about the customer and property.
*   `poolSelection`: (Object) Contains details about the selected pool shell and its associated base costs.
*   `siteRequirements`: (Object) Details specific site access and preparation needs (crane, bobcat, custom work).
*   `concreteAndPaving`: (Object) Details all concrete and paving work required.
*   `retainingWalls`: (Object) Details any retaining walls needed.
*   `fencing`: (Object) Details the pool fencing requirements.
*   `electrical`: (Object) Details the electrical work needed.
*   `waterFeature`: (Object) Details any selected water features.
*   `addOns`: (Object) Details optional add-ons like heating, cleaners, automation, etc.
*   `quoteTotalSummary`: (Object) Provides the grand total cost and margin for the entire quote.

---

## Detailed Sections

### 1. `customerInfo` (Object)

Contains information identifying the customer and the property.

*   `customerId`: (String) Unique identifier for the customer record.
*   `owner1`: (String) Name of the primary owner.
*   `owner2`: (String) Name of the secondary owner (if applicable).
*   `phoneNumber`: (String) Customer's phone number.
*   `emailAddress`: (String) Customer's email address.
*   `propertyDetails`: (Object) Information about the installation site.
    *   `homeAddress`: (String) Customer primary residence address.
    *   `siteAddress`: (String) Address where the pool will be installed (if different from home address).
    *   `installationArea`: (String) General geographic area of installation (e.g., "Brisbane").
    *   `residentHomeowner`: (Boolean) Indicates if the customer resides at the installation property.
*   `proposalInfo`: (Object) Information specific to this proposal document.
    *   `proposalName`: (String) The title or name used for the generated proposal document.

### 2. `poolSelection` (Object)

Details the chosen pool model and its inherent costs (base price, fixed, and individual).

*   `pool`: (Object) Specific details about the pool shell.
    *   `modelName`: (String) Name and dimensions of the pool model.
    *   `poolRange`: (String) The product range the pool belongs to (e.g., "Latin").
    *   `poolType`: (String) General size category (e.g., "SMALL").
    *   `weightKg`: (Number) Weight of the pool shell in kilograms.
    *   `volumeLiters`: (Number) Water volume capacity in liters.
    *   `color`: (String) Selected color finish for the pool shell.
    *   `dimensions`: (Object) Physical measurements of the pool.
        *   `lengthM`: (Number) Length in meters.
        *   `widthM`: (Number) Width in meters.
        *   `shallowDepthM`: (Number) Depth at the shallow end in meters.
        *   `deepDepthM`: (Number) Depth at the deep end in meters.
        *   `waterlineLitersPerMeter`: (Number) Liters per meter at the waterline (useful for calculations).
    *   `pricing`: (Object) Base pricing for the pool shell.
        *   `basePriceExGst`: (Number) Base price excluding Goods and Services Tax.
        *   `basePriceIncGst`: (Number) Base price including Goods and Services Tax.
*   `fixedCosts`: (Array) List of standard fixed costs associated with any pool installation.
    *   *Each object in the array contains:*
        *   `name`: (String) Description of the fixed cost item.
        *   `cost`: (Number) The cost associated with this item.
*   `totalFixedCosts`: (Number) The sum of all costs listed in `fixedCosts`.
*   `individualCosts`: (Array) List of costs that vary based on the specific pool or site but are directly tied to the pool installation itself.
    *   *Each object in the array contains:*
        *   `name`: (String) Description of the individual cost item.
        *   `cost`: (Number) The cost associated with this item.
*   `totalIndividualCosts`: (Number) The sum of all costs listed in `individualCosts`.
*   `costSummary`: (Object) **Standardized Summary** for this section.
    *   `totalCost`: (Number) The total cost for the pool selection = `pool.pricing.basePriceIncGst` + `totalFixedCosts` + `totalIndividualCosts`.
    *   `totalMargin`: (Number) The margin derived from the base pool price = `pool.pricing.basePriceIncGst` - `pool.pricing.basePriceExGst`. (Assumes fixed/individual costs listed here have no separate margin).

### 3. `siteRequirements` (Object)

Details costs related to site access and specific preparation tasks.

*   `standardSiteRequirements`: (Object) Costs for standard access equipment.
    *   `trafficControl`: (Object) Details about traffic control needs.
        *   `level`: (String) Level of traffic control required (e.g., "None Required").
        *   `cost`: (Number) Associated cost.
    *   `craneSelection`: (Object) Details about the crane needed.
        *   `type`: (String) Type/size of crane selected.
        *   `cost`: (Number) Associated cost.
    *   `bobcatSelection`: (Object) Details about the bobcat needed.
        *   `type`: (String) Type/size of bobcat selected.
        *   `cost`: (Number) Associated cost.
*   `customSiteRequirements`: (Array) List of non-standard site requirements. Can contain objects or strings (notes).
    *   *Example object:*
        *   `description`: (String) Description of the custom requirement.
        *   `price`: (Number) The cost/price for this custom work.
    *   *Example string:*
        *   `"Notes: Airconditioner removal needed for site access."`
*   `costSummary`: (Object) **Standardized Summary** for this section.
    *   `totalCost`: (Number) Sum of all costs within `standardSiteRequirements` and the `price` field of custom requirements objects.
    *   `totalMargin`: (Number) The total margin associated with this section (assumed 0 in the example unless specific logic calculates margin on custom items).

### 4. `concreteAndPaving` (Object)

Details costs related to concrete work, paving, and associated tasks.

*   Contains various objects detailing different types of concrete/paving work (`pavingCategory`, `pavingOnExistingConcrete`, `extraConcreting`, `concretePump`, `underFenceConcreteStrips`, `concreteCuts`). Each sub-object typically includes details like area/length, rates, and potentially its own cost breakdown and summary.
*   `costSummary`: (Object) **Standardized Summary** for this entire section.
    *   `totalCost`: (Number) The sum total cost of all concrete and paving activities selected/calculated within this section.
    *   `totalMargin`: (Number) The sum total margin calculated from all concrete and paving activities within this section.

### 5. `retainingWalls` (Object)

Details costs for constructing retaining walls.

*   `walls`: (Array) List of retaining walls to be built.
    *   *Each object in the array details:* Name, type, dimensions, rates, and calculation results (`totalCost`, `marginAmount`) for *that specific wall*.
*   `costSummary`: (Object) **Standardized Summary** for this section.
    *   `totalCost`: (Number) The sum total cost of all walls listed in the `walls` array.
    *   `totalMargin`: (Number) The sum total margin from all walls listed in the `walls` array.

### 6. `fencing` (Object)

Details the costs associated with pool safety fencing.

*   Contains properties defining fence type, length, cost per meter, gate selection (including discounts), special panel costs, and earthing costs.
*   `costSummary`: (Object) **Standardized Summary** for this section.
    *   `totalCost`: (Number) The total calculated cost for the fencing, including linear cost, gates (minus discounts), special panels, and earthing.
    *   `totalMargin`: (Number) The total margin associated with the fencing (assumed 0 in the example, but could be calculated based on margins within `costPerMeter` or gate costs if applicable, adjusted for discounts).

### 7. `electrical` (Object)

Details the required electrical work and costs.

*   Contains objects for different electrical components (`standardPower`, `addOnFenceEarthing`, `heatPumpCircuit`), usually indicating selection (`isSelected`) and associated `rate` or cost.
*   `costSummary`: (Object) **Standardized Summary** for this section.
    *   `totalCost`: (Number) The sum total cost of all selected electrical items.
    *   `totalMargin`: (Number) The total margin associated with the electrical work (assumed 0 in the example unless rates embed margin).

### 8. `waterFeature` (Object)

Details the specification and cost of a selected water feature.

*   Contains properties defining the size, finishes, cladding needs, and LED blade selection for the water feature. Costs and margins for sub-components might be explicitly listed.
*   `costSummary`: (Object) **Standardized Summary** for this section.
    *   `totalCost`: (Number) The total cost of the water feature, including base item, cladding, and LED blade.
    *   `totalMargin`: (Number) The total margin derived from the water feature components (base item margin, cladding margin, LED blade margin).

### 9. `addOns` (Object)

Groups various optional add-ons for the pool.

*   Contains sub-objects for different categories of add-ons (`heating`, `poolCleaner`, `hardwareUpgrades`, `otherAddOns`).
*   Each category contains an array of specific add-on types (e.g., `heating` contains "Heat Pump" and "Blanket and Roller").
*   Each add-on type object includes:
    *   `name`: (String) The name of the add-on.
    *   `isSelected`: (Boolean) Indicates if this add-on is included in the quote.
    *   `products`: (Array) List of specific product SKUs/details associated with this add-on.
        *   *Each product object typically contains:* `sku`, `description`, `cost`, `margin`, `total` (or `rrp`).
*   `costSummary`: (Object) **Standardized Summary** for this section.
    *   `totalCost`: (Number) The sum total cost (`total` or equivalent price field) of all product items within add-on categories where `"isSelected": true`.
    *   `totalMargin`: (Number) The sum total `margin` of all product items within add-on categories where `"isSelected": true`.

### 10. `quoteTotalSummary` (Object)

Provides the final aggregated totals for the entire quote.

*   `grandTotalCost`: (Number) The sum of the `totalCost` values from the `costSummary` object of *every* preceding section (`poolSelection`, `siteRequirements`, `concreteAndPaving`, `retainingWalls`, `fencing`, `electrical`, `waterFeature`, `addOns`).
*   `grandTotalMargin`: (Number) The sum of the `totalMargin` values from the `costSummary` object of *every* preceding section.

---