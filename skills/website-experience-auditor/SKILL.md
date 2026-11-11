---
name: website-experience-auditor
description: Brand & Customer Experience Auditor for any website. Checks whether the site moves its primary audience to the intended next step. Two separate tracks - an evidence audit of every page (verifiable observations) and five simulated customer walks (hypotheses, not proof). Compares intended message with received message per section, judges each visual by its purpose, lists what to keep, and proposes the smallest useful changes with copy that is fact-checked against confirmed product facts. Use when the user says "audit my website", "act as a customer", "does the site convince", "is it too shiny", "persona review", "customer experience audit", "brand audit of the site".
---

# Website Experience Auditor

Question: **does the site get the primary audience to understand, believe and take the intended next step, and what is the smallest change that helps?** Not "do five different people all like it".

## Run
`/website-experience-auditor <site> [url]`, e.g. `/website-experience-auditor example`. If the URL is local, start the server from `sites/<site>/site.md` first (in the background). Output goes to `<project>/research/experience-audit-<date>/`. Feedback on a finished audit → `/audit-feedback` (logs to `FEEDBACK.md`, edits this skill).

## Inputs (one folder per site: `sites/<site>/`)
- `site.md`: URLs, how to serve locally, the business, **the primary audience, the intended next step for each audience**, what is out of scope, where the decision logs live.
- `brand-criteria.md`: positioning, signature, voice, red lines, claim rules, decisions already made. Cite sources.
- `facts.md`: **confirmed product facts vs open facts** (price, timing, who pays, features). Rewrites may only promise confirmed facts.
- `personas.md`: 5 personas built around a **decision**: the question they bring, their authority, what a positive outcome is *for them* (see `references/persona-template.md`). Names and jobs are secondary.

New site → copy `sites/_template/`, fill the four files. Ask the user only for what isn't in their files (primary audience, next step, confirmed facts).

## Two tracks, kept separate

### Track A: Evidence audit (the auditor, every page)
1. Capture: `node scripts/capture.mjs <url> <out>/capture --max-screens 45`, then `python3 scripts/sheets.py <out>/capture/<page>`. It crawls same-origin pages and scrolls each one screen at a time on desktop (1440×900) and phone (iPhone 13). Text inside iframes is listed whole, so the screenshot is the truth. Also open collapsed content (FAQ, menus, forms, success states) and inspect it.
2. Write only **verifiable observations**: "the club page has no contact button", "FAQ answer X defers", "page says one camera, club page says two". Each one gets a file reference.
3. **Layman checks** (rubric §0, before anything else): drunk-user test per section, grandpa test, communication (intended vs received), problem statement, a **sentence pass over every sentence** (`SENTENCES.md`), and length. The site is judged on whether any layman understands it.
4. **Section matrix** (core output), one row per important section:
   `Intended message → What is visibly communicated → What personas noticed → What they understood → What remains unanswered → Smallest useful change`.
   Classify each gap as **Missing** (not on the site) / **Easy to miss** (there, but small, late or collapsed) / **Misunderstood** (noticed, read wrong) / **Unconvincing** (understood, not believed). Only "Missing" is fixed by adding copy.
5. **Visuals by purpose**: for each animation or graphic, state its job (explain / recognise / remember / brand feel), whether it does that job, and its attention cost (how many screens, before or after the first concrete answer). The verdict is **keep / shorten / move / remove**, with a reason. No shine-percentage thresholds. Screen counts depend on capture spacing and are context, not a score.
6. **Commitment check per audience**: what the site asks each audience to do, and what that person needs to know to do it (a parent introducing a club ≠ a president adopting). The same gap (e.g. no price) can block one and not the other.
7. **Keep list**: what works and must survive the next round.

### Track B: Customer simulation (5 personas + 1 layman reader, sub-agents, `references/persona-prompt.md`)
- **Each persona scrolls at its own pace first.** Run `node scripts/walk.mjs <url> <out>/walks --device <m|d> --flick F --pause MS --prefix p1` with the `Scroll:` line from that persona in `personas.md` (skimmer: big flicks, short pauses; reader: small steps, long pauses). The persona gets its own walk frames (`walks/p1-m-NN.jpg`), not the fixed one-screen capture: a fast scroller sees scroll films jump, and that is what they would see. Use the fixed capture only for the layman reader and Track A.
- Each persona arrives in their own context and device and follows **only the path they would plausibly choose**. They open each screen they reach, in order. When they lose interest they stop, and **their verdict is frozen there**. They don't see the rest; at most they say what might have brought them back.
- Success is judged against **that persona's positive outcome**, not the site's main CTA. A kid saying "I'll show my dad" is a success when the parent is the route.
- Every persona also reports the drunk glance, words they didn't get, the message and problem in their own words, and whether it felt long (persona-prompt §9–12).
- **6th walk, the layman reader** (`references/layman-prompt.md`): not a customer. A grandparent-type reader opens every screen and state and logs every sentence. Feeds the grandpa test and `SENTENCES.md`.
- These are hypotheses. Report as "the simulations suggest…", never "nobody is convinced".

