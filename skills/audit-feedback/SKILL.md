---
name: audit-feedback
description: Take feedback on a website audit (the user's highlighted points, a Codex or reviewer critique, or "this finding was wrong") and turn each point into a change to the website-experience-auditor skill, logged in its FEEDBACK.md. Use when the user says "audit feedback", "improve the auditor", "add this to the auditor", "the audit got X wrong", pastes a review of an audit report, or highlights points from an audit and asks to keep them.
---

# Audit feedback → auditor skill

The auditor lives at `~/.claude/skills/website-experience-auditor/`. This skill changes it from feedback, one point at a time. Every change is traceable in `FEEDBACK.md`.

## Steps
1. **Collect the points.** Split the pasted text or highlighted lines into separate, numbered points. Quote each one in a few words.
2. **Weigh each point; don't apply it blindly.** Read the evidence (the report, the captures, the site, the owner's decision logs) and give each point a verdict:
   - **Accept**: it's right and general.
   - **Partly**: right in spirit but wrong in detail. Say what you keep.
   - **Reject**: wrong, or it conflicts with an owner decision. Give the reason.
   - **Site-only**: true for this site, not for the method. It goes to `sites/<site>/`.
   Reviewers can be wrong too. Say so with evidence (e.g. "the site already says 'lunedì'").
3. **Route each accepted point to one place:**
   | Kind of point | File |
   |---|---|
   | How the audit is run, what the report must contain | `SKILL.md` (Two tracks / Synthesis) |
   | What personas see, do or report | `references/persona-prompt.md` |
   | How sections, visuals, UX or brand are judged | `references/rubric.md` |
   | Report structure or wording | `references/report-template.md` |
   | Persona design | `references/persona-template.md` + `sites/<site>/personas.md` |
   | Product facts, brand rules, audience for one site | `sites/<site>/facts.md`, `brand-criteria.md`, `site.md` |
   | Capture bugs (missed pages, screens, collapsed content) | `scripts/capture.mjs` (then test it on the site) |
   Edit in place. Don't stack contradicting rules; replace the old rule. Keep `SKILL.md` under ~120 lines.
4. **Log it.** Append to `FEEDBACK.md` one row per point: `date | source | point | verdict | file changed | what changed`. Add one dated line to `SKILL.md` "Lessons learned" only when the point changes the method.
5. **Fix past output if needed.** If a point makes an existing report wrong, add a short dated correction note at the top of that report. Don't rewrite history.
6. **Show the user** a table (point → verdict → file → change) plus anything that needs their decision. Then offer to re-run the auditor so the change can be checked.
7. Run `python3 ~/.claude/skills-index/build_index.py`.

## Rules
- One point, one change, one log row. If a point needs an owner decision (e.g. a brand rule conflict), log it as **Open** and ask; don't pick a side.
- Never weaken a brand red line or an owner decision because a reviewer suggested it.

## Lessons learned
- 2026-11-06: Created after the Codex review of the first audit (log entry F1–F8 in the auditor's FEEDBACK.md).
