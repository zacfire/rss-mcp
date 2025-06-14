import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema, Tool, CallToolRequest } from "@modelcontextprotocol/sdk/types.js";
import axios from 'axios';
import Parser from 'rss-parser';
import * as cheerio from 'cheerio';
import { formatInTimeZone } from 'date-fns-tz';
import 'dotenv/config';

// Load instances from environment variable first, if available
const priorityInstance = process.env.PRIORITY_RSSHUB_INSTANCE;

let RSSHUB_INSTANCES = [
    "https://rsshub.app",
    "https://rsshub.rssforever.com",
    "https://rsshub.feeded.xyz",
    "https://hub.slarker.me",
    "https://rsshub.liumingye.cn",
    "https://rsshub-instance.zeabur.app",
    "https://rss.fatpandac.com",
    "https://rsshub.pseudoyu.com",
    "https://rsshub.friesport.ac.cn",
    "https://rsshub.atgw.io",
    "https://rsshub.rss.tips",
    "https://rsshub.mubibai.com",
    "https://rsshub.ktachibana.party",
    "https://rsshub.woodland.cafe",
    "https://rsshub.aierliz.xyz",
    "http://localhost:1200"
];

// If a priority instance is set, add it to the front of the list
if (priorityInstance) {
    // Remove it from the list if it already exists to avoid duplicates
    RSSHUB_INSTANCES = RSSHUB_INSTANCES.filter(url => url !== priorityInstance);
    RSSHUB_INSTANCES.unshift(priorityInstance);
}


function convertRsshubUrl(url: string): string[] {
    if (url.startsWith('rsshub://')) {
        const path = url.substring(9);
        return RSSHUB_INSTANCES.map(instance => `${instance}/${path}`);
    }

    for (const instance of RSSHUB_INSTANCES) {
        if (url.startsWith(instance)) {
            const path = url.substring(instance.length).replace(/^\//, '');
            return RSSHUB_INSTANCES.map(inst => `${inst}/${path}`);
        }
    }

    return [url];
}

interface RssFeed {
    title?: string;
    link?: string;
    description?: string;
    items: RssItem[];
}

interface RssItem {
    title?: string;
    description?: string;
    link?: string;
    guid?: string;
    pubDate?: string;
    author?: string;
    category?: string[];
}


const server = new Server(
    {
        name: "rss",
        version: "1.0.0"
    },
    {
        capabilities: {
            tools: {}
        }
    }
);

export async function get_feed(params: { url: string }): Promise<RssFeed> {
    let currentUrl = params.url;

     if (typeof currentUrl !== 'string') {
        throw new Error("URL must be a string.");
    }

    // Handle JSON string input
    try {
        const parsed = JSON.parse(currentUrl);
        if (parsed && typeof parsed === 'object' && parsed.url) {
            currentUrl = parsed.url;
        }
    } catch (e) {
        // Not a JSON string, use as is
    }

    if (!currentUrl.includes('://')) {
        currentUrl = `rsshub://${currentUrl}`;
    }

    const urls = convertRsshubUrl(currentUrl);

    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0"
    ];

    const headers = {
        "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
        "Accept": "application/rss+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "close"
    };

    let lastError: Error | null = null;

    for (const u of urls) {
        try {
            console.error(`Attempting to fetch from ${u}...`);
            const response = await axios.get(u, {
                headers,
                timeout: 30000,
            });

            const parser = new Parser();
            const feed = await parser.parseString(response.data);

            if (!feed || !feed.items) {
                throw new Error("Cannot parse RSS feed, feed or feed.items is undefined.");
            }

            const feedInfo: RssFeed = {
                title: feed.title,
                link: feed.link,
                description: feed.description,
                items: []
            };

            for (const item of feed.items) {
                let description = '';
                if (item.content) {
                    const $ = cheerio.load(item.content);
                    description = $.text().replace(/\s+/g, ' ').trim();
                } else if (item.contentSnippet) {
                    description = item.contentSnippet;
                }

                let pubDate: string | undefined = undefined;
                if (item.pubDate) {
                    try {
                        pubDate = formatInTimeZone(new Date(item.pubDate), 'UTC', "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
                    } catch (e) {
                        console.error(`Date parse error: ${e}`);
                        pubDate = item.pubDate;
                    }
                }

                const feedItem: RssItem = {
                    title: item.title,
                    description: description,
                    link: item.link,
                    guid: item.guid || item.link,
                    pubDate: pubDate,
                    author: item.creator,
                    category: item.categories
                };
                feedInfo.items.push(feedItem);
            }

            return feedInfo;

        } catch (error) {
            lastError = error as Error;
            console.error(`Attempt to access ${u} failed:`, error);
            continue;
        }
    }

    throw new Error(`All RSSHub instances failed: ${lastError?.message || 'Unknown error'}`);
}

const rssTool: Tool = {
    name: 'get_feed',
    description: 'Get RSS feed from any URL, including RSSHub feeds.',
    inputSchema: {
        type: 'object',
        properties: {
            url: {
                type: 'string',
                description: 'URL of the RSS feed. For RSSHub, you can use "rsshub://" protocol (e.g., "rsshub://bilibili/user/dynamic/208259").'
            }
        },
        required: ['url']
    }
};

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [rssTool]
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request: CallToolRequest) => {
    if (request.params.name === 'get_feed') {
        try {
            const feedResult = await get_feed(request.params.arguments as { url: string });
            // The client expects a `content` array with a text object containing the stringified JSON.
            return {
                content: [{ type: 'text', text: JSON.stringify(feedResult, null, 2) }]
            } as any;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            return {
                content: [{ type: 'text', text: `Error fetching RSS feed: ${errorMessage}` }]
            } as any;
        }
    }
    throw new Error(`Tool not found: ${request.params.name}`);
});


async function run() {
    try {
        const transport = new StdioServerTransport();
        await server.connect(transport);
        console.error('RSS MCP Server started via stdio');
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

if (require.main === module) {
    run();
}