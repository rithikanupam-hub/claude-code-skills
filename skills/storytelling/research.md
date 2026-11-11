# Research pipeline (NotebookLM via `nlm`)

The `nlm` CLI (v0.7.2) is installed. The research account is the default profile `<profile>` (switched 2026-10-01; the old account `default` has hit its notebook limit, so don't create notebooks there). Check it with `nlm login --check`. If that fails, run `nlm login --profile `<profile>` and the founder signs in, in the Chrome window `nlm` opens (not their normal Chrome).

**Local patch:** Google moved this account to `notebook.google.com`, and nlm 0.7.2 only accepted `notebooklm.google.com`, so login never finished. `notebooklm_tools/utils/cdp.py` `_is_notebooklm_url` was patched to accept `notebook.google.com` (backup `cdp.py.orig` in the uv tool folder). An `nlm` upgrade undoes this; re-apply it if login hangs at "Waiting for sign-in". Never copy session cookies by hand. **Third patch (2026-10-03):** signed-out users are now sent to `notebook.google.com/login`, which the login check took as signed in (it saved 1 cookie and closed Chrome). `cdp.py` `is_logged_in` now returns False for paths starting with `/login`. If `nlm login` times out on `Runtime.enable`, the profile's debug Chrome (port 9223, `chrome-profiles/<profile>`) is still open with a hung tab: open a fresh `notebook.google.com` tab and close the others through CDP (`Target.createTarget`/`closeTarget`, `suppress_origin=True`), then run `nlm login --profile `<profile>` again; it reuses that signed-in Chrome (69 cookies). **Second patch (2026-10-01):** the session cookies are now host-only for `notebook.google.com`, so API calls to the old host fail with "Authentication expired" even right after a successful login. `notebooklm_tools/utils/config.py` `_ALLOWED_BASE_HOSTS` now includes `notebook.google.com` (backup `config.py.orig`); **prefix every command with `export NOTEBOOKLM_BASE_URL=https://notebook.google.com;`** (the MCP server needs the same env var). Get the full docs with `nlm --ai`. NotebookLM answers only from the sources in the notebook, which is why we use it: every answer has citations.

## 1. Create a notebook and collect sources
```bash
nlm notebook create "VS story: <topic>"          # note the ID; alias it with: nlm alias set <name> <id>
nlm research start "<topic question>" --notebook-id <id> --mode deep   # deep web, about 5 min
nlm research status <id>                          # poll; then:
nlm research import <id> <task-id>                # import all, or --indices 0,2,5 for the good ones
nlm source add <id> --url "https://..." --wait    # add primary sources yourself
nlm source add <id> --url "https://youtube.com/..." --wait   # talks, lectures, documentaries
nlm source add <id> --file paper.pdf --wait       # papers and books
nlm source list <id>
```
Aim for 10–25 sources with a mix of kinds: academic (papers, university pages), primary (archives, original documents, first-hand accounts), data (UNESCO, Ethnologue, surveys, official statistics), thinkers (philosophers, linguists, their talks) and journalism (long reads). Drop content farms, AI-written listicles and sources without authors. Don't add competitors' marketing.

## 2. Run the standard question set
Run each question with `nlm notebook query <id> "<question>" --json > research/nlm/q<N>.json`:
1. What are the most surprising, counterintuitive facts in these sources? For each: the fact, which source, and how solid it is.
2. What do most people wrongly believe about <topic>, and what do the sources show instead? (This is where head fakes come from.)
3. Who are the real people in this story (names, roles, dates), and what did each of them risk?
4. Give every number, statistic or date in the sources, exactly as stated, with its source and year.
5. What do philosophers, linguists or researchers say this means for how humans understand each other? Give direct quotes with their speakers.
6. Where do the sources disagree or say the evidence is weak?
7. What is the single most important insight a working professional should take from this?
8. What is the timeline of key moments?
9. Which vivid details (objects, places, sounds, scenes) would make this visual?
10. What open question do the sources leave unanswered?
Ask follow-ups with `--conversation-id` wherever an answer opens something promising.

## 3. Write `research/dossier.md`
Sections: **Facts** (numbered `S#`, each with the claim, source title and URL, year, and whether it's established or disputed), **Numbers**, **People**, **Quotes** (verbatim, with speaker and source), **Misconceptions → truths** (head-fake candidates), **Insights and philosophy**, **Visual details**, **Open questions**, **Weak or disputed**.
Checks before the dossier is used:
- Every number has two independent sources, or it's marked as a single source.
- Open the original source for every quote and every number that goes into the script. NotebookLM citations point to the passage, so read it.
- Nothing in the script may come from anywhere other than the dossier.

## Optional
- `nlm audio` makes an audio overview. It's useful for the founder to listen to the topic quickly; it's never used in our video.
- `nlm report create` makes a briefing document, which is a good cross-check of the dossier.
- **Research always runs in NotebookLM** (founder, 2026-10-01). If `nlm` auth fails, ask the founder to sign in (`nlm login --profile `<profile>` --clear` opens a fresh Chrome sign-in) and do only non-research work meanwhile. Downloaded originals go *into* the notebook as sources (`nlm source add --file`); a subagent dossier is a verification aid, never a replacement. Other research tools only with the founder's explicit OK.

## Fresh-news stories: how to choose sources and questions (founder asked for this to be kept, 2026-10-02)
Use this for topics from the last days or weeks (the founder's freshness rule). Deep research often returns 0 sources for news this new, so seed the notebook yourself.
1. **Find the chain back to the primary source.** Start from the news hits (agent-reach/Exa, web search). In each article, look for the link to the original (the company's own blog post, the Reddit thread, the court filing, the press conference). Example: TechCrunch's text held `openai.com/index/how-we-will-do-better-for-australia/`. Download it with `curl https://r.jina.ai/<url>` into `research/originals/` and add it to the notebook.
2. **Pick sources by role, not by count:** one primary (the actor's own words), two independent outlets per incident (e.g. Guardian + ABC + Reuters, TechRadar + dev.ua), and one technical explainer for the mechanism (e.g. MindPattern on Windows junctions). Skip aggregator blogs that only rephrase.
3. **If `nlm source add --url` fails** (paywall or bot block), add the downloaded text with `--file`. The `r.jina.ai` text is the original article.
4. **Ask the questions the story needs, not generic ones.** Adapt the standard set to the story's engine. For an incident story: "What was each actor asked to do? What blocked it? What did it do next?" (this finds the head fake). "Give every quote verbatim with speaker." "Where do sources use 'allegedly' or disagree on numbers or dates?" "Timeline from first event to the next dated follow-up." "What safeguards do the sources themselves recommend?" (this finds the payoff). "Which visual details (messages, screens, numbers)?" Run the set in the background (`run_in_background`); each query takes about a minute.
5. **Draft the story while the queries run**, using only facts already read in the originals. Then **verify every planned script fact with a script**: a Python loop that searches all `originals/*.md` for each key phrase or number and prints the surrounding text. Keep a fact only if it appears in two originals, or mark it as single-source. (A shell `grep -o` loop with `2>/dev/null` silently printed nothing on macOS; use Python.)
6. **Write down what the news gets wrong or blurs** in `story.md` → Accuracy notes: when it really happened vs when it was reported (OpenAI: June incident, September disclosure), self-reported vs confirmed (Reddit posts), related-but-separate events (a model shelved the same week is not the cause).

## Rules from runs (moved from SKILL.md lessons 2026-11-06; stories in ../LESSONS_LOG.md)
- NotebookLM is the first action of any research agent: create the notebook and start deep research, then add what Exa/web searches find (2026-10-02).
- Import deep-research sources by `--indices` after reading titles; about a quarter are junk (2026-10-01).
- Open the originals (`research/originals/`) for every line the script uses; NotebookLM summaries and agency blogs overstate (2026-10-01).
- Before the voice step, open every quoted or "their docs say" source live and paste the exact sentence into script.md; no verbatim match means rewrite (2026-10-19).
- Recount every number from the raw results file, never from memory or a summary (2026-10-04).
- First-hand tests: record the input as one continuous take and check the system's own logs for artefacts of how the test was built (2026-10-07).
- When the founder claims first-hand use of a tool, check the codebase for a trace (deps, logs, dates) before scripting it (2026-10-19).
- Keep a model a model ("one research model", not "researchers found"); keep the source's hedges; check 2×2 claims cell by cell (2026-10-03).
- Every word added to a line needs its own source hit, and credits and job titles match the source (back-translation by human translators, not the tool; "software engineers", not "linguists") (2026-10-04).
- Don't count ideas ("one idea") when the source lists several (2026-10-03).
- Check linguistic claims against a dictionary (dict.cc) before building a head fake on them (2026-10-04).
- Split big stories: research agent → dossier only, with dated hook candidates and head fakes at the top; writer agent → script from files only; fresh critic (2026-10-03).
- `nlm login --profile `<profile>` renews an expired session silently (2026-10-01).
