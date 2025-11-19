# RSS MCP Server

[![NPM Version](https://img.shields.io/npm/v/rss-mcp.svg)](https://www.npmjs.com/package/rss-mcp)

A Model Context Protocol (MCP) server for fetching and parsing RSS/Atom feeds with RSSHub support. This server can be deployed to Vercel as a remote MCP server or run locally via stdio.

## Features

- **Universal Feed Parsing**: Fetch and parse any standard RSS/Atom feed from a given URL.
- **Enhanced RSSHub Support**: Fetch any RSSHub-supported feed via MCP, with multi-instance support.
- **Customizable Item Count**: Specify the number of feed items to retrieve, with support for fetching all items.
- **Multi-instance Support**: Includes a list of public RSSHub instances and automatically polls to find an available service.
- **Smart URL Parsing**: Supports standard RSSHub URLs and a simplified `rsshub://` protocol format.
- **Priority Instance Configuration**: Set a preferred RSSHub instance via the `PRIORITY_RSSHUB_INSTANCE` environment variable.
- **Robust Error Handling**: If a request to one instance fails, it automatically tries the next one until it succeeds.
- **Content Cleaning**: Uses Cheerio to clean the feed content and extract plain text descriptions.
- **Vercel Deployment**: Deploy as a remote MCP server accessible via HTTPS.

## Deployment Options

### Option 1: Deploy to Vercel (Recommended)

Deploy your own RSS MCP server to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zacfire/rss-mcp)

Or deploy manually:

```bash
# Clone the repository
git clone https://github.com/zacfire/rss-mcp.git
cd rss-mcp

# Install dependencies
npm install

# Deploy to Vercel
npx vercel

# Or deploy to production
npx vercel --prod
```

After deployment, you'll get an HTTPS URL like: `https://your-rss-mcp.vercel.app`

#### Environment Variables (Optional)

In your Vercel project settings, you can set:

- `PRIORITY_RSSHUB_INSTANCE`: Your preferred RSSHub instance URL (e.g., `https://my-rsshub.example.com`)

### Option 2: Run Locally via stdio

For local development or traditional MCP usage:

```bash
# Clone and install
git clone https://github.com/zacfire/rss-mcp.git
cd rss-mcp
npm install

# Build for stdio mode
npm run build:stdio

# Run the server
npm run start:stdio
```

### Option 3: Use via npx

```bash
npx rss-mcp
```

## MCP Client Configuration

### For Cursor (Remote Server)

Add to your Cursor settings (`~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "rss": {
      "url": "https://your-rss-mcp.vercel.app/api"
    }
  }
}
```

### For Claude Desktop (Remote Server)

Claude Desktop requires `mcp-remote` to connect to remote servers. Add to your Claude Desktop config:

```json
{
  "mcpServers": {
    "rss": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://your-rss-mcp.vercel.app/api"
      ]
    }
  }
}
```

### For Local stdio Mode

```json
{
  "mcpServers": {
    "rss": {
      "command": "npx",
      "args": ["rss-mcp"]
    }
  }
}
```

Or with a local installation:

```json
{
  "mcpServers": {
    "rss": {
      "command": "node",
      "args": ["/path/to/your/rss-mcp/dist/index.js"]
    }
  }
}
```

## Tool Definition

### `get_feed`

Fetches and parses an RSS feed from a given URL. It supports both standard RSS/Atom feeds and RSSHub feeds.

#### Input Parameters

- `url` (string, required): The URL of the RSS feed to fetch. Supported formats:
    1. **Standard URL**: `https://rsshub.app/bilibili/user/dynamic/208259`
    2. **`rsshub://` protocol**: `rsshub://bilibili/user/dynamic/208259`
    3. **Short path**: `bilibili/user/dynamic/208259` (automatically converted to rsshub://)
- `count` (number, optional): The number of RSS feed items to retrieve.
    - **Default**: `1`
    - **Retrieve all**: `0`

#### Output

Returns a JSON string containing the feed information:

```json
{
  "title": "bilibili User Dynamics",
  "link": "https://space.bilibili.com/208259",
  "description": "bilibili User Dynamics",
  "items": [
    {
      "title": "[Dynamic Title]",
      "description": "Plain text content of the dynamic...",
      "link": "https://t.bilibili.com/1234567890",
      "guid": "https://t.bilibili.com/1234567890",
      "pubDate": "2024-05-20T12:30:00.000Z",
      "author": "Author Name",
      "category": ["Category1", "Category2"]
    }
  ]
}
```

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# The server will be available at http://localhost:3000
# MCP endpoint: http://localhost:3000/api
```

## Project Structure

```
rss-mcp/
├── app/
│   ├── api/
│   │   └── [transport]/
│   │       └── route.ts        # MCP handler for Vercel
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Homepage with API documentation
├── src/
│   ├── lib/
│   │   ├── feed-parser.ts      # Core RSS parsing logic
│   │   ├── rsshub-instances.ts # RSSHub instance management
│   │   ├── types.ts            # TypeScript types
│   │   └── index.ts            # Module exports
│   └── index.ts                # stdio server entry point
├── .env.example
├── next.config.js
├── vercel.json
├── package.json
├── tsconfig.json
└── README.md
```

## Main Dependencies

- [mcp-handler](https://www.npmjs.com/package/mcp-handler): Vercel adapter for MCP servers
- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk): MCP SDK
- [next](https://www.npmjs.com/package/next): React framework for production
- [axios](https://www.npmjs.com/package/axios): HTTP client
- [rss-parser](https://www.npmjs.com/package/rss-parser): RSS/Atom feed parser
- [cheerio](https://www.npmjs.com/package/cheerio): HTML parser for content cleaning
- [date-fns-tz](https://www.npmjs.com/package/date-fns-tz): Timezone-aware date formatting
- [zod](https://www.npmjs.com/package/zod): Schema validation

## License

This project is licensed under the Apache-2.0 License.
