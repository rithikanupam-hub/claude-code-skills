---
name: storytelling
description: Research and write narrated stories for videos and films, routed by story type. Types are educational/history, AI news, under-the-hood teardown, tips/list reel, product or use-case explainer (incl. honest founder test), office scene film, investor/pitch film, brand/origin story, and data story. Each type has its own playbook (shape, hook angle, ending, how much we may sell) on top of shared rules (research with NotebookLM, plain spoken sentences, cold-listener and simulated-viewer tests, scored hooks, sourced facts, voice gate). Use before any narrated video or film, or when the founder says "write the script", "tell the story", "storytelling", "hook", "research this topic", "make it informative", "investor film", "explainer of the app", "brand story", "data story", "tips reel", "make people keep watching" or "we don't have a good script". Not for carousels (carousel), LinkedIn text posts (linkedin-post-writer) or website copy.
disable-model-invocation: true
---

# Storytelling

Every film tells one story to one audience, and every fact in it is true and sourced. *What kind* of story it is decides the rest: its shape, where the hook comes from, how it ends, and whether we may sell. So step 0 picks the type, and the type's playbook in `types/` adds to the shared rules below. It never replaces them.

## Step 0: pick the type (router)

Pick **one primary type** from the request, the context card (content-next) or the project. If two types fit equally well, ask the founder one question naming the two. If the request needs two jobs that clash (teach *and* pitch), it's two films (shared rule 1).

| Type | Pick when the founder says / the project is | Viewer at the end | Selling | Playbook |
|---|---|---|---|---|
| **Educational / history** | "tell the story", a real event, a myth, research, a documentary (Georgetown, Nuremberg, Cyberball) | knows something true and surprising, repeats it to a friend | never; brand on the end card only | `types/educational.md` |
| **AI news** | "latest news", something that happened in the last 2 months (agents said sorry, model race) | knows what happened, when, and why it matters to them | never | `types/news.md` |
| **Under-the-hood teardown** | "how does X work", reverse engineering, "under the hood", a mechanism (phone tilt, REA teardown) | understands the hidden mechanism behind an everyday action | only as the founder's stance, kept short | `types/teardown.md` |
| **Tips / list reel** | "top things to keep in mind", checklist, "5 tips", tests to run | has a list they can use today, and saves it | keyword ask for the full list | `types/list.md` |
| **Product / use-case explainer** | "explainer of the app", "show how the feature works", a demo, a use case, our own results, an honest test (Footura, badge, AI receptionist, SEO Mission Control) | saw the product work for someone like them and knows the next step | yes: product on screen, one CTA | `types/product.md` |
| **Office scene film** | a fictional everyday situation, "the second job", no narrator lecture | recognises their own team in it | at exploration level only | `types/scene.md` |
| **Investor / pitch film** | "investor film", "pitch", a deck film | feels "this grows, and I want in" without being told | yes, but shown, not said | `types/pitch.md` |
| **Brand / origin story** | "brand story", "our story", the founder's why, a signature line ("You against you") | knows what we believe and why it's true for them | brand line only | `types/brand.md` |
| **Data story** | "data story", "show the numbers", real match or product data (SoccerTrack) | gets one number and what it means for one person | none, the data is the hero | `types/data.md` |

**Hand off instead of writing here:** a carousel goes to `carousel`, a LinkedIn text post to `linkedin-post-writer`, website sections to the website process (`marketing/website/`, legal → plan → animated demos). Topic and context card come from `content-next` first. The hook is written in `hook-scale`. The build goes to `motion-director` or `video-creator`.
**Structure inside the type:** when a context card exists, the frame (dopamine loop, Story Circle, StoryBrand, Strategy Story…) comes from `content-next/frames.md` §A. Each playbook names its default frame for when there's no card.

## Always first
1. Name the type and open its playbook in `types/`.
2. Read the project's rules: its brand book, decision file and any brand/video gate it keeps. If the project has none, ask for the brand rules and decision file.
3. Read `craft.md` (5-line blueprint, but/therefore, rhythm, 4 S hooks, triple hook, lock-in zone, endings), `loop.md` (dopamine loop) and `research.md` (NotebookLM pipeline + rules from runs).

## The steps (every type)

| # | Step | Output | Gate |
|---|---|---|---|
| 1 | Topic | 3 candidates where our world, a surprising truth and the viewer's life meet; each with its question, why the audience cares, its "wait, what?" line (drop any that doesn't pull), optionally scored /30 (freshness, discussion, character, quotable line, LinkedIn fit, Instagram fit) | **founder picks** |
| 2 | Research | NotebookLM notebook + `research/dossier.md`, all sourced (`research.md`) | none |
| 3 | Find the story | `story.md`: the type's spine fields (see playbook), 5-line core, **last line written first** | none |
| 4 | Script | `script.md` (format below). Only a hook that passes `hook-scale` (16/20, no hard fail) enters the script | **founder approves** |
| 5 | Tests | cold listener → simulated viewer → story check → critic ≥ 8 | none |
| 6 | Voice and timing | hook takes → founder picks by ear → full voice → `words.json` (`voice.md`) | **founder hears it** |
| 7 | Hand-off | script, voice and words to the build skill | none |

Files: `<project>/marketing/video/<name>/story/` → `topics.md`, `research/dossier.md`, `research/nlm/`, `research/originals/`, `story.md`, `script.md`, `script_lines.txt`, `critic.md`, `voice/`, `words.json`.

