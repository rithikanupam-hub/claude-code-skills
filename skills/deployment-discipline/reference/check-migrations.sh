#!/usr/bin/env bash
# Migration purity guard.
#
# Rule 2 of the deployment-discipline rules: migrations describe SCHEMA, never
# one-off DATA repairs. A migration containing only data operations can succeed
# on exactly one machine and fails everywhere else — which makes environment
# parity impossible and blocks any dev -> live promotion.
#
# Real incident this guards against (2026-08-31):
#   supabase/migrations/20260821213643_ad4bb7be-....sql
#     SELECT public.cancel_workflow_run_and_release_holds('9b53192c-...'::uuid, ...);
#   Four lines, zero DDL. Cancelled one workflow run that existed only in the
#   Lovable production database. Halted a 28-migration push against staging with
#   ERROR: workflow run not found (SQLSTATE 42501).
#
# Exit 0 = clean, 1 = violation found.

set -uo pipefail

MIG_DIR="${1:-supabase/migrations}"
ALLOWLIST="scripts/ci/migration-purity-allowlist.txt"

if [ ! -d "$MIG_DIR" ]; then
  echo "check-migrations: no migrations directory at '$MIG_DIR' — nothing to check."
  exit 0
fi

fail=0
checked=0
warned=0

is_allowlisted() {
  [ -f "$ALLOWLIST" ] || return 1
  grep -qxF "$(basename "$1")" "$ALLOWLIST"
}

# Strip line comments, block comments and blank lines so keyword counting sees
# real statements only.
strip_sql() {
  sed -e 's/--.*$//' "$1" | sed -e '/^[[:space:]]*$/d'
}

for f in "$MIG_DIR"/*.sql; do
  [ -e "$f" ] || continue
  checked=$((checked + 1))
  base=$(basename "$f")
  body=$(strip_sql "$f")

  # A file whose entire body is comments is a deliberate no-op placeholder
  # ("superseded by ..., retained for migration-history compatibility").
  # That is legitimate: it executes nothing, so it is safe on every environment.
  if [ -z "$(printf '%s' "$body" | tr -d '[:space:]')" ]; then
    continue
  fi

  ddl=$(printf '%s\n' "$body" | grep -icE '(^|[[:space:]])(create|alter|drop|comment[[:space:]]+on|grant|revoke)[[:space:]]' || true)

  if [ "$ddl" -eq 0 ]; then
    if is_allowlisted "$f"; then
      echo "  ALLOWLISTED  $base (zero DDL, explicitly accepted)"
      warned=$((warned + 1))
      continue
    fi
    echo "ERROR: $base executes statements but changes no schema."
    echo "       This is a DATA operation, not a migration. It will fail on every"
    echo "       environment except the one it was written against."
    echo "       Move it to scripts/runbook/ and run it manually where needed."
    echo "       (If it is genuinely required, add its filename to $ALLOWLIST"
    echo "        with a comment explaining why.)"
    echo
    fail=1
  fi
done

# Softer signal: destructive DML aimed at specific rows inside an otherwise
# legitimate schema migration.
for f in "$MIG_DIR"/*.sql; do
  [ -e "$f" ] || continue
  base=$(basename "$f")
  body=$(strip_sql "$f")
  if printf '%s\n' "$body" \
     | grep -iE '^[[:space:]]*(delete[[:space:]]+from|update)[[:space:]]' \
     | grep -qiE "'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'"; then
    echo "WARNING: $base targets specific rows by hard-coded UUID in DELETE/UPDATE."
    echo "         Environment-specific data does not belong in a migration."
    warned=$((warned + 1))
  fi
done

echo
echo "check-migrations: $checked file(s) checked, $warned warning(s)."
if [ "$fail" -ne 0 ]; then
  echo "check-migrations: FAILED — migrations must contain schema changes only."
  exit 1
fi
echo "check-migrations: PASS — all migrations contain schema statements."
exit 0
