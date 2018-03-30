import XElement from '/libraries/x-element/x-element.js';
import Router from '/libraries/es6-router/src/index.js';

const _waitingForInit = [];
const DEFAULT_CLASSES = ['from-right-in', 'in', 'from-left-out', 'visible', 'from-left-in', 'from-right-out'];

export default class XRouter extends XElement {

    static get instance() {
        return new Promise((resolve, reject) => {
            if (XRouter._instance) resolve(XRouter._instance);
            else _waitingForInit.push(resolve);
        });
    }

    static create(initialPath, classes = DEFAULT_CLASSES) {
        location.hash = XRouter._sanitizePath(initialPath);
        XRouter._classes = classes;

        const xRouter = new XRouter();
    }

    static _sanitizePath(path) { return path.replace(/(^\s*\/|\s*\/$|_[^_]*_)/g, ''); }
    static _isRoot(path = '') { return XRouter._sanitizePath(path) == ''; }

    constructor() {
        super(document.body);
    }

    onCreate() {
        window.XRouter = XRouter;
        this.reverse = false;
        this.routing = false;
        this.running = false;
        this.history = [];

        // read XRouter.classes, then <x-router animations="...", or fall back to DEFAULT_CLASSES
        if (XRouter.classes instanceof Array) this.classes = XRouter.classes
        else if (this.$el.hasAttribute('animations')) this.classes = this.$el.getAttribute('animations').split(' ')
        if (!(this.classes instanceof Array) || this.classes.length != 6) this.classes = DEFAULT_CLASSES;
        [ this.CSS_IN, this.CSS_SHOW, this.CSS_OUT, this.CSS_VISIBLE, this.CSS_IN_REVERSE, this.CSS_OUT_REVERSE ] = this.classes;

        this.router = new Router({ debug: false, startListening: false });

        let state = 1; // first time, there is no 'previous' element
        this.addEventListener('animationend', e => {
            if (!this.routing) return;
            const xElement = XElement.get(e.target);
            if (e.target == this.current.element) {
                this._toggleInOut(this.animateIn, false, false);
                this._setClass(this.animateIn, this.CSS_SHOW, true);
                this._doRouteCallback(this.current, 'onAfterEntry');
                state++;
            }
            if (this.previous && e.target == this.previous.element) {
                this._toggleInOut(this.animateOut, false, false);
                this._setClass(this.animateOut, this.CSS_VISIBLE, false);
                this._doRouteCallback(this.previous, 'onExit');
                state++;
            }
            if (state == 2) {
                state = 0;
                this.routing = false;
            }
        });

        // X-router is just an element of page, so the initialization of x-router may happen before all the siblings
        // are initialized by x-element. Thus, leaving the current process to make sure all initialization is done.
        setTimeout(() => this._initialize());
    }

    _initialize() {
        this.parseRoutes(this.$$('[x-route]'));
        this.parseAside(this.$$('[x-route-aside]'));
        this.hookUpLinks(this.$$('a[x-href]'));

        XRouter._instance = this;
        for (const callback of _waitingForInit) callback(this);

        // make sure that anyone that was listening can act first, e.g. update the route
        setTimeout(() => this.router.listen());
    }

    parseRoutes(routeElements) {
        this.routes = new Map();
        this.routeByElement = new Map();
        for (const element of routeElements) {
            const { path, nodes } = this._absolutePathOf(element);
            const regex = XRouter._isRoot(path) ? /^\/?$|^\/?_.*/ : new RegExp(`^\/?${ path }$|^\/?${ path }_.*$`);
            const route = { path, element, regex, nodes };

            // relative route '/' might overwrite parent route
            this.routes.set(XRouter._sanitizePath(path), route);
            this.routeByElement.set(element, route);
            element.parentNode.classList.add('x-route-parent');
        }

        for (const [path, route] of this.routes){
            this.router.add(route.regex, (params) => this._show(path, params));
        }

    }

