// RSS feed parsing logic using Web APIs

import { XMLParser } from 'fast-xml-parser';
import { convertRsshubUrl } from './rsshub';
import { RssFeed, RssItem } from './types';

export interface GetFeedParams {
    url: string;
    count?: number;
    priorityInstance?: string;
}

// Simple HTML tag stripper (alternative to cheerio for Cloudflare Workers)
function stripHtmlTags(html: string): string {
    if (!html) return '';

    // Replace common HTML entities
    let text = html
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&ldquo;/g, '"')
        .replace(/&rdquo;/g, '"')
        .replace(/&lsquo;/g, "'")
        .replace(/&rsquo;/g, "'");

    // Remove HTML tags
    text = text.replace(/<[^>]*>/g, '');

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
}

// Format date to ISO string
function formatDate(dateString: string | undefined): string | undefined {
    if (!dateString) return undefined;

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return dateString; // Return original if invalid
        }
        return date.toISOString();
    } catch (e) {
        console.error(`Date parse error: ${e}`);
        return dateString;
    }
}

// Normalize array or single value to array
function toArray<T>(value: T | T[] | undefined): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

export async function getFeed(params: GetFeedParams): Promise<RssFeed> {
    try {
        let currentUrl = params.url;

        // Handle JSON string input
        if (typeof currentUrl !== 'string') {
            throw new Error("URL must be a string.");
        }

        try {
            const parsed = JSON.parse(currentUrl);
            if (parsed && typeof parsed === 'object' && parsed.url) {
                currentUrl = parsed.url;
            }
        } catch {
            // Not a JSON string, use as is
        }

        // Add rsshub:// protocol if no protocol is provided
        if (!currentUrl.includes('://')) {
            currentUrl = `rsshub://${currentUrl}`;
        }

        // Convert to array of URLs to try (handles RSSHub multi-instance)
        const urls = convertRsshubUrl(currentUrl, params.priorityInstance);

        const userAgents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0"
        ];

        const headers = {
            "User-Agent": userAgents[Math.floor(Math.random() * userAgents.length)],
            "Accept": "application/rss+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
        };

        let lastError: Error | null = null;

        // Try each URL until one succeeds
        for (const u of urls) {
            try {
                console.log(`Attempting to fetch from ${u}...`);

                const response = await fetch(u, {
                    headers,
                    signal: AbortSignal.timeout(15000) // 15s timeout
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const xmlData = await response.text();

                if (!xmlData) {
                    throw new Error("Empty response data");
                }

                // Parse XML using fast-xml-parser
                const parser = new XMLParser({
                    ignoreAttributes: false,
                    attributeNamePrefix: "@_",
                    textNodeName: "#text",
                    parseAttributeValue: true,
                    parseTagValue: true,
                    trimValues: true
                });

                const parsedFeed = parser.parse(xmlData);

                // Handle both RSS and Atom feeds
                let feedData: any;
                let items: any[] = [];

                if (parsedFeed.rss) {
                    // RSS 2.0
                    feedData = parsedFeed.rss.channel;
                    items = toArray(feedData.item);
                } else if (parsedFeed.feed) {
                    // Atom feed
                    feedData = parsedFeed.feed;
                    items = toArray(feedData.entry);
                } else if (parsedFeed['rdf:RDF']) {
                    // RSS 1.0 (RDF)
                    feedData = parsedFeed['rdf:RDF'].channel;
                    items = toArray(parsedFeed['rdf:RDF'].item);
                } else {
                    throw new Error("Unsupported feed format");
                }

                if (!items || items.length === 0) {
                    console.warn("No items found in feed");
                }

                const feedInfo: RssFeed = {
                    title: feedData.title || feedData['#text'],
                    link: typeof feedData.link === 'object' ? feedData.link['@_href'] : feedData.link,
                    description: feedData.description || feedData.subtitle,
                    items: []
                };

                const itemsToProcess = params.count === 0 ? items : items.slice(0, params.count ?? 1);

                for (const item of itemsToProcess) {
                    // Extract description/content
                    let description = '';
                    const content = item['content:encoded'] || item.content || item.description || item.summary;

                    if (content) {
                        const contentText = typeof content === 'object' ? (content['#text'] || content) : content;
                        description = stripHtmlTags(String(contentText));
                    }

                    // Extract link (handle both RSS and Atom formats)
                    let link: string | undefined;
                    if (item.link) {
                        if (typeof item.link === 'string') {
                            link = item.link;
                        } else if (Array.isArray(item.link)) {
                            const altLink = item.link.find((l: any) => l['@_rel'] === 'alternate');
                            link = altLink ? altLink['@_href'] : item.link[0]['@_href'];
                        } else if (typeof item.link === 'object') {
                            link = item.link['@_href'] || item.link['#text'];
                        }
                    }

                    // Extract categories
                    const categories = toArray(item.category).map((cat: any) =>
                        typeof cat === 'object' ? (cat['@_term'] || cat['#text']) : cat
                    ).filter(Boolean);

                    const feedItem: RssItem = {
                        title: item.title,
                        description: description,
                        link: link,
                        guid: item.guid || item.id || link,
                        pubDate: formatDate(item.pubDate || item.published || item.updated),
                        author: item.author?.name || item['dc:creator'] || item.creator,
                        category: categories.length > 0 ? categories : undefined
                    };

                    feedInfo.items.push(feedItem);
                }

                console.log(`Successfully fetched feed from ${u} with ${feedInfo.items.length} items`);
                return feedInfo;

            } catch (error) {
                lastError = error as Error;
                const errorMsg = error instanceof Error ? error.message : String(error);
                console.error(`Attempt to access ${u} failed: ${errorMsg}`);

                // Small delay between retries (only if not last URL)
                if (urls.indexOf(u) < urls.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
                continue;
            }
        }

        const finalError = lastError?.message || 'Unknown error';
        console.error(`All RSSHub instances failed. Last error: ${finalError}`);
        throw new Error(`All RSSHub instances failed: ${finalError}`);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        console.error(`Unexpected error in getFeed: ${errorMessage}`);
        throw error;
    }
}