## Shared writing rules (all types)
1. **One film, one topic.** A second "but" that exists only to reach a product or another topic is a second film.
2. **Clarity first.** Complete, plain sentences a first-time listener follows at speed: subject, verb, what happened. One idea per sentence. No telegraphic fragments, no source jargon, at most one verbatim quote per film, explained in plain words. Rhythm comes second.
3. **Time order, actor named** in every sentence ("Tsuda sued", never "he sued"). Say what moved and how it was measured ("ranked high → fell down the results → climbed back"), never "dropped" alone.
4. **One meaning per line.** No line can be heard as both sarcastic and literal, and no unclear it/its/they.
5. **Lead with the most informative fact.** Line 1 is a hook (stakes plus a twist), never background. For a myth: state the myth plainly in line 1, deny it in line 2, then explain in time order with ≤ 3 supporting facts.
6. **Mechanisms and experiments in steps.** Show the steps in time order, one actor per line, the twist alone on its own line, then the result. Avoid "you think you're…" framing, hidden setups, and a second study that contradicts the first. Name the experiment and plan an on-screen recreation labelled "Recreation · not the original software", with a step-synced simulation table in `script.md`.
7. **Write for the ear.** ≤ 14 words per sentence, many of 2–6. Every sentence has a picture; if you can't name the image, cut the line. Join beats with **but / therefore**, never "and then", and pass the jagged-edge rhythm test (`craft.md` §3). The 2–4 sentences after the hook (the lock-in zone) show proof on screen. Change the pattern every 8–10 s.
8. **Numbers mean something.** Turn every number into what it means for a person. Mark 1–2 **anchor words** per sentence. They go on screen, synced to the syllable (ref5: ~180 wpm, a cut every 1–1.5 s, the project).
9. **Jargon and foreign terms.** Introduce jargon once in plain words, or put it on screen. Replace a foreign term with the source's own plain definition. Exception: for professionals (SEOs, marketers), use the industry's exact terms, with the real screen shown at that word.
10. **Truth.** Every fact is sourced, quotes are matched verbatim to a live source, and inferences are worded as inferences. A number with only one source is attributed out loud ("according to one study"). Paraphrases must not overstate, and placing two beats next to each other must not imply a cause the sources don't state. The founder's own work counts as a source ("we tracked"). Save their evidence (screenshots, exports) in the film's `source/` as the proof shot. Say "we" only for our own work, and ask the founder before crediting others' findings to "we". Never name private people; say "one SEO analyst" and show the source on screen. Never state a contested fact as proven; attribute it, and say the hedge out loud where the doubt matters.
11. **Demo questions are everyday.** No foreign names, places or jargon ("Where's the restaurant?").
12. Run `humanizer`, then re-check every changed line against its source. Count words with a script (≈ 180 wpm), never estimate.

## Tests before the founder sees a script
- **Cold listener:** a fresh subagent hears the narration once and retells it in 3 sentences: what happened, what was surprising, what it means. It also explains any mechanism step by step. If it gets lost, the fix is to **structure**, not wording. Check that the founder can retell the story in one breath.
- **Simulated viewer:** a fresh Sonnet subagent plays the type's audience (playbook) line by line. It gives time, stay or swipe and why, the swipe second, the comment it would leave and a friend summary. Fix every swipe point and misreading, then re-test. Log both runs in `script.md` and label them an AI simulation.
- **Story check** (yes/no per item in `script.md`; any no gets a rewrite): 0 hook options scored (3–5, each scored on the 4 S's with a ≤ 8-word on-screen text and a visual; founder picks before script approval; first line is a hook) · 1 one topic · 2 premises from the brief confirmed · 3 say what moved · 4 one meaning per line · 5 time order, actor named · 6 no unnecessary names · 7 plain first listen · 8 every fact sourced, nothing overstated · **plus the type's own items** (playbook).
- **Critic** (fresh subagent, gets only the script, the dossier, `research/originals/` to grep, this rubric and the playbook; ships at ≥ 8 on every line): hook (4 S's, spoken/text/visual aligned, stakes and question in 3 s) · lock-in zone (proof in 10 s) · but/therefore · rhythm · head fake (does it really surprise? where the playbook requires one) · learning or payoff · accuracy · the loop · ear · **type fit**: does it do the type's job and keep its selling rule? Founder-approved hook lines are marked fixed.

## script.md contains
1. Type, audience, takeaway (one line), 5-line core, triple hook (spoken / text / visual).
2. Script, one sentence per line, **anchors** in bold, `[S#]` after every factual sentence.
3. Beat table: `# | sentence | anchors | picture (own footage / archive / fal still / fal clip / graphic / data chart) | SFX | est. s`. Data shows as a chart or counting number; quotes as on-screen text with the name.
4. Voice direction (from the playbook's default, adapted).
5. Sources: every `[S#]` with link, established or disputed.
6. Test logs: cold listener, simulated viewer, story check, critic.

## Voice gate
See `voice.md`. The founder hears the full narration before any build; never default to the last film's voice. Keep a natural pace (atempo ≤ 1.05) and one voice character. Record hook takes first, in 2–3 voices, and the founder picks by ear. Take word timestamps into `words.json`. That file is the edit's timeline.

## Lessons learned
Rules only, ≤ 25 words. The stories are in `LESSONS_LOG.md`, type-only rules are in `types/`, voice rules are in `voice.md` and research rules are in `research.md`.
- 2026-11-06 (founder): the skill was one the project educational recipe forced onto pitches and product films. Always route by type first.
- 2026-10-03 (founder): run the story check and record yes/no before showing any script.
- 2026-10-01 (founder): never write to beat the critic's rhythm rubric at the cost of clarity. A cold listener beats a critic.
- 2026-10-04: extra frames and the STORY check live in `content-next/frames.md`. Don't duplicate them here.
