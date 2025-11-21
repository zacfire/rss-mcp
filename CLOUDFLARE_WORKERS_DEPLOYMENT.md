# Deploy RSS MCP to Cloudflare Workers

This guide shows you how to deploy the RSS MCP server to Cloudflare Workers using the workers-mcp implementation.

## Why Cloudflare Workers?

After attempting deployment on both Vercel and Cloudflare Pages, Cloudflare Workers emerged as the best solution:

✅ **Better China Access**: Not blocked by the Great Firewall like Vercel
✅ **Faster Cold Starts**: ~50-100ms vs ~100-200ms on Vercel
✅ **Generous Free Tier**: 100,000 requests/day (vs Vercel's 100GB bandwidth)
✅ **True Edge Computing**: Runs in 300+ cities worldwide
✅ **No Timeout Issues**: More reliable than serverless functions

## Prerequisites

- Cloudflare account (free tier works)
- Node.js 18+ installed locally
- Git (for version control)

## Quick Start Deployment

### 1. Navigate to the Workers Project

```bash
cd workers-rss-mcp
```

### 2. Login to Cloudflare

```bash
npx wrangler login
```

This will open a browser window for authentication.

### 3. Deploy

```bash
npm run deploy
```

Your Worker will be deployed to: `https://workers-rss-mcp.<your-account>.workers.dev`

## Configure MCP Clients

### Claude Desktop

Edit your configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add this configuration:

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

**Important**: Replace `<your-account>` with your actual Cloudflare Workers subdomain.

### Cursor / Windsurf

Add to your MCP settings file:

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

### Restart Your MCP Client

After updating the configuration:
- **Claude Desktop**: Restart the application
- **Cursor/Windsurf**: Restart or reload the window

## Test Your Deployment

### Option 1: Test with MCP Inspector

```bash
npx @modelcontextprotocol/inspector npx workers-mcp run workers-rss-mcp https://workers-rss-mcp.<your-account>.workers.dev
```

### Option 2: Test in Claude Desktop

After restarting Claude Desktop, try:

```
Please list available tools
```

You should see the `get_feed` tool. Then test it:

```
Please use get_feed to fetch 3 items from https://news.ycombinator.com/rss
```

### Option 3: Test RSSHub Support

```
Please fetch 5 items from rsshub://bilibili/user/dynamic/208259
```

## Environment Variables (Optional)

If you want to prioritize a specific RSSHub instance:

```bash
cd workers-rss-mcp
npx wrangler secret put PRIORITY_RSSHUB_INSTANCE
```

Enter your preferred instance URL when prompted (e.g., `https://rsshub.app`).

Alternatively, set it in the Cloudflare Dashboard:
1. Go to **Workers & Pages**
2. Select your **workers-rss-mcp** worker
3. Go to **Settings** > **Variables**
4. Add **PRIORITY_RSSHUB_INSTANCE** with your preferred URL

## Custom Domain (Optional)

### 1. Add a Custom Domain

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **Workers & Pages**
3. Click on your **workers-rss-mcp** worker
4. Go to **Settings** > **Domains & Routes**
5. Click **Add Custom Domain**
6. Enter your domain (e.g., `rss-mcp.yourdomain.com`)
7. Follow DNS setup instructions

### 2. Update MCP Client Configuration

Update your Claude Desktop config to use the custom domain:

```json
{
  "mcpServers": {
    "rss": {
      "command": "npx",
      "args": [
        "workers-mcp",
        "run",
        "workers-rss-mcp",
        "https://rss-mcp.yourdomain.com"
      ]
    }
  }
}
```

## Development Workflow

### Local Development

```bash
cd workers-rss-mcp
npm run dev
```

The Worker will be available at `http://localhost:8787`

### Test Locally with MCP Inspector

```bash
npx @modelcontextprotocol/inspector npx workers-mcp run workers-rss-mcp http://localhost:8787
```

### Deploy Updates

```bash
npm run deploy
```

**Note**: If you change method names or parameters, restart your MCP client after deployment.

## Troubleshooting

### "Unauthorized" Error

This is **expected behavior**! The Worker uses MCP protocol, not regular HTTP. You must access it through:
- An MCP client (Claude Desktop, Cursor, etc.)
- The workers-mcp proxy: `npx workers-mcp run ...`
- MCP Inspector

### "wrangler: command not found"

Install wrangler globally:

```bash
npm install -g wrangler
```

Or use npx:

```bash
npx wrangler login
npx wrangler deploy
```

### "Not logged in to Cloudflare"

Run the login command:

```bash
npx wrangler login
```

### Feed Timeout Errors

Cloudflare Workers free tier has a 50ms CPU time limit. For large feeds:
1. Use the `count` parameter to limit items
2. Consider upgrading to Workers Paid ($5/month for 30s CPU time)

### RSSHub Instance Failures

The Worker automatically tries multiple RSSHub instances. If all fail:
1. Check if RSSHub is accessible from your region
2. Set a priority instance with `PRIORITY_RSSHUB_INSTANCE`
3. Try a different RSSHub route

### "Module not found" Errors

Reinstall dependencies:

```bash
cd workers-rss-mcp
rm -rf node_modules package-lock.json
npm install
```

## Architecture Details

### Technology Stack

- **workers-mcp**: Cloudflare's official MCP adapter
- **fast-xml-parser**: Lightweight XML parser (works in Workers runtime)
- **Native Fetch API**: For HTTP requests
- **WorkerEntrypoint**: Cloudflare's service binding pattern

### How It Works

1. **MCP Client** (Claude Desktop) calls `get_feed` tool
2. **workers-mcp** proxy translates MCP protocol to HTTP
3. **ProxyToSelf** in Worker routes request to `get_feed()` method
4. **RSS Parser** fetches and parses the feed using Web APIs
5. **RSSHub Handler** tries multiple instances on failure
6. **Response** returns as JSON to the MCP client

### Key Differences from Next.js Version

| Component | Next.js Version | Workers Version |
|-----------|----------------|-----------------|
| **Transport** | mcp-handler | workers-mcp + ProxyToSelf |
| **HTTP Client** | axios | Native fetch() |
| **XML Parser** | rss-parser (Node.js) | fast-xml-parser (Web-compatible) |
| **HTML Cleaning** | cheerio | Regex-based stripping |
| **Date Formatting** | date-fns-tz | Native Date + Intl API |
| **Runtime** | Node.js | Edge Runtime |

## Monitoring & Analytics

### View Logs

```bash
npx wrangler tail
```

### View Metrics

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **Workers & Pages**
3. Click on **workers-rss-mcp**
4. View metrics: requests, errors, CPU time

### Enable Enhanced Analytics (Paid)

Workers Analytics Engine provides detailed metrics:
- Request duration
- Success/error rates
- Popular feeds

## Cost Estimate

### Free Tier Limits

- **100,000 requests/day**
- **10ms CPU time per request**
- **50ms total CPU time per request**

### Typical Usage

- Average request: ~5-10ms CPU time
- 1,000 feeds/day = well within free tier
- Most users never exceed free tier

### Paid Tier ($5/month)

- **10 million requests/month**
- **30s CPU time per request**
- **50ms total CPU time per request**

## Security Best Practices

1. **Never commit secrets**: Use `wrangler secret` for sensitive data
2. **Use Custom Domains**: For production use
3. **Rate Limiting**: Consider implementing if public-facing
4. **CORS**: Already handled by ProxyToSelf

## Comparison: Deployment Options

| Feature | Vercel | Cloudflare Pages | Cloudflare Workers |
|---------|--------|------------------|-------------------|
| **China Access** | ❌ Blocked | ✅ Better | ✅ Best |
| **Free Tier** | 100GB bandwidth | Unlimited | 100K req/day |
| **Build Time** | ~1-2 min | ~2-3 min | ~30s |
| **Cold Start** | ~100-200ms | ~50-100ms | ~5-50ms |
| **Node.js Support** | ✅ Full | ❌ Edge only | ❌ Edge only |
| **Dependencies** | Any npm package | Web APIs only | Web APIs only |
| **RSS Parsing** | ✅ rss-parser | ❌ Incompatible | ✅ fast-xml-parser |
| **Setup Complexity** | Easy | Medium | Easy |
| **Best For** | Full Node.js apps | Static sites | Edge APIs |

**Winner for this project**: Cloudflare Workers - best balance of reliability, accessibility, and simplicity.

## Migration from Vercel

If you deployed the Next.js version to Vercel first:

1. Deploy to Cloudflare Workers (this guide)
2. Update Claude Desktop config to use Workers URL
3. Test that it works
4. (Optional) Keep Vercel deployment as backup
5. (Optional) Delete Vercel deployment to save resources

## Support

For issues or questions:
- **GitHub Issues**: https://github.com/zacfire/rss-mcp/issues
- **Cloudflare Discord**: https://discord.cloudflare.com
- **MCP Documentation**: https://modelcontextprotocol.io

## Next Steps

1. ✅ Deploy to Cloudflare Workers
2. ⬜ Configure Claude Desktop
3. ⬜ Test with sample RSS feeds
4. ⬜ Test with RSSHub feeds
5. ⬜ (Optional) Set up custom domain
6. ⬜ (Optional) Configure priority RSSHub instance
7. ⬜ Share with others!

## License

Apache-2.0
