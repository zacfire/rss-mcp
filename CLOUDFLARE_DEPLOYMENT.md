# Deploy RSS MCP to Cloudflare Pages

This guide shows you how to deploy the RSS MCP server to Cloudflare Pages.

## Prerequisites

- Cloudflare account (free tier works)
- GitHub repository connected to Cloudflare Pages
- Node.js 18+ installed locally

## Deployment Options

### Option 1: Deploy via Cloudflare Dashboard (Recommended)

1. **Go to Cloudflare Dashboard**
   - Visit https://dash.cloudflare.com/
   - Navigate to **Workers & Pages**

2. **Create a New Project**
   - Click **Create application** → **Pages** → **Connect to Git**
   - Select your GitHub repository: `zacfire/rss-mcp`
   - Click **Begin setup**

3. **Configure Build Settings**
   - **Framework preset**: Next.js
   - **Build command**: `npm run pages:build`
   - **Build output directory**: `.vercel/output/static`
   - **Root directory**: `/` (leave empty)

4. **Environment Variables** (optional)
   - Add `PRIORITY_RSSHUB_INSTANCE` if you want to prioritize a specific RSSHub instance

5. **Deploy**
   - Click **Save and Deploy**
   - Wait for the build to complete (~2-3 minutes)
   - Your site will be available at: `https://rss-mcp-xxx.pages.dev`

### Option 2: Deploy via Wrangler CLI

1. **Install Wrangler**
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

3. **Build the Project**
   ```bash
   npm run build
   npm run pages:build
   ```

4. **Deploy**
   ```bash
   wrangler pages deploy .vercel/output/static --project-name=rss-mcp
   ```

5. **Your MCP server will be available at:**
   ```
   https://rss-mcp.pages.dev/api/mcp
   ```

## Configure Claude Desktop

After deployment, update your Claude Desktop config:

**macOS/Linux:**
```json
{
  "mcpServers": {
    "rss": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://rss-mcp-xxx.pages.dev/api/mcp",
        "--transport",
        "http-only"
      ]
    }
  }
}
```

**File location:**
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

## Test Your Deployment

1. **Test with curl:**
   ```bash
   curl https://rss-mcp-xxx.pages.dev/
   ```

2. **Test MCP endpoint:**
   ```bash
   npx mcp-remote https://rss-mcp-xxx.pages.dev/api/mcp --transport http-only
   ```

3. **Restart Claude Desktop** and test with a prompt:
   ```
   Please list available tools
   ```

## Troubleshooting

### Build fails with "Module not found"
- Make sure all dependencies are installed: `npm install`
- Check Node.js version: `node --version` (should be 18+)

### 404 error when accessing /api/mcp
- Verify build output directory is set to `.vercel/output/static`
- Check Cloudflare Pages build logs for errors

### Connection timeout in Claude Desktop
- Ensure you're using `--transport http-only` flag
- Check if your network can access `.pages.dev` domains
- Try using a VPN if in mainland China

## Custom Domain (Optional)

1. Go to your Pages project in Cloudflare Dashboard
2. Click **Custom domains** tab
3. Click **Set up a custom domain**
4. Follow the DNS instructions

## Comparison: Vercel vs Cloudflare Pages

| Feature | Vercel | Cloudflare Pages |
|---------|--------|------------------|
| China Access | ❌ Blocked | ✅ Better |
| Free Tier | 100GB/month | Unlimited |
| Build Time | ~1-2 min | ~2-3 min |
| Cold Start | ~100-200ms | ~50-100ms |
| Edge Locations | Global | Global |

## Support

For issues or questions:
- GitHub Issues: https://github.com/zacfire/rss-mcp/issues
- MCP Documentation: https://modelcontextprotocol.io

## License

Apache-2.0
