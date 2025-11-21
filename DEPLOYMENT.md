# RSS MCP Deployment Guide

## ⚡ Cloudflare Workers (Recommended)

This is the **recommended deployment method** for the best global performance and accessibility.

### Quick Deploy

```bash
# Navigate to the Workers project
cd workers-rss-mcp

# Login to Cloudflare (first time only)
npx wrangler login

# Install dependencies
npm install

# Deploy to Cloudflare Workers
npm run deploy
```

Your Worker will be available at: `https://workers-rss-mcp.<your-account>.workers.dev`

### Configure Claude Desktop

After deployment, add to your Claude Desktop config:

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

Replace `<your-account>` with your actual Cloudflare Workers subdomain.

### Benefits

- ✅ **Global Access**: Works worldwide, including China (not blocked by GFW)
- ✅ **Fast**: ~50-100ms cold starts, 300+ global edge locations
- ✅ **Free Tier**: 100,000 requests/day
- ✅ **Reliable**: Built on Cloudflare's global network

---

## 📚 Full Documentation

For detailed guides, see:

- **[workers-rss-mcp/README.md](./workers-rss-mcp/README.md)** - Project documentation
- **[CLOUDFLARE_WORKERS_DEPLOYMENT.md](./CLOUDFLARE_WORKERS_DEPLOYMENT.md)** - Complete deployment guide

---

## 🔧 Local Development

```bash
cd workers-rss-mcp
npm install
npm run dev
```

The Worker will be available at `http://localhost:8787`

---

## ⚠️ Note on Other Deployment Methods

This repository previously supported Vercel/Next.js deployment. However, **Cloudflare Workers is now the recommended and primary deployment method** due to:

- Better global accessibility (especially from China)
- Faster performance and lower latency
- Simpler deployment process
- Lower cost (generous free tier)

If you need the Vercel version, it's still available in the codebase but is no longer actively maintained.

---

## 🆘 Troubleshooting

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

### "Not logged in"

Run the login command:
```bash
npx wrangler login
```

### Cloudflare Pages Build Errors

**Important**: This repository is designed for Cloudflare Workers deployment, NOT Cloudflare Pages.

If you connected this repo to Cloudflare Pages by mistake:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Workers & Pages**
3. Find your Pages project
4. Go to **Settings** > **Builds & deployments**
5. Click **Delete deployment** or disable automatic deployments

Then deploy properly using Workers:
```bash
cd workers-rss-mcp
npm run deploy
```

---

## 📖 Usage Example

After deployment and configuration, test in Claude Desktop:

```
Please fetch 3 items from rsshub://github/issue/cloudflare/workers-sdk
```

Or with a regular RSS feed:

```
Please fetch 5 items from https://news.ycombinator.com/rss
```

---

## 🚀 Next Steps

1. ✅ Deploy to Cloudflare Workers (see above)
2. ✅ Configure your MCP client (Claude Desktop, Cursor, etc.)
3. ✅ Test with sample RSS feeds
4. ✅ (Optional) Set custom domain
5. ✅ (Optional) Configure `PRIORITY_RSSHUB_INSTANCE` environment variable

Enjoy your globally-accessible RSS MCP server! 🎉
