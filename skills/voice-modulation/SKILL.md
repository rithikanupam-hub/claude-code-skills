---
name: voice-modulation
description: Decide where the voice lifts and where it stays plain in any narrated video, record it that way and prove it with a measurement before anyone listens. Works on ElevenLabs (eleven_v4), Gemini 3.8 TTS and Fish Audio; used for the project and the project films. Score first (max 3 lifts, everything else plain), one whole take, lift_check.py, then the founder's ear. Use for any narration, voice direction, "the voice is flat", "weird modulation", "too emotional", "what emotion are we giving", "modulation", "takes", "change the voice", or when pacing, pauses, emphasis or emotion affect the film; not for live speech translation or audio branding strategy.
disable-model-invocation: true
---

# Voice modulation for video

Make the spoken performance carry the story and remain easy to understand on a phone. Use this inside `motion-director` / the video pipeline (WORKFLOW.md step 6); the film's approved script and creative direction stay authoritative. For the project work, read project `DECISIONS.md` and `marketing/video/WORKFLOW.md` first. **Narration uses Gemini and Fish, each for its job** (founder, 2026-10-07; replaces Fish-only of 2026-10-06), see the routing table below. Commands and past measurements are in `~/.claude/skills/storytelling/voice.md`; verify model behaviour against docs.fish.audio before relying on a tag or setting.

## The procedure (every narration, every engine)
The founder's rule (2026-11-10): "where emotion is there we use it, where it is not required we keep it okay-ish, not so emotional." Plain is the default; a lift is the exception.

1. **Lift map before any recording.** Write `voice/voice_score.md` with the table from "Score the script" below, then mark the lifts:
   - One narrator character for the whole film, written in one sentence (e.g. "a good coach telling a true story to parents").
   - **At most 3 lifts per 60–90 s** (1 per 30 s). A lift is a line where the meaning turns: the value statement, the relief, the promise. Each lift has a kind: **up** (brighter, fuller, louder) or **land** (slower, firm, each word set down).
   - Every other line is **plain**: same character, conversational, no tag. Lists, features, numbers and names are always plain. Names (places, people, the brand) are never whispered.
2. **Budget gate (paid engines).** Before the first call: characters × takes × engine rate, against the balance, and tell the user the number. ElevenLabs eleven_v4 measured 2026-11-10: ~3.5 credits per character (a 900-character narration = ~3,100 credits per take; a Starter month is 40,000). Plan **1 casting round (5 voices × ≤350 characters) + 3 whole takes + 3 re-directed takes**; ask before going past that. `elevenlabs user get` lags, so count your own calls.
3. **Record the whole narration in one call**, 3 takes. The text carries **one baseline tag at the start** and **one tag at each lift**, nothing else; blank lines between scenes, `...` for a beat. Never record scene by scene with a tag per phrase: an 11-scene film with 2–3 tags per scene, and per-line "big pitch movement", both came out oversold and were rejected.
4. **Measure where the voice went** (needs `<take>.words.json` from Soniox and a `phrases.json` listing every phrase with word indexes and `"lift": true` (up) or `"lift": "land"`):
   ```bash
   cd "Open Conversation" && lingosync/.venv/bin/python ~/.claude/skills/voice-modulation/scripts/lift_check.py take.wav take.words.json phrases.json
   ```
   Done = every lift prints `LIFT OK`, at most 1 plain phrase prints `OVERSOLD`, word count equals the script, no tag words in the transcript. Template: `<project>/marketing/video/...` (score, tts_script_c.txt, phrases.json).
5. **Re-direct only what failed, then re-take whole** (max 2 rounds, then show the founder the best take with its table):
   | Measured problem | Change that worked (eleven_v4, 2026-11-10) |
   |---|---|
   | An **up** lift comes out lowest/quietest | Soft tags pull the voice down: `[with quiet relief]`, `[fuller, heartfelt]` failed. Use `[brighter, rising, with joy]` or `[louder, full voice, with conviction]` and end the sentence with `!` |
   | A **land** lift is rushed | `...` before each landed word, one word per sentence, tag `[firmer]` |
   | A plain list or feature line is oversold | `[plainly, listing]` or `[calm, thoughtful]` before it |
   | Voice sinks through the last third | Put the last lift's tag on the sentence itself, not on the line before |
6. **Founder hears audio before the picture is rendered.** Hand over the chosen take placed on the film timeline (voice alone and with music) with the lift table, say that numbers are not a listening claim, and render only after the take is chosen (or in parallel if a render is free).
7. **Timing comes from the chosen take.** Cut it per phrase at the quietest point between words and place each phrase on the timeline; where the picture hits a word (a title, a flash), anchor the phrase on that word. Move the picture to the voice; never speed the voice up.

