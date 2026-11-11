# Python MCP Server Implementation Guide

## Setup

```bash
uv add "mcp[cli]"
# or
pip install "mcp[cli]"
```

## Project Structure
```
my-mcp-server/
├── server.py         ← Main server (FastMCP)
├── tools/
│   ├── browser.py    ← Browser tools
│   └── extract.py    ← Extraction tools
├── pyproject.toml
└── README.md
```

## Server Initialization (FastMCP)

```python
from mcp.server.fastmcp import FastMCP, Context
from pydantic import BaseModel

mcp = FastMCP("my-server", json_response=True)
```

## Tool Registration Pattern

```python
@mcp.tool()
async def browser_navigate(url: str, wait_ms: int = 1000) -> dict:
    """Navigate the browser to a URL and wait for page stability.
    
    Args:
        url: The full URL to navigate to (must include https://)
        wait_ms: Milliseconds to wait for DOM stability after load
    
    Returns:
        dict with keys: success, title, url, screenshot_b64
    """
    # implementation
    return {"success": True, "title": page.title(), "url": page.url}
```

## Input Validation with Pydantic

```python
class DateSelection(BaseModel):
    date: str          # Format: YYYY-MM-DD
    selector: str      # CSS selector or natural language description
    fallback: bool = True  # Try coordinate click if selector fails

@mcp.tool()
async def browser_select_date(params: DateSelection) -> dict:
    """Select a date in a date picker widget."""
    ...
```

## Structured Output

```python
class BookingResult(BaseModel):
    found: bool
    options: list[dict]
    handoff_url: str | None = None

@mcp.tool()
async def browser_extract_results() -> BookingResult:
    """Extract booking options from the current page."""
    ...
```

## Context & Progress Reporting

```python
@mcp.tool()
async def browser_book_flow(destination: str, date: str, ctx: Context) -> dict:
    """Run a complete booking flow with progress updates."""
    await ctx.info(f"Starting booking for {destination} on {date}")
    
    await ctx.report_progress(progress=0.2, total=1.0, message="Navigating to site")
    # ... navigate
    
    await ctx.report_progress(progress=0.5, total=1.0, message="Selecting date")
    # ... select date
    
    return {"handoff_url": "https://..."}
```

## Running the Server

```bash
# Development (with MCP Inspector)
fastmcp dev server.py

# stdio (for Claude Desktop)
python server.py

# HTTP (for remote/multi-user)
mcp.run(transport="streamable-http", host="0.0.0.0", port=8000)
```

## Claude Desktop Config (`mcp_config.json`)

```json
{
  "mcpServers": {
    "browser-agent": {
      "command": "python",
      "args": ["/path/to/server.py"],
      "env": {
        "BROWSERBASE_API_KEY": "...",
        "PROXY_URL": "..."
      }
    }
  }
}
```

## Quality Checklist
- [ ] All tools have docstrings with Args and Returns
- [ ] All inputs validated with Pydantic models
- [ ] Error responses include actionable messages
- [ ] Async/await used for all I/O
- [ ] `readOnlyHint` annotated correctly
- [ ] Tested with `fastmcp dev server.py`
