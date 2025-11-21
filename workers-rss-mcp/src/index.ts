/**
 * RSS MCP Server on Cloudflare Workers - Remote HTTP MCP Server
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { z } from 'zod';
import { getFeed } from './rss-parser';

export interface Env {
	PRIORITY_RSSHUB_INSTANCE?: string;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		// Handle CORS preflight
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: {
					'Access-Control-Allow-Origin': '*',
					'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type',
				},
			});
		}

		// SSE endpoint for MCP
		if (url.pathname === '/sse' || url.pathname === '/') {
			return handleSSE(request, env);
		}

		// Health check
		if (url.pathname === '/health') {
			return new Response(JSON.stringify({ status: 'ok' }), {
				headers: { 'Content-Type': 'application/json' },
			});
		}

		return new Response('RSS MCP Server - Use /sse endpoint for MCP connection', {
			status: 404,
		});
	},
};

async function handleSSE(request: Request, env: Env): Promise<Response> {
	const server = new Server(
		{
			name: 'rss-mcp',
			version: '1.0.0',
		},
		{
			capabilities: {
				tools: {},
			},
		}
	);

	// Register the get_feed tool
	server.setRequestHandler('tools/list', async () => ({
		tools: [
			{
				name: 'get_feed',
				description:
					'Get RSS feed from any URL, including RSSHub feeds. Supports rsshub:// protocol and automatically tries multiple RSSHub instances for better reliability.',
				inputSchema: {
					type: 'object',
					properties: {
						url: {
							type: 'string',
							description:
								"URL of the RSS feed. For RSSHub, you can use 'rsshub://' protocol (e.g., 'rsshub://bilibili/user/dynamic/208259'). For regular RSS feeds, use the full URL.",
						},
						count: {
							type: 'number',
							description:
								'Number of RSS feed items to retrieve. Defaults to 1. Set to 0 to retrieve all items.',
							default: 1,
						},
					},
					required: ['url'],
				},
			},
		],
	}));

	// Handle tool calls
	server.setRequestHandler('tools/call', async (request) => {
		if (request.params.name === 'get_feed') {
			try {
				const args = request.params.arguments as { url: string; count?: number };
				console.log(`Tool called with URL: ${args.url}, count: ${args.count}`);

				const feedResult = await getFeed({
					url: args.url,
					count: args.count ?? 1,
					priorityInstance: env.PRIORITY_RSSHUB_INSTANCE,
				});

				console.log(`Tool completed successfully for URL: ${args.url}`);
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(feedResult, null, 2),
						},
					],
				};
			} catch (error) {
				const errorMessage =
					error instanceof Error ? error.message : 'An unknown error occurred';
				console.error(`Tool error: ${errorMessage}`);
				return {
					content: [
						{
							type: 'text',
							text: `Error fetching RSS feed: ${errorMessage}`,
						},
					],
					isError: true,
				};
			}
		}

		throw new Error(`Unknown tool: ${request.params.name}`);
	});

	const transport = new SSEServerTransport('/messages', request);
	await server.connect(transport);

	return transport.response;
}
