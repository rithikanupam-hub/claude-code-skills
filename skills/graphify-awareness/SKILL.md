---
name: graphify-awareness
description: Leverage the existing Graphify outputs for codebase understanding and architectural context.
disable-model-invocation: true
---

# Graphify Awareness Skill

This skill reminds you (Antigravity) that the user's project contains a pre-compiled Knowledge Graph of their codebase located in the `graphify-out/` directory. 

## When to use this
Anytime the user asks a broad architectural question, or a question about how different parts of their codebase interact (e.g., "How does authentication tie into the LangGraph agents?" or "Where is the function X called?"), you MUST:
1. Prioritize reading `graphify-out/GRAPH_REPORT.md` first to understand the structural "Communities" and "God Nodes".
2. If necessary, use `grep_search` to find the specific community or node in the report to avoid reading hundreds of source files blindly.

## How to use this
The graph provides structural (AST-based) context. 
- Use the `view_file` tool to inspect `./graphify-out/GRAPH_REPORT.md` if the project uses it.
- This gives you the map. Use the map to navigate exactly to the true source code files.
