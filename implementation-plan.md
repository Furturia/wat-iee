# Implementation Plan

## Stage 0 — Inspect before coding
- Inspect the existing repository and its package manager.
- Keep the current stack if it is already established.
- Identify existing UI conventions and reusable components.
- Do not overwrite existing work before summarizing the plan.

## Stage 1 — Working UI shell
Build:
- responsive dashboard
- app header and brief product explanation
- comparison table with empty state
- availability status and a “hide full jobs” filter enabled by default
- add-job / edit-job flow
- fictional demo data toggle or seed action
- Thai-first interface

Acceptance criteria:
- user can add two jobs
- table displays the same metric definitions for both
- no fake IEE data or unsupported availability claims
- demo data is visibly marked as fictional

## Stage 1A — Configurable fee rules
- Read program fees and promotion rules from `config/iee-fees-promotions.json`.
- Show itemized fee breakdown by currency.
- Show promotion start/end dates and expiration status.
- Keep discount amounts unknown until supplied; do not invent amounts.
- Do not hard-code fee constants across components.

Acceptance criteria:
- Changing a fee in the config changes every relevant display/calculation.
- Ultimate eligibility for applicants who paid THB 7,900 is represented as a validation rule.
- Visa fee USD and THB fees remain separate until conversion.
- Airfare unknown prevents a claim that the trip's total cost is complete.

## Stage 2 — Calculation engine
Create pure functions for:
- duration
- modeled costs
- upfront cash required
- gross income
- estimated deductions
- estimated net income
- net return
- break-even hours
- low / expected / high scenarios

Acceptance criteria:
- functions have unit tests
- missing critical values produce incomplete results
- dates and rates are validated
- currency units cannot be mixed accidentally
- deposits and emergency reserve are not automatically counted as final costs
- formula assumptions are visible in the UI

## Stage 3 — Persistence
- save to localStorage
- support edit/delete/duplicate
- export JSON
- import JSON with validation and helpful errors

Acceptance criteria:
- refresh does not erase saved jobs
- malformed import does not corrupt existing data
- schema version is included

## Stage 4 — Trust and comparison quality
- show source/verification status
- identify missing or stale data
- sort by explicit metrics
- show assumptions and warnings per job
- make comparisons fair when some fields are unknown

## Stage 5 — Later features, only after user approval
- PDF text extraction and field suggestions
- manual review before saving extracted values
- official/authorized data integration if available
- sourced city/neighborhood safety information
- optional cloud database/auth only if multi-device or multi-user usage becomes necessary

## Do not do without approval
- add login/backend/database in MVP
- implement web scraping or bypass site access controls
- add paid AI APIs
- create an opaque overall job score
- claim jobs are available or that an offer is safe/profitable
- invent employer details
