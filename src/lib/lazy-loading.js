export default class LazyLoading {
    static async loadScript(src, retainOrder) {
        let request = LazyLoading.REQUESTS.get(src);
        if (request) return request;
        request = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            LazyLoading._bindEvents(script, resolve, reject);
            script.type = 'text/javascript';
            script.src = src;
            if (retainOrder) {
                script.async = false; // download async and don't block rendering but execute in insertion order
            }
            document.head.appendChild(script);
        });
        LazyLoading.REQUESTS.set(src, request);
        request.catch(() => LazyLoading.REQUESTS.delete(src));
        return request;
    }

    static async loadScripts(files, retainOrder) {
        retainOrder = retainOrder !== undefined ? retainOrder : files.length > 1;
        return Promise.all(files.map(file => LazyLoading.loadScript(file, retainOrder)));
    }

    static _bindEvents(el, resolve, reject) {
        el.onload = () => {
            el.onload = null;
            el.onerror = null;
            resolve();
        };
        el.onerror = e => {
            el.onload = null;
            el.onerror = null;
            reject(e);
        };
    }
}
LazyLoading.REQUESTS = new Map();
