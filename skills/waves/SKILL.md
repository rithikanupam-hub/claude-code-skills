---
name: waves
description: >
  Turn a phased plan into simultaneous-implementation waves: one self-contained
  prompt per terminal, one git worktree per prompt, disjoint file ownership, an
  evidence ledger that cannot be overclaimed, implementation-grade loop specs so
  cheap/non-Claude models can implement safely, and a strong-model gate prompt
  between waves. Use when the user says "/waves", "run this in waves",
  "simultaneous implementation", "parallel terminals", or wants several agents
  of mixed models/vendors implementing a phased plan at once. Complementary to
  wave-planner (research→plan stages); waves is the execution machinery.
  Produces docs/<plan>/waves/, docs/<plan>/loops/, docs/<plan>/coverage/.
disable-model-invocation: true
---

# /waves — simultaneous implementation with enforcement

Proven on the Oltre "Italy Travel Assistant" build (reference output: `Integrated wa for Italy/docs/app/{waves,loops,coverage}/`): waves 1–3 ran 5 mixed-model terminals each, 1,124 backend + 40 Swift tests green, zero file collisions.

## The five artifacts (create all of them; each blocks a failure mode)

1. **Ledger** `coverage/jobs.yaml` + `job_coverage.py` — every deliverable is a row `{id, track: product|production, job, status: missing|partial|done, phase, evidence: [paths], gap?}`. A checker script fails (`--strict`) when a done/partial row's evidence files are missing from disk, prints per-track counts and `PRODUCTION READY: yes/no` (all production rows done). Wire it into CI and a test. *Blocks: claiming work that doesn't exist.*
2. **Phase files** — per phase: goal, measurable exit gate, agents with **Owns / Must-not-touch** file lists, loops, dependencies, risks. *Blocks: scope drift and file collisions.*
3. **Loop specs** `loops/p<N>-l<n>-*.md` — per loop, implementation-grade: Objective · Files you own · Files you read but never edit · Contracts (verified against real code, with signatures) · Numbered implementation steps **with actual code** · Tests-first list (names + assertions + one mutation check) · Patches to hand back (shared files are never edited directly) · Commands · Done-when · Out of scope · Traps. **No terminal opens without one.** *Blocks: weak models making architecture decisions.*
4. **Wave files** `waves/wave-N.md` — one `## Terminal X` section per parallel loop: a worktree bootstrap line (`git worktree add ../<plan>-wave<N>-<T> -b wave<N>/<slug> main` + venv/env link), then a self-contained prompt: the 12 rules below, `YOUR PHASE FILE`, `YOUR LOOP SPEC`, `YOU OWN`, `MUST NOT TOUCH`, `DONE WHEN`, "start with the tests named in the spec". *Blocks: prompt drift and setup mistakes.*
   For SwiftUI/XCUITest work the gate also runs the merged UI suite in local AND CI shape before mutations — see the `driveable-swiftui` skill (the Wave 4 lesson: five green terminals, 15/19 red merged).
5. **Gate** `waves/gate.md` — the strong-model prompt run once per wave: commit → review each diff against its Owns list → merge sequentially with the full suites after each merge → apply handed-back patches → mutation-test each merged linchpin → run UI suites → compare to exit gates → update ledger with evidence (`--strict` must pass) → write handover → **write the next wave's loop specs** → founder summary naming the next terminals. *Blocks: unreviewed merges and spec-less next waves.*

## The 12 rules (paste into every terminal prompt, verbatim, adapted paths)

1 minimum code that works; never cut validation/error handling/security/accessibility · 2 query the repo's knowledge tooling before grepping · 3 tests first, deterministic assertions · 4 failures degrade, never crash a turn/screen · 5 touch only owned files; needed changes elsewhere become patch files, never applied · 6 never push, never paid evals, never real providers in tests · 7 exact suite commands, must stay green · 8 report what actually happened with exact test output · 9 frozen contracts are law — flag, don't change · 10 **follow the loop spec literally; if missing or contradicting the code, STOP and report the contradiction** · 11 update only your own ledger rows in the same change, `--strict` must pass · 12 finish with files/tests/what-you-couldn't-do/patches, then stop — the gate merges.

## Packing algorithm

List loops with owned files and dependencies → two loops conflict if owned files intersect, both patch the same shared file, or one needs the other merged → pack greedily by dependency depth then by ledger rows closed, max ~5 terminals per wave → data-only (YAML) loops pack earliest (never conflict, unblock everything) → founder-only actions (accounts, hosts, licences, human sessions) are listed on the wave they block, not hidden.

## Model tiers (waves are vendor-agnostic — prompts must need only bash + files)

| Role | Tier |
|---|---|
| Gate + loop-spec writing | strongest available, always |
| Specced backend/UI loop | mid tier, any vendor |
| Data-only loop | cheap tier |
| Screenshot-judging audit | mid tier, vision-capable |

A cheap model stopping on rule 10 is the system working: rerun that one prompt on a stronger model; never loosen the spec.

## Run loop (what the human does)

Gate wave 0 (commit the plan so worktrees branch from real code) → open one terminal per prompt, paste → when all report, run the gate → repeat. Paste → wait → gate → paste.

## Output checklist
- [ ] ledger + checker + CI hook + test
- [ ] phase files with ownership tables
- [ ] loop specs for every wave-1 loop (later waves: gate step 9)
- [ ] wave-N.md files with bootstrap + 12 rules + owns/must-not/done
- [ ] gate.md
- [ ] README sequence table: wave · terminals · starts-when · gate-done-when · model tiers