    parseAside(routeElements) {
        this.asides = new Map();
        for (const element of routeElements) {
            const tag = element.attributes['x-route-aside'].value.trim();
            const regex = new RegExp(`.*_${ tag }\/?([^_]*)_.*`);
            const replace = new RegExp(`_${ tag }\/?[^_]*_`, 'g');
            this.asides.set(tag, { tag, element, regex, replace, visible: false });
        }
    }

    hookUpLinks(links) {
        this.links = [];
        for (const link of links) {
            const linkPath = link.attributes['x-href'].value.trim();
            if (linkPath[0] == '/') {
                const path = XRouter._sanitizePath(linkPath);
                link.href = `#/${ path }`;
                this.links.push({ path, link });
            } else {
                let { path, nodes } = this._absolutePathOf(link);
                let absolutePath = path ? `${ path }/${ linkPath }` : linkPath;
                if (linkPath.slice(0, 2) == '..') {
                    if (nodes.length < 2) {
                        path = '';
                        nodes = [nodes[0]];
                    }
                    else {
                        path = this._absolutePathOf(nodes.reverse()[1]).path;
                    }
                    absolutePath = XRouter._sanitizePath(path);
                }
                link.href = `#/${ absolutePath }`;
                this.links.push({ path: absolutePath, link });
            }
        }
    }

    goTo(pathOrNode, relativePath) {
        this.reverse = false;
        const findRoute = (nodeOrPath, relative) => {
            if (typeof nodeOrPath == 'string') {
                const path = nodeOrPath;
                return { route: this._getRoute(path), path };
            }
            let node = nodeOrPath.$el ? nodeOrPath.$el : nodeOrPath;
            node = relative ? node.querySelector(`[x-route="${ relative }"]`) : node;
            const route = this.routeByElement.get(node);
            return { route, path: route.path };
        };
        const { route, path } = findRoute(pathOrNode, relativePath);
        if (!route) throw `XRouter: route for absolute path "${ path }" of ${ pathOrNode.tagName } not found.`;
        this.history.unshift(route);
        this.router.navigate(path);
    }

    _absolutePathOf(node, relativePath){
        if (typeof node == 'string') return node; // `node` is abs path already
        const nodes = [];
        const readPath = (node, path = []) => {
            const segment = node.getAttribute('x-route');
            if (segment != null) {
                path.unshift(XRouter._sanitizePath(segment));
                nodes.unshift(node);
            }
            return (node.parentNode != this.$el) ? readPath(node.parentNode, path) : path;
        };
        const leaf = relativePath ? node.querySelector(`[x-route="${ relativePath }"]`) : node;
        if (!leaf) throw new Error(`XRouter: can not find relative x-route ${ relativePath } in this tag ${ node.tagName }`);
        const path = readPath(leaf).filter(segment => segment.trim().length > 0).join('/');
        return { path, nodes };
    }

    goBackTo(path) {
        this.reverse = true;
        const search = new RegExp(`.*${ path }.*`);
        const found = this.history.find((item, index) => {
            if (path == item || item.match(search)) {
                this.goBack(index);
                return true;
            }
        });
        if (!found) {
            throw new Error(`XRouter: goBackTo(${ path }): path not found in history ${ JSON.stringify(this.history) }`);
        }
    }

    goBack(steps = 1) {
        // this.goBackTo(this.history[1]);
        this._log(`XRouter: going ${ steps } steps back in history to ${ this.history[steps] }. old history = ${ JSON.stringify(this.history) }`);
        // forget all the history "in between"
        this.history = this.history.slice(steps);
        this._log(`XRouter: new history = ${ JSON.stringify(this.history) }`);
        window.history.go(-steps);
    }

    showAside(tag, parameters) {
        this.goTo(this._putAside(this.router.currentRoute, tag, parameters));
    }

    _putAside(path, tag, parameters) {
        const aside = this.asides.get(tag);
        if (!aside) throw new Error(`XRouter: aside "${ tag } unknown"`);

        return path.match(aside.regex) ? path : `${ path }${ this._makeAside(tag, parameters)}`;
    }

    _makeAside(tag, parameters) {
        let param = '';
        if (parameters) {
            param = (parameters instanceof Array) ? parameters : [parameters];
            param = '/' + [...param].join('/');
        }
        return `_${ tag }${ param }_`;
    }