## Which engine for which job (founder 2026-10-07)
| Job | Engine | Why |
|---|---|---|
| Main narrator with energy, comedy, "telling a friend" | **Gemini** `gemini-3.8-flash-tts` (Charon, Fenrir) | Acts the `style` direction; blind A/B 2026-10-07: modulation 8–9 vs Fish Jordan 2 |
| Calm documentary narrator | **A/B both** | Fish deep voices worked on Tokyo; judge by ear |
| Accents, character voices (Japanese, Italian, an "AI voice") | **Fish** | Big library; Gemini has few accents |
| Italian narrator for us (native voice, founder picks by ear) | **ElevenLabs** `eleven_v4`, CLI `elevenlabs text-to-speech convert --voice-id <id> --model-id eleven_v4 --language-code it --text "…" --output take.mp3` | Fish library voice was heard as "Argentine" and tags did not widen its range (2026-11-10); 5-voice casting on the film's own lines, founder chose GianP `SpoXt7BywHwFLisCTpQ3` |
| Founder's own voice | **Fish clone** or the founder's real recording | Gemini cannot clone |
| Word check / timestamps · cold listener | Soniox · Gemini listener | unchanged |
One narrator stays on one engine for the whole film; mixing engines is for different speakers only. Every film: hook takes on both engines, a blind shuffled Gemini A/B (`marketing/video/_tools/kept-scripts/gemini_ab_compare.py`, run twice with different seeds), then the founder's ear. Gemini recipe and tag list: `storytelling/voice.md` → "Directed Gemini recipe" (delivery in the separate `style` field, only documented `<laugh> <short pause> <long pause>` tags inline; grep Soniox for tag words). Script: `motion-director/scripts/tts_gemini_directed.py --model gemini-3.8-flash-tts`.