## Quick re-run after a change (personas only)
`/website-experience-auditor <site> --personas-only [url]`: skip Track A; run each persona's walk, then the persona and layman walks, and compare their verdicts with the last REPORT.md. Use it to judge a new version, not to replace a full audit.

## Synthesis (`references/report-template.md`)
- Lead with the **primary audience**: does the intended action happen? Other personas expose supporting or downstream issues.
- Observed facts and simulated reactions in clearly labelled sections.
- Every rewrite is checked against `facts.md` and the red lines. Anything unconfirmed is marked **[da confermare]** and listed as a question for the owner, never written as a promise.
- "Simpler" means less effort to understand and decide. It does not mean fewer graphics, more literal headlines, or less brand personality.
- Persona requests that break red lines (e.g. rankings) are flagged, not recommended.
- End with: validate the top 3 hypotheses with 5 real people from the primary audience.
- Save to `<project>/research/experience-audit-<date>/REPORT.md`.

## Lessons learned
- 2026-11-05: Crawler bug: comparing to `location.origin` inside Node dropped every link; compare to the start URL's origin.
- 2026-11-05: 3 of 5 personas skimmed via the contact sheet instead of opening screens; the prompt now requires opening each screen they reach.
- 2026-11-05: Collapsed FAQ answers must be read; deferrals ("si definiscono con la società") were a major gap.
- 2026-11-06 (Codex review of the first run): v1 invented a "35% shine" threshold, showed personas the whole site after they had left, judged every persona against the parent CTA, wrote "nobody is convinced" from simulations, and proposed copy with unconfirmed promises ("senza lavoro in più per i volontari", "il tuo nome resta tra noi", Monday timing). Rebuilt into two tracks, a section matrix, visuals by purpose, per-persona outcomes, a keep list, and `facts.md` gating.
- 2026-11-06 (second run): sheets.py wrote `sheet-d/m.jpg` per capture dir, so the last page overwrote the home sheets; now `sheet-<page>-<d|m>.jpg`. Collapsed-state capture: wait >3 s after opening a form before submitting (anti-bot timers fake a "Grazie!"). Give personas one file per collapsed state, not one STATES.md (P4 read all of it). Measure menu-anchor landing screens before writing them into persona prompts (an approximate hint sent P3 to the wrong section). Check the source when a persona misreads a visual: the Visto legend was hidden on phone by CSS.
- 2026-11-06 (user): judge every site on whether any layman understands it. Added rubric §0 (drunk-user, grandpa, communication, problem statement, every-sentence pass, length), persona fields §9–12, and the layman reader walk.
- 2026-11-06 (third run, layman checks): (1) Give personas the **landing screenshot** for each menu link (`states/<d|m>-nav-*.jpg`), not the nearest captured screen: "Privacy → m-19" showed the end of the previous film and P2 called the menu broken. (2) State `.md` dumps must skip off-screen/aria-hidden elements: the honeypot "Website" label leaked and the layman reported a visible English box. (3) Preview labels ("modulo non collegato", WhatsApp "non attivo") stop the primary persona at the action: report them as a build blocker for real-user tests, separate from copy findings. (4) The sentence pass found contradictions headline reading missed (player count vs 7/9-a-side categories, "segnate" = scored): always check numbers and calcio words against the audience's own categories.
- 2026-11-06 (user: "did you scroll as per the user persona?"): personas only ever saw fixed one-screen captures, so a skimmer and a careful reader saw the same frames of each scroll film. Added `scripts/walk.mjs` (flick + pause pace), a `Scroll:` line per persona, and the personas-only re-run.
- 2026-11-06 (fourth run, first with walk.mjs): two walk bugs fixed — the final scroll position wasn't captured (footer missing from every persona, P3 'never found' the club link) and skimmers got a frame only every ~1.6 screens (P1 saw a heading without the FAQ under it). After a round of fixes, also audit the fixes themselves: 3 regressions came from the fix round (an unscoped 'Non costa nulla', a new privacy contradiction, a button that pushed content off the screen).
- 2026-11-08 (user: "make sure the UI/UX, icons and everything are proper"): the 06c audit never ran the brand rules on the site itself. A grep found pink used for form errors, near-black #0E1418 backgrounds and pink trails over the 5% limit, all breaking `marketing/brand/VIDEO-BRAND-CHECK.md`. Track A now also needs a brand-rule pass: grep colours/filters/stroke widths against the brand check, and inventory the icons that are actually rendered (unused icon arrays in JS do not count).
