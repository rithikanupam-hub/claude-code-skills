---
name: implementation-loop
description: The founder's standard way to start and run any implementation, in every project. Turns a feature plan into an agentic delivery plan (components, blockers, contract-first lanes, loops with builder/reviewer swap, live verification by the non-builder, release), then routes the building to Sonnet sub-agents when the spec is implementation-grade, with Opus planning, reviewing and integrating. Use when the user says "start the implementation", "implement this plan", "make an agentic plan", "loop engineering", "plan the build", "give this to sonnet", or approves a design/UI plan and wants it built.
---

# Implementation loop

How every implementation starts and runs (founder, 2026-10-20: "when we start an implementation we do it this way", across all projects). First worked example: `scrapbook-web/docs/plans/2026-10-20-director-ui-agentic-plan.md`. Template: [plan-template.md](plan-template.md). Sonnet hand-off prompt: [sonnet-brief.md](sonnet-brief.md).

Opus (the strongest model) plans, writes specs, reviews and integrates. Sonnet builds, but only from a spec that passes the detail bar in step 5. A spec that fails the bar is finished by Opus first; Sonnet never makes design decisions.

## Steps

1. **Read the project's rules first.** `CLAUDE.md`/`AGENTS.md`, the coordination board if any (e.g. `docs/plans/COORDINATION.md`), the release queue (e.g. `docs/releases/RELEASE_QUEUE.md`, newest History first), memory, and the feature plan. Use graphify when `graphify-out/` exists. Follow the project's release lifecycle; this skill never grants release or AWS/production authority.
2. **Explain before building.** Write the agentic plan (step 3–4) and get the founder's go-ahead. No code before that.
3. **Find the real components.** List everything the feature needs to reach "verified on staging", not just the visible part. Check each dependency's actual status in the queue and code. Usually the feature is 2–4 components (e.g. UI + backend contract + upstream capabilities). Each gets an ID and a one-line "working means".
4. **Write the agentic plan** from [plan-template.md](plan-template.md), saved next to the feature plan as `<date>-<feature>-agentic-plan.md`:
   1. Goal and finish line (a verified state, never "it builds").
   2. The loop every task runs (step 6 below).
   3. Contract first: a shared schema + 2–3 fixture projects both lanes test against; contract tests on both sides. Name what the prototype simulates that app code must not.
   4. Blockers to clear before loop 0, each with who and how.
   5. Loops D0…Dn: tasks with builder and reviewer, parallel lanes, and "owner sees" per loop. D0 = registration + contract + the riskiest unknown read from code. Last two loops = integration/live verification, then release + guide video.
   6. Acceptance criteria mapped to test IDs: where automated, who checks live.
   7. File ownership per lane.
   8. Cost and safety limits.
   9. Owner decisions, each with a recommendation. Only ones that block.
5. **Apply the Sonnet detail bar** to each task. A task goes to Sonnet only when its spec has all of:
   - files it owns, and files it must not touch;
   - contracts with real signatures, checked against current code (path:line);
   - numbered steps, with code where a choice could go two ways;
   - tests first: names, assertions, the fixture used;
   - exact gate commands, and done-when;
   - out of scope, and known traps.
   Missing anything → Opus writes it (for multi-terminal waves use the `waves` loop-spec format), or Opus builds that task itself. Design work, contract changes, hard generators/evals and integration stay with Opus.
6. **Run the loop per task:** register → plan → build (own worktree, `isolation: "worktree"` or `git worktree add ../<repo>-<agent>-<topic> -b agent-<x>/<topic> staging`) → self-gate (full check script on the exact commit) → handoff (branch, SHA, how to run, what is not claimed) → review by a different agent: rerun gate, read whole diff, try it, findings with severity → fix (max 3 rounds, then owner) → reviewer merges and reruns the gate on the merged SHA → live check by the non-builder with real inputs and inspected outputs → record evidence in the release queue. Failure = NEEDS_FIX; a relevant change after a pass = RETEST_REQUIRED.
7. **Delegate to Sonnet** with the Agent tool: `model: "sonnet"`, `isolation: "worktree"`, prompt from [sonnet-brief.md](sonnet-brief.md) with the spec pasted in full. Run independent lanes in one message so they run in parallel. Sonnet stopping on a contradiction is the system working: Opus fixes the spec and reruns; never loosen the spec.
8. **Opus reviews every Sonnet result** as the reviewer in step 6: reruns the gate itself, reads the diff against the owned-files list, greps for simulated/fixture-only behaviour leaking into app code, then merges or sends findings back to the same agent (SendMessage).
9. **Report to the founder** per loop: component IDs, work/release/video status, tests passed/failed/skipped, what the owner can see, remaining work and decisions.

## Rules that always hold

- Nobody verifies their own work on a live environment.
- Shared files (coordination board, release queue, logs) are append-only in your own rows/sections.
- No secrets, invite codes or cookies in files, logs, screenshots or chat.
- Starting servers or spending money needs the owner's current go-ahead; stop servers after.
- A build, a fixture demo or a sub-agent's "done" is never readiness.

## Lessons learned
- 2026-10-20: created from the DIRECTOR-UI plan. The founder wants this as the default start for every implementation, and wants implementation-grade plans built by Sonnet to save cost (permanent rule).
- 2026-10-20: in D0, check the feature plan's "maps to code" section against where the data and execution actually live before writing contracts (DIRECTOR: the UI plan targeted server jobs that were off; understanding lived in the browser) (specific to that task).
- 2026-10-20: Sonnet sub-agents had no browser. The reviewer runs the render check (headless Playwright, `channel: "chrome"`, desktop + 390 px: console errors, horizontal scroll, the flow) and keeps the script in the scratchpad (specific to that task).
- 2026-10-20: in fixture mode, run sample data through the same logic live mode uses (DIRECTOR R1: the stored extract ignored the chips) (specific to that task).
- 2026-10-20: measure layout claims in the browser (sticky, overflow, reachability); green unit tests missed a sticky bar 1,400 px off-screen. Source checks only guard against regressions (rule).
