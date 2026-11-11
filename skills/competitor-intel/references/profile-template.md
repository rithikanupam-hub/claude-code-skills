# Profile template

Copy into `<store>/<slug>/PROFILE.md`. Slug = lowercase-hyphenated brand (`veo`, `hudl`, `once-sport`).
Header lines and the Snapshot bullets are machine-read by `scripts/build_comparison.py`: keep their exact spelling.

## Fact format (every fact, every section)

`- <fact, verbatim quotes in "original language"> [YYYY-MM-DD · <source>]`

- Date = when the fact was observed (capture date or the source document's research date), not today.
- Source = a URL, or a project file path, or `capture YYYY-MM-DD/<file>`. Short codes (S1, S2) are fine if defined under `## Sources`.
- Labels when it matters: `(claimed)` vendor says, `(3rd party)` aggregator or press, `(inferred)` our reasoning.
- Changed value: move the old line to `## Changes log` as `- YYYY-MM-DD <dimension>: was "<old>" [old date · source] → now "<new>" [new date · source]`. Never delete or overwrite silently.

---

```markdown
# <Name>

**Name:** <Name>
**URL:** https://...
**Category:** direct | adjacent | inspiration
**HQ / markets:** <city, country> · <where it sells>
**Last checked:** YYYY-MM-DD (<what was checked: live site / seeded from files>)

## Snapshot
<!-- one short line each; feeds COMPARISON.md. Update when a section below changes. -->
- Positioning: 
- Target customer: 
- Who pays: 
- Price signal: 
- Hardware: 
- Product & AI: 
- Italy presence: 
- Visual identity: 
- Imagery & video: 
- Threat to us: high | medium | low — why

## 1. Positioning & promise
## 2. Target customer & segments
## 3. Messaging & tone of voice
<!-- verbatim headlines, sub-heads, CTAs in the original language; note the language/locale seen -->
## 4. Customer language
<!-- the exact words they use for coaches, parents, players, clubs, the match, the product -->
## 5. Product & features
## 6. Pricing & packaging
## 7. Hardware & setup
## 8. Proof
<!-- logos, testimonials (quote + name), numbers, partnerships, funding -->
## 9. Visual identity
<!-- font-family values from computed CSS, colour hex with role, logo, UI light/dark, texture -->
## 10. Imagery & video style
<!-- what is shown: raw match footage vs graphics/renders, people vs product, angles, emotion, grade, who is in frame -->
## 11. Website structure & funnel
<!-- nav items, section order, primary/secondary CTA, forms, lead capture -->
## 12. Social / Instagram style
## 13. Italy-specific presence

## Captures
<!-- - YYYY-MM-DD: captures/YYYY-MM-DD/ — what was captured (pages, files) -->

## Changes log

## Open questions

## Sources
```
