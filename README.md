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

#### Method A: One-Click Deploy

Deploy with a single click using Vercel's deployment button:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/zacfire/rss-mcp)

#### Method B: Deploy via Vercel Dashboard

1. Visit [Vercel Dashboard](https://vercel.com/new)
2. Click "Import Project"
3. Connect your GitHub account and select the `zacfire/rss-mcp` repository
4. Select the branch you want to deploy (e.g., `main` or your feature branch)
5. Vercel will auto-detect Next.js settings
6. Click "Deploy"
7. Wait for deployment to complete (usually 1-2 minutes)

After deployment, you'll get:
- **Production URL**: `https://your-project-name.vercel.app`
- **MCP Endpoint**: `https://your-project-name.vercel.app/api`

**Benefits of Dashboard Deployment:**
- Auto-deploys on every push to the connected branch
- Preview deployments for pull requests
- Easy environment variable management
- Deployment history and rollback support

#### Method C: Deploy via CLI

For manual deployment from your local machine:

```bash
# 1. Clone the repository (if not already cloned)
git clone https://github.com/zacfire/rss-mcp.git
cd rss-mcp

# 2. Install Vercel CLI globally (first time only)
npm install -g vercel

# 3. Login to Vercel
vercel login

# 4. Deploy to preview environment
vercel

# 5. Deploy to production
vercel --prod
```

#### Setting Environment Variables

In your Vercel project settings, you can optionally set:

- **`PRIORITY_RSSHUB_INSTANCE`**: Your preferred RSSHub instance URL
  - Example: `https://my-rsshub.example.com`
  - This instance will be tried first before falling back to public instances

**How to set environment variables:**
1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add `PRIORITY_RSSHUB_INSTANCE` with your value
4. Select environment (Production, Preview, Development)
5. Click "Save" - this will trigger a new deployment

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
│   │       └── route.ts        # MCP handler (required dynamic route)
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Homepage with API documentation
├── src/
│   ├── lib/
│   │   ├── feed-parser.ts      # Core RSS parsing logic
│   │   ├── rsshub-instances.ts # RSSHub instance management
│   │   ├── types.ts            # TypeScript types
│   │   └── index.ts            # Module exports
│   └── index.ts                # stdio server entry point
├── public/
│   └── .gitkeep                # Keep public directory in git
├── .env.example
├── next.config.mjs             # Next.js configuration
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

## Verifying Your Deployment

After deploying to Vercel, verify that everything works:

### 1. Check the Homepage

Visit your deployment URL (e.g., `https://your-project-name.vercel.app`)

You should see:
- Server name and description
- MCP endpoint URL
- Available tools documentation
- Client configuration examples

### 2. Test the MCP Endpoint

The MCP endpoint is available at: `https://your-project-name.vercel.app/api`

You can test it by:
1. Adding it to your MCP client configuration (Cursor or Claude Desktop)
2. Trying the `get_feed` tool with a test URL

### 3. Example Test

In Cursor or Claude Desktop, try:
```
Use the rss tool to get the feed from: rsshub://github/issue/anthropics/anthropic-sdk-typescript
```

## Troubleshooting

### Vercel Deployment Issues

**Error: "No Output Directory named 'public' found"**
- Solution: The `public` directory should be auto-created. If missing, run:
  ```bash
  mkdir public
  git add public
  git commit -m "Add public directory"
  git push
  ```

**Error: "Build failed" or TypeScript errors**
- Check the build logs in Vercel Dashboard
- Ensure all dependencies are installed: `npm install`
- Test locally first: `npm run build`

**Error: "Function timeout"**
- Some RSS feeds may take longer to fetch
- The route handler uses `maxDuration: 60` seconds by default
- For Vercel Pro accounts, you can increase this limit in the mcp-handler options

### MCP Connection Issues

**Client can't connect to the server**
- Verify the URL is correct: `https://your-project-name.vercel.app/api`
- Check that the deployment is live (visit the URL in browser)
- For Claude Desktop, ensure `mcp-remote` is installed: `npx mcp-remote --version`

**Tool returns errors**
- Check Vercel function logs in Dashboard → Deployments → [Latest] → Functions
- Verify the RSS/RSSHub URL is accessible
- Try a different RSSHub instance by setting `PRIORITY_RSSHUB_INSTANCE`

### Local Development Issues

**Port 3000 already in use**
- Change the port: `PORT=3001 npm run dev`
- Or kill the process using port 3000

**TypeScript errors during development**
- Run `npm install` to ensure all type definitions are installed
- Check that `tsconfig.json` is properly configured

## Performance Notes

- **Cold Starts**: First request after inactivity may take 2-3 seconds (Vercel serverless warm-up)
- **Timeout**: RSS fetching has a 15-second timeout per instance, 60-second function limit
- **RSSHub Fallback**: If one instance fails, it automatically tries the next one
- **Caching**: Consider implementing caching for frequently accessed feeds

## License

This project is licensed under the Apache-2.0 License.
