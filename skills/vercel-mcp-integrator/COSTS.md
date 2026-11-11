# Costs for Vercel MCP Integrator

## Cost Per Action
- **Vercel Deployment:** Free for Hobby tier, usages charges for Pro.
- **Vercel AI Gateway:** Usage-based (consult Vercel pricing).
- **GitHub Action (if used):** Free for public repos.

## Maximum Spend Per Run
- $0 (excluding your existing Vercel plan).
- Safeguard: Skill will NOT proceed if it detects a Pro plan without `max_budget` set.

## API Credit Safeguards
- Checks `vercel usage` before starting.
- Checks GitHub API rate limits.

## Early Termination Rules
- Stop if Vercel deployment takes > 5 minutes.
- Stop if `mcp_config.json` is not writable.
