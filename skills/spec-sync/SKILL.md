---
name: spec-sync
description: Keep a product's PRD, architecture brief, implementation plan, decisions log, capability register and evidence log in sync with the code, before and after every functionality change. Use when the user asks to add, change or remove a feature of Mission Control (or any project with docs/product/), says "update the PRD", "add this to the plan", "change the architecture", "what's the status", or before launching implementation agents, and at the end of any implementation task. Also use when a stream agent reports done.
---

# spec-sync

The PRD, architecture brief and implementation plan are living documents. Code changes without a matching doc change are not finished; doc changes without a decision line are not traceable. This skill is the one place that rule is enforced.

## Where the documents live

For Mission Control: `seo-mission-control/docs/product/`
- `PRD.md` · requirements with IDs (`W1-R3`), priority, acceptance check, status
- `ARCHITECTURE.md` · components, data flow, source map, a **Learn** box per section
- `IMPLEMENTATION_PLAN.md` · streams, owners, order, shared-file rules, release gate
- `DECISIONS.md` · `D-NNN` lines, newest first, plus open questions
- `CAPABILITIES.md` · operation ↔ UI ↔ service ↔ Hermes tool ↔ permission ↔ cost ↔ confirm ↔ test
- `EVIDENCE.md` · append-only verification records per stream

Other projects: the same six files under `docs/product/`; create them from these if missing.

## Mode 1 — before a change ("add X", "change Y")

1. Read `PRD.md` §5–6 and `DECISIONS.md`. Find the rows the request touches. If none, it is a new requirement.
2. Write or edit the requirement row(s): ID, priority, **acceptance check a tester can run**, status `—`.
3. If the request changes a component, data flow or a boundary (tenancy, permissions, jobs, external provider), edit the matching `ARCHITECTURE.md` section and its **Learn** box. Update the source map if files move.
4. Add the work to `IMPLEMENTATION_PLAN.md`: which stream owns it, order, files owned, risks. Respect the shared-file rules (migration numbers, tool index, actions file).
5. Add a `CAPABILITIES.md` row for every new user-facing operation (UI and Hermes twin both named, or an explicit "UI only" reason).
6. Append a `D-NNN` line to `DECISIONS.md` with the why and who. If something is undecided, add it to the open questions with a default.
7. Bump the version line at the top of each edited document (`Version X.Y · date`).
8. Show the user the diff summary (rows added/changed) before any code is written. If the user is launching agents, the agent prompt must quote the row IDs it owns.

## Mode 2 — after a change (implementation done, or an agent reports done)

1. Compare what was built with the owned rows. For each row set status: `T` (automated tests pass), `S` (verified on staging with real inputs and inspected outputs), `NEEDS_FIX`, or `RETEST` (changed after verification). Never `S` from a build alone.
2. Append to `EVIDENCE.md`: date, branch + commit, command, passed/failed/skipped, what was checked by hand, evidence paths, limitations, next action.
3. If the implementation diverged from the architecture (different table, provider, flow), fix `ARCHITECTURE.md` to match reality and add a `D-NNN` line explaining why.
4. Complete the `CAPABILITIES.md` row (test column at minimum).
5. Refuse "done" if: a Must row has no acceptance check; a new table or tool has no same-tenant isolation test; a capability row is missing; the evidence block is missing.
6. Report in one short block: rows and statuses, tests, evidence, remaining work.

## Mode 3 — status ("where are we")

Read the status columns in `PRD.md` and the last block per stream in `EVIDENCE.md`. Answer with a table: stream, Must rows done / total, last verified date, blockers. No prose summary of the docs.

## Rules

- One fact, one place: requirements in PRD, design in ARCHITECTURE, sequencing in PLAN, choices in DECISIONS. Link, don't copy.
- Acceptance checks are observable: a tester clicks or runs something and sees a stated result.
- Keep the Learn boxes: the founder is learning system design from these docs. New concept → one paragraph + one check.
- Dates absolute (2026-10-07), never "today".
- Do not rewrite documents wholesale; edit rows and sections so the diff is reviewable.
- When a stream agent is launched, hand it this skill name and the row IDs; its final report must include the Mode 2 block.

## Lessons learned
- 2026-10-07: created for Mission Control 1.0 from the four-stream plan. The repo had 46 uncommitted paths and one initial commit; a git baseline is a prerequisite the skill now checks for in Mode 1 step 4 (plan P1).
