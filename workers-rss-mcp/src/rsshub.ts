// RSSHub instance management

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
    "https://rsshub.aierliz.xyz"
];

export function getRsshubInstances(priorityInstance?: string): string[] {
    if (priorityInstance) {
        const instances = RSSHUB_INSTANCES.filter(url => url !== priorityInstance);
        return [priorityInstance, ...instances];
    }
    return [...RSSHUB_INSTANCES];
}

export function convertRsshubUrl(url: string, priorityInstance?: string): string[] {
    const instances = getRsshubInstances(priorityInstance);

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
