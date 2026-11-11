# Auditor feedback log

One row per feedback point. Maintained by the `audit-feedback` skill.

| # | Date | Source | Point | Verdict | File changed | What changed |
|---|---|---|---|---|---|---|
| F1 | 2026-11-06 | Codex review of us round-10 audit | Separate observations from simulated reactions | Accept | SKILL.md, report-template.md | Two tracks: evidence audit vs simulation; "simulations suggest" wording |
| F2 | 2026-11-06 | Codex | 35% "shine" threshold has no evidence | Accept | SKILL.md, rubric.md | Threshold removed; screen counts are context only |
| F3 | 2026-11-06 | Codex | Judge graphics by purpose | Accept | rubric.md §3 | Job → does it work → attention cost → keep/shorten/move/remove |
| F4 | 2026-11-06 | Codex | Personas follow their own path and stop; no peeking after leaving | Accept | persona-prompt.md | Verdict frozen at exit; open only the screens they reach |
| F5 | 2026-11-06 | Codex | Evaluate the commitment asked of each audience | Accept | rubric.md §4 | Commitment-per-audience table |
| F6 | 2026-11-06 | Codex | Personas built around decisions and their own positive outcome | Accept | persona-template.md, sites/example/personas.md | Question / outcome / authority table; kid forwarding to a parent = success |
| F7 | 2026-11-06 | Codex | Intended vs received meaning; four gap types | Accept | rubric.md §1 | Section matrix: Missing / Easy to miss / Misunderstood / Unconvincing |
| F8 | 2026-11-06 | Codex | Keep list + fact-check rewrites | Partly | SKILL.md, sites/example/facts.md | Accepted, but "lunedì" is already on the live site and was not invented; it is now flagged as an open fact |
| F9 | 2026-11-06 | User | Design as if the visitor is drunk | Accept | rubric.md §0, persona-prompt.md §9 | Drunk-user test per section; persona "drunk glance" per section |
| F10 | 2026-11-06 | User | Copy a grandpa understands; judge the site on whether any layman understands it | Accept | rubric.md §0, layman-prompt.md, SKILL.md | Grandpa test + a 6th walk (layman reader); new "easy for a layman" score |
| F11 | 2026-11-06 | User | Is the communication proper? | Accept | rubric.md §0, persona-prompt.md §11, report-template.md | Intended vs received message in one sentence |
| F12 | 2026-11-06 | User | Is the problem statement proper? | Partly | rubric.md §0 | Checks that the visitor's own problem is clear. Does not ask for problem stats on the home page: owner decision "site shows value, not the problem" (2 Nov) and brand A4 stand |
| F13 | 2026-11-06 | User | Read every sentence we wrote | Accept | rubric.md §0, layman-prompt.md | Sentence pass over every sentence and state → SENTENCES.md. Customer personas still read realistically; the layman reader and the auditor read everything |
| F14 | 2026-11-06 | User | Is the website too long? | Partly | rubric.md §0, persona-prompt.md §12 | Length check added without a fixed screen limit (F2 removed thresholds): too long = the answer a persona needs sits after the point where they stop |
