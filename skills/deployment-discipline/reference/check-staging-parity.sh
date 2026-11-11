#!/usr/bin/env bash
# Staging parity guard.
#
# Rule 1: every schema change is a migration file in the repo — so the repo and
# the staging database must never disagree. This fails the build when staging has
# migrations pending, which is what would have caught the 2026-08-31 incident
# where staging had silently fallen 28 migrations behind for five weeks.
#
# Requires SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF in the environment.
# Read-only: --dry-run never writes.

set -uo pipefail

: "${SUPABASE_PROJECT_REF:?SUPABASE_PROJECT_REF not set}"

# SUPABASE_ACCESS_TOKEN is required in CI, but locally the CLI's stored login is
# enough — don't force developers to export a token to run this by hand.
if [ -z "${SUPABASE_ACCESS_TOKEN:-}" ]; then
  if supabase projects list >/dev/null 2>&1; then
    echo "check-staging-parity: using the CLI's stored login (no SUPABASE_ACCESS_TOKEN set)."
  else
    echo "check-staging-parity: no SUPABASE_ACCESS_TOKEN and the CLI is not logged in."
    echo "  In CI, set the SUPABASE_ACCESS_TOKEN secret. Locally, run: supabase login"
    exit 1
  fi
fi

mkdir -p supabase/.temp
printf '%s' "$SUPABASE_PROJECT_REF" > supabase/.temp/project-ref

out=$(supabase db push --linked --dry-run 2>&1)
status=$?
echo "$out"

if [ $status -ne 0 ]; then
  echo
  echo "check-staging-parity: FAILED — could not compare against staging."
  echo "  If the error is 'Remote migration versions not found in local migrations"
  echo "  directory', the remote ledger references migrations the repo no longer"
  echo "  carries. Reconcile with: supabase migration repair --status reverted <versions>"
  exit 1
fi

if echo "$out" | grep -q "Would push these migrations"; then
  echo
  echo "check-staging-parity: FAILED — staging is behind the repo."
  echo "  The migrations listed above exist in the repo but are not applied to"
  echo "  staging. Apply them before merging:"
  echo "    supabase db push --linked"
  exit 1
fi

echo
echo "check-staging-parity: PASS — staging matches the repo."
exit 0
