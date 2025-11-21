// RSS Feed types

export interface RssFeed {
    title?: string;
    link?: string;
    description?: string;
    items: RssItem[];
}

export interface RssItem {
    title?: string;
    description?: string;
    link?: string;
    guid?: string;
    pubDate?: string;
    author?: string;
    category?: string[];
}
