---
name: scroll-motion-web
description: Put motion graphics into a website so the visitor's scroll drives them (scroll = timeline, forward and backward), as live HTML compositions rather than video, and run a scroll audit on every version. Use when the user says "the scroll is not working", "the scroll is not falling in the right place", "motion graphics in the website", "scroll animation", "scroll with the transition", "scroll audit", "scroll and see", or shares scroll-world / GSAP links.
---

# Scroll-driven motion in a website

The user wants motion graphics that live inside the page and move with the scroll, not videos that play on a timer. They want each animated story to land exactly where the eye is, and they want every version checked by actually scrolling it. Built and approved on the project site, Version A, on 4 Nov 2026.

## Rules (from the user's corrections)

1. **Live, not video.** Build or reuse motion graphics as HTML/SVG compositions with `window.draw(t)` and `seek(t)`. Embed them live in the page; the scroll drives `seek`. Use video only for real footage.
2. **Scroll is the timeline.** Scroll down plays forward; scroll up plays backward. Never use a timer for story motion. Slideshows of screens may still autoplay while on screen.
3. **The story finishes when the element is centred.** Map progress so that 0 = the element's top touches the bottom of the screen and 1 = it is centred and fully visible. Hold the final state after that, or run a secondary motion (a path, a drift) as it leaves.
4. **Never hold the page** (no pin, no damped scroll library). The animation runs over the element's natural pass up the screen.
5. **On desktop the composition is the section,** edge to edge, with the same background, so there are no boxes or colour strips. On phones, crop to the key part (the card) at a readable scale, and show the page's own heading above it.
6. **Copy lives in the page.** Inject the composition's text from the site's i18n object so every language works. Hide duplicate HTML headings visually on desktop (screen-reader only).
7. **Only transform and opacity** for page-level scroll effects. Scrubbed clip-path or filter on large areas repaints every frame and makes the scroll feel broken.
8. **Reduced motion:** show the final frame and no scrubbing.

## Steps

1. **Read the project's principles first**.
2. **Get the compositions.** If the films are seek-driven HTML (e.g. `demos/reference-board/*.html` with `film-kit.js`), copy them into the site (`films/`), fix the asset paths, and add:
   - `?embed`: no own timer, post "ready";
   - `?notext`: hide the composition's text and chrome.
3. **Measure the timeline:** read each film's `draw(t)` and note when the key moments land (card formed, numbers counted, headline in). Set `data-end` to the moment the story is complete (m9: 6.2 s; m10: 3 s of data, then the path to 8.8 s).
4. **Embed** with `live-film-engine.js` (in this folder):
   - `.live` box, iframe 1920×1080 scaled by `transform`;
   - phone crop via `data-crop`;
   - rAF smoothing toward the target time;
   - progress from `getBoundingClientRect` on a passive scroll listener.
   GSAP ScrollTrigger is fine for the reveals around it.
5. **Map the time** with `prog()` from the engine (0 = enters, 1 = centred, 2 = 60% gone). Story-to-centred: `t = min(1, p/0.9) * end`. A secondary motion uses `p` 1→2.
6. **Scroll audit,** every version, desktop 1440×900 and iPhone 13. Serve over http (a blob/iframe needs http, not `file://`):
   ```bash
   cd <site dir> && python3 -m http.server 8744 --bind 127.0.0.1 &
   node ~/.claude/skills/scroll-motion-web/scroll-audit.mjs <outdir> http://127.0.0.1:8744/<page>.html
   ```
   It wheels down in 180/160 px steps and logs the visible sections, each `.live` film's time `t`, its top, its % visible, and any heading or card still hidden in the middle of the screen. It saves a screenshot every second step.
   - **Pass:** at the first step where a film is ≥90% visible, its `t` is at its story end. No visible area shows an empty card. No section is held.
   - Make a contact sheet of the screenshots and look at it: empty gaps, colour strips, things landing off-screen.
7. **Other checks:**
   - 0 console errors;
   - no horizontal overflow at 320/390/1440 px;
   - taps ≥40 px;
   - IT/EN keys filled;
   - mouse wheel and touch actually move `scrollY`.