## Fish Audio (s2.1-pro): how to direct it
Checked against docs.fish.audio on 2026-10-06; re-check when a tag misbehaves.
- **Direction = free-text tags in square brackets inside the text**, e.g. `[curious]`, `[emphasis]`, `[soft tone]`, `[whisper]`, `[break]`, `[long-break]`. At most **3 tags per sentence**; a tag serves a meaning change, never decoration. Put the tag right before the words it changes.
- **Write the intent first, then the tag.** For each line fill the score table below (listener's thought, delivery shift, focus word, boundary), and only then translate it: a reveal → `[emphasis]` on the focus word + `[break]` before it; a confession → `[soft tone]`; a question the viewer should feel → `[curious]`. Save both: `story/voice_score.md` (intent) and `story/fish_script.txt` (text with tags).
- **Takes vary by direction, not by temperature.** The 3 hook takes are 3 written directions (for example "tell one friend what surprised you", "documentary narrator, certain", "quiet confession"), same `temperature`. The founder picks a direction; the full narration follows it. Temperature (`0.7` default, with `top_p`) is only for re-rolling one failed line.
- **Speed:** `prosody.speed` 0.5–2.0 exists; stay at 0.95–1.05. Never fix pace with speed-up; fix the words or the breaks.
- **Names and numbers:** add a pronunciation entry for every proper name and non-English word before the first take; keep `normalize` on so numbers and dates are read out. Check both with Soniox word match.
- **Spoken-tag bug:** a tag outside brackets, or a bracket the model doesn't know, can be read aloud. The Soniox transcript must contain no tag words; if it does, the take is rejected.
- **Judge by genre.** A documentary take is judged for clarity and fitting emotion; a comedy take for timing. wpm, gaps and pitch range are diagnostics that flag a take for a listen; they are never a quality score.
- **Before the founder hears anything:** wpm and gaps (`voice_vibe.py`), pitch range, Soniox word accuracy against the script, loudness, then a Gemini listener ranks the takes and flags flat or misread lines. The founder's ear stays the final gate; our job is that nothing bad reaches it.

## Score the script before recording

Read the whole script aloud against its picture and runtime. Fix unclear words or crowded ideas in the script before trying to rescue them with delivery. Mark each spoken line with:

| Line / speaker | Listener's thought or feeling | Delivery shift | One focus word | Boundary or handoff |
|---|---|---|---|---|
| exact approved text | what changes here | e.g. curious → certain; brighter → intimate; brisk → deliberate | word to stress by pitch, duration, or articulation | where the thought ends, the picture needs room, or another speaker enters |

Use a **change** when the meaning changes: new information, turn, reveal, punchline, quote, question, number, or conclusion. Give a narrator a stable character across the film; vary the moment within it. Let humor come from the written situation and timing. Do not force a low pitch to sound authoritative, a wide pitch range to sound lively, or a smile through a serious line.

Aim for conversational clarity at the pace the film needs. Treat WPM as a measurement of a take, not a universal target. Place pauses at clauses, sentences, reveals, and visual handoffs; preserve enough space for the listener to parse and the viewer to see. Shorten dead air only after listening. Never remove every breath or pause, and do not set a mechanical maximum gap across all formats. For multilingual or dense material, test comprehension with a listener unfamiliar with the script.

## Direct and select takes

Give a human performer or TTS engine the line's intention and context, not just an emotion label. Offer a speakable direction: “tell one colleague what surprised you; land **changed**; leave room for the screen before the next line.” A light markup such as `↑` for lift, `↓` for landing, `/` for a small boundary, and `//` for a larger transition can guide a human read; the marks are directions, not spoken text or engine-neutral syntax.

For TTS, use Fish's control format above. Keep the exact spoken text separate from style instructions where the API supports that. Generate short representative hook takes and compare them at matched loudness. Choose by listening for intelligibility, emotional fit, pronunciation, natural phrasing, and stable speaker identity. In the project, the founder picks the narrator by ear from hook takes and hears the full narration before the video build, as recorded in the project workflow.

If one whole take stays expressive and coherent, keep it. If a chapter fails, reroll or record that chapter with a clear local direction, then join only at a natural boundary. Avoid changing tempo or pitch to manufacture energy; local founder feedback found heavy time stretching and section stitching unclear. Keep different speakers and real product audio identifiable, with enough space between turns.

## Listen to the finished voice

1. Listen once without reading the script. Retell the point, note misheard words and the first moment attention drops. Repair text or performance before polishing sound.
2. Compare the final audio with the approved script and transcript: missing or added words, spoken TTS tags, names, numbers, language, speaker changes, and question or conclusion intonation.
3. Listen with the picture, captions, music, effects, and real dialogue at phone volume. Confirm the important word lands with the visual; music never masks it; the ending has an audible tail. Use word timestamps from the **selected final audio**, not a draft.
4. Save the score, chosen takes, final audio, transcript/timings, and any substantive listening finding with the video. Hand the film timing to `motion-director` step 4b from that final audio.

For the research behind these choices and its limits, read [evidence.md](references/evidence.md) when changing a performance rule or explaining one. Its numbers describe particular studies, not production presets.

## Lessons learned
- 2026-10-27 (trust-but-verify-1987): founder named the engine up front ("make this in Fish studio audio"). When the founder picks an engine, skip the cross-engine A/B and do the 3 hook takes as 3 written directions on that engine. Fish Audio Studio (the fish.audio web app) is the path when API credit is empty: either the founder generates there, or the assistant drives it in the founder's browser. Save each take in story/voice/ with its exact text and settings.
- 2026-10-20 (before-ai-builds v3, founder: "make it the best"): splicing a newly voiced hook line onto an old take sounded like two sessions (blind seam 3–6/10) even after loudness and EQ matching, because the hook was acted in a different style. Re-recording the hook together with the rest of its chapter in one take (same model, voice and base direction, plus per-line notes for the hook) moved the seam to an existing chapter boundary (7–8/10). Re-voice to the next natural boundary, never a single line.
- 2026-10-20 (rea-teardown v7): a one-sentence splice passed the seam test (1–2/10), but swapping a whole 30 s second half failed on every take (9–10/10) even on the same model and voice: each take sets its own mood. When more than a sentence or two changes, re-record the whole narration in one take and let the founder re-hear it.
- 2026-10-19 (rea-teardown): gemini-3.8-flash-tts has a 100 requests/day cap on Tier 1; a day of hook takes, full takes and re-takes used it up. Count requests before a session and keep a few for late script changes. Gemini 2.5 Pro 'Puck' is not the 3.8 'Puck': spliced onto a 3.8 take, the blind seam test scored it 10/10 obvious ('deeper, different narrator'). Never mix model versions inside one narrator.
- 2026-10-19 (rea-teardown): one approved Gemini line had to change after the founder's OK. Re-voiced lines 7–9 in context (3 takes, same direction), spliced only the changed line at measured pauses, gain-matched by LUFS, then ran a blind Gemini seam A/B in both orders: one take scored 1–2/10 audibility, another 9/10 (proximity/EQ shift). Always A/B splices both orders; take-to-take timbre varies more than the transcript shows.
- 2026-10-07 (ai-acts-too-early, founder: "The voice does not have any character like we used to have from gemini did you realize that?"): I sent plain library voices (Ethan, light tags) as "recommended" although the Gemini listener had already rated them flat (energy 4–6). A flat screen result is a stop sign, not a footnote: say so before the founder listens. 11 Fish voices on s2.1-pro-free, including all official ones (Adrian, Ethan, Hannah, Jordan, Laura, Sarah, Jax), never got past energy 6. Exaggerated tags ([panicked], [laughs], [devastated]) raised energy a little but caused misreads ("Grome", "Nilan", "won in Milan") and an extra "no no", so re-check every word against the approved line. Founder chose the best Fish take for now (Jordan, exaggerated) over cloning their own voice or a Gemini exception. Next time, offer a founder voice clone earlier.
- 2026-10-07 (tokyo-voice-ruling v3, founder: "oldman d1 is the best, but there is no modulation, this should be a little exaggerated comically"): a plain 'certain documentary' direction on a deep accented Fish voice came out flat (Gemini modulation 4/10, pitch spread 8.3 st). Per-phrase free-text tags ([dramatic pause], [whispering], [deadpan, very low], [suspicious], [rising, curious]) lifted it to 7/10 and 11.1 st with the accent kept. A 'deadpan comedian' line-level persona with interjections (None! / Hmm.) got the best comic timing but erased the Japanese accent (2/10): strong persona tags can override the base voice's accent, so re-check the accent on every directed take.
- 2026-10-07 (tokyo v3, founder: m2 "nice, but shouldn't it be a little fast?"): the deep 'old man' Fish voice reads at ~105–110 wpm. [break] removal + speed 1.05 + silence tightening saved only ~1.5 s of 23 s; Fish's native prosody.speed is not linear (1.15 → 19.8 s, 1.25 → 19.4 s) and at 1.25 the first words 'No money' were heard as 'Nanami'. A 'sigh' tag was read aloud in one take (f5): keep Gemini/Soniox tag checks on every take. Speed above 1.05 is the founder's call, offered as an A/B.
- 2026-10-07 (ai-acts-too-early hook, founder: "why is the modulation not proper… try the same configuration with Gemini voice"): with the same words and the same exaggerated direction, a blind A/B (2 shuffled runs) ranked Gemini 3.8 Charon and Fenrir far above the best Fish library voice (Jordan: modulation 2/10, "flat, robotic"; Charon 8–9). Fish s2.1-pro-free library voices take a direction as a light hint because each voice is cloned from a fixed reference clip. Gemini's style field directs the whole performance. When a film needs comic or energetic acting, run a Gemini A/B before settling on Fish; Fish is still the pick for accents and character voices. Script: marketing/video/_tools/kept-scripts/gemini_ab_compare.py.
- 2026-10-15: Gemini Sulafat stressed "Futoora" as Fu-TO-ra; a TTS-only respelling "Futùra" (captions keep Futoora) fixed it, confirmed by the Gemini listener. When reusing approved takes with new ones, gain-match by LUFS and run Soniox on the assembled WAV; ASR noise ("In 2 minuti", merged "Poi il") still needs an ear, not a re-take.
- 2026-10-20 (real-ai-receptionist): Gemini 3.8 flash TTS has a 100 requests/day Tier-1 cap (429 for ~13 h) and the Fish API credit ran out; fall back to gemini-2.5-flash-preview-tts (2.5 pro timed out twice). Preflight both before a takes round. The 'leaning in, conspiratorial' direction won the blind listen for a 'she isn't real' reveal; 'documentary' read as announcer-like. words_soniox.py must run from Open Conversation/ (it reads lingosync/.env).
- 2026-10-25 (carter-poland-1977, Charon 3.8): never cut silences from Soniox word timings; Soniox gave some words a 0.06 s span and the cut clipped "people" (both blind listeners heard "Polish pee- carnally"). Cut only real silence (silencedetect), and re-check clips against the raw take. 3.8 Charon's natural pauses were already short (−45 dB saves 0.4 s on 86 s); a long narration is a script-length question, not an edit. The Gemini 3.1 pro listener sometimes answers from a transcript without hearing the audio ("cannot hear"): with three ~1.3 MB stereo MP3s, 2 of 5 runs did. Send mono 64k files and discard any run that says it can't hear. Homophones in a hook ("Poles" → "polls") were misheard in every take and by Soniox; no delivery fixes that, so take it to the founder as a script choice. Fish API credit was empty again (402): preflight it before planning a both-engines A/B.
