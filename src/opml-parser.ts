// OPML parser for RSS feed subscriptions

import { XMLParser } from 'fast-xml-parser';

export interface OPMLFeed {
    title: string;
    xmlUrl: string;
    htmlUrl?: string;
    category?: string;
}

export interface OPMLParseResult {
    title?: string;
    feeds: OPMLFeed[];
}

// Normalize array or single value to array
function toArray<T>(value: T | T[] | undefined): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
}

// Recursively extract feeds from OPML outline structure
function extractFeeds(outlines: any[], category?: string): OPMLFeed[] {
    const feeds: OPMLFeed[] = [];

    for (const outline of outlines) {
        // If outline has xmlUrl, it's a feed
        if (outline['@_xmlUrl']) {
            feeds.push({
                title: outline['@_title'] || outline['@_text'] || 'Untitled',
                xmlUrl: outline['@_xmlUrl'],
                htmlUrl: outline['@_htmlUrl'],
                category: category,
            });
        }

        // If outline has nested outlines, it's a category/folder
        if (outline.outline) {
            const nestedOutlines = toArray(outline.outline);
            const categoryName = outline['@_title'] || outline['@_text'] || category;
            feeds.push(...extractFeeds(nestedOutlines, categoryName));
        }
    }

    return feeds;
}

export function parseOPML(opmlContent: string): OPMLParseResult {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
        parseAttributeValue: true,
        parseTagValue: true,
        trimValues: true,
    });

    const parsed = parser.parse(opmlContent);

    if (!parsed.opml) {
        throw new Error('Invalid OPML format: missing <opml> root element');
    }

    const opml = parsed.opml;
    const head = opml.head || {};
    const body = opml.body || {};

    const title = head.title;
    const outlines = toArray(body.outline);
    const feeds = extractFeeds(outlines);

    return {
        title,
        feeds,
    };
}
