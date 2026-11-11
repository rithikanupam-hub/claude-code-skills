---
name: kinetic-phrases
description: Narrated-video captions as motion graphics with meaning, the "Livestream Guardian / the project v12" grammar. Every spoken sentence appears on screen in chunks of max 4 words, popping on the spoken word; key words are big and act out what they mean (GRANDI grows, VISTI gets the tracking box, PROGRESSI climbs, the O of PERCORSO rolls away as a ball); phrases turn into drawings made of their own words (checklists that tick, receipts, flags on a growth line, a spotlight finding a player, a grid of names, one full-colour beat). Use when the user says "the phrases are missing", "words with meaning", "like the Scrapbook / Livestream Guardian reel", "like v12", "kinetic type", "captions as graphics", "make the words visible", or for any narrated film or reel with on-screen text.
---

# Kinetic phrases

The words on screen are part of the picture, not subtitles. The viewer reads at most four words at a time, sees each word land when it is said, and sees what the key word means through how it moves or what it draws.

Approved by the user on v19 (9 Nov 2026): "the animation that you've set for the video, it is proper. I think it is very good" — after asking for "max 4 words at a time" and "the writing should have a meaning … a flag, the size, the way it is turning into a ball".

For the whole film pipeline (voice, full frame, data graphics, render, mix, checks) see `example-narrated-film`.

## References (look before building)
- **Livestream Guardian** (Scrapbook / Reel Maker project): `~/Reel Maker by celestiee/Videos for editing through Scrapbook/output/livestream-director-v8-high-quality.mp4`. Soft small words + big condensed words; hand-drawn wavy underline under the key word; a checklist ("phrases you'll hit ○ …") whose circles fill with ticks one by one; full-colour ground beats.
- **Working implementation**: `motion-v6/index19.html`: `SENTS` (script sentences aligned to Soniox words), `PCFG` (per sentence: lime word, position, `ch` chunk sizes), `FXW` (word → effect), `wordFX()` (the effect library), `renderPhrases()`, `gfx()` (phrase graphics). Copy from there.

## Rules
1. **Every spoken sentence is on screen.** Use the script's words, not the ASR's (Soniox drops and merges words); take the timing from ASR, aligning script words to ASR words in order.
2. **Max 4 words at a time.** Split each sentence into chunks of ≤ 4 words at natural phrase breaks (write the chunk sizes per sentence, e.g. `ch:[3,2,3]` for "Perché ogni partita / può diventare / un'opportunità per crescere."). Never leave one soft word alone. Also split titles, signatures and big statements (no 6–9-word blocks).
3. **Each word pops on its spoken time** (spring up, ~0.3 s); the chunk swaps in 0.1 s; the panel behind a sentence fades only at its start and end.
4. **Hierarchy:** soft words small (wide 700); key words 2–2.5× (condensed italic 900); one lime word per sentence with a hand-drawn wavy underline that draws itself.
5. **Key words act out their meaning** (pick the literal picture of the word):
   - size words → `grow` (GRANDI); edge/far words → `edge` / `far` (PERIFERIA, LONTANO)
   - seen/visible → `seen`, the brand's tracking box snaps on (VISTI, VISTO)
   - place → `pitch` lines drawn round the word (CAMPO); here/where → `pin` drops with a ripple (QUI)
   - build → letters drop and stack (COSTRUIRE); digital → `decode` from scrambled glyphs (DIGITALE)
   - connect → `node`: lime nodes under the words linked by lines (COLLEGARE · CAMPI · ITALIA)
   - zero/no cost → `strike` through the word (COSTI); identity → `badge` frame with an ID tab
   - rewatch → `rewind` ghosts + ◀◀ (RIVEDERE); progress/grow → `stairs` / `rise` letters climb (PROGRESSI, CRESCERE)
   - share → `share` copies fly out (CONDIVIDERE); spotlight → `spot` beam lights the word (RIFLETTORI)
   - impact → `impact` shake + ring; lift → `lift`; the thing that "should not be" the goal → `drop` (rises then sinks grey: COPPA); secondary → `fade` grey + shrink (RISULTATO)
   - ball words → `ball`: a letter turns into a ball and rolls away (PALLA?, PERCORSO)
   - the peak word → `hero` burst + rings, on a full-colour ground for ~1.5 s
6. **Phrases become drawings made of their own words** (one per section, facts sourced): a checklist whose circles fill with ticks (product pillars from the deck); a receipt that adds up (€0 · €0 · totale €0); flags on the growth line labelled with the spoken words; a spotlight sweeping real footage and the box locking on a player; a two-column "the result shrinks / the growth rises"; a grid of the 22 real shirt numbers that all turn lime on the peak word; a names-with-photos card for people.
7. **Brand first:** the reference's motion grammar, never its fonts or colours. the project: Archivo only on the canvas (no serif: a reference's soft italic becomes Archivo wide 400/700 smaller), ground #2B3A44, lime #C4F135 as the signal, grey #E9EBED type; run `brand_fonts_check.mjs` on both layouts.
8. **Positions:** lower third on a translucent ground panel over footage; beside the phone in app beats; top over charts; 9:16 has its own sizes (base ~52 px, key ~112 px, ≤ 1000 px wide, wraps inside the chunk).

9. **Focus beats:** 3–4 times per film a chunk of 1–2 words takes the whole screen (huge, centred, plain ground, overlays hidden, hold ≥ 1 s; the next chunk waits). In index19.html: `PCFG[i].focus:[chunk index], hold:s`. Everywhere else the frame is full (footage + explaining graphic).

## Steps
1. Get the script sentences and the voice's word timings (`cues*.js`).
2. Write `PCFG` (lime word, position, chunk sizes) and `FXW` (key word → effect) for every sentence; choose one phrase graphic per section from rule 6 and source every number on it.
3. Render stills at each chunk's middle in both layouts and look: no chunk > 4 words, nothing overlapping or clipped, every effect readable at phone size.
4. Font gate both layouts, then the full render; contact sheets at 1 s.
5. After feedback, add a dated line below.

## Lessons learned
- 2026-11-09: full sentences as lower-third subtitles read as "bundled, missing"; plain word pops without meaning missed the point; the user pointed at v12 and Livestream Guardian. Max 4 words + meaning effects + phrase drawings was approved. Write chunk sizes by hand: greedy 4-word splitting cut "un'opportunità / per crescere" and left "palla?" alone.
- 2026-11-09: a precedence bug (`a+b+PORT?160:260`) sent the ball the wrong way; bracket ternaries inside arithmetic.
- 2026-11-09 (v19H check): in 9:16 the key word wraps under its soft words, so any effect that moves letters UP (rise, stairs, lift) collides with the line above; in portrait make it climb inside its own line (origin top). Labels at the right end of a chart: anchor them `end`, or 9:16 clips them.
- 2026-11-09 (v19H reel): the caption is not the only thing on screen; in 9:16 the footage must sit against the caption and the leftover space must carry an explaining graphic (pitch, ball, tracking). See example-video PRINCIPLE 27.
- 2026-11-09 (v19H): `wordFX` reset every effect word's opacity, so effect words showed before they were spoken; keep them hidden while u<0.
