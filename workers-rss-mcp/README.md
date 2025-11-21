# RSS MCP Server for Cloudflare Workers

A Model Context Protocol (MCP) server implementation for Cloudflare Workers that provides RSS feed fetching and parsing capabilities with RSSHub support.

## Features

- 🚀 **Serverless Architecture**: Runs on Cloudflare Workers edge network
- 📡 **RSS/Atom Feed Support**: Parse any RSS 2.0, RSS 1.0 (RDF), or Atom feed
- 🔄 **RSSHub Integration**: Built-in support for RSSHub with multi-instance failover
- 🌍 **Global Edge Network**: Low latency worldwide
- 💰 **Free Tier Friendly**: Works within Cloudflare Workers free tier limits
- 🔧 **MCP Protocol**: Compatible with Claude Desktop, Cursor, and other MCP clients

## Architecture

This implementation uses:
- **workers-mcp**: Cloudflare's official MCP adapter for Workers
- **fast-xml-parser**: Lightweight, Web-compatible XML parser
- **Native Fetch API**: For HTTP requests (no axios needed)
- **WorkerEntrypoint**: Cloudflare's service binding pattern for MCP

### Dependency Replacements from Next.js Version

| Original (Next.js) | Workers Version | Reason |
|-------------------|-----------------|---------|
| axios | Native fetch() | Cloudflare Workers built-in |
| rss-parser | fast-xml-parser + custom logic | Works in Workers runtime |
| cheerio | Regex-based HTML stripping | No DOM needed in Workers |
| date-fns-tz | Native Date + Intl API | Lighter, built-in support |

## Quick Start

### 1. Deploy to Cloudflare Workers

```bash
npm run deploy
```

This will deploy your Worker to `https://workers-rss-mcp.<your-account>.workers.dev`

### 2. Configure Claude Desktop

After deployment, update your Claude Desktop configuration:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "rss": {
      "command": "npx",
      "args": [
        "workers-mcp",
        "run",
        "workers-rss-mcp",
        "https://workers-rss-mcp.<your-account>.workers.dev"
      ]
    }
  }
}
```

### 3. Test with Cursor/Windsurf

Add to your Cursor/Windsurf MCP settings:

```json
{
  "mcpServers": {
    "rss": {
      "command": "npx",
      "args": [
        "workers-mcp",
        "run",
        "workers-rss-mcp",
        "https://workers-rss-mcp.<your-account>.workers.dev"
      ]
    }
  }
}
```

## Development

### Local Testing

```bash
npm run dev
```

This starts a local development server at `http://localhost:8787`

### Testing with MCP Inspector

```bash
npx @modelcontextprotocol/inspector npx workers-mcp run workers-rss-mcp http://localhost:8787
```

## Usage

Once configured in your MCP client, you can use the `get_feed` tool:

```
Please use the get_feed tool to fetch the latest 5 items from https://news.ycombinator.com/rss
```

### RSSHub Support

Use the `rsshub://` protocol for RSSHub feeds:

```
Please fetch 3 items from rsshub://bilibili/user/dynamic/208259
```

The server automatically tries multiple RSSHub instances for better reliability.

## Environment Variables

Set in Cloudflare Dashboard under Workers > Settings > Variables:

- `PRIORITY_RSSHUB_INSTANCE` (optional): Prioritize a specific RSSHub instance (e.g., `https://rsshub.app`)

To set via CLI:

```bash
wrangler secret put PRIORITY_RSSHUB_INSTANCE
```

## API Reference

### `get_feed(url: string, count?: number)`

Fetches and parses an RSS/Atom feed.

**Parameters:**
- `url`: RSS feed URL or RSSHub path (with `rsshub://` protocol)
- `count`: Number of items to return (default: 1, set to 0 for all items)

**Returns:** JSON string with feed data including title, description, and items

**Example Response:**
```json
{
  "title": "Example Feed",
  "link": "https://example.com",
  "description": "Feed description",
  "items": [
    {
      "title": "Item Title",
      "description": "Item content...",
      "link": "https://example.com/item",
      "guid": "unique-id",
      "pubDate": "2025-01-01T00:00:00.000Z",
      "author": "Author Name",
      "category": ["tech", "news"]
    }
  ]
}
```

## Deployment Options

### Option 1: Via Wrangler CLI (Recommended)

```bash
# Login to Cloudflare
wrangler login

# Deploy
npm run deploy
```

### Option 2: Via GitHub Actions

See `.github/workflows/deploy.yml` for CI/CD setup (if configured)

### Option 3: Via Cloudflare Dashboard

1. Copy `src/` folder contents
2. Go to Workers & Pages > Create application
3. Paste code and deploy

## Troubleshooting

### "Unauthorized" Response

This is expected! The Worker uses MCP protocol, not HTTP. Use an MCP client like:
- Claude Desktop with workers-mcp
- MCP Inspector
- Cursor/Windsurf with workers-mcp

### Feed Parsing Errors

- Check if the URL is accessible
- Verify it's a valid RSS/Atom feed
- Try different RSSHub instances if using RSSHub

### Timeout Issues

- Cloudflare Workers have a 50ms CPU time limit (free tier)
- Large feeds may timeout - use the `count` parameter to limit items

## Project Structure

```
workers-rss-mcp/
├── src/
│   ├── index.ts          # WorkerEntrypoint & MCP handler
│   ├── rss-parser.ts     # RSS/Atom feed parsing
│   ├── rsshub.ts         # RSSHub instance management
│   └── types.ts          # TypeScript interfaces
├── wrangler.jsonc        # Cloudflare configuration
├── package.json          # Dependencies
└── README.md            # This file
```

## Comparison: Vercel vs Cloudflare Workers

| Feature | Vercel (Next.js) | Cloudflare Workers |
|---------|------------------|-------------------|
| **China Access** | ❌ Blocked by GFW | ✅ Better accessibility |
| **Free Tier** | 100GB bandwidth | 100,000 req/day |
| **Cold Start** | ~100-200ms | ~50-100ms |
| **Edge Runtime** | Node.js or Edge | Edge only |
| **Dependencies** | Full Node.js | Web APIs only |

## Contributing

Issues and PRs welcome at the main repository: https://github.com/zacfire/rss-mcp

## License

Apache-2.0

## Related Projects

- [rss-mcp (Next.js version)](../): Original Next.js/Vercel implementation
- [workers-mcp](https://github.com/cloudflare/workers-mcp): Official Cloudflare MCP adapter
- [RSSHub](https://docs.rsshub.app/): Powerful RSS feed aggregator
