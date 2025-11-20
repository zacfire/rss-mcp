// RSSHub instance management

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

export function getRsshubInstances(): string[] {
    return [...RSSHUB_INSTANCES];
}

export function convertRsshubUrl(url: string): string[] {
    const instances = getRsshubInstances();

    if (url.startsWith('rsshub://')) {
        const path = url.substring(9);
        return instances.map(instance => `${instance}/${path}`);
    }

    for (const instance of instances) {
        if (url.startsWith(instance)) {
            const path = url.substring(instance.length).replace(/^\//, '');
            return instances.map(inst => `${inst}/${path}`);
        }
    }

    return [url];
}
