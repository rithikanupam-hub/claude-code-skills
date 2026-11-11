---
name: wave-planner
description: Turn any large goal into a simultaneous-implementation plan — sequential WAVES of parallel per-terminal workstreams with disjoint claims, gated by reports. Use when the user wants multiple agents/terminals implementing at once ("plan this in waves", "simultaneous implementation", "parallel terminals"), or wants references/competitors researched and turned into a phased parallel build plan. Produces a self-contained kickoff file per terminal per wave.
disable-model-invocation: true
---

# Wave Planner — simultaneous implementation plans

Method proven on a client /create harness build (see worked example:
`<path>`). Six stages; do them in order.

## Stage 1 — Research fan-out (parallel, read-only)

One study agent per external reference (repo teardown: runtime anatomy, extension model, UI,
safety posture, license — verify docs against source), plus one inventory of OUR current
state (what exists, test counts, contracts). Every study ends with per-pattern verdicts:
**ADOPT-PATTERN (what exactly) / REJECT (why) / IRRELEVANT** — never "fork wholesale":
their patterns, our spine. Product references get a feature teardown mapped to our
inventory: **HAVE / HAVE-VIA-COMPOSITION / GAP / SKIP (off-strategy)**. Reports go in one
`reports/` directory; they are the wave plan's evidence base.

## Stage 2 — Synthesis: the decision layer

The orchestrator (not an agent) writes the FIXED DECISIONS: architecture rulings (D1..Dn)
that implementers may not re-litigate, the reuse/adapt/build/exclude matrix, and the
target end-state in one paragraph a founder can repeat. Every adopted pattern cites its
study; every rejection records why (rejections prevent re-proposals later).

## Stage 3 — Wave decomposition

Slice the work into WAVES (sequential) of WORKSTREAMS (parallel). Rules that make
simultaneity safe:
- **Disjoint claims**: each workstream owns exact paths/directories exclusively; overlap =
  same workstream or different wave. A claims table lives in the wave file.
- **Contracts freeze first**: any shared schema/contract lands in wave 1 (or a wave-0
  contracts stream) before parallel consumers build on it. One side is canonical; mirrors
  carry KEEP-IN-SYNC pointers and parity tests.
- **Serialized surfaces**: config files, migrations, locale files, shared entry points get a
  single owner per wave, named in the file.
- **Dependencies point backward only**: a workstream may depend on prior waves, never on a
  sibling in its own wave. If two streams need each other, merge them or split the wave.
- **Verification is a station, not a hope**: every wave includes (a) RED-first tests per
  item, (b) an independent adversarial VERIFIER for money/auth/consent/data surfaces, and
  (c) an E2E gate — run the real thing (localhost/browser/live), never suites alone
  (suites are structurally blind to cross-boundary bugs; proven repeatedly).

## Stage 4 — File the plan (the deliverable)

Directory `<goal>-waves/`:
- `00_PROTOCOL.md` — inherited rules (git hygiene, budgets, stop conditions, report
  template, the E2E-before-exposure law, the pinned-literal test anti-pattern warning).
- `WAVE1/TERMINAL_A_<role>.md`, `TERMINAL_B_<role>.md`, … — one SELF-CONTAINED kickoff per
  terminal: context paragraph, fixed decisions it inherits, its exact claims, ordered work
  items each with a named RED test, hard rules (never push without authorization, no
  secrets, spend caps), and the report format. A person opens N terminals, pastes one file
  into each, and the wave runs.
- `WAVE2/…`, `WAVE3/…` — same shape; each wave file opens by REQUIRING the previous wave's
  report: `reports/WAVE<k>_REPORT.md` with a PASS exit gate (missing/failed = STOP).

## Stage 5 — Run and orchestrate

The orchestrator never implements: it audits bases, resolves cross-stream questions as
rulings (recorded in the wave files), integrates serially (one merge at a time, full suite
between), relays contract changes to affected streams mid-wave, and writes the wave report.
Findings from ANY stream that affect the shared contract become explicit addenda in the
wave file, never silent divergence.

## Stage 6 — Gate and roll

A wave exits only when: all streams report green, verifier verdicts are clean or
explicitly risk-accepted by the user, the E2E gate passed with evidence, and the report is
written. Then the next wave's terminals launch. Mid-course discoveries that belong to a
LATER wave get filed there, not absorbed early; anything user-decision-shaped (spend,
exposure, taste) is listed in the report's "decisions for the user" section — the plan
never assumes consent.

## Budgets & honesty defaults (inherit unless overridden)

Provider/API spend: capped per wave, every paid action individually pre-authorized with the
price shown first; chat text never approves. CI: local verify before push, one push per
green item. Reports state what was NOT done as prominently as what was. Untested claims are
labeled untested. A blocked permission = stop and surface, never route around.
