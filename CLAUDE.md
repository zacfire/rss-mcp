# RSS MCP Server

A Model Context Protocol (MCP) server for fetching and parsing RSS/Atom feeds with RSSHub support.

## Project Structure

```
rss-mcp/
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
│   │   ├── opml-parser.ts        # OPML file parser
│   │   ├── rsshub.ts             # RSSHub instance management
│   │   └── types.ts              # TypeScript types
│   ├── test/                     # Vitest tests
│   ├── wrangler.jsonc            # Wrangler config
│   └── package.json              # Workers dependencies
├── package.json
└── tsconfig.json
```

## Deployment Modes

### 1. Cloudflare Workers (Recommended)
- Entry: `workers-rss-mcp/src/index.ts`
- Uses `agents` SDK from Cloudflare
- Deploy: `cd workers-rss-mcp && npm run deploy`

### 2. stdio Mode
- Entry: `src/index.ts`
- Uses `@modelcontextprotocol/sdk` directly
- Build: `npm run build`
- Run: `npm run start` or `npx rss-mcp`

## Key Dependencies

- `@modelcontextprotocol/sdk`: MCP SDK for stdio mode
- `agents`: Cloudflare Workers MCP adapter
- `axios`: HTTP client (stdio mode)
- `rss-parser`: RSS/Atom feed parser
- `cheerio`: HTML parsing for content cleaning
- `zod`: Schema validation
- `date-fns-tz`: Timezone-aware date formatting
- `fast-xml-parser`: XML parsing (Workers version)

## MCP Tools

### `get_feed`
Fetches and parses a single RSS feed.

**Parameters:**
- `url` (string, required): RSS feed URL
  - Standard URL: `https://example.com/feed.xml`
  - RSSHub protocol: `rsshub://bilibili/user/dynamic/208259`
  - Short path: `bilibili/user/dynamic/208259`
- `count` (number, optional): Number of items to retrieve (default: 1, 0 for all)

### `get_feeds`
Fetches multiple RSS feeds at once. Supports OPML files from Feedly, Inoreader, etc.

**Parameters:**
- `opml` (string, optional): OPML file content (XML string)
- `urls` (array, optional): Array of RSS feed URLs
- `count` (number, optional): Items per feed (default: 1)
- `concurrency` (number, optional): Parallel fetches (default: 5)

## Development Commands

```bash
# Install dependencies
npm install

# Build stdio version
npm run build

# Run stdio server
npm run start

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
