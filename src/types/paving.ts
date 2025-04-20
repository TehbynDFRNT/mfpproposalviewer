export interface PavingCostSummary {
  ratePerM2: number;
  areaM2: number;
  totalCost: number;
}

export interface SectionTotal {
  totalCost: number;
  totalMargin: number;
}

export interface RateBreakdownPerM2 {
  paverCost: number;
  wastageCost: number;
  marginCost: number;
  materialsSubtotal: number;
  labourCost: number;
}

export interface RateBreakdownTotal {
  paverCost: number;
  wastageCost: number;
  marginCost: number;
  materialsSubtotal: number;
  labourCost: number;
}

export interface RateBreakdown {
  perM2: RateBreakdownPerM2;
  totalForArea: RateBreakdownTotal;
}

export interface ConcretePump {
  concretePumpRequired: boolean;
  numberOfDaysRequired: number;
  ratePerDay: number;
  totalCost: number;
}

export interface ConcreteCuts {
  cutType: string;
  costPerCut: number;
  quantity: number;
  totalCost: number;
}

export interface ConcreteAndPaving {
  pavingCategory: string;
  squareMeters: number;
  pavingCostSummary: PavingCostSummary;
  rateBreakdown: RateBreakdown;
  pavingOnExistingConcrete?: {
    pavingCategory: string;
    squareMeters: number;
    costSummary: PavingCostSummary;
    rateBreakdown: RateBreakdown;
  };
  extraConcreting?: {
    concreteType: string;
    meterageM2: number;
    costSummary: PavingCostSummary;
    rateBreakdown: {
      perM2: {
        basePrice: number;
        margin: number;
        materialsSubtotal: number;
      };
      totalForArea: {
        basePrice: number;
        margin: number;
        materialsSubtotal: number;
      };
    };
  };
  concretePump: ConcretePump;
  underFenceConcreteStrips?: {
    selectedOption: string;
    ratePerLm: number;
    lengthMeters: number;
    totalCost: number;
  };
  concreteCuts: ConcreteCuts;
  sectionTotal: SectionTotal;
}