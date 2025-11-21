#!/bin/sh
# This repository is designed for Cloudflare Workers, not Pages
# The workers-rss-mcp directory should be deployed separately using:
#   cd workers-rss-mcp && npx wrangler deploy

echo "⚠️  This project is for Cloudflare Workers deployment only"
echo "📖 See workers-rss-mcp/README.md for deployment instructions"
echo ""
echo "To deploy:"
echo "  cd workers-rss-mcp"
echo "  npx wrangler login"
echo "  npm run deploy"

# Create empty build output to satisfy Pages
mkdir -p .next
touch .next/.gitkeep

exit 0
