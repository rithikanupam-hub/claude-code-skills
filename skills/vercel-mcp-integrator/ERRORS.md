# Errors and Recovery for Vercel MCP Integrator

## Common Failure Scenarios
- **Auth Failure:** Invalid `VERCEL_TOKEN` or `GITHUB_TOKEN`.
- **Name Conflict:** Project name already exists on Vercel or GitHub.
- **Deployment Timeout:** Vercel deployment taking too long.
- **Config Corruption:** Error writing to `mcp_config.json`.

## API Failures
- **Vercel 401:** Check token permissions.
- **GitHub 404:** Repository not found or no access.

## Data Quality Issues
- Invalid JSON in template files.
- Missing environment variables in Vercel project.

## Retry Logic
- Automatic retry for transient network errors (up to 3 times).
- Manual re-run required for authentication errors.

## Safe Exit Conditions
- Rollback GitHub commit if Vercel deployment fails.
- Revert `mcp_config.json` to previous state on failure.
