/**
 * RSS MCP Server on Cloudflare Workers using Agents SDK
 */

import { createMcpHandler } from 'agents/mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getFeed } from './rss-parser';

export interface Env {
	PRIORITY_RSSHUB_INSTANCE?: string;
}

const server = new McpServer({
	name: 'rss-mcp',
	version: '1.0.0',
});

server.tool(
	'get_feed',
	{
		url: z
			.string()
			.describe(
				"URL of the RSS feed. For RSSHub, you can use 'rsshub://' protocol (e.g., 'rsshub://bilibili/user/dynamic/208259'). For regular RSS feeds, use the full URL."
			),
		count: z
			.number()
			.optional()
			.default(1)
			.describe('Number of RSS feed items to retrieve. Defaults to 1. Set to 0 to retrieve all items.'),
	},
	async ({ url, count }, { ctx }) => {
		try {
			const env = ctx.env as Env;
			console.log(`Tool called with URL: ${url}, count: ${count}`);

			const feedResult = await getFeed({
				url,
				count: count ?? 1,
				priorityInstance: env.PRIORITY_RSSHUB_INSTANCE,
			});

			console.log(`Tool completed successfully for URL: ${url}`);
			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify(feedResult, null, 2),
					},
				],
			};
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
			console.error(`Tool error: ${errorMessage}`);
			return {
				content: [
					{
						type: 'text' as const,
						text: `Error fetching RSS feed: ${errorMessage}`,
					},
				],
				isError: true,
			};
		}
	}
);

export default {
	fetch: createMcpHandler(server),
};
