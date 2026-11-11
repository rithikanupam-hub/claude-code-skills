# <Feature>: agentic delivery plan

Date: <YYYY-MM-DD>. Status: proposal, not started. Needs the owner's go-ahead (section 9).

Implements: `<feature plan path>`. Process: `<coordination board path>`. Status of record: `<release queue path>`.

## 1. Goal and finish line

<The verified state that ends this plan, e.g. COMPONENT at STAGING_VERIFIED meeting every acceptance criterion, then release.>

| Component | What "working" means | Registered? | Status today |
|---|---|---|---|

## 2. The loop every task runs

register → plan → build → self-gate → handoff → review (max 3 rounds) → merge → live check by non-builder → record. NEEDS_FIX / RETEST_REQUIRED loop back to build.

## 3. Contract first

- `contracts/<feature>/<name>.v1.json`: <frames/endpoints covered>
- Fixtures: <2–3 named projects, incl. an empty/zero case and a locked/failure case>
- Contract tests on both sides. Simulated in the prototype, forbidden in app code: <list>

## 4. Blockers before D0

| # | Blocker | Who | How it clears |
|---|---|---|---|

## 5. Loops

### D0. Contracts and registration
| Task | Builder | Model | Reviewer |
|---|---|---|---|
Owner sees: <...>

### D1 … Dn-2. <Lanes in parallel>
| Lane | Task | Builder | Model (Sonnet only if spec passes the detail bar) | Reviewer |
|---|---|---|---|---|
Owner sees: <...>

### Dn-1. Integration and live verification
<flag switch, deploy, automated journey run by the non-builder, owner walkthrough, evidence path>

### Dn. Release and guide video

## 6. Acceptance tests

| ID | Criterion | Automated where | Live check by |
|---|---|---|---|

## 7. File ownership

| Area | Owner |
|---|---|

## 8. Cost and safety limits

## 9. Decisions needed from the owner

| # | Decision | Recommendation |
|---|---|---|
