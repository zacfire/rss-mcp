/**
 * RSS MCP Server on Cloudflare Workers using Agents SDK
 */

import { createMcpHandler } from 'agents/mcp';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getFeed } from './rss-parser';
import { parseOPML } from './opml-parser';
import type { RssFeed } from './types';

export interface Env {
	PRIORITY_RSSHUB_INSTANCE?: string;
}

const server = new McpServer({
	name: 'rss-mcp',
	version: '1.1.0',
});

// Tool 1: Get a single RSS feed
server.registerTool(
	'get_feed',
	{
		description: 'Get RSS feed from any URL, including RSSHub feeds.',
		inputSchema: {
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
	},
	async ({ url, count }) => {
		try {
			console.log(`Tool called with URL: ${url}, count: ${count}`);

			const feedResult = await getFeed({
				url,
				count: count ?? 1,
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

// Tool 2: Get multiple RSS feeds from URLs or OPML
server.registerTool(
	'get_feeds',
	{
		description:
			'Get multiple RSS feeds at once. Accepts either an OPML file content (exported from Feedly, Inoreader, etc.) or a list of RSS URLs. Returns aggregated content from all feeds.',
		inputSchema: {
			opml: z
				.string()
				.optional()
				.describe('OPML file content (XML string) exported from RSS readers like Feedly, Inoreader, etc.'),
			urls: z
				.array(z.string())
				.optional()
				.describe('Array of RSS feed URLs to fetch'),
			count: z
				.number()
				.optional()
				.default(1)
				.describe('Number of items to retrieve per feed. Defaults to 1. Set to 0 for all items.'),
			concurrency: z
				.number()
				.optional()
				.default(5)
				.describe('Number of feeds to fetch in parallel. Defaults to 5. Higher values are faster but may hit rate limits.'),
		},
	},
	async ({ opml, urls, count, concurrency }) => {
		try {
			// Collect all feed URLs
			let feedUrls: { url: string; title?: string; category?: string }[] = [];

			// Parse OPML if provided
			if (opml) {
				console.log('Parsing OPML content...');
				const opmlResult = parseOPML(opml);
				console.log(`Found ${opmlResult.feeds.length} feeds in OPML`);
				feedUrls.push(
					...opmlResult.feeds.map((f) => ({
						url: f.xmlUrl,
						title: f.title,
						category: f.category,
					}))
				);
			}

			// Add URLs if provided
			if (urls && urls.length > 0) {
				console.log(`Adding ${urls.length} URLs from array`);
				feedUrls.push(...urls.map((url) => ({ url })));
			}

			if (feedUrls.length === 0) {
				return {
					content: [
						{
							type: 'text' as const,
							text: 'Error: No feeds provided. Please provide either OPML content or an array of URLs.',
						},
					],
					isError: true,
				};
			}

			console.log(`Fetching ${feedUrls.length} feeds with concurrency ${concurrency}...`);

			// Fetch feeds in parallel with concurrency limit
			const results: {
				title: string;
				url: string;
				category?: string;
				feed?: RssFeed;
				error?: string;
			}[] = [];

			// Process in batches
			const batchSize = concurrency ?? 5;
			for (let i = 0; i < feedUrls.length; i += batchSize) {
				const batch = feedUrls.slice(i, i + batchSize);
				const batchResults = await Promise.all(
					batch.map(async ({ url, title, category }) => {
						try {
							const feed = await getFeed({ url, count: count ?? 1 });
							return {
								title: title || feed.title || url,
								url,
								category,
								feed,
							};
						} catch (error) {
							const errorMessage = error instanceof Error ? error.message : 'Unknown error';
							console.error(`Failed to fetch ${url}: ${errorMessage}`);
							return {
								title: title || url,
								url,
								category,
								error: errorMessage,
							};
						}
					})
				);
				results.push(...batchResults);
			}

			// Aggregate results
			const successful = results.filter((r) => r.feed);
			const failed = results.filter((r) => r.error);

			const summary = {
				total: feedUrls.length,
				successful: successful.length,
				failed: failed.length,
				feeds: successful.map((r) => ({
					title: r.title,
					url: r.url,
					category: r.category,
					link: r.feed?.link,
					description: r.feed?.description,
					items: r.feed?.items || [],
				})),
				errors: failed.map((r) => ({
					title: r.title,
					url: r.url,
					error: r.error,
				})),
			};

			console.log(`Completed: ${successful.length} successful, ${failed.length} failed`);

			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify(summary, null, 2),
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
						text: `Error processing feeds: ${errorMessage}`,
					},
				],
				isError: true,
			};
		}
	}
);

const handler = createMcpHandler(server, {
	route: '/rss', // 端点: mcp.roseau.app/rss
	corsOptions: {
		origin: '*',
		methods: 'GET, POST, OPTIONS',
		headers: 'Content-Type',
	},
});

export default {
	fetch: handler,
};
