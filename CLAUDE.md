# RSS MCP Server

A Model Context Protocol (MCP) server for fetching and parsing RSS/Atom feeds with RSSHub support.

## Project Structure

```
rss-mcp/
├── src/
│   ├── index.ts              # Workers entry point
│   ├── rss-parser.ts         # RSS feed parsing logic
│   ├── opml-parser.ts        # OPML file parser
│   ├── rsshub.ts             # RSSHub instance management
│   └── types.ts              # TypeScript types
├── wrangler.toml             # Cloudflare Workers config
├── package.json
└── tsconfig.json
```

## Deployment

### Cloudflare Workers (Primary)

```bash
# Install dependencies
npm install

# Deploy
npx wrangler deploy
```

## Key Dependencies

- `@modelcontextprotocol/sdk`: MCP SDK
- `agents`: Cloudflare Workers MCP adapter
- `fast-xml-parser`: XML parsing
- `zod`: Schema validation

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

## Environment Variables

- `PRIORITY_RSSHUB_INSTANCE`: Preferred RSSHub instance URL (optional)

## Code Conventions

- TypeScript throughout
- ES modules (`"type": "module"`)
- Zod for input validation
- Error handling returns structured responses with `isError: true`
- RSSHub fallback: automatically tries multiple instances on failure
