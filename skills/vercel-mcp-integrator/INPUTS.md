# Inputs for Vercel MCP Integrator

## Required Inputs
- `vercelToken`: Personal Access Token for Vercel.
- `githubToken`: Personal Access Token for GitHub.
- `projectName`: Desired name for the Vercel project and GitHub repository.

## Optional Inputs
- `mcpType`: The type of MCP server (e.g., `sse`, `stdio`). Default: `sse` (recommended for Vercel).
- `enableAiGateway`: Boolean to enable Vercel AI Gateway. Default: `true`.

## Default Values
- `branch`: `main`
- `region`: `iad1` (Vercel default)

## Hard Limits
- **Cost Cap:** $5 per run (estimated Vercel usage).
- **Retry Cap:** 3 attempts for deployment.

## Validation Rules
- `vercelToken` must start with `v1_`.
- `projectName` must be URL-safe (lowercase, alphanumeric, and hyphens).
