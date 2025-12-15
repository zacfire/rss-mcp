# RSS MCP Server

A Model Context Protocol (MCP) server for fetching and parsing RSS/Atom feeds with RSSHub support. Deploy to Cloudflare Workers for global accessibility.

## Features

- **Universal Feed Parsing**: Fetch and parse any standard RSS/Atom feed from a given URL.
- **Batch Feed Fetching**: Fetch multiple feeds at once with OPML support (Feedly, Inoreader, etc.)
- **Enhanced RSSHub Support**: Fetch any RSSHub-supported feed via MCP, with multi-instance support.
- **Customizable Item Count**: Specify the number of feed items to retrieve, with support for fetching all items.
- **Multi-instance Support**: Includes a list of public RSSHub instances and automatically polls to find an available service.
- **Smart URL Parsing**: Supports standard RSSHub URLs and a simplified `rsshub://` protocol format.
- **Priority Instance Configuration**: Set a preferred RSSHub instance via the `PRIORITY_RSSHUB_INSTANCE` environment variable.
- **Robust Error Handling**: If a request to one instance fails, it automatically tries the next one until it succeeds.

## Deployment

### Deploy to Cloudflare Workers

**Benefits:**
- Better accessibility from China (not blocked by GFW)
- Faster cold starts (~50-100ms)
- Generous free tier (100,000 requests/day)
- True edge computing (300+ global locations)

**Quick Start:**

```bash
# Clone the repository
git clone https://github.com/zacfire/rss-mcp.git
cd rss-mcp

# Install dependencies
npm install

# Login to Cloudflare
npx wrangler login

# Deploy
npx wrangler deploy
```

Your Worker will be available at: `https://rss-mcp.<your-account>.workers.dev`

**Custom Domain (Recommended for China):**

Add a custom domain in Cloudflare Dashboard → Workers → Your Worker → Settings → Triggers → Custom Domains.

## MCP Client Configuration

### For Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "rss": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://your-custom-domain.com/rss"
      ]
    }
  }
}
```

### For Cursor

Add to your Cursor settings (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "rss": {
      "url": "https://your-custom-domain.com/rss"
    }
  }
}
```

## MCP Tools

### `get_feed`

Fetches and parses a single RSS feed from a given URL.

**Input Parameters:**

- `url` (string, required): The URL of the RSS feed to fetch. Supported formats:
    1. **Standard URL**: `https://rsshub.app/bilibili/user/dynamic/208259`
    2. **`rsshub://` protocol**: `rsshub://bilibili/user/dynamic/208259`
    3. **Short path**: `bilibili/user/dynamic/208259` (automatically converted to rsshub://)
- `count` (number, optional): The number of RSS feed items to retrieve.
    - **Default**: `1`
    - **Retrieve all**: `0`

**Output:**

```json
{
  "title": "Feed Title",
  "link": "https://example.com",
  "description": "Feed description",
  "items": [
    {
      "title": "Article Title",
      "description": "Plain text content...",
      "link": "https://example.com/article",
      "guid": "https://example.com/article",
      "pubDate": "2024-05-20T12:30:00.000Z",
      "author": "Author Name",
      "category": ["Category1", "Category2"]
    }
  ]
}
```

### `get_feeds`

Fetches multiple RSS feeds at once. Supports OPML files exported from Feedly, Inoreader, etc.

**Input Parameters:**

- `opml` (string, optional): OPML file content (XML string) exported from RSS readers
- `urls` (array, optional): Array of RSS feed URLs to fetch
- `count` (number, optional): Number of items to retrieve per feed. Default: `1`
- `concurrency` (number, optional): Number of feeds to fetch in parallel. Default: `5`

**Output:**

```json
{
  "total": 10,
  "successful": 8,
  "failed": 2,
  "feeds": [
    {
      "title": "Feed Title",
      "url": "https://example.com/feed.xml",
      "category": "Technology",
      "items": [...]
    }
  ],
  "errors": [
    {
      "title": "Failed Feed",
      "url": "https://example.com/broken.xml",
      "error": "Error message"
    }
  ]
}
```

## Project Structure

```
rss-mcp/
├── src/
│   ├── index.ts          # Workers entry point
│   ├── rss-parser.ts     # RSS feed parsing logic
│   ├── opml-parser.ts    # OPML file parser
│   ├── rsshub.ts         # RSSHub instance management
│   └── types.ts          # TypeScript types
├── wrangler.toml         # Cloudflare Workers config
├── package.json
└── tsconfig.json
```

## Environment Variables

- `PRIORITY_RSSHUB_INSTANCE`: Your preferred RSSHub instance URL (optional)
  - Example: `https://my-rsshub.example.com`
  - This instance will be tried first before falling back to public instances

Set via Cloudflare Dashboard or `wrangler secret put PRIORITY_RSSHUB_INSTANCE`.

## Main Dependencies

- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk): MCP SDK
- [agents](https://www.npmjs.com/package/agents): Cloudflare Workers MCP adapter
- [fast-xml-parser](https://www.npmjs.com/package/fast-xml-parser): XML parsing
- [zod](https://www.npmjs.com/package/zod): Schema validation

## Troubleshooting

### Deployment Issues

**Error: "Could not resolve module"**
- Ensure all dependencies are installed: `npm install`
- Check that `package.json` includes all required dependencies

### MCP Connection Issues

**Client can't connect to the server**
- Verify the URL is correct
- If using `workers.dev` domain from China, use a custom domain instead
- For Claude Desktop, ensure `mcp-remote` is installed

**Tool returns errors**
- Check Cloudflare Workers logs in Dashboard
- Verify the RSS/RSSHub URL is accessible
- Try a different RSSHub instance by setting `PRIORITY_RSSHUB_INSTANCE`

## License

This project is licensed under the Apache-2.0 License.
