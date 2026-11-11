---
name: deployment-discipline
description: Keep a dev environment promotable to production so the eventual swap is a config change, not a project. Three rules — schema changes only ever as migration files, no data operations inside migrations, one single place where changes are made. Use when working on database migrations, schema changes, deploys, environment/env-var setup, CI for a Supabase+Vercel app, when a staging and production database may have drifted, or when planning to move a dev site to live. Especially for repos where a builder tool (Lovable, v0, Bolt) also writes to the same repo or database.
disable-model-invocation: true
---

# Deployment discipline — keep dev promotable to live

Written from a real incident (a client, 2026-08-31). Staging had silently fallen **28 migrations
behind** for five weeks; a 28-migration catch-up push then **halted halfway** on a migration that
turned out to be a one-off data repair — four lines cancelling one workflow run by hard-coded UUID,
rows that existed only in the production database. Both failures trace to the same cause: **nothing
enforced that the repo, staging, and production describe the same thing.**

The goal these rules serve: *"build freely in dev, then move it to live without breaking anything."*
That is achievable, and it stays a five-minute config change — **only** if the three rules hold
while you build. Break them and the swap becomes a migration project.

## Rule 1 — Every schema change is a migration file in the repo

Never change a table, policy, index, or function through a dashboard, a builder tool's UI, or an
ad-hoc SQL console. If a schema change exists only in one database, that database is now the only
place it exists, and nothing can reproduce it.

When it always lives in a file, *"make live match dev"* reduces to: **run the migrations.** That is
the whole trick. It is what turns a frightening merge into a boring one.

**Applying this:**
- New schema → `supabase migration new <name>`, edit the file, apply it locally, commit it.
- Someone changed a database directly → capture it (`supabase db diff`) into a migration file
  immediately, before it is forgotten. An uncaptured change is a future outage.
- Reviewing a PR that touches the database → if there is no migration file, that is the review
  comment.

## Rule 2 — No data operations inside migrations

A migration describes **schema**. It must never repair, delete, or cancel specific rows.

A migration containing a one-off data operation succeeds on exactly one machine — the one whose data
it was written against — and fails everywhere else. That single file makes environment parity
impossible, which means it blocks every future dev → live promotion, not just today's.

The real example this rule comes from:

```sql
-- supabase/migrations/20260821213643_ad4bb7be-….sql  (4 lines, zero DDL)
SELECT public.cancel_workflow_run_and_release_holds('9b53192c-…'::uuid, '83c7b441-…'::uuid, …);
```

It halted a staging push with `ERROR: workflow run not found (SQLSTATE 42501)`, because that
workflow run only ever existed in production.

**Applying this:**
- One-off repairs go in `scripts/runbook/`, are run by hand on the environment that needs them, and
  are never recorded in `supabase_migrations`.
- Seed data is allowed in a migration only if it is **idempotent and environment-independent**
  (`insert … on conflict do nothing` for reference rows that every environment must have).
- **A comment-only migration is fine** — `-- superseded by X, retained as a no-op` placeholders
  execute nothing and are safe everywhere. The thing to reject is a file that *executes statements
  but changes no schema*.
- Already shipped one to production? Do **not** delete the file — production's ledger references
  that version and removing it breaks future pushes there. Allowlist it, and neutralise it elsewhere
  with `supabase migration repair --status applied <version>`.

## Rule 3 — One place where changes are made

Pick the single surface where code and schema change, and use only that one. If a builder tool
(Lovable, v0, Bolt) also writes to the repo or the database, you have two authors on one branch with
no protocol between them, and every edit on the unused surface becomes drift you must reconcile
later.

This is the rule that matters most, and while you are building in your own environment it costs
nothing to follow.

**Check whether you have this problem:**
```bash
git log --format='%an' -40 main | sort | uniq -c | sort -rn   # a bot author here is the warning
git log --oneline -25 main | grep -iE 'revert.*drift|redeployed'
```
Reverts of a bot's commits mean work is already being spent undoing the second author.

**Applying this:**
- Confine the builder tool to a prototyping branch a human reviews and merges, or stop using it for
  this project.
- Protect `main`, require PRs.
- If the tool must keep write access, run the parity check below on every merge so drift surfaces in
  minutes rather than in five weeks.

## Make the rules automatic

Rules people must remember are rules that lapse. Ship both checks with the repo.

`scripts/ci/check-migrations.sh` — enforces rule 2. Fails any migration that executes statements but
changes no schema. Accepts comment-only no-ops automatically; documented exceptions live in
`scripts/ci/migration-purity-allowlist.txt`, each with a written reason.

`scripts/ci/check-staging-parity.sh` — enforces rule 1. Runs `supabase db push --linked --dry-run`
and fails if anything is pending, so staging can never silently fall behind. Read-only. Needs
`SUPABASE_ACCESS_TOKEN` and `SUPABASE_PROJECT_REF`; skips cleanly when they are absent.

Reference copies live beside this file in `reference/`. Wire both into CI on any PR touching
`supabase/migrations/**`. Working versions are in a client repo at `scripts/ci/`, with the
workflow at `.github/workflows/migration-guard.yml`.

## Before promoting dev → live, verify

1. `./scripts/ci/check-migrations.sh` passes.
2. `supabase db push --linked --dry-run` against **both** environments reports nothing pending.
3. Environments differ **only** by environment variables — never by code, never by manual settings.
4. Every provider secret is set server-side on the target project, with the exact names the code
   reads. Verify by name, and confirm the project ref in the dashboard URL — putting a key on the
   wrong project of a multi-project account is a common and silent failure.
5. You know how much real user data lives in production. This is what decides whether promotion is a
   config change or a data migration, and it is the single question most likely to be skipped.

## Useful facts

- `supabase db query --linked` runs read-only SQL through the **Management API** using the CLI access
  token — **no database password**. Most "we need the DB password to check this" beliefs are wrong.
- `supabase secrets list` shows a **sha256 digest** of each value, so you can verify *which* key is
  stored, or prove a rotation happened, without ever printing the secret.
- `supabase migration repair` writes only to `supabase_migrations.schema_migrations`. It never
  touches schema, so it is safe for reconciling ledgers.
- `supabase/.temp/` is gitignored and does **not** cross git worktrees — a second worktree will
  report "Cannot find project ref" until those files are copied over.
