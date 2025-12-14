# RSS MCP Server

A Model Context Protocol (MCP) server for fetching and parsing RSS/Atom feeds with RSSHub support.

## Project Structure

```
rss-mcp/
├── app/                          # Next.js app (Vercel deployment)
│   ├── api/[transport]/route.ts  # MCP handler using mcp-handler
│   ├── api/test/route.ts         # Test endpoint
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Homepage with documentation
├── src/
│   ├── lib/
│   │   ├── feed-parser.ts        # Core RSS parsing logic
│   │   ├── rsshub-instances.ts   # RSSHub instance management
│   │   ├── types.ts              # TypeScript types
│   │   └── index.ts              # Module exports
│   ├── index.ts                  # stdio server entry point
│   └── test.ts                   # Test file
├── workers-rss-mcp/              # Cloudflare Workers version
│   ├── src/
│   │   ├── index.ts              # Workers entry point using agents SDK
│   │   ├── rss-parser.ts         # Workers RSS parser (fetch API based)
│   │   ├── rsshub.ts             # RSSHub instance management
│   │   └── types.ts              # TypeScript types
│   ├── test/                     # Vitest tests
│   ├── wrangler.jsonc            # Wrangler config
│   └── package.json              # Workers dependencies
├── package.json
├── tsconfig.json
└── next.config.mjs
```

## Deployment Modes

### 1. Vercel (Next.js)
- Entry: `app/api/[transport]/route.ts`
- Uses `mcp-handler` package
- Run: `npm run dev` (development), `npm run build && npm run start` (production)

### 2. Cloudflare Workers
- Entry: `workers-rss-mcp/src/index.ts`
- Uses `agents` SDK from Cloudflare
- Deploy: `cd workers-rss-mcp && npm run deploy`

### 3. stdio Mode
- Entry: `src/index.ts`
- Uses `@modelcontextprotocol/sdk` directly
- Build: `npm run build:stdio`
- Run: `npm run start:stdio` or `npx rss-mcp`

## Key Dependencies

- `@modelcontextprotocol/sdk`: MCP SDK for stdio mode
- `mcp-handler`: Vercel adapter for MCP
- `agents`: Cloudflare Workers MCP adapter
- `axios`: HTTP client (Vercel/stdio)
- `rss-parser`: RSS/Atom feed parser
- `cheerio`: HTML parsing for content cleaning
- `zod`: Schema validation
- `date-fns-tz`: Timezone-aware date formatting
- `fast-xml-parser`: XML parsing (Workers version)

## MCP Tool

### `get_feed`
Fetches and parses RSS feeds from any URL.

**Parameters:**
- `url` (string, required): RSS feed URL
  - Standard URL: `https://example.com/feed.xml`
  - RSSHub protocol: `rsshub://bilibili/user/dynamic/208259`
  - Short path: `bilibili/user/dynamic/208259`
- `count` (number, optional): Number of items to retrieve (default: 1, 0 for all)

## Development Commands

```bash
# Install dependencies
npm install

# Development server (Vercel)
npm run dev

# Build stdio version
npm run build:stdio

# Run stdio server
npm run start:stdio

# Deploy to Cloudflare Workers
npm run deploy:workers
# or
cd workers-rss-mcp && npm run deploy
```

## Environment Variables

- `PRIORITY_RSSHUB_INSTANCE`: Preferred RSSHub instance URL (optional)

## Code Conventions

- TypeScript throughout
- ES modules (`"type": "module"`)
- Zod for input validation
- Error handling returns structured responses with `isError: true`
- RSSHub fallback: automatically tries multiple instances on failure
