import { createMcpHandler } from 'mcp-handler';
import { z } from 'zod';
import { getFeed } from '../../../src/lib';

// Vercel Route Segment Config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const handler = createMcpHandler(
  (server) => {
    server.tool(
      'get_feed',
      'Get RSS feed from any URL, including RSSHub feeds.',
      {
        url: z.string().describe("URL of the RSS feed. For RSSHub, you can use 'rsshub://' protocol (e.g., 'rsshub://bilibili/user/dynamic/208259')."),
        count: z.number().optional().describe("Number of RSS feed items to retrieve. Defaults to 1. Set to 0 to retrieve all items.")
      },
      async ({ url, count }) => {
        try {
          console.log(`Tool called with URL: ${url} and count: ${count}`);
          const feedResult = await getFeed({ url, count });
          console.log(`Tool completed successfully for URL: ${url}`);
          return {
            content: [{ type: 'text' as const, text: JSON.stringify(feedResult, null, 2) }]
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
          console.error(`Tool error for URL ${url}: ${errorMessage}`);
          return {
            content: [{ type: 'text' as const, text: `Error fetching RSS feed: ${errorMessage}` }],
            isError: true
          };
        }
      }
    );
  },
  {},
  {
    basePath: '/api',
    verboseLogs: true,
    maxDuration: 60
  }
);

export { handler as GET, handler as POST };
