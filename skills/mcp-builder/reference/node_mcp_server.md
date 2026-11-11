# TypeScript/Node.js MCP Server Implementation Guide

## Setup

```bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk zod
npm install -D typescript @types/node tsx
```

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "strict": true
  },
  "include": ["src/**/*"]
}
```

## Project Structure
```
my-mcp-server/
├── src/
│   ├── index.ts        ← Entry point
│   ├── tools/
│   │   ├── browser.ts  ← Browser tools
│   │   └── extract.ts  ← Data extraction
│   └── utils/
│       └── stealth.ts  ← Anti-bot helpers
├── package.json
└── tsconfig.json
```

## Server Initialization

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
  name: "browser-agent",
  version: "1.0.0",
});
```

## Tool Registration with Zod

```typescript
server.registerTool(
  "browser_navigate",
  {
    title: "Navigate Browser",
    description: "Navigate to a URL and wait for DOM stability. Use before any interaction.",
    inputSchema: {
      url: z.string().url().describe("Full URL including https://"),
      wait_ms: z.number().default(1000).describe("Milliseconds to wait for stability"),
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: true,
    },
  },
  async ({ url, wait_ms }) => {
    await page.goto(url);
    await waitForStability(page, wait_ms);
    return {
      content: [{ type: "text", text: JSON.stringify({ success: true, url: page.url() }) }],
    };
  }
);
```

## Structured Output

```typescript
server.registerTool(
  "browser_extract_results",
  {
    title: "Extract Booking Results",
    description: "Extract structured booking options from the current page.",
    inputSchema: {},
    outputSchema: {
      options: z.array(z.object({
        title: z.string(),
        price: z.string(),
        url: z.string(),
      })),
      handoff_url: z.string().optional(),
    },
  },
  async () => {
    const options = await page.evaluate(() => { /* ... */ });
    return {
      structuredContent: { options, handoff_url: options[0]?.url },
      content: [{ type: "text", text: JSON.stringify(options) }],
    };
  }
);
```

## Running

```bash
# Development
npx @modelcontextprotocol/inspector npx tsx src/index.ts

# Build for production
npm run build
node dist/index.js
```

## Claude Desktop Config

```json
{
  "mcpServers": {
    "browser-agent": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "BROWSERBASE_API_KEY": "..."
      }
    }
  }
}
```

## Quality Checklist
- [ ] All schemas defined with Zod
- [ ] `outputSchema` defined for data-returning tools
- [ ] `structuredContent` returned alongside `content`
- [ ] `readOnlyHint` / `openWorldHint` set correctly
- [ ] Build passes: `npm run build`
- [ ] Tested with MCP Inspector
