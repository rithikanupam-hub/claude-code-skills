---
name: ai-video-director
description: AI film director for Higgsfield-generated footage (Kling, Seedance, Veo, Nano Banana, GPT Image). Turns a brief's shot list into locked keyframe stills, then image-to-video clips, with a generation ledger, frame-by-frame rejection checks, one shared grade and a lessons loop, so nothing looks like AI slop. Use when the user says "AI video director", "direct the Higgsfield clips", "generate the AI shots", "make the AI footage look real/not sloppy", "best quality AI video", or a the project / client brief lists AI clip prompts (Clip A–H).
---

# AI Video Director (Higgsfield)

Built 2026-11-10 from the top-ranked public director skills (research report in the session that made this):
- `vendor/smixs-visual-skills/` (smixs/visual-skills, CC BY 4.0, Serge Shima): story layer, de-slop, model files.
- `vendor/osidemedia-higgsfield/` (OSideMedia/higgsfield-ai-prompt-skill, MIT): Higgsfield routing, MCSLA, failure modes, negative constraints, DISCIPLINE.md.
- Lessons loop idea from 0xadvait/ai-video-skill (contact sheet → score → one-line lesson).
Versions pinned in `vendor/VERSIONS.txt`. Vendor files are references: read them, don't treat their SKILL.md as separate skills.

## Read before prompting (in this order)
1. `LESSONS.md` here (what failed before).
2. `vendor/smixs-visual-skills/video/references/dramaturgy.md` §11 shot card + §15 check (skim), `universal-rules.md`.
3. One model file: `vendor/smixs-visual-skills/video/references/kling.md` | `seedance-25.md` | `veo.md`.
4. For keyframe stills of real-looking scenes: `vendor/smixs-visual-skills/image/references/de-slop.md` + `nano-banana.md` or `gpt-image.md`.
5. `vendor/osidemedia-higgsfield/skills/shared/negative-constraints.md` (positive phrasing).
6. Verify every param live: `higgsfield model get <model>`; cost: `higgsfield generate cost <model> …`. Never guess flags.

## Workflow (strict order, no skipping)
1. **Shot cards.** For every clip: job in the story (one line), first frame, single camera move, 1 primary action (+≤2 secondary), light source + direction, three details (environment pressure, micro-action, sound/visual motif), final frame, which seconds the edit will use (usually 1.5–3.5 s of a 5 s clip).
2. **Look lock.** One shared STYLE block repeated verbatim in every keyframe prompt (capture medium, stock, grade, palette, time of day). Name a capture pipeline (35mm colour negative lab scan / handheld cinema camera frame grab), never "photorealistic", "8K", "masterpiece", "stunning".
3. **Keyframes first (cheap).** Nano Banana Pro 2k or GPT Image 2.6 (quality medium for de-slop), 9:16, 2–3 variants per shot (~2–3 credits each). Contact-sheet them, look at every one, pick or fix ONE variable and rerun. People: from behind, backlit, silhouette, or faces soft; hands away from camera; no readable text, numbers or logos on kits.
4. **Image-to-video.** Default **Kling 4.0** image-to-video 5 s 1080p (≈16 credits): prompt 20–40 words, motion only ("Preserve the scene, people, kits and light exactly. Slow push-in. …"). Fast action (tackle, shot): ask for slow motion and speed up in post. Light-beam / environment: Kling 4.0 or Veo 3.1 with start image. Seedance 2.5 only when a start+end frame pair is needed (omni_reference; 80 credits at 1080p, so test at 720p).
5. **Ledger.** Every job → `LEDGER.md` in the project shot folder: shot, model, params, prompt hash/file, credits, result path, verdict (KEEP / BANK s–s / REJECT + reason tag).
6. **Reject check (frame by frame, contact sheet every 0.25 s).** Hands/fingers · feet sliding · ball size/contact/teleport · faces in 2nd half · cloned/extra people · fence/net mesh warping · text/numbers/logos · flicker · backwards motion · melting at frame edges · physics (ball must leave the foot on contact). One bad frame inside the used window = REJECT; clean seconds elsewhere can be BANKED as inserts.
7. **Post (same for every clip).** Upscale only if needed → neutral correct → ONE grade (shared LUT/curve) → slight handheld drift on locked shots → grain last (fine, 2–4 %). Use the cleanest 1.5–3.5 s, cut within 4–8 frames of the motion peak, speed-ramp slow-mo.
8. **Budget.** State the plan's credits before spending (keyframes + i2v + 1 retry per hero shot). Keep ≥15 % reserve. Stop and report before exceeding the plan.
9. **Lessons.** After review, add one dated line per new failure/fix to `LESSONS.md`.

## Prompt templates
**Keyframe (Nano Banana / GPT Image):**
`[Capture: a frame grab from 35mm colour negative cinema footage, lab scan.] [Shot: <size>, <lens>, <height/angle>.] [Subject + action frozen mid-moment, people from behind/backlit, faces not readable.] [Setting: <foreground / middle / background>, worn real details located: …] [Light: <source>, <direction>, <colour temperature>.] [Look: STYLE block.] Absent: text, logos, sponsor marks, numbers on shirts, extra people, glossy skin, HDR glow.`

**Image-to-video (Kling 4.0):**
`Preserve the scene, people, kits and light exactly as in the image. <One camera move, speed>. <Primary action, physical verbs>. <1 secondary motion: dust / hair / flag / haze>. <Tempo: real time | slow motion>. Natural handheld micro-movement. Everything stays photographic.`

## Hard rules
- A brand's own rules override this skill unless the user waives them for a film; record any waiver in LESSONS.md and the project decisions file.
- Minors: never identifiable faces (back, silhouette, out of focus).
- Never generate text, maps, phones, UI or logos with AI: those are motion graphics on top.
- Real places (e.g. a famous lighthouse) are approximations: use image-to-video from a licensed real photo when fidelity matters, or keep it a silhouette and label it illustrative.
- Never claim a clip is good from a finished job: look at frames.

## Lessons learned
See `LESSONS.md`.
