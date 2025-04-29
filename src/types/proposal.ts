/* src/types/proposal.ts
 * ONE single source of truth for the viewer
 */
export interface ProposalData {
  /* ─── Customer Info ─────────────────────────── */
  customerInfo: {
    owner1: string;
    owner2?: string | null;
    phoneNumber: string;
    emailAddress: string;
    propertyDetails: { 
      fullAddress: string;      // Site address (or home address as fallback)
      homeAddress?: string;     // Owner's home address (may be different from site address)
      formattedAddress?: string; // Properly formatted address for geocoding
      coordinates?: { lat: number; lng: number }; // Store coordinates if we have them
    };
  };

  /* ─── Pool Selection ────────────────────────── */
  poolSelection: {
    pool: {
      name: string;
      color: string;
      description?: string; // Optional description that could be provided from the backend
      dimensions: { lengthM: number; widthM: number; shallowDepthM: number; deepDepthM: number };
    };
    fixedCosts: Array<{ id: string; name: string; price: number }>;
    individualCosts: Array<{ id: string; name: string; price: number }>;
    totalFixedCosts: number;
    totalIndividualCosts: number;
    costSummary: { totalCost: number };
  };

  /* ─── Concrete / Paving ─────────────────────── */
  concreteAndPaving: {
    squareMeters?: number;
    pavingCategory?: string;
    pavingCostSummary: { areaM2: number; ratePerM2: number; totalCost: number };

    extraConcreting?: {
      meterageM2: number;
      concreteType?: string;
      costSummary: { ratePerM2: number; totalCost: number };
    };

    concretePump: { numberOfDaysRequired: number; totalCost: number };

    concreteCuts?: { quantity: number; cutType: string; costPerCut: number; totalCost: number };

    underFenceConcreteStrips?: { lengthMeters: number; ratePerLm: number; totalCost: number };

    sectionTotal?: number;
  };

  /* ─── Site Requirements ─────────────────────── */
  siteRequirements: {
    costSummary: { totalCost: number };
    standardSiteRequirements: {
      craneSelection:  { type: string; cost: number };
      bobcatSelection: { type: string; cost: number };
      trafficControl:  { level: string; cost: number };
    };
    customSiteRequirements?: Array<{ description: string; price: number }> | null;
  };

  /* ─── Electrical ────────────────────────────── */
  electrical: {
    costSummary: { totalCost: number };
    standardPower:      { isSelected: boolean; rate: number };
    addOnFenceEarthing: { isSelected: boolean; rate: number };
    heatPumpCircuit:    { isSelected: boolean; rate: number };
  };

  /* ─── Fencing ───────────────────────────────── */
  fencing: {
    fenceType: string;
    totalFenceLengthM: number;
    fenceLinearCost: number;
    gateSelection: { quantity: number; gateTotalCost: number; freeGateDiscount: number };
    fgRetainingPanels: { simpleCount: number; simpleCost: number; complexCount: number; complexCost: number };
    earthingRequired: boolean;
    earthingCost: number;
    costSummary: { totalCost: number };
  };

  /* ─── Retaining Walls ───────────────────────── */
  retainingWalls: {
    costSummary: { totalCost: number };
    walls: Array<{
      wallType: string;
      height1M: number;
      lengthM: number;
      baseRatePerM2: number;
      extraRatePerM2: number;
      calculation: { squareMeters: number; totalCost: number };
    }>;
  };

  /* ─── Water Feature ─────────────────────────── */
  waterFeature: {
    size: string;
    ledBladeSelection: string;
    frontFinish: string;
    sidesFinish: string;
    backCladdingNeeded: boolean;
    backCladdingCost: number;
    costSummary: { totalCost: number };
  };

  /* ─── Add-Ons summary (UI hasn’t drilled further yet) ─── */
  addOns: { costSummary: { totalCost: number } };
}
