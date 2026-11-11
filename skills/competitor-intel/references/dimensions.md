# Dimension checklist

What to look for on each dimension, and where. Tick what the question needs; a full first pass on a new competitor covers all 14.
`capture.js` output keys are in brackets.

| # | Dimension | Look for | Where | Method |
|---|---|---|---|---|
| 1 | Positioning & promise | Category they claim, the one promise, who they say it is for, what they are "not" | Home hero, meta description [`metaDescription`, `hero`], About | text |
| 2 | Target customer & segments | Club / coach / parent / player / federation / school; level (pro, grassroots, youth); sports | Nav "Solutions/For X", pricing tiers, forms ("What sport?") | text |
| 3 | Messaging & tone | Verbatim H1, H2s, CTAs, taglines; register (hype, calm, technical); you vs we; locale shown | [`headings`, `ctas`, `hero`]; `<slug>-text.txt` | text, copy verbatim |
| 4 | Customer language | Words for coach, parent, player, club, match, highlight, stats, "AI" | Body copy, FAQ, help centre, app store listing | text, quote |
| 5 | Product & features | Modules, add-ons, AI claims (documented vs claimed), turnaround time, outputs | Product pages, help centre/docs, release notes | text |
| 6 | Pricing & packaging | Plans, € / $ figures, billing periods, hardware free/leased/bought, who pays, storage limits | /pricing (often JS: use the browser), quote forms, 3rd-party | browser if prices render client-side; note geo (prices change by country) |
| 7 | Hardware & setup | Camera type (fixed/portable/phone), mount, connectivity, who sets up, battery, install | Product page, manuals, support | text |
| 8 | Proof | Client logos (names), testimonials (quote + person), numbers (teams, matches), partners, funding | Logo strip [`media.images` alt/src names], case studies, press | browser + text |
| 9 | Visual identity | Font families per role, colour hex + role (bg, text, accent, CTA), CSS variables, light vs dark, logo | [`typeRoles`, `fontsByTextVolume`, `fontFacesLoaded`, `textColors`, `backgroundColors`, `cssColorVars`] + screenshots | browser (computed CSS, never guess from a screenshot) |
| 10 | Imagery & video | Raw match footage (from their own camera) vs cinematic shoot vs 3D product renders vs UI mock-ups; people (who, age, gender, emotion) vs product; angles (wide elevated, ground level, close-up); grade (warm, flat, saturated); autoplay loops vs play-button films | [`media.videos`, `media.images`], `media_frames.sh` contact sheets, hero t0/t4/t8 | browser + `media_frames.sh` |
| 11 | Website structure & funnel | Nav items, section order (top to bottom), primary vs secondary CTA, lead forms and their fields, chat widget, promo banners | [`nav`, `sections`, `ctas`], full-page tiles | browser |
| 12 | Social / Instagram | Handles, follower counts, post types (match clips, memes, UGC, product), cadence, captions language | Instagram/TikTok/LinkedIn/YouTube profile pages (often login-walled: note it, don't log in) | browser, WebSearch |
| 13 | Italy presence | Italian site/locale, € prices, Italian clubs/federations, LND/FIGC deals, resellers, Italian press | `/it` paths, LND sites, Italian press search | text, WebSearch |
| 14 | Strengths / weaknesses vs us | Where they beat the brand's model (fixed free install, families pay, every child, 48 h, privacy) and where they leave a gap | Synthesis of 1-13 | reasoning, label (inferred) |


- Model: fixed 4K camera installed free at the pitch; families subscribe; club gets €0 cost and a revenue share; 48 h highlights, stats, reports; 36-month pitch contracts; Liguria 2026, Italy 2027.

## Freshness

- Facts < 60 days old: answer from the store.
- 60-180 days: answer, say the date, offer a re-check.
- > 180 days or price/offer facts > 30 days: re-capture before relying on them (offers change monthly; Veo ran Black Friday on 2026-11-04).
