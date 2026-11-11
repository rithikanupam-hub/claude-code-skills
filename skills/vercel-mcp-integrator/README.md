# Vercel MCP Integrator Skill

This skill allows you to seamlessly connect Vercel-hosted MCP servers to your Antigravity agent and automate the publication/deployment flow.

## What it does
- Automates Vercel deployment of MCP servers.
- Manages GitHub repository creation for your skills.
- Automatically registers the server in Antigravity's `mcp_config.json`.

## When to use it
- When you have a new skill that you want to host on Vercel.
- When you want to bridge Vercel AI Gateway features with your agent.
- To avoid manual editing of configuration files.

## Example Use Case
"Deploy my new `weather-mcp` skill to Vercel and connect it to my agent."

## Known Limitations
- Requires Vercel and GitHub CLI tools to be installed locally for the agent to use.
- Hobby tier limits apply.
