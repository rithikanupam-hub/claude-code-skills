---
name: vercel-mcp-integrator
description: Connect a Vercel MCP server to the Antigravity agent and publish skills to GitHub as Vercel-hosted MCP servers.
disable-model-invocation: true
---

# Vercel MCP Integrator Skill

## Purpose
This skill automates the connection of a Vercel MCP (Model Context Protocol) server to the Antigravity agent. It also assists in publishing new skills to GitHub and deploying them as MCP servers on Vercel.

## Step-by-Step Execution Logic
1. **Prerequisite Check:** Verify Vercel CLI and Git are installed.
2. **Authentication:** 
    - Validate `VERCEL_TOKEN`.
    - Validate GitHub Personal Access Token.
3. **Project Initialization:**
    - Initialize a new project or use an existing one.
    - Setup the MCP server adapter (e.g., `@modelcontextprotocol/sdk`).
4. **Vercel AI Gateway Configuration:**
    - Optional but recommended for production skills.
5. **Deployment:**
    - Execute `vercel deploy --prod`.
    - Retrieve the deployment URL.
6. **Antigravity Registration:**
    - Add the deployment URL to `<path>`.
7. **Validation:**
    - Test the connection using the Antigravity terminal.

## External Services Used
- **Vercel:** Hosting and AI Gateway.
- **GitHub:** Source control and skill registry.

## API Interaction Logic
- Uses Vercel CLI for deployment.
- Uses Git CLI for repository management.
- Modifies local filesystem for configuration.

## Stopping Conditions
- Successful registration in `mcp_config.json`.
- Manual cancellation by the user.
- Authentication failure.

## Validation Logic
- Check for 200 OK from the Vercel deployment endpoint.
- Verify JSON schema of `mcp_config.json` after modification.

## Compliance & Ethical Safeguards
- No storage of API keys in plaintext (use environment variables).
- User must approve the `mcp_config.json` change.
