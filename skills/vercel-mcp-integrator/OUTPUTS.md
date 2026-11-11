# Outputs for Vercel MCP Integrator

## Output Data Schema
```json
{
  "status": "success" | "failure",
  "deploymentUrl": "string",
  "githubRepoUrl": "string",
  "mcpConfigPath": "string",
  "errors": ["string"]
}
```

## File Formats
- Summary report as a Markdown table.
- Log of the deployment process.

## Required vs Optional Fields
- **Required:** `status`, `deploymentUrl` (on success), `errors` (on failure).
- **Optional:** `githubRepoUrl`.

## Example Output
| Field | Value |
|-------|-------|
| Status | Success |
| Deployment URL | `https://my-mcp-server.vercel.app` |
| GitHub Repo | `https://github.com/user/my-mcp-server` |
| Config Updated | `<path>` |
