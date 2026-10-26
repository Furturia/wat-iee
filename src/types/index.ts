export type VerificationStatus = "verified" | "user_entered" | "estimated" | "unknown";
export type AvailabilityStatus = "open" | "limited" | "full" | "closed" | "unknown";
export type JobGroupType = "classic" | "signature" | "exclusive" | "ultimate" | "other";
export type SecondJobFeasibility = "high" | "medium" | "low" | "prohibited" | "unknown";

export interface DataSource {
  sourceName?: string;
  sourceUrl?: string;
  documentName?: string;
  pageOrSection?: string;
  checkedAt?: string; // ISO date YYYY-MM-DD
  status: VerificationStatus;
  notes?: string;
}

export interface MoneyInput {
  id: string;
  amount?: number; // undefined means unknown; zero means explicitly zero
  currency: "USD" | "THB";
  label: string;
  paidUpfront: boolean;
  includedInProgramFee?: boolean;
  refundable?: boolean;
  category?: "program" | "visa" | "sevis" | "airfare" | "insurance" | "deposit" | "other";
  source?: DataSource;
}

export interface WeeklyCostInput {
  id: string;
  amount?: number; // undefined means unknown
  currency: "USD" | "THB";
  label: string;
  category?: "housing" | "food" | "transport" | "phone" | "other";
  source?: DataSource;
}

export interface SecondJobInfo {
  feasibility: SecondJobFeasibility;
  notes?: string;
  potentialExtraHoursPerWeek?: number;
  potentialExtraWageUSD?: number;
}

export interface JobOffer {
  id: string;
  employerName: string;
  jobTitle: string;
  agency?: string; // Default "IEE Thailand"
  jobGroupType: JobGroupType;
  availabilityStatus: AvailabilityStatus;
  availabilityCheckedAt?: string; // YYYY-MM-DD
  availabilitySource?: DataSource;
  city: string;
  state: string;
  workplaceAddress?: string;
  
  // Dates
  employmentStartDate?: string; // YYYY-MM-DD
  employmentEndDate?: string; // YYYY-MM-DD
  
  // Wage & Hours
  hourlyWageUSD?: number;
  expectedHoursPerWeek?: number;
  minimumHoursPerWeek?: number;
  maximumHoursPerWeek?: number;
  lowHoursPerWeek?: number;
  highHoursPerWeek?: number;
  
  // Safety & 2nd job
  citySafetyNotes?: string;
  secondJobInfo?: SecondJobInfo;

  // Costs
  oneTimeCosts: MoneyInput[];
  weeklyCosts: WeeklyCostInput[];
  refundableDepositsUSD?: number;
  emergencyReserveUSD?: number;
  estimatedDeductionRate?: number; // decimal e.g. 0.10 for 10%
  
  isDemo?: boolean;
  notes?: string;
  source?: DataSource;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  hideFullJobsByDefault: boolean;
  currencyDisplay: "USD" | "THB" | "both";
  exchangeRateTHBPerUSD: number;
  exchangeRateDate: string;
  locale: "th-TH" | "en-US";
  globalStartDate?: string;
  globalEndDate?: string;
  applyGlobalDatesToAll?: boolean;
}

export interface AppDataV1 {
  schemaVersion: 1;
  settings: AppSettings;
  jobs: JobOffer[];
}

export interface ScenarioResult {
  hoursPerWeek: number;
  grossIncomeUSD: number;
  grossIncomeTHB: number;
  estimatedDeductionsUSD: number;
  estimatedDeductionsTHB: number;
  estimatedNetIncomeUSD: number;
  estimatedNetIncomeTHB: number;
  netReturnUSD: number;
  netReturnTHB: number;
  isBreakEven: boolean;
  hoursMarginFromBreakEven: number;
}

export interface CalculationEvaluation {
  jobId: string;
  isComplete: boolean;
  missingFields: string[];
  durationDays: number;
  durationWeeks: number;
  
  // Upfront cash
  upfrontCashUSD: number;
  upfrontCashTHB: number;
  refundableDepositsUSD: number;
  emergencyReserveUSD: number;

  // Modeled costs
  totalOneTimeCostsUSD: number;
  totalOneTimeCostsTHB: number;
  weeklyRecurringCostUSD: number;
  weeklyRecurringCostTHB: number;
  totalModeledCostsUSD: number;
  totalModeledCostsTHB: number;

  // Income at expected hours
  grossIncomeUSD: number;
  grossIncomeTHB: number;
  estimatedDeductionsUSD: number;
  estimatedDeductionsTHB: number;
  estimatedNetIncomeUSD: number;
  estimatedNetIncomeTHB: number;

  // Return & Break-even
  netReturnUSD: number;
  netReturnTHB: number;
  breakEvenHoursPerWeek?: number;
  isBreakEvenPossibleWithExpectedHours: boolean;
  hoursShortfallOrSurplus: number; // positive = surplus, negative = deficit

  // Scenarios
  scenarios: {
    low?: ScenarioResult;
    expected?: ScenarioResult;
    high?: ScenarioResult;
  };
}

export type SortMetric = 
  | "break_even_asc"
  | "net_return_desc"
  | "wage_desc"
  | "upfront_cash_asc"
  | "second_job_desc";