    hideAside(tag, replaceWith = '') {
        const aside = this.asides.get(tag);
        if (!aside) throw new Error(`XRouter: aside "${ tag } unknown"`);
        this.goTo(this.router.currentRoute.replace(aside.replace, replaceWith));
    }

    replaceAside(oldTag, newTag, parameters) {
        this.hideAside(oldTag, this._makeAside(newTag, parameters));
    }

    get goingBackwards() { return this.reverse; }


    _getRoute(path) { return this.routes.get(XRouter._sanitizePath(path)); }

    async _show(path) {
        if (this.running) {
            return setTimeout(() => this._show(path));
        }
        this.running = true;

        const hash = this.router.currentRoute;
        const route = this._getRoute(path);
        this._log(`XRouter: showing ${ path }, hash = ${ hash }, route = `, route);

        this._changeRoute(route);
        this._checkAsides(hash);
        this._highlightLinks(route);

        this.running = false;
    }

    _changeRoute(route) {
        if (this.current && route.path === this.current.path) return;
        [ this.previous, this.current ] = [ this.current, route ];

        if (this.previous) {
            this.animateIn = this.current.nodes.filter(node => !this.previous.nodes.includes(node));
            this.animateOut = this.previous.nodes.filter(node => !this.current.nodes.includes(node));
        } else {
            this.animateIn = [...this.current.nodes];
            this.animateOut = [];
        }

        this._toggleInOut(this.animateOut, false)
        this._setClass(this.animateOut, this.CSS_SHOW, false);
        if (this.previous) {
            this._doRouteCallback(this.previous, 'onBeforeExit');
            this.previous.element.classList.remove('current');
        }

        this.current.element.classList.add('current');
        this._doRouteCallback(this.current, 'onEntry');
        this._toggleInOut(this.animateIn, true);
        this._setClass(this.animateIn, this.CSS_VISIBLE, true);

        this.routing = true;
    }

    _checkAsides(hash) {
        let onEntries = [];
        let onExits = [];
        for (const [tag, aside] of this.asides) {
            const match = hash.match(aside.regex);
            if (match && !aside.visible) {
                const params = match[1] ? match[1].split('/') : [];
                aside.visible = true;
                onEntries.push({ tag, element: aside.element, name: 'onEntry', params });
            }
            if (!match && aside.visible) {
                aside.visible = false;
                onExits.push({ tag, element: aside.element, name: 'onExit' });
            }
        }
        for (const callback of [...onEntries, ...onExits]) {
            this._log(`XRouter: aside "${ callback.tag }" ${ callback.name }`, callback.params);
            this._doCallback(callback.element, callback.name, callback.params);
        }
    }

    _highlightLinks(route) {
        for (const { path, link } of this.links) {
            link.classList.toggle('current', path == route.path);
        }
    }

    _doRouteCallback(route, name, args = []) {
        if (!route) {
            throw new Error('XRouter: no route!');
        }
        for (const node of route.nodes) {
            this._doCallback(node, name, args);
        }
    }

    _doCallback(element, name, args = []) {
        const xElement = XElement.get(element);
        // element is undefined if el is a plain html node, e.g. section, main, ...
        if (!xElement) return;

        if (xElement[name] instanceof Function) {
            xElement[name](...args);
        } else console.warn(`XRouter: ${ element.tagName }.${ name } not found.`);
    }

    _toggleInOut(route, setIn, setOut = !setIn) {
        this._setClass(route, this.CSS_IN, setIn && !this.reverse);
        this._setClass(route, this.CSS_IN_REVERSE, setIn && this.reverse);
        this._setClass(route, this.CSS_OUT, setOut && !this.reverse);
        this._setClass(route, this.CSS_OUT_REVERSE, setOut && this.reverse);
    }

    _setClass(route, css, on) {
        const nodes = (route instanceof Array) ? route : route.nodes;
        if (route) {
            for (const node of nodes) node.classList.toggle(css, on);
        } else {
            throw new Error('XRouter: no route!');
        }
    }

    _log(...args) {
        console.log(...args);
    }
}

// todo [low] support change of parameters while staying in same aside
