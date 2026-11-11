---
name: driveable-swiftui
description: >
  Make SwiftUI screens that an XCUITest suite and VoiceOver can actually drive,
  and keep parallel UI work integrable. Use when writing or reviewing any SwiftUI
  view that a UI test or a11y audit must reach, when writing XCUITests against
  screens being built in another terminal/worktree, when a UI suite is green in
  isolation but red on the merged app, and at every waves gate before merging UI
  work. Encodes the eleven integration defects found at the Reel Maker Wave 4
  gate (15/19 XCUITests red on merge) as rules, a source-scan lint, harness
  invariants, and a gate step. Complements `waves` (execution machinery).
disable-model-invocation: true
---

# /driveable-swiftui — screens a test can drive, merges that stay green

Origin: Reel Maker by celestiee, Wave 4 gate, 2026-09-06. Five terminals built
style doors, taste dial, director's note, chat intents and the XCUITest suite
in parallel worktrees. Each was green alone; the merged app failed 15 of 19
UI tests. Every cause was mechanical. This skill makes them impossible to
repeat rather than relying on a reviewer to remember them.

## 1. The traps (each one cost a merge)

| # | Trap | Rule |
|---|---|---|
| 1 | A container's `.accessibilityIdentifier` silently **overwrites every child's** identifier. XCUITest and VoiceOver then see one opaque element. | Any container that carries an identifier also carries `.accessibilityElement(children: .contain)` in the same modifier chain. Leaves (Button, Toggle, TextField) never need it. |
| 2 | `LazyVGrid` / `LazyVStack` inside a `ScrollView` lays out **only the visible row**; off-screen cells and the newest chat card never exist to the test. | Eager `VStack`/`Grid` for content a test or reader must reach. A lazy container needs a written waiver. Newest-last lists scroll to newest on append. |
| 3 | A fixed `.frame(height:)` smaller than the content: SwiftUI centres the overflow and **does not clip hit-testing**, so the invisible overflow swallows taps on neighbours. | Size to content or make it scroll. Never a fixed height below the content's natural height. |
| 4 | `accessibilityIncrement()` / `accessibilityDecrement()` on an `XCUIElement` are **no-ops**; a segmented `Picker` does not report which segment is selected. | Any control a test must step is a group of Buttons, the current one with `.isSelected`. Keep the adjustable trait for VoiceOver if you like, but the buttons are the contract. |
| 5 | `ColorPicker` opens a system sheet **nothing can type into**; a `Form` `Picker(.menu)` swallows the next tap. | Typed fields (`#RRGGBB` + swatch), steppers, or segmented buttons for anything the suite sets. |
| 6 | A selectable card that **advances on tap** cannot be asserted as selected. | Tap selects (state + `.isSelected`), a separate Continue advances. |
| 7 | A modal action whose dismiss path is a no-op in the dev shell ("Never mind" did nothing). | Every sheet has an explicit dismiss handler wired in every host, including fixture/dev hosts. |
| 8 | Long async work (render, save, upload) with **no in-flight row**: the test cannot tell "working" from "hung". | One identified in-flight element (`export.rendering`) that exists from start to completion, plus timing logs. |
| 9 | The simulator renders Core Image in software (~9 min per reel vs 5 s on device). Full-size exports time out the suite and are not a product number. | A render-scale/quality knob (`-exportQuality preview`) the harness passes; device numbers are measured on a device, never inferred from the simulator. |
| 10 | The app **prefers whatever local fixture the machine has** (real clips in `DevFixtures/`), so the suite drove a different plan than it asserted on. CI never had the clips and would have been green for the wrong reason. | The harness pins the fixture explicitly (`-fixture sample`) and the app honours the pin over any local preference. Run the suite once in CI shape (no local fixtures) before calling it green. |
| 11 | Hand-authored probe/reply fixtures **drifted from the generator** (summaries, ids, ranges). | Fixtures a generator can produce are installed from the generator, byte-identical; tests pin the generator's output, not a human's guess. |

Also on record: assertions that could never hold on a real screen (counting
"Clip N" blocks when the timeline culls by design; an exact duration after an
earlier edit already changed it). Assert on the plan dump or the model, with
tolerances the PRD states, not on culled pixels.

## 2. The executable contract (both sides consume one file)

The identifier table lived in markdown; the views and the tests each read it
by eye and diverged. Replace it with a JSON file both sides load:

