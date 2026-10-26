# WAT Worth It? — Product Source of Truth

## 1. Product summary

WAT Worth It? is a decision-support web app for Thai students comparing Work and Travel USA job offers. It estimates the total cash required, likely income, break-even work hours, and net money remaining after modeled costs. It compares multiple job offers side by side.

The product is not an official IEE product and must not imply affiliation or endorsement.

## 2. Primary user

A Thai student considering Work and Travel and comparing several employer/job profiles before committing money.

Initial use case: choosing among Summer 2027 jobs. Dates, budgets, exchange rates, and job details must be editable rather than hard-coded.

## 3. User problem

Job information is scattered across employer profiles and program documents. A higher hourly wage can look attractive while housing, food, transportation, uncertain work hours, and upfront fees make the overall financial outcome worse.

The user needs to answer:
- How much money do I need before departure?
- What is the full estimated cost?
- How many paid hours per week would I need to break even?
- What happens if I get fewer or more hours than expected?
- Which offer has the best estimated net return for my constraints?
- What important information is missing or uncertain?

## 4. Product promise

Help users compare offers on a consistent basis and understand the assumptions and risks behind every estimate.

Do not promise a job will be profitable, safe, or available. Do not present estimates as guarantees.

## 5. MVP scope

### Must have
1. Dashboard with multiple job cards or comparison table.
2. Create, edit, duplicate, and delete a job offer.
3. Editable employment start and end dates.
4. Hourly wage, expected hours/week, and optional minimum/guaranteed hours/week.
5. Editable one-time costs: program fee, visa-related fees, flights, insurance not already included, and other costs.
6. Editable recurring costs: housing, food, transportation, phone, and other weekly expenses.
7. Cost breakdown with explicit categories and no silent double counting.
8. Break-even hours/week estimate.
9. Low / expected / high scenarios.
10. Currency conversion with a user-editable USD-to-THB rate and rate date.
11. Availability status for each job and a “hide full jobs” filter enabled by default.
12. Fee and promotion rules loaded from `config/iee-fees-promotions.json`.
13. Clear unknown/unverified states for missing values.
14. Save data locally and export/import JSON.
15. Responsive desktop and mobile layout.
16. Demo data visibly labeled as fictional.

### Not in MVP
- Automatic background syncing from IEE
- Login, accounts, or cloud sync
- AI-generated recommendations
- Claims of real-time job availability
- A definitive city safety score
- Tax/legal advice
- Automatic prediction of probability of profit
- Booking, payment, or application submission

## 6. Availability filtering

Each job has an availability status: `open`, `limited`, `full`, `closed`, or `unknown`. Default to hiding jobs whose status is explicitly `full`; provide a visible toggle/filter so the user can include them. Filtering must not delete jobs or remove their saved details. `unknown` must not be treated as full. Availability should include the source and date last checked when available. Do not infer that a job is open simply because it appears in a PDF.

## 7. Fee and promotion configuration

Keep changeable program fees, promotion dates, eligibility rules, and discount stacking rules in `config/iee-fees-promotions.json`. UI components should read from this configuration instead of embedding numeric fee values. When fees/rules change, update the config and display the rule source and last-reviewed date.

Use the user's supplied IEE information as the initial configuration, not as independently verified current information. The listed promotion window is October 16–31, 2026 inclusive. The current Ultimate fee values and restrictions are recorded in the config file. The airfare amount is unknown and must be entered by the user; do not assume zero. Other groups' full fee schedules and specific discount amounts are not provided and must remain unknown until entered.

For the Ultimate group, distinguish regular/time-limited promotion eligibility from the stated exceptions for group and pair discounts. Do not invent discount percentages, discount amounts, or additional stacking rules. If a rule is ambiguous, show it for manual confirmation rather than calculate an unsupported discount.

## 8. Data provenance and trust

Every imported or manually entered important value should be able to store:
- source name or URL/document filename
- source page/section when known
- date checked
- confidence/status: `verified`, `user_entered`, `estimated`, or `unknown`
- optional notes

Never fabricate job data, costs, dates, safety statistics, availability, or employer guarantees. If a value is missing, show that it is missing and let the user enter it.

Do not scrape or bypass access controls. Before implementing any automated IEE data retrieval, verify that the source permits it and whether an official API/export exists. The optional public IEE job browser reads only public listing/detail pages, respects the site's robots.txt, refreshes through a short-lived server cache, and adds a job to local comparison data only when the user selects it. It does not infer availability or missing financial values.

## 9. Financial model rules

- Distinguish upfront cash required from modeled economic cost.
- A refundable deposit is a cash requirement but is not automatically a final cost. Show it separately.
- Emergency reserve is money the user should have available, not automatically an expense.
- Do not double count costs already included in a program fee.
- Do not treat all days in the US as paid working days.
- Use actual employment dates for income calculations.
- Show gross income separately from estimated deductions and net income.
- Tax estimates must be editable assumptions and clearly labeled as rough estimates. Do not imply a flat rate is an accurate tax calculation for every person.
- Show calculations in USD and THB where relevant.
- Clearly display the exchange rate used and its last-updated date.
- If critical inputs are missing, show "Cannot estimate yet" rather than silently using zero.
- Round only for display; keep precision in calculations.
- Include a visible assumptions section beside results.

## 10. Comparison and ranking

Default comparison metrics:
- Estimated total program cost
- Estimated upfront cash needed
- Break-even hours/week
- Expected net return
- Low-case net return
- Expected work hours versus break-even hours
- Housing cost/week
- Data completeness and verification status
- Known risks / missing information

Do not rank jobs only by hourly wage. If sorting is added, let the user choose the metric and label it.

Avoid one opaque composite score for "best job." If a summary label is used, explain the exact rule that produced it.

## 11. Key user flow

1. User opens dashboard.
2. User adds a job manually or loads clearly fictional sample data.
3. User enters employer, location, wage, employment dates, expected hours, and costs.
4. App validates missing or inconsistent inputs.
5. App calculates total costs, income scenarios, break-even hours, and net return.
6. User adds other jobs and compares them side by side.
7. User can export the comparison and assumptions.
8. User can hide/show filled jobs without deleting them.
9. User can inspect and edit the fee/promotion configuration separately from job records.

## 12. Product language

Use clear, plain language. Thai is the default interface language. Keep USD and THB labels explicit.

Suggested labels:
- "เงินลงทุนรวม"
- "เงินสดที่ควรเตรียมก่อนเดินทาง"
- "รายได้ก่อนหักภาษี"
- "รายได้หลังหักรายการประมาณการ"
- "เงินเหลือ/ขาดทุนโดยประมาณ"
- "ชั่วโมงทำงานเพื่อคืนทุน"
- "ชั่วโมงทำงานที่คาดการณ์"
- "ข้อมูลที่ยังไม่ยืนยัน"
- "สมมติฐานการคำนวณ"

Use "เงินเหลือสุทธิโดยประมาณ" rather than suggesting guaranteed profit.

## 13. Definition of done for MVP

A user can enter at least two offers, edit their dates and assumptions, and compare costs, expected income, break-even hours, and scenario outcomes without a backend. The calculations are tested, unknown data is not silently treated as verified, all demo data is clearly fictional, full jobs can be hidden/shown without being deleted, and fee/promotion values are managed in a separate configuration file.
