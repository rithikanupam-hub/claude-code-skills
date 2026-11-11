---
name: competitor-intel
description: Competitor research that lands in a persistent per-project knowledge base. Use for "check competitor website", "how does Veo/Hudl/Pixellot pitch", competitor fonts, colours, imagery, video, pricing, features, messaging, or any question comparing the project with a competitor.
---

# Competitor intel

Every competitor observation goes into one store per project, with a date and a source, so knowledge grows instead of dying in chat. Answer from the store first; capture only what is missing or stale.

## The store (per project)

`<project>/research/competitors/`

| File | What |
|---|---|
| `INDEX.md` | One row per competitor (name, URL, category, last checked, positioning). Generated. Hand-kept watchlist between markers. |
| `<slug>/PROFILE.md` | Living profile, 14 fixed dimensions + Snapshot + Changes log. Template: `references/profile-template.md` |
| `<slug>/captures/YYYY-MM-DD/` | Screenshots, page text, `*-computed.json` (fonts/colours/CTAs/media), `media/` video contact sheets |
| `QUESTIONS-LOG.md` | Every competitor question: date, question, competitors, answered from, saved to |
| `COMPARISON.md` | Matrix generated from Snapshots + hand-written "What this means for us" between markers |

If the store does not exist, create it with the files above (copy the structure from the project store).

## Workflow

1. **Intake.** Name the competitor(s) and the exact question. Map the question to dimensions in `references/dimensions.md`. Unknown competitor → add a profile (slug, category) before capturing.
2. **Check the store.** Read `QUESTIONS-LOG.md` (same question asked before?) and the relevant sections of each `PROFILE.md`. For each needed fact, apply freshness: < 60 days → use it; 60–180 days → use it, say the date; older, or prices/offers > 30 days → re-capture. If everything is fresh, skip to step 5.
3. **Capture**, cheapest first:
   - Text: `curl -sL` or WebFetch on the page / help centre / pricing.
   - JS pages, screenshots, computed fonts/colours, media inventory:
     ```bash
     ~/.claude/skills/competitor-intel/scripts/capture.sh <url> <store>/<slug>/captures/$(date +%F)
     ```
     It drives the browser-use CLI (read `~/.claude/skills/browser-use/SKILL.md` first; follow its token rules). Writes `<page>-hero.png`, `-hero-clean.png` (cookie layer hidden, never accepted), `-hero-t4/t8.png`, `-full.png`, `-full-tiles/`, `-computed.json`, `-text.txt`, and prints a one-line summary.
   - Video/imagery questions: `scripts/media_frames.sh <capture_dir>` downloads each visible site video and writes a 6-frame contact sheet per video. Look at the sheets, not the mp4s.
   - If Claude in Chrome tools (`mcp__claude-in-chrome__*`) are loaded, they can replace browser-use: paste `scripts/capture.js` into the javascript tool; it returns the same JSON.
   - Read screenshots/tiles only where layout or imagery matters. Never print whole DOM or AX trees.
   - Stop at login walls, paywalls, CAPTCHAs. Don't create accounts, start trials or submit forms. Note "login-walled" in the profile instead.
4. **Write facts into the profile.** Follow the fact format in `references/profile-template.md`: every line gets `[YYYY-MM-DD · source]`. Quote headlines and CTAs verbatim in the original language. Fonts and colours come from computed CSS (`*-computed.json`), never guessed from pixels. If a value changed, move the old one to `## Changes log` with both dates. Update the Snapshot line, `**Last checked:**`, and `## Captures`.
5. **Log the question** in `QUESTIONS-LOG.md` (newest at top): date, question in the user's words, competitors, `store` / `new capture` / `mixed`, where the answer is saved (profile sections, capture folder).
6. **Regenerate** when any Snapshot line or profile was added or changed:
   ```bash
   python3 ~/.claude/skills/competitor-intel/scripts/build_comparison.py <store>
   ```
   Then update the hand-written "What this means for us" block in `COMPARISON.md` if the finding changes a recommendation.
7. **Answer briefly**: the answer first (bullets), the dates of the facts used, then one line saying where it is saved. Offer a re-capture if anything was stale.

## Rules

- One fact, one line, one date, one source. No undated facts.
- Old facts are history: never delete them; move them to the Changes log.
- Label `(claimed)`, `(3rd party)`, `(inferred)` where the difference matters. Never present a vendor claim as tested.
- Seeded facts keep the research date of their source file, not today's date.
- Don't edit the source research files you seed from; cite them by path.
- Geo matters: note the country/locale and currency a page served (Veo serves € prices to Italy).
- browser-use adds a horse emoji to the tab title (`🐴 …`); strip it when quoting page titles.
- Big files (full-page PNG ~25 MB, downloaded mp4s) stay in `captures/`; don't attach them to chat.

## Files in this skill

- `scripts/capture.sh` — one-URL capture via browser-use (screenshots, JSON, text, tiles)
- `scripts/capture.js` — in-page extractor: fonts per role, loaded font faces, colour hex by text volume and by area, CSS colour variables, headings, CTAs, nav, sections, hero, image/video inventory
- `scripts/media_frames.sh` — video contact sheets from a capture
- `scripts/build_comparison.py` — regenerates `INDEX.md` + `COMPARISON.md` from profiles
- `references/profile-template.md` — profile skeleton + fact format
- `references/dimensions.md` — what to check per dimension, where, and how; the project reference points; freshness rules

## Lessons learned

- 2026-11-04 (first run, Veo): `Emulation.setDeviceMetricsOverride` before `new_tab()` does not apply to the new tab, and applying it after made `captureBeyondViewport` fail ("Unable to capture screenshot"). Dropped the override; capture uses the real Chrome viewport (1470 px wide, 2× DPR) and falls back to stitched viewport shots if the full-page shot fails.
- 2026-11-04: Webflow sites (Veo) lazy-load `<video>` with the page URL as `src` until scrolled; `capture.js` reads `<source>` instead and drops hidden/duplicate videos (Veo has 50 `<video>` tags, 14 unique visible).
- 2026-11-04: Veo's home hero changes with campaigns (Black Friday takeover on 2026-11-04). Record the campaign state with the date; the evergreen hero sits underneath.
- 2026-11-04: A safety check blocks `rm -rf <capture_dir>/*`; re-running `capture.sh` overwrites files in place, so no cleanup is needed.
