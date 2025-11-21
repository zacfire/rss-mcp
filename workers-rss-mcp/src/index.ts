/**
 * RSS MCP Server on Cloudflare Workers
 *
 * This Worker implements a Model Context Protocol (MCP) server that provides
 * RSS feed fetching and parsing capabilities with RSSHub support.
 *
 * To test: npm run dev
 * To deploy: npm run deploy
 */

import { WorkerEntrypoint } from 'cloudflare:workers';
import { ProxyToSelf } from 'workers-mcp';
import { getFeed } from './rss-parser';

export interface Env {
	// Environment variables
	PRIORITY_RSSHUB_INSTANCE?: string;
}

export default class RssMcpWorker extends WorkerEntrypoint<Env> {
	/**
	 * Get RSS feed from any URL, including RSSHub feeds.
	 *
	 * This tool fetches and parses RSS/Atom feeds from any URL. It supports
	 * RSSHub feeds using the 'rsshub://' protocol and automatically tries
	 * multiple RSSHub instances for better reliability.
	 *
	 * @param url The URL of the RSS feed. For RSSHub, you can use 'rsshub://' protocol (e.g., 'rsshub://bilibili/user/dynamic/208259'). For regular RSS feeds, use the full URL.
	 * @param count Number of RSS feed items to retrieve. Defaults to 1. Set to 0 to retrieve all items.
	 * @return A JSON string containing the parsed RSS feed data including title, description, and items.
	 */
	async get_feed(url: string, count: number = 1): Promise<string> {
		try {
			console.log(`get_feed called with URL: ${url}, count: ${count}`);

			const feedResult = await getFeed({
				url,
				count,
				priorityInstance: this.env.PRIORITY_RSSHUB_INSTANCE
			});

			console.log(`get_feed completed successfully for URL: ${url}`);
			return JSON.stringify(feedResult, null, 2);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
			console.error(`get_feed error for URL ${url}: ${errorMessage}`);

			// Return error as JSON
			return JSON.stringify({
				error: errorMessage,
				url: url
			}, null, 2);
		}
	}

	/**
	 * @ignore
	 * This method handles incoming HTTP requests and routes them to the MCP protocol handler.
	 */
	async fetch(request: Request): Promise<Response> {
		return new ProxyToSelf(this).fetch(request);
	}
}
