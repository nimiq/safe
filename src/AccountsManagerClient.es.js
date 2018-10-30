class RandomUtils {
    static generateRandomId() {
        const array = new Uint32Array(1);
        crypto.getRandomValues(array);
        return array[0];
    }
}

var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus["OK"] = "ok";
    ResponseStatus["ERROR"] = "error";
})(ResponseStatus || (ResponseStatus = {}));

/* tslint:disable:no-bitwise */
class Base64 {
    // base64 is 4/3 + up to two characters of the original data
    static byteLength(b64) {
        const [validLength, placeHoldersLength] = Base64._getLengths(b64);
        return Base64._byteLength(validLength, placeHoldersLength);
    }
    static decode(b64) {
        Base64._initRevLookup();
        const [validLength, placeHoldersLength] = Base64._getLengths(b64);
        const arr = new Uint8Array(Base64._byteLength(validLength, placeHoldersLength));
        let curByte = 0;
        // if there are placeholders, only get up to the last complete 4 chars
        const len = placeHoldersLength > 0 ? validLength - 4 : validLength;
        let i = 0;
        for (; i < len; i += 4) {
            const tmp = (Base64._revLookup[b64.charCodeAt(i)] << 18) |
                (Base64._revLookup[b64.charCodeAt(i + 1)] << 12) |
                (Base64._revLookup[b64.charCodeAt(i + 2)] << 6) |
                Base64._revLookup[b64.charCodeAt(i + 3)];
            arr[curByte++] = (tmp >> 16) & 0xFF;
            arr[curByte++] = (tmp >> 8) & 0xFF;
            arr[curByte++] = tmp & 0xFF;
        }
        if (placeHoldersLength === 2) {
            const tmp = (Base64._revLookup[b64.charCodeAt(i)] << 2) |
                (Base64._revLookup[b64.charCodeAt(i + 1)] >> 4);
            arr[curByte++] = tmp & 0xFF;
        }
        if (placeHoldersLength === 1) {
            const tmp = (Base64._revLookup[b64.charCodeAt(i)] << 10) |
                (Base64._revLookup[b64.charCodeAt(i + 1)] << 4) |
                (Base64._revLookup[b64.charCodeAt(i + 2)] >> 2);
            arr[curByte++] = (tmp >> 8) & 0xFF;
            arr[curByte /*++ not needed*/] = tmp & 0xFF;
        }
        return arr;
    }
    static encode(uint8) {
        const length = uint8.length;
        const extraBytes = length % 3; // if we have 1 byte left, pad 2 bytes
        const parts = [];
        const maxChunkLength = 16383; // must be multiple of 3
        // go through the array every three bytes, we'll deal with trailing stuff later
        for (let i = 0, len2 = length - extraBytes; i < len2; i += maxChunkLength) {
            parts.push(Base64._encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
        }
        // pad the end with zeros, but make sure to not forget the extra bytes
        if (extraBytes === 1) {
            const tmp = uint8[length - 1];
            parts.push(Base64._lookup[tmp >> 2] +
                Base64._lookup[(tmp << 4) & 0x3F] +
                '==');
        }
        else if (extraBytes === 2) {
            const tmp = (uint8[length - 2] << 8) + uint8[length - 1];
            parts.push(Base64._lookup[tmp >> 10] +
                Base64._lookup[(tmp >> 4) & 0x3F] +
                Base64._lookup[(tmp << 2) & 0x3F] +
                '=');
        }
        return parts.join('');
    }
    static encodeUrl(buffer) {
        return Base64.encode(buffer).replace(/\//g, '_').replace(/\+/g, '-').replace(/=/g, '.');
    }
    static decodeUrl(base64) {
        return Base64.decode(base64.replace(/_/g, '/').replace(/-/g, '+').replace(/\./g, '='));
    }
    static _initRevLookup() {
        if (Base64._revLookup.length !== 0)
            return;
        Base64._revLookup = [];
        for (let i = 0, len = Base64._lookup.length; i < len; i++) {
            Base64._revLookup[Base64._lookup.charCodeAt(i)] = i;
        }
        // Support decoding URL-safe base64 strings, as Node.js does.
        // See: https://en.wikipedia.org/wiki/Base64#URL_applications
        Base64._revLookup['-'.charCodeAt(0)] = 62;
        Base64._revLookup['_'.charCodeAt(0)] = 63;
    }
    static _getLengths(b64) {
        const length = b64.length;
        if (length % 4 > 0) {
            throw new Error('Invalid string. Length must be a multiple of 4');
        }
        // Trim off extra bytes after placeholder bytes are found
        // See: https://github.com/beatgammit/base64-js/issues/42
        let validLength = b64.indexOf('=');
        if (validLength === -1)
            validLength = length;
        const placeHoldersLength = validLength === length ? 0 : 4 - (validLength % 4);
        return [validLength, placeHoldersLength];
    }
    static _byteLength(validLength, placeHoldersLength) {
        return ((validLength + placeHoldersLength) * 3 / 4) - placeHoldersLength;
    }
    static _tripletToBase64(num) {
        return Base64._lookup[num >> 18 & 0x3F] +
            Base64._lookup[num >> 12 & 0x3F] +
            Base64._lookup[num >> 6 & 0x3F] +
            Base64._lookup[num & 0x3F];
    }
    static _encodeChunk(uint8, start, end) {
        const output = [];
        for (let i = start; i < end; i += 3) {
            const tmp = ((uint8[i] << 16) & 0xFF0000) +
                ((uint8[i + 1] << 8) & 0xFF00) +
                (uint8[i + 2] & 0xFF);
            output.push(Base64._tripletToBase64(tmp));
        }
        return output.join('');
    }
}
Base64._lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
Base64._revLookup = [];

var ExtraJSONTypes;
(function (ExtraJSONTypes) {
    ExtraJSONTypes[ExtraJSONTypes["UINT8_ARRAY"] = 0] = "UINT8_ARRAY";
})(ExtraJSONTypes || (ExtraJSONTypes = {}));
class JSONUtils {
    static stringify(value) {
        return JSON.stringify(value, JSONUtils._jsonifyType);
    }
    static parse(value) {
        return JSON.parse(value, JSONUtils._parseType);
    }
    static _parseType(key, value) {
        if (value && value.hasOwnProperty &&
            value.hasOwnProperty(JSONUtils.TYPE_SYMBOL) && value.hasOwnProperty(JSONUtils.VALUE_SYMBOL)) {
            switch (value[JSONUtils.TYPE_SYMBOL]) {
                case ExtraJSONTypes.UINT8_ARRAY:
                    return Base64.decode(value[JSONUtils.VALUE_SYMBOL]);
            }
        }
        return value;
    }
    static _jsonifyType(key, value) {
        if (value instanceof Uint8Array) {
            return JSONUtils._typedObject(ExtraJSONTypes.UINT8_ARRAY, Base64.encode(value));
        }
        return value;
    }
    static _typedObject(type, value) {
        const obj = {};
        obj[JSONUtils.TYPE_SYMBOL] = type;
        obj[JSONUtils.VALUE_SYMBOL] = value;
        return obj;
    }
}
JSONUtils.TYPE_SYMBOL = '__';
JSONUtils.VALUE_SYMBOL = 'v';

class RequestIdStorage {
    /**
     * @param {boolean} [storeState=true] Whether to store state in sessionStorage
     */
    constructor(storeState = true) {
        this._store = storeState ? window.sessionStorage : null;
        this._validIds = new Map();
        if (storeState) {
            this._restoreIds();
        }
    }
    static _decodeIds(ids) {
        const obj = JSONUtils.parse(ids);
        const validIds = new Map();
        for (const key of Object.keys(obj)) {
            const integerKey = parseInt(key, 10);
            validIds.set(isNaN(integerKey) ? key : integerKey, obj[key]);
        }
        return validIds;
    }
    has(id) {
        return this._validIds.has(id);
    }
    getCommand(id) {
        const result = this._validIds.get(id);
        return result ? result[0] : null;
    }
    getState(id) {
        const result = this._validIds.get(id);
        return result ? result[1] : null;
    }
    add(id, command, state = null) {
        this._validIds.set(id, [command, state]);
        this._storeIds();
    }
    remove(id) {
        this._validIds.delete(id);
        this._storeIds();
    }
    clear() {
        this._validIds.clear();
        if (this._store) {
            this._store.removeItem(RequestIdStorage.KEY);
        }
    }
    _encodeIds() {
        const obj = Object.create(null);
        for (const [key, value] of this._validIds) {
            obj[key] = value;
        }
        return JSONUtils.stringify(obj);
    }
    _restoreIds() {
        const requests = this._store.getItem(RequestIdStorage.KEY);
        if (requests) {
            this._validIds = RequestIdStorage._decodeIds(requests);
        }
    }
    _storeIds() {
        if (this._store) {
            this._store.setItem(RequestIdStorage.KEY, this._encodeIds());
        }
    }
}
RequestIdStorage.KEY = 'rpcRequests';

class UrlRpcEncoder {
    static receiveRedirectCommand(url) {
        // Need referrer for origin check
        if (!document.referrer)
            return null;
        // Parse query
        const params = new URLSearchParams(url.search);
        const referrer = new URL(document.referrer);
        // Ignore messages without a command
        if (!params.has('command'))
            return null;
        // Ignore messages without an ID
        if (!params.has('id'))
            return null;
        // Ignore messages without a valid return path
        if (!params.has('returnURL'))
            return null;
        // Only allow returning to same origin
        const returnURL = new URL(params.get('returnURL'));
        if (returnURL.origin !== referrer.origin)
            return null;
        // Parse args
        let args = [];
        if (params.has('args')) {
            try {
                args = JSONUtils.parse(params.get('args'));
            }
            catch (e) {
                // Do nothing
            }
        }
        args = Array.isArray(args) ? args : [];
        return {
            origin: referrer.origin,
            data: {
                id: parseInt(params.get('id'), 10),
                command: params.get('command'),
                args,
            },
            returnURL: params.get('returnURL'),
        };
    }
    /**
     * @param {URL|Location} url
     * @return {{origin:string, data:{id:number, status:string, result:*}}}
     */
    static receiveRedirectResponse(url) {
        // Need referrer for origin check
        if (!document.referrer)
            return null;
        // Parse query
        const params = new URLSearchParams(url.search);
        const referrer = new URL(document.referrer);
        // Ignore messages without a status
        if (!params.has('status'))
            return null;
        // Ignore messages without an ID
        if (!params.has('id'))
            return null;
        // Ignore messages without a result
        if (!params.has('result'))
            return null;
        // Parse result
        const result = JSONUtils.parse(params.get('result'));
        const status = params.get('status') === ResponseStatus.OK ? ResponseStatus.OK : ResponseStatus.ERROR;
        return {
            origin: referrer.origin,
            data: {
                id: parseInt(params.get('id'), 10),
                status,
                result,
            },
        };
    }
    static prepareRedirectReply(state, status, result) {
        const params = new URLSearchParams();
        params.set('status', status);
        params.set('result', JSONUtils.stringify(result));
        params.set('id', state.id.toString());
        // TODO: what if it already includes a query string
        return `${state.returnURL}?${params.toString()}`;
    }
    static prepareRedirectInvocation(targetURL, id, returnURL, command, args) {
        const params = new URLSearchParams();
        params.set('id', id.toString());
        params.set('returnURL', returnURL);
        params.set('command', command);
        if (Array.isArray(args)) {
            params.set('args', JSONUtils.stringify(args));
        }
        // TODO: what if it already includes a query string
        return `${targetURL}?${params.toString()}`;
    }
}

class RpcClient {
    constructor(allowedOrigin, storeState = false) {
        this._allowedOrigin = allowedOrigin;
        this._waitingRequests = new RequestIdStorage(storeState);
        this._responseHandlers = new Map();
    }
    onResponse(command, resolve, reject) {
        this._responseHandlers.set(command, { resolve, reject });
    }
    _receive(message) {
        // Discard all messages from unwanted sources
        // or which are not replies
        // or which are not from the correct origin
        if (!message.data
            || !message.data.status
            || !message.data.id
            || (this._allowedOrigin !== '*' && message.origin !== this._allowedOrigin))
            return;
        const data = message.data;
        const callback = this._getCallback(data.id);
        const state = this._waitingRequests.getState(data.id);
        if (callback) {
            this._waitingRequests.remove(data.id);
            console.debug('RpcClient RECEIVE', data);
            if (data.status === ResponseStatus.OK) {
                callback.resolve(data.result, data.id, state);
            }
            else if (data.status === ResponseStatus.ERROR) {
                const error = new Error(data.result.message);
                if (data.result.stack) {
                    error.stack = data.result.stack;
                }
                callback.reject(error, data.id, state);
            }
        }
        else {
            console.warn('Unknown RPC response:', data);
        }
    }
    _getCallback(id) {
        // Response handlers by id have priority to more general ones by command
        if (this._responseHandlers.has(id)) {
            return this._responseHandlers.get(id);
        }
        else {
            const command = this._waitingRequests.getCommand(id);
            if (command) {
                return this._responseHandlers.get(command);
            }
        }
        return undefined;
    }
}
class PostMessageRpcClient extends RpcClient {
    constructor(targetWindow, allowedOrigin) {
        super(allowedOrigin);
        this._target = targetWindow;
        this._connected = false;
        this._receiveListener = this._receive.bind(this);
    }
    async init() {
        await this._connect();
        window.addEventListener('message', this._receiveListener);
    }
    async call(command, ...args) {
        if (!this._connected)
            throw new Error('Client is not connected, call init first');
        return new Promise((resolve, reject) => {
            const obj = {
                command,
                args,
                id: RandomUtils.generateRandomId(),
            };
            // Store the request resolvers
            this._responseHandlers.set(obj.id, { resolve, reject });
            this._waitingRequests.add(obj.id, command);
            // Periodically check if recepient window is still open
            const checkIfServerWasClosed = () => {
                if (this._target.closed) {
                    reject(new Error('Window was closed'));
                }
                setTimeout(checkIfServerWasClosed, 500);
            };
            setTimeout(checkIfServerWasClosed, 500);
            console.debug('RpcClient REQUEST', command, args);
            this._target.postMessage(obj, this._allowedOrigin);
        });
    }
    close() {
        window.removeEventListener('message', this._receiveListener);
    }
    _connect() {
        return new Promise((resolve, reject) => {
            /**
             * @param {MessageEvent} message
             */
            const connectedListener = (message) => {
                const { source, origin, data } = message;
                if (source !== this._target
                    || data.status !== ResponseStatus.OK
                    || data.result !== 'pong'
                    || data.id !== 1
                    || (this._allowedOrigin !== '*' && origin !== this._allowedOrigin))
                    return;
                // Debugging printouts
                if (data.result.stack) {
                    const error = new Error(data.result.message);
                    error.stack = data.result.stack;
                    console.error(error);
                }
                window.removeEventListener('message', connectedListener);
                this._connected = true;
                console.log('RpcClient: Connection established');
                window.addEventListener('message', this._receiveListener);
                resolve(true);
            };
            window.addEventListener('message', connectedListener);
            let connectTimer = 0;
            const timeoutTimer = setTimeout(() => {
                window.removeEventListener('message', connectedListener);
                clearTimeout(connectTimer);
                reject(new Error('Connection timeout'));
            }, 10 * 1000);
            /**
             * Send 'ping' command every second, until cancelled
             */
            const tryToConnect = () => {
                if (this._connected) {
                    clearTimeout(timeoutTimer);
                    return;
                }
                try {
                    this._target.postMessage({ command: 'ping', id: 1 }, this._allowedOrigin);
                }
                catch (e) {
                    console.error(`postMessage failed: ${e}`);
                }
                // @ts-ignore
                connectTimer = setTimeout(tryToConnect, 1000);
            };
            // @ts-ignore
            connectTimer = setTimeout(tryToConnect, 100);
        });
    }
}
class RedirectRpcClient extends RpcClient {
    constructor(targetURL, allowedOrigin) {
        super(allowedOrigin, /*storeState*/ true);
        this._target = targetURL;
    }
    async init() {
        const message = UrlRpcEncoder.receiveRedirectResponse(window.location);
        if (message) {
            this._receive(message);
        }
        else {
            this._rejectOnBack();
        }
    }
    /* tslint:disable:no-empty */
    close() { }
    call(returnURL, command, ...args) {
        this.callAndSaveLocalState(returnURL, null, command, ...args);
    }
    callAndSaveLocalState(returnURL, state, command, ...args) {
        const id = RandomUtils.generateRandomId();
        const url = UrlRpcEncoder.prepareRedirectInvocation(this._target, id, returnURL, command, args);
        this._waitingRequests.add(id, command, state);
        history.replaceState({ rpcRequestId: id }, document.title);
        console.debug('RpcClient REQUEST', command, args);
        window.location.href = url;
    }
    _rejectOnBack() {
        if (history.state && history.state.rpcRequestId) {
            const id = history.state.rpcRequestId;
            const callback = this._getCallback(id);
            const state = this._waitingRequests.getState(id);
            if (callback) {
                this._waitingRequests.remove(id);
                console.debug('RpcClient BACK');
                const error = new Error('Request aborted');
                callback.reject(error, id, state);
            }
        }
    }
}

class RequestBehavior {
    static getAllowedOrigin(endpoint) {
        const url = new URL(endpoint);
        return url.origin;
    }
    constructor(type) {
        this._type = type;
    }
    async request(endpoint, command, args) {
        throw new Error('Not implemented');
    }
    get type() {
        return this._type;
    }
}
var BehaviorType;
(function (BehaviorType) {
    BehaviorType[BehaviorType["REDIRECT"] = 0] = "REDIRECT";
    BehaviorType[BehaviorType["POPUP"] = 1] = "POPUP";
    BehaviorType[BehaviorType["IFRAME"] = 2] = "IFRAME";
})(BehaviorType || (BehaviorType = {}));
class PopupRequestBehavior extends RequestBehavior {
    constructor(options = PopupRequestBehavior.DEFAULT_OPTIONS) {
        super(BehaviorType.POPUP);
        this._options = options;
    }
    async request(endpoint, command, args) {
        const origin = RequestBehavior.getAllowedOrigin(endpoint);
        const popup = this.createPopup(endpoint);
        const client = new PostMessageRpcClient(popup, origin);
        await client.init();
        try {
            const result = await client.call(command, ...args);
            client.close();
            popup.close();
            return result;
        }
        catch (e) {
            client.close();
            popup.close();
            throw e;
        }
    }
    createPopup(url) {
        const popup = window.open(url, 'NimiqAccounts', this._options);
        if (!popup) {
            throw new Error('Failed to open popup');
        }
        return popup;
    }
}
PopupRequestBehavior.DEFAULT_OPTIONS = '';
class IFrameRequestBehavior extends RequestBehavior {
    constructor() {
        super(BehaviorType.IFRAME);
        this._iframe = null;
        this._client = null;
    }
    async request(endpoint, command, args) {
        if (this._iframe && this._iframe.src !== `${endpoint}${IFrameRequestBehavior.IFRAME_PATH_SUFFIX}`) {
            throw new Error('Accounts Manager iframe is already opened with another endpoint');
        }
        const origin = RequestBehavior.getAllowedOrigin(endpoint);
        if (!this._iframe) {
            this._iframe = await this.createIFrame(endpoint);
        }
        if (!this._iframe.contentWindow) {
            throw new Error(`IFrame contentWindow is ${typeof this._iframe.contentWindow}`);
        }
        if (!this._client) {
            this._client = new PostMessageRpcClient(this._iframe.contentWindow, origin);
            await this._client.init();
        }
        return await this._client.call(command, ...args);
    }
    async createIFrame(endpoint) {
        return new Promise((resolve, reject) => {
            const $iframe = document.createElement('iframe');
            $iframe.name = 'NimiqAccountsIFrame';
            $iframe.style.display = 'none';
            document.body.appendChild($iframe);
            $iframe.src = `${endpoint}${IFrameRequestBehavior.IFRAME_PATH_SUFFIX}`;
            $iframe.onload = () => resolve($iframe);
            $iframe.onerror = reject;
        });
    }
}
IFrameRequestBehavior.IFRAME_PATH_SUFFIX = '/iframe.html';

class Observable {
    static get WILDCARD() {
        return '*';
    }
    constructor() {
        this._listeners = new Map();
    }
    _offAll() {
        this._listeners.clear();
    }
    on(type, callback) {
        if (!this._listeners.has(type)) {
            this._listeners.set(type, [callback]);
            return 0;
        }
        else {
            return this._listeners.get(type).push(callback) - 1;
        }
    }
    off(type, id) {
        if (!this._listeners.has(type) || !this._listeners.get(type)[id])
            return;
        delete this._listeners.get(type)[id];
    }
    fire(type, ...args) {
        const promises = [];
        // Notify listeners for this event type.
        if (this._listeners.has(type)) {
            const listeners = this._listeners.get(type);
            for (const key in listeners) {
                // Skip non-numeric properties.
                if (typeof key !== 'number')
                    continue;
                const listener = listeners[key];
                const res = listener.apply(null, args);
                if (res instanceof Promise)
                    promises.push(res);
            }
        }
        // Notify wildcard listeners. Pass event type as first argument
        if (this._listeners.has(Observable.WILDCARD)) {
            const listeners = this._listeners.get(Observable.WILDCARD);
            for (const key in listeners) {
                // Skip non-numeric properties.
                if (typeof key !== 'number')
                    continue;
                const listener = listeners[key];
                const res = listener.apply(null, arguments);
                if (res instanceof Promise)
                    promises.push(res);
            }
        }
        if (promises.length > 0)
            return Promise.all(promises);
        return null;
    }
    bubble(observable, ...types) {
        for (const type of types) {
            let callback;
            if (type === Observable.WILDCARD) {
                callback = function () {
                    this.fire.apply(this, arguments);
                };
            }
            else {
                callback = function () {
                    this.fire.apply(this, [type, ...arguments]);
                };
            }
            observable.on(type, callback.bind(this));
        }
    }
}

var RequestType;
(function (RequestType) {
    RequestType["LIST"] = "list";
    RequestType["CHECKOUT"] = "checkout";
    RequestType["SIGNTRANSACTION"] = "sign-transaction";
    RequestType["SIGNUP"] = "signup";
    RequestType["LOGIN"] = "login";
    RequestType["EXPORT_WORDS"] = "export-words";
    RequestType["EXPORT_FILE"] = "export-file";
    RequestType["LOGOUT"] = "logout";
})(RequestType || (RequestType = {}));

class AccountsManagerClient {
    constructor(endpoint = AccountsManagerClient.DEFAULT_ENDPOINT, defaultBehavior) {
        this._endpoint = endpoint;
        this._defaultBehavior = defaultBehavior || new PopupRequestBehavior(`left=${window.innerWidth / 2 - 500},top=50,width=1000,height=900,location=yes,dependent=yes`);
        this._iframeBehavior = new IFrameRequestBehavior();
        // Check for RPC results in the URL
        this._redirectClient = new RedirectRpcClient('', RequestBehavior.getAllowedOrigin(this._endpoint));
        this._observable = new Observable();
    }
    init() {
        return this._redirectClient.init();
    }
    on(command, resolve, reject) {
        this._redirectClient.onResponse(command, resolve, reject);
    }
    signup(request, requestBehavior = this._defaultBehavior) {
        return this._request(requestBehavior, RequestType.SIGNUP, [request]);
    }
    signTransaction(request, requestBehavior = this._defaultBehavior) {
        return this._request(requestBehavior, RequestType.SIGNTRANSACTION, [request]);
    }
    checkout(request, requestBehavior = this._defaultBehavior) {
        return this._request(requestBehavior, RequestType.CHECKOUT, [request]);
    }
    login(request, requestBehavior = this._defaultBehavior) {
        return this._request(requestBehavior, RequestType.LOGIN, [request]);
    }
    logout(request, requestBehavior = this._defaultBehavior) {
        return this._request(requestBehavior, RequestType.LOGOUT, [request]);
    }
    list(requestBehavior = this._iframeBehavior) {
        return this._request(requestBehavior, RequestType.LIST, []);
    }
    exportFile(request, requestBehavior = this._defaultBehavior) {
        return this._request(requestBehavior, RequestType.EXPORT_FILE, [request]);
    }
    exportWords(request, requestBehavior = this._defaultBehavior) {
        return this._request(requestBehavior, RequestType.EXPORT_WORDS, [request]);
    }
    // END API
    /* PRIVATE METHODS */
    _request(behavior, command, args) {
        return behavior.request(this._endpoint, command, args);
    }
}
AccountsManagerClient.DEFAULT_ENDPOINT = window.location.origin === 'https://safe-next.nimiq.com' ? 'https://accounts.nimiq.com'
    : window.location.origin === 'https://safe-next.nimiq-testnet.com' ? 'https://accounts.nimiq-testnet.com'
        : 'http://localhost:8080';

export default AccountsManagerClient;
