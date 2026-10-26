# Instructions for AI Coding Agents

Read `project.md`, `design.md`, `calculation-spec.md`, `data-model.md`, and `implementation-plan.md` before making substantial changes.

## Rules
1. Treat `project.md` as product source of truth.
2. Treat `design.md` as UI/UX guidance, not as permission to invent features.
3. Implement the smallest useful step. Do not build every future feature at once.
4. Inspect the existing repo before editing files; preserve working code and current stack.
5. Use TypeScript types and validate external/user input.
6. Keep calculations in pure, testable functions separate from UI.
7. Never silently treat missing financial data as zero.
8. Never fabricate job listings, IEE data, housing costs, safety data, availability, fee values, discount amounts, or employer guarantees.
9. Keep mutable fee and promotion values in `config/iee-fees-promotions.json`; do not hard-code them across components.
10. Hide jobs explicitly marked `full` by default, but never delete them. Provide a user-visible filter to show them. Treat `unknown` availability as unknown, not open or full.
11. Clearly label fictional seed/demo data.
12. Show assumptions and explain results in plain Thai.
13. Never imply financial return, work hours, job availability, or safety are guaranteed.
14. Avoid unnecessary dependencies and paid APIs.
15. Do not add AI features unless explicitly requested.
16. After each stage, report files changed, decisions made, tests run, and remaining limitations.

## Workflow
- First summarize the repository and propose a small implementation plan.
- Then implement Stage 1 only unless the user asks for more.
- Run lint/typecheck/tests where available.
- If a requirement is ambiguous and materially affects money calculations, ask before making a risky assumption.
