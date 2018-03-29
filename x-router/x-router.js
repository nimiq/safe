import XElement from '/libraries/x-element/x-element.js';
import Router from '/libraries/es6-router/src/index.js';

const _waitingForInit = [];

export default class XRouter extends XElement {

    static get instance() {
        return new Promise((resolve, reject) => {
            if (XRouter._instance) resolve(XRouter._instance);
            else _waitingForInit.push(resolve);
        });
    }

    static create(initialPath) {
        location.hash = XRouter._sanitizePath(initialPath);

        /*
        if (this.$el.hasAttribute('animations') && this.animations.length > 0) {
            const animations = this.$el.getAttribute('animations').split(' ')
            if (animations.length == 6) {
                classes = animations;
            }
        }*/

        return new XRouter();
    }

    static _sanitizePath(path) { return path.replace(/(^\s*\/|\/\s*$|_[^_]*_)/g, ''); }

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

        let classes = ['from-right-in', 'in', 'from-left-out', 'visible', 'from-left-in', 'from-right-out'];

        [ this.CSS_IN, this.CSS_SHOW, this.CSS_OUT, this.CSS_VISIBLE, this.CSS_IN_REVERSE, this.CSS_OUT_REVERSE ] = classes;

        this.router = new Router({ debug: false, startListening: false });

        let state = 1; // first time, there is no 'previous' element
        this.addEventListener('animationend', e => {
            if (!this.routing) return;
            const xElement = XElement.get(e.target);
            if (e.target == this.current.element) {
                this._toggleInOut(this.current, false, false);
                this._setClass(this.current, this.CSS_SHOW, true);
                this._doRouteCallback(this.current, 'onAfterEntry');
                state++;
            }
            if (this.previous && e.target == this.previous.element) {
                this._toggleInOut(this.previous, false, false);
                this._setClass(this.previous, this.CSS_VISIBLE, false);
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

        for (const callback of _waitingForInit) callback(this);

        XRouter._instance = this;
        // this.router.listen();
        // make sure that anyone that was listening
        setTimeout(() => this.router.listen());
    }

    parseRoutes(routeElements) {
        this.routes = new Map();
        this.routeByElement = new Map();
        for (const element of routeElements) {
            const { path, nodes } = this._absolutePathOf(element);
            const regex = XRouter._isRoot(path) ? /^\/?$|^\/?_.*/ : new RegExp(`^\/?${ path }.*`);
            const route = { path, element, regex, nodes };

            this.routes.set(path, route);
            this.routeByElement.set(element, route);
            this.router.add(regex, (params) => this._show(path, params));
            // this._setClass(route, this.CSS_VISIBLE, false);
            element.parentNode.classList.add('x-route-parent');
        }
    }

    parseAside(routeElements) {
        this.asides = new Map();
        for (const element of routeElements) {
            const tag = element.attributes['x-route-aside'].value.trim();
            const regex = new RegExp(`.*_${ tag }\/?([^_]*)_.*`, 'g');
            const replace = new RegExp(`_${ tag }\/?[^_]*_`, 'g');
            this.asides.set(tag, { tag, element, regex, replace, visible: false });
        }
    }

    hookUpLinks(links) {
        this.links = [];
        for (const link of links) {
            const linkPath = link.attributes['x-href'].value.trim();
            if (linkPath[0] == '/') {
                link.href = `#${ linkPath }`;
                this.links.push({ path: XRouter._sanitizePath(linkPath), link });
            } else {
                // if relative (no leading slash) > use _absolutePathOf > path + relative
                const { path, nodes } = this._absolutePathOf(link);
                const absolutePath = path ? `${ path }/${ linkPath }` : linkPath;
                link.href = `#/${ absolutePath }`;
                this.links.push({ path: absolutePath, link });
            }
            // // do we need this? is the above line not enough?
            // link.addEventListener('click', e => {
            //     this.goTo(path);
            //     e.preventDefault();
            // });
        }
    }

    goTo(pathOrNode, relativePath) {
        this.reverse = false;
        // const path = this._absolutePathOf(pathOrNode, orgPath);
        const findRoute = (node, relative) => {
            if (typeof node == 'string') return { route: this._getRoute(node), path: node };
            const _node = relative ? pathOrNode.querySelector(`[x-route="${ relative }"]`) : node;
            return { route: this.routeByElement.get(), path: route.path };
        }
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
        const path = readPath(leaf).join('/');
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
            this._toggleInOut(this.previous, false)
            this._setClass(this.previous, this.CSS_SHOW, false);
            this._doRouteCallback(this.previous, 'onBeforeExit');
            this.previous.element.classList.remove('current');
        }

        this._toggleInOut(this.current, true);
        this._setClass(this.current, this.CSS_VISIBLE, true);
        this._doRouteCallback(this.current, 'onEntry');
        this.current.element.classList.add('current');

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
        if (route) {
            for (const node of route.nodes) node.classList.toggle(css, on);
        } else {
            throw new Error('XRouter: no route!');
        }
    }

    _log(...args) {
        console.log(...args);
    }
}

// todo [low] support change of parameters while staying in same aside
