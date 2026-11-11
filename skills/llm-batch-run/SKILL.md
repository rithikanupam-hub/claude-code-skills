---
name: llm-batch-run
description: Run a large paid LLM job (classify, label or enrich thousands to millions of records via a Batch API) safely and in one go — free full-scale preflight, self-healing guards, approval, chunked sending under a shared budget cap, monitoring and a results check. Use when the user says "run the 5%", "run the full archive", "send the chunks", "start the batch", "prepare for the run", "enrich the posts", or any paid AI run over many records (FOL pipeline and similar).
disable-model-invocation: true
---

# LLM batch run

A paid run over many records must reach the provider once, cleanly. Every problem we can find for free (token counts, oversized inputs, odd content) is found before the first request is sent, and a guard that trips fixes the request or sets the record aside — it never stops the whole run. Built from the FOL 5% run (2026-10-22), where chunk 1 passed by luck and chunk 2 was refused three times before a cent was spent.

## Steps

1. **One code copy.** Run from the git checkout that the PR comes from (FOL: `FOL Project/repo-finanza/fol-pipeline`, `.env` and venv linked in, both gitignored). Never fix code in one copy and run another.
2. **Freeze the input.** Reproducible sample/scope file, chunk folders with `source.jsonl` + `ids.json`, a `manifest.json` with shares by year and section. Show the user the share table (all rows, never shortened).
3. **Free preflight on ALL chunks, not one.** Count every request's exact tokens (free `count_tokens` endpoint) for every chunk before asking for approval. FOL: `run_pilot.py ... --batch` answered `n`, looped over every chunk; collect splits, oversized posts and the total estimate in one table. A sample estimate (`--estimate-groups`) is for cost only, never for clearing the run.
4. **Scan content for token bombs.** Before preflight, grep inputs and context fields for inline data (`base64,`), huge pasted tables, repeated characters; the text sent to the AI must replace them with a placeholder (FOL: `bbcode.drop_inline_data`).
5. **Guards self-heal.** Over-limit group → split in half and recount. Single record over the limit → review list. Invalid answer → keep valid groups, retry the rest. Only budget and approval may stop a run.
6. **Ask once, with numbers.** Records, requests, exact input tokens, worst-case and expected cost, who pays (FOL: Mauro's API credits), budget cap. Wait for an explicit yes.
7. **Send chunk 1, check it, then the rest.** After chunk 1: actual cost vs estimate, failed/review counts, a quick label table (opinions, direction, spam, pump), top names. Re-project the cost of the full job from the actual. Then send the remaining chunks in one sequential loop under one shared ledger (`runs/spend.json`, `FOL_BUDGET_USD`).
8. **Monitor quietly.** Watch only finish/error/cost lines; never stream "still processing" lines. A refusal before sending costs nothing — say so plainly.
9. **Report** in a table: per-chunk cost, total, failed, review, what changed in the code (with tests), and the next decision.
10. **Commit the fixes to the PR branch** the same day, with tests; record the run in the release/decision notes.

## FOL commands

```bash
F="<path>"; S="$F/outputs/fol-run/<run>"
cd "$F/repo-finanza/fol-pipeline"
# preflight, free: answer n
echo n | FOL_BUDGET_USD=20 PYTHONPATH=. .venv/bin/python tools/run_pilot.py --source "$S/chunk-01/source.jsonl" \
  --ids-file "$S/chunk-01/ids.json" --text full --batch --out "$S/runs/chunk-01"
# send, after approval: --yes, all chunks share $S/runs/spend.json
```

## Lessons learned
- 2026-10-22 (permanent, user: "we need our process to get better"): preflight every chunk for free before approval; chunk 1 passing proved nothing about chunk 2.
- 2026-10-22: a byte cap does not bound tokens — dense Italian text reached 36k tokens in 60 kB. Count tokens; split, don't refuse.
- 2026-10-22: one inline base64 image in a *context* post (1 in 211k) blocked a 20k-post chunk. Scan context fields too.
- 2026-10-22: put every chunk under one `runs/` folder so the budget ledger is shared; a per-chunk ledger makes the cap per chunk.
- 2026-10-22: the chunk loop must continue on exit 2 (finished, some posts failed) and stop only on other codes; a single bad post nearly skipped chunks 10–11.
- 2026-10-22: Haiku 5.5 with effort puts a thinking block first; read the first `text` block, never `content[0]`. Save the batch ID before polling so a crashed read resumes without resending.
- 2026-10-22: an upper-bound coverage figure ("up to 89%") assumed every name was an instrument; report the measured figure and what the rest is.
- 2026-10-22: the git commit picked the wrong global identity; set repo-local `user.name/email` before the first commit.
