# Calculation Specification

This file defines the intended behavior for calculations. Implement calculations as pure functions with unit tests, separate from UI components.

## 0. Availability filter

- Each job has `availabilityStatus`: `open`, `limited`, `full`, `closed`, or `unknown`.
- The default list view hides only jobs explicitly marked `full`.
- A user-facing toggle includes/excludes full jobs from the current view.
- Filtering is presentational only; it must not delete records or alter calculations for a saved job.
- `unknown` must remain visible unless the user deliberately filters it out. Never infer availability from a job profile's presence alone.

## 1. Inputs

### Required for a basic estimate
- hourly wage (USD/hour)
- employment start date
- employment end date
- expected paid hours per week
- one-time program and travel costs, entered explicitly
- recurring living costs, entered explicitly
- exchange rate (THB per USD) if showing THB

If any critical value is unknown, mark the result incomplete. Do not silently substitute zero for unknown.

### Optional
- minimum/guaranteed hours per week
- low / expected / high hours assumptions
- estimated payroll deduction rate
- overtime assumptions, disabled by default
- refundable housing deposit
- emergency reserve
- source and verification status for each field

## 1A. IEE fees and promotion rules

The changeable initial fee/promotion facts are kept in `config/iee-fees-promotions.json`. Read this configuration from one service/module and use the same result wherever fees are shown or calculated. Do not copy numeric amounts into multiple UI components.

Initial user-supplied information (not independently verified):
- Promotional window: October 16–31, 2026 inclusive.
- Ultimate application fee: THB 9,900.
- Ultimate program fee, part 1: THB 20,000.
- Ultimate program fee, part 2: THB 63,900.
- Ultimate group processing fee: THB 8,000.
- Visa fee: USD 185.
- SEVIS fee: THB 3,900.
- Airfare: unknown; user must supply a value before a complete trip budget can be reported.
- A THB 7,900 application payment makes the applicant ineligible to select Ultimate, according to the supplied rule.
- Ultimate is excluded from the general promotional discount, while group and pair discounts are stated exceptions. Do not invent discount amounts or assume other discounts stack.

For the listed Ultimate charges, the known fixed fees sum to THB 105,700 plus USD 185, excluding airfare, living costs, and any unknown amounts. Display currencies separately until a stated exchange rate is applied. This sum is a derived subtotal, not the complete trip cost.

Promotion validity: treat the provided date range as inclusive of both endpoints. After the end date, do not automatically keep the promotion active. The UI should mark it expired unless a new configuration is supplied.

Discount handling: apply a discount only when its amount/rate and eligibility are explicitly present in configuration. Store discount types as separate rules. The supplied wording permits group and pair discounts for Ultimate; preserve that exception but require explicit values before showing a discounted total. If the exact stacking calculation is unclear, flag it for confirmation.

## 2. Date duration

Use employment dates, not arrival/departure dates, for income.

Calculate:
- calendar days between start and end, with the chosen convention clearly documented
- approximate weeks = calendar days / 7
- for a simple MVP, use weeks = inclusive employment days / 7 if the UI says inclusive dates

Be consistent and test the boundary case where start date equals end date. Reject end dates earlier than start dates.

For weekly estimates, fractional weeks may be used, but disclose that the model assumes work and recurring expenses scale proportionally across the period. A later version can model calendar weeks and pay periods more accurately.

## 3. Costs

`oneTimeCosts` includes expenses such as:
- program fee
- visa-related fees
- round-trip flights
- insurance not already included
- other one-time fees

`weeklyCosts` includes:
- housing
- food
- transportation
- phone
- other recurring expenses

`refundableDeposits` are shown as upfront cash required, but excluded from final net-return cost unless the user marks a portion as non-refundable or lost.

`emergencyReserve` is a cash buffer, not a cost unless spent.

Do not count an item twice. Include an `includedInProgramFee` flag or equivalent for insurance/other bundled costs.

Formulas:
- `modeledCosts = sum(oneTimeCosts) + sum(weeklyCosts) * weeks`
- `upfrontCashRequired = upfrontOneTimeCosts + deposits + initial costs + chosen reserve`
- If a cost is unknown, total cost should be marked incomplete rather than assuming the unknown value is zero.

## 4. Income

Base case:
- `grossIncome = hourlyWage * paidHoursPerWeek * weeks`

For a scenario:
- `grossIncomeScenario = hourlyWage * scenarioHoursPerWeek * weeks`

Estimated deductions:
- `estimatedDeductions = grossIncome * assumedDeductionRate`
- `estimatedNetIncome = grossIncome - estimatedDeductions`

Important: this is a simplified planning estimate. A single flat deduction rate is not an authoritative US tax calculation. Keep the rate editable, label it as an assumption, and avoid legal/tax advice.

## 5. Net return

- `netReturn = estimatedNetIncome - modeledCosts`
- positive value means estimated money remaining after modeled costs
- negative value means estimated shortfall against modeled costs

Do not call this a guaranteed profit. Show the result as an estimate and list the assumptions.

## 6. Break-even hours

If costs are complete and the model has a positive net hourly income:
- `breakEvenHoursPerWeek = modeledCosts / (hourlyWage * (1 - deductionRate) * weeks)`

Equivalent interpretation: average paid hours per week required for estimated net income to equal modeled costs.

Do not calculate if:
- hourly wage is zero or negative
- duration is zero or negative
- deduction rate is outside 0..1
- critical cost values are unknown
- currency conversion or units are inconsistent

If the result exceeds the hours available or the employer's stated maximum, display a warning. Do not assume overtime is available.

## 7. Scenarios

Let the user specify low, expected, and high weekly hours. If no explicit values are supplied, the UI may offer editable scenario inputs but must not pretend these are sourced employer predictions.

For each scenario calculate:
- gross income
- estimated deductions
- estimated net income
- net return
- margin from break-even hours

Avoid assigning probabilities unless reliable evidence exists. "Low / expected / high" are scenario labels, not probability estimates.

## 8. Currency

- Store primary financial inputs in USD for the US job comparison.
- `exchangeRateTHBPerUSD` means THB per 1 USD.
- THB display = USD amount * exchange rate.
- Show the exchange rate and its effective date.
- Never mix USD and THB in one sum.
- Do not fetch an exchange rate silently in the MVP; use a user-editable value and clearly identify it as user-entered. Live exchange rates can be added later.

## 9. Formatting and precision

- Keep full numeric precision internally.
- Round currency to 2 decimal places in detail views; optionally show whole-dollar / whole-baht rounded summaries.
- Round break-even hours up to one decimal place for display.
- Distinguish "not available" from zero.
- Display negative values with a minus sign and a clear shortfall label.

## 10. Example test fixture (fictional)

Inputs:
- one-time costs: $4,500
- weekly housing + food + transport + other: $150
- employment duration: 12 weeks
- wage: $16/hour
- deduction assumption: 10%
- expected hours: 40/week

Costs = 4500 + (150 * 12) = $6,300
Gross income = 16 * 40 * 12 = $7,680
Estimated deductions = 768
Estimated net income = $6,912
Net return = 6912 - 6300 = $612
Break-even hours/week = 6300 / (16 * 0.9 * 12) = 36.46

All figures are fictional and are only for testing formula implementation.
