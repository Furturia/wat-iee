# Design Guidelines — WAT Worth It?

## Design goal

Make a consequential financial comparison feel calm, understandable, and trustworthy. The interface should help users see trade-offs quickly without hiding uncertainty behind a score or decorative visualization.

## Principles

### 1. Clarity over decoration
- Prioritize cost, break-even hours, and net return.
- Use plain Thai labels and explain financial terms in context.
- Avoid decorative gradients, excessive glassmorphism, or distracting animations.

### 2. Numbers before chrome
- Show the most decision-relevant numbers first.
- Use consistent number formatting, currency symbols, and units.
- Every monetary amount must clearly say USD or THB.
- Never display a number without enough context to interpret it.

### 3. Progressive disclosure
- Start with the essential inputs.
- Put advanced assumptions (tax estimate, exchange-rate date, scenarios, refundable deposits) in clearly labeled expandable sections.
- Do not hide important risks or costs behind a collapsed section by default.

### 4. Trust through transparency
- Distinguish verified, user-entered, estimated, and unknown values.
- Explain how each important result was calculated.
- Display assumptions near the result, not only in a separate settings page.
- Do not use green success styling to imply guaranteed profit.

### 5. Consistency reduces cognitive load
- Use the same cost categories and units across job offers.
- Comparison columns must use the same definitions.
- Keep the edit form and comparison view aligned in terminology.

## Layout

### Dashboard
- Header with product name and concise explanation.
- Availability filter with “ซ่อนงานที่เต็มแล้ว” enabled by default; users can turn it off to view full jobs.
- Distinguish `เปิดรับ`, `ใกล้เต็ม/จำกัด`, `เต็มแล้ว`, `ปิดรับ`, and `ยังไม่ทราบ` with text labels; never use color alone.
- Filtering must not delete or archive a job.
- Main action: "เพิ่มงานที่ต้องการเปรียบเทียบ".
- Summary strip: number of jobs, lowest modeled upfront cash, best expected net return (only if comparable data exists).
- Comparison table or cards.
- Missing-data warnings visible without opening each job.
- Sample data banner when demo data is loaded.

### Job form
Group fields into:
1. Employer, job title, location, and availability status
2. Employment dates
3. Pay and work hours
4. One-time costs (including program fee, visa, SEVIS, airfare, and other fees)
5. Weekly living costs
6. Deposits and cash buffer
7. Currency and tax assumptions
8. Data source, verification, and last-checked date

Keep program fee/promotion rules in `config/iee-fees-promotions.json`. Do not ask users to edit fee constants inside code components.

Use sensible defaults only for UI behavior, never for unknown financial facts. Blank unknown amounts should remain unknown, not silently become zero. If a cost truly does not apply, let the user explicitly select "ไม่มีค่าใช้จ่าย".

### Results
Display:
- Total modeled costs
- Upfront cash requirement
- Gross income
- Estimated deductions
- Estimated net return
- Break-even hours/week
- Low / expected / high scenarios
- Assumptions and missing data

### Comparison
- Let users compare at least 2 offers.
- Make the most important rows sticky or visually easy to scan.
- Support sorting by an explicit metric.
- Avoid declaring a single "winner" when data completeness differs significantly.

## Accessibility and responsive behavior
- Maintain strong text/background contrast.
- Do not use color as the only indicator of risk or status.
- Inputs need visible labels and keyboard focus states.
- Tables should remain usable on smaller screens; horizontal scrolling is acceptable if clearly indicated.
- Provide helpful validation errors next to the relevant field.
- Use semantic headings and accessible form controls.

## Visual direction
A clean, modern utility dashboard. Neutral background, readable typography, restrained blue accent, clear borders, generous spacing, and limited shadows. Avoid a casino/trading-terminal aesthetic: this is a planning tool for students, not a speculative investment product.

## UX anti-patterns to avoid
- Fake live data or fake safety scores
- An opaque "AI recommendation"
- Confetti or celebratory UI when the modeled result is positive
- Hiding fees or assumptions
- Showing a precise result when critical data is missing
- Treating a refundable deposit as both a final expense and a separate cash requirement

## Availability status language
- `open`: เปิดรับ (only when supported by a recent source)
- `limited`: จำนวนจำกัด/ใกล้เต็ม (only when stated by source)
- `full`: เต็มแล้ว
- `closed`: ปิดรับ/ไม่รับสมัครแล้ว
- `unknown`: ยังไม่ทราบ

If status is `unknown`, make the uncertainty visible and do not classify it as open or full.