8. **Report the audit as a table** (scroll px → visible % → time → what the eye sees), then the fix, then the re-audit numbers.

## Lessons learned
- 2026-11-04: tests that jump with `scrollTo` miss scroll problems. Always wheel or touch step like a visitor (permanent).
- 2026-11-04: video crops of films misaligned and looked soft; the user asked for "best quality, keep them as the animation in the web". Embed the live composition (permanent).
- 2026-11-04: progress mapped over the whole pass (top 85% → bottom 35%) made the headline rise while the film was leaving the screen. Finish at centred (permanent).
- 2026-11-04: baked-in headings in films duplicate the page heading and stay in one language. Hide them (`notext`) or inject the copy.
- 2026-11-04: scroll-world (oso95) is a good technique (scroll drives video time, blob-seek) but generates AI art with paid tools. For a no-AI-images brand, usee the technique only (no-AI-images rule).
- 2026-11-04: GSAP 3.12.5 + ScrollTrigger from cdnjs was already in use; there's no need to install greensock/gsap.
- 2026-11-04: on v18 (Kickbase 1:1), the audit's section list only knew hero/ogni/chi/rispetto/faq, so the three story blocks (#rivediti, #crescere, #come) and the ribbons showed as the sticky hero. Add the page's own section ids before running; a position:sticky hero reports as visible for the whole page and is not a hold.
- 2026-11-04 (round 3): "passes at ≥90% visible" was not enough: m9's key moments (pitch → card) happened at 22–44% visible, below the fold, and the owner still felt it misaligned. Start the story when ~40% is on screen (p ≈ .38), not at 0, and check where the *middle* of the story lands, not only the end (permanent).
- 2026-11-04 (round 3): rAF smoothing toward the target (t += (want−t)·.35) lagged ~150 ms behind the scroll and felt late on a trackpad. Draw the target time in the same frame as the scroll event; GSAP scroll effects use `scrub: true`. Audit lag too: wheel 180 px and 40 px steps, wait two frames, compare drawn t with the t the position asks for (target ≤ .01 s). Script: `marketing/website/research/version-a/audit-round3/audit3.mjs` (permanent).
- 2026-11-04 (round 3): a step explainer ("Come funziona") that advanced by tap/PLAY read as "basic, the scroll does not work". Use the scroll-spy pattern with a sticky stage (`position: sticky`, never pinned): the step nearest the centre is active and the stage draws with the step's progress (D28).
- 2026-11-04 (round 3): a colour that must "fill the section" (D26): scale a solid layer with `transform` from the element's box to the whole section; never animate clip-path or size.
- 2026-11-05: no two sections on one page may share a scroll pattern. Give each section its own move (assemble, 3D camera move, a line down the page, a fold/collapse) and show them as a demo page first (permanent).
- 2026-11-05: CSS 3D: any `mix-blend-mode` (or opacity < 1, filter) inside a `preserve-3d` parent flattens it, so a standing element (rotateX(-90deg)) disappears. And `vector-effect: non-scaling-stroke` breaks `pathLength` dash draws (dashes become 1 px). Use user-unit stroke widths for lines that draw.
- 2026-11-05: for treated real footage (echo trail, grade), pre-render a WebP frame sequence with a script and draw it on a canvas from scroll progress (88 frames × 2 layers ≈ 5.6 MB); crossfade layers with canvas globalAlpha, not CSS filter. SoccerTrack MOT GT can be offset from the decoded clip (117093: 24 frames); measure the offset before compositing.
- 2026-11-09: `scroll-audit.mjs` only reads `.live` films; the project site now uses sticky `section.r6` stages that write `data-p`, so the stock audit reported nothing. Used a page-specific audit (wheel steps + `data-p` per stage). Next time, extend the script to read `section[data-p]` too. Also measure first-view bytes: Visto preloaded 4.6 MB of frame sequences at page load. Gate frame loading on the first parent scroll (or 3 s).
