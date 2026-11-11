# MCP Best Practices

## Tool Naming Conventions
- Use consistent prefixes matching the server name: `browser_navigate`, `browser_click`, `browser_fill`
- Use action-oriented names (verbs first): `get_`, `list_`, `create_`, `delete_`
- Avoid abbreviations; be explicit

## Response Format Guidelines
- Return **JSON** for structured data (lists, booking results, extracted fields)
- Return **Markdown** for human-readable text (summaries, instructions)
- Always include an `error` key in failure responses with an actionable message

## Tool Description Standards
- First sentence: what the tool does
- Second sentence: when to use it (vs. similar tools)
- List parameters and their types in the description
- Include an example in complex tools

## Pagination
- Always support `limit` and `offset` or `cursor` for list operations
- Return `has_more: bool` and `next_cursor` in paginated responses
- Default `limit` should be 20-50; cap at 200

## Transport Selection
| Use Case | Transport |
|---|---|
| Local development / Claude Desktop | stdio |
| Remote / multi-user server | Streamable HTTP |
| Existing web server | Mount as ASGI sub-app |

## Error Handling Standards
- Never return raw stack traces to the LLM
- Always include: what went wrong + what to try next
- Use specific error types: `NOT_FOUND`, `AUTH_FAILED`, `RATE_LIMITED`, `CAPTCHA_REQUIRED`

## Security
- Validate all inputs with Pydantic (Python) or Zod (TypeScript)
- Never log secrets or PII
- Rate-limit destructive tools
- Mark read-only tools with `readOnlyHint: true`

## Annotations (apply to every tool)
```python
@mcp.tool(
    annotations=ToolAnnotations(
        readOnlyHint=True,       # Does not change state
        destructiveHint=False,   # Not destructive
        idempotentHint=True,     # Safe to retry
        openWorldHint=True,      # Interacts with external web
    )
)
```
