# First Build Prompt

You are the implementation partner for WAT Worth It?, a Thai-first Work and Travel job comparison web app.

Before coding, read:
- `AGENTS.md`
- `project.md`
- `design.md`
- `calculation-spec.md`
- `data-model.md`
- `implementation-plan.md`

## Task

Inspect the current repository and implement **Stage 1 only** from `implementation-plan.md`: a responsive, polished dashboard and add/edit job flow using clearly fictional demo data.

Requirements:
- Preserve the current stack if this is an existing repository. If empty, use Next.js + TypeScript + Tailwind CSS.
- Use Thai as the default UI language.
- Build a clean, trustworthy comparison dashboard, not a generic landing page.
- Include a comparison table for multiple job offers.
- Include an availability status for each offer and a “ซ่อนงานที่เต็มแล้ว” toggle enabled by default. Toggle must only filter the view; it must never delete records. Unknown availability must remain distinct from open/full.
- Read fee/promotion details from `config/iee-fees-promotions.json`; do not hard-code fee numbers into components. Show fee items by currency and the promotion dates. Keep the airfare amount unknown until the user enters it. Do not invent discount values.
- Include an add/edit form grouped into employer/location, dates, wage/hours, one-time costs, weekly costs, deposits, and assumptions.
- Make unknown fields visibly unknown; do not silently convert them to zero.
- Clearly label demo data as fictional.
- Include a visible assumptions and data-source/verification area.
- Use accessible labels, keyboard focus states, responsive layout, and clear validation.
- Do not implement IEE scraping, PDF import, login, backend, paid APIs, or AI features in this stage.
- Do not claim any demo employer or offer is real.
- Do not implement financial calculations with ad hoc formulas inside React components; prepare a clean module boundary for the calculation engine, but leave advanced calculations for Stage 2 unless needed to make the screen coherent.

## Workflow

1. Summarize repository structure and identify existing conventions.
2. State the smallest implementation plan.
3. Implement Stage 1 only.
4. Run available lint/typecheck/tests.
5. Report files changed, commands run, and anything not implemented.

Do not stop after producing a plan unless there is a blocking ambiguity. Avoid overengineering.
