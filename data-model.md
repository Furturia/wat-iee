# Suggested Data Model

Use TypeScript interfaces. Keep the MVP local-first. Persist a versioned JSON structure in localStorage and support export/import so users can back up their data.

```ts
type VerificationStatus = "verified" | "user_entered" | "estimated" | "unknown";
type AvailabilityStatus = "open" | "limited" | "full" | "closed" | "unknown";
type JobGroupType = "ultimate" | "non_ultimate" | "unknown";

interface DataSource {
  sourceName?: string;
  sourceUrl?: string;
  documentName?: string;
  pageOrSection?: string;
  checkedAt?: string; // ISO date
  status: VerificationStatus;
  notes?: string;
}

interface MoneyInput {
  amount?: number; // undefined means unknown; zero means explicitly zero
  currency: "USD" | "THB";
  label: string;
  paidUpfront: boolean;
  includedInProgramFee?: boolean;
  refundable?: boolean;
  source?: DataSource;
}

interface WeeklyCostInput {
  amount?: number;
  currency: "USD" | "THB";
  label: string;
  source?: DataSource;
}

interface JobOffer {
  id: string;
  employerName: string;
  jobTitle: string;
  jobGroupType: JobGroupType;
  availabilityStatus: AvailabilityStatus;
  availabilityCheckedAt?: string; // YYYY-MM-DD
  availabilitySource?: DataSource;
  city: string;
  state: string;
  workplaceAddress?: string;
  hourlyWageUSD?: number;
  employmentStartDate?: string; // YYYY-MM-DD
  employmentEndDate?: string; // YYYY-MM-DD
  expectedHoursPerWeek?: number;
  minimumHoursPerWeek?: number;
  maximumHoursPerWeek?: number;
  lowHoursPerWeek?: number;
  highHoursPerWeek?: number;
  oneTimeCosts: MoneyInput[];
  weeklyCosts: WeeklyCostInput[];
  refundableDepositsUSD?: number;
  emergencyReserveUSD?: number;
  estimatedDeductionRate?: number; // decimal: 0.10 = 10%
  notes?: string;
  source?: DataSource;
  createdAt: string;
  updatedAt: string;
}

interface AppSettings {
  hideFullJobsByDefault: boolean;
  currencyDisplay: "USD" | "THB" | "both";
  exchangeRateTHBPerUSD?: number;
  exchangeRateDate?: string;
  locale: "th-TH" | "en-US";
}

interface AppDataV1 {
  schemaVersion: 1;
  settings: AppSettings;
  jobs: JobOffer[];
}
```

## Configurable fee and promotion rules

Store changeable program fee and promotion facts in `config/iee-fees-promotions.json`. Do not hard-code these values into React components or mix them into individual job records unless a job has a documented exception. A job record can reference the applicable group/category and config version.

For editable promotion logic, model at least: campaign start/end dates, group category, fees by currency, included/excluded promotion types, allowed discount types, stacking rules, eligibility conditions, and data source/last-reviewed date. Unknown amounts must be `null`/omitted rather than `0`.

## Implementation notes

- Validate data at boundaries (form submit and JSON import).
- Never convert missing numeric values to zero.
- Use stable IDs; do not use array index as a record ID.
- Handle malformed imported JSON gracefully.
- Add a schema version so future migrations are possible.
- Keep calculation functions separate from components.
- For localStorage, handle unavailable storage and parsing failures.
- Do not store sensitive passport, visa document, or payment card details.
- `minimumHoursPerWeek` must not automatically be called "guaranteed" unless the source explicitly says so. Consider a separate `hoursStatus` field in the implementation.
- `MoneyInput` may need `category` and `includedInProgramFee` logic to avoid double counting. Keep cost-category IDs stable for comparison.