```
contracts/ui/accessibility-identifiers.v1.json
{ "version": "1",
  "static":  [{ "id": "session.picker", "screen": "C1", "element": "screen root", "container": true }, …],
  "dynamic": [{ "pattern": "style.look.<caption>.<picture>", "regex": "^style\\.look\\.[a-z]+\\.[a-z-]+$", "screen": "C2" }, …] }
```

- Additive only. A new screen adds rows in the same change as its views.
- The unit-level lint (below) proves every literal in source is in the file and
  every static id in the file is in source. No simulator needed.
- The XCUITest audit (`testEveryContractIdentifierExistsOnItsScreen`) proves
  each id exists on its screen with a non-empty label. That is the runtime half.

## 3. The lint (runs in `swift test`, seconds, no simulator)

A textual source scan in the app's unit test target, same convention as the
repo's other lint tests (Foundation-only walker file + Testing-only test file).
In Reel Maker: `ios/App/Tests/AppCoreTests/DriveabilityLintTests.swift`, run
with `cd ios/App && swift test --filter DriveabilityLintTests` (see the
Makefile's `SWIFT_TEST_FLAGS` on a CLT-only machine). Checks:

- a. every container identifier chain includes `.accessibilityElement(children: .contain)` (waiver: `// driveability: leaf` on the line above a Button-label chain);
- b. every identifier literal in source is in the contract (static or dynamic regex);
- c. every static contract id appears in source;
- d. no `ColorPicker(`, `.pickerStyle(.menu)`, `.accessibilityAdjustableAction` in a file that declares a contract identifier (waiver: `// driveability: waived <reason>`);
- e. `LazyVGrid`/`LazyVStack`/`LazyHStack` in such a file needs `// driveability: lazy-ok <reason>`;
- f. the UI harness pins its launch args (`-fixture sample`, `-exportQuality preview`) and the `make ios-test` target pre-grants Photos.

The lint is only evidence once it has been mutated: delete one `.contain`,
watch it go red naming the file, restore, and record that in the handover.
Porting to another repo: copy the two files, change the three source roots and
the harness file path, regenerate the contract from `grep accessibilityIdentifier`.

## 4. Harness invariants (the UI suite's launch)

- Explicit fixture, transport, store and quality flags on every launch; the
  app must honour them over any local preference. A machine with real footage
  and a CI runner without it must drive the same plan.
- Permissions the flow will hit (Photos, Photos-add, mic) are pre-granted by
  the make target, not answered mid-test.
- Preview render scale on the simulator; full scale only on device runs.
- One dump of the plan to a path (`-planDumpPath`) so tests assert on the
  model, not on culled or animated pixels.
- Timeouts per phase (launch / screen / render) as named constants, never
  literals scattered through tests.

## 5. Writing UI tests against screens another terminal is building

- Both terminals code to the contract file, not to each other's branch. The
  test terminal adds the ids it needs to the contract in its own change; the
  view terminal binds them. The gate's lint reconciles.
- Never assert on things a real screen cannot hold: counts of virtualised
  rows, exact durations after an earlier edit, pixel positions.
- Drive controls only through Buttons, TextFields, Toggles and taps. If the
  spec's control cannot be driven that way, stop and report (rule 10 of
  `waves`), do not fake the assertion.
- Fixtures come from the generator (`make <fixtures>` or the router), never
  hand-typed.

## 6. Gate step (add to `waves/gate.md`, between merge and mutation)

After the last merge and before patches/mutations:

1. `swift test` for every package plus the app target, including the driveability lint.
2. The full UI suite on the merged app (`make ios-test`), in local shape.
3. The same suite once in CI shape: no local fixtures (`make ios-test CLIPS_DIR=/nonexistent` or the repo's equivalent) so the fixture pin is proven, not assumed.
4. Every red is an integration defect: fix at the gate, list each in the handover under "what the gate had to do", and add a lint check or contract row so it cannot recur silently. A green suite that was never mutated is not evidence.

## 7. Checklist for a terminal that touches a screen

- [ ] every new id is in `contracts/ui/accessibility-identifiers.v1.json`
- [ ] containers with ids carry `.accessibilityElement(children: .contain)`
- [ ] no lazy stacks / fixed heights below content / undriveable pickers without a waiver comment
- [ ] steppable controls are Buttons with `.isSelected`
- [ ] every sheet dismisses in every host (dev shell included)
- [ ] every async phase has an identified in-flight element
- [ ] `swift test --filter DriveabilityLintTests` green, and mutated once
- [ ] the relevant XCUITest run once on the simulator with the harness's pinned args
