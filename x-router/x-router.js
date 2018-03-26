import XElement from '/libraries/x-element/x-element.js';
import Router from '/libraries/es6-router/src/index.js';

export default class XRouter extends XElement {

    constructor() {
        super(document.body);
    }

    onCreate() {
        this.reverse = false;
        this.routing = false;
        this.running = false;
        const recoveredState = window.history.state ? window.history.state.path : null;
        this.history = recoveredState ? [ recoveredState ] : [];

        let classes = ['from-right-in', 'in', 'from-left-out', 'out', 'from-left-in', 'from-right-out'];
        if (this.$el.hasAttribute('animations') && this.animations.length > 0) {
            const animations = this.$el.getAttribute('animations').split(' ')
            if (animations.length == 6) {
                classes = animations;
            }
        }
        [ this.CSS_IN, this.CSS_SHOW, this.CSS_OUT, this.CSS_HIDDEN, this.CSS_IN_REVERSE, this.CSS_OUT_REVERSE ] = classes;

        if (!XRouter.root) XRouter.root = window.xRouter = this;
        this.router = new Router({ debug: false, startListening: false });

        this.addEventListener('animationend', e => {
            if (!this.routing) return;
            this.routing = false;
            this._toggleInOut(this.previous, false, false);
            this._setClass(this.previous, this.CSS_HIDDEN, true);
            this._toggleInOut(this.current, false, false);
            this._setClass(this.current, this.CSS_SHOW, true);
            this._doCallback(this.previous, 'onExit');
            this._doCallback(this.current, 'onAfterEntry');
        });

        // X-router is just an element of page, so the initialization of x-router happens before all the siblings
        // are initialized by x-element. Thus, leaving the current process to make sure all initialization is done.
        setTimeout(e => this._initialize(), 1);
    }

    _initialize() {
        this.parseRoutes(this.$$('[x-route]'));
        this.parseAside(this.$$('[x-route-aside]'));
        this.hookUpLinks(this.$$('a[x-href]'));

        this.router.listen();
    }

    parseRoutes(routeElements) {
        this.routes = new Map();
        for (const element of routeElements) {
            const path = element.attributes['x-route'].value.trim();
            if (this._isRoot(path)) { // root
                const regex = /^\/?$|^\/?_.*/;
                this.routes.set('_root', { path, element });
                this.router.add(regex, () => {
                    this._show('_root');
                });
            } else {
                // const regex = new RegExp(path[0] == `^\/?${ path }./`);
                const regex = new RegExp(`^\/?${ path }.*`);
                this.routes.set(path, { path, element, regex });
                this.router.add(regex, (params) => {
                    this._show(path);
                });
            }
        }
    }

    parseAside(routeElements) {
        this.asides = new Map();
        for (const element of routeElements) {
            const tag = element.attributes['x-route-aside'].value.trim();
            const regex = new RegExp(`.*_${ tag }\/?([^_]*)_.*`);
            this.asides.set(tag, { tag, element, regex, visible: false });
        }
    }

    hookUpLinks(links) {
        for (const link of links) {
            const path = link.attributes['x-href'].value.trim();
            link.href = `#/${path}`;
            // do we need this? is the above line not enough?
            link.addEventListener('click', e => {
                this.goTo(path);
                e.preventDefault();
            });
        }
    }

    goTo(path) {
        this.reverse = false;
        this.history.unshift(path);
        this.router.navigate(path);
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
        const aside = this.asides.get(tag);
        if (!aside) throw new Error(`XRouter: aside "${ tag } unknown"`);

        const path = this.router.currentRoute;
        if (!path.match(aside.regex)) {
            let param = '';
            if (parameters) {
                param = (parameters instanceof Array) ? parameters : [parameters];
                param = '/' + [...param].join('/');
            }
            // this.router.navigate(`${ path }_${ tag }${param}_`);
            this.goTo(`${ path }_${ tag }${param}_`);
        }
    }

    hideAside(tag) {
        // this.router.navigate(this.router.currentRoute.replace(new RegExp(`_${tag}\/?[^_]*_`, 'g'), ''));
        this.goTo(this.router.currentRoute.replace(new RegExp(`_${tag}\/?[^_]*_`, 'g'), ''));
    }

    get goingBackwards() {
        return this.reverse;
    }

    _isRoot(path = '') {
        return ['', '/', '_root'].includes(path.trim());
    }

    async _show(path) {
        if (this.running) {
            return setTimeout(_ => this._show(path), 1);
        }
        this.running = true;

        const hash = this.router.currentRoute;
        const parsedPath = this._isRoot(path) ? '_root' : path;
        this._log(`XRouter: showing ${ parsedPath }, hash = ${ hash }`);

        this._changeRoute(parsedPath);
        this._checkAsides(hash);

        this.running = false;
    }

    _changeRoute(path) {
        if (path === this.current) return;
        this.reverse = path == this.previous;
        [ this.previous, this.current ] = [ this.current, path ];
        this._toggleInOut(this.previous, false)
        this._setClass(this.previous, this.CSS_SHOW, false);
        this._toggleInOut(this.current, true);
        this._setClass(this.current, this.CSS_HIDDEN, false);
        this._doRouteCallback(this.previous, 'onBeforeExit');
        this._doRouteCallback(this.current, 'onEntry');
        this.routing = true;
    }

    _checkAsides(hash) {
        for (const [tag, aside] of this.asides) {
            const match = hash.match(aside.regex);
            if (match && !aside.visible) {
                const params = match[1] ? match[1].split('/') : [];
                aside.visible = true;
                this._log(`XRouter: aside "${ tag }" onEntry; params=`, params);
                this._doCallback(aside.element, 'onEntry', params);
            }
            if (!match && aside.visible) {
                aside.visible = false;
                this._log(`XRouter: aside "${ tag }" onExit`);
                this._doCallback(aside.element, 'onExit');
            }
        }
    }

    _doRouteCallback(path, name, args = []) {
        if (!path) return;
        this._doCallback(this.routes.get(path).element, name, args);
    }

    _doCallback(el, name, args = []) {
        const element = XElement.get(el);
        // element is undefined if el is a plain html node, e.g. section, main, ...
        if (!element) return;

        if (element[name] instanceof Function) {
            element[name](...args);
        } else console.warn(`XRouter: ${ element.tagName }.${ name } not found.`);
    }

    _toggleInOut(path, setIn, setOut = !setIn) {
        this._setClass(path, this.CSS_IN, setIn && !this.reverse);
        this._setClass(path, this.CSS_IN_REVERSE, setIn && this.reverse);
        this._setClass(path, this.CSS_OUT, setOut && !this.reverse);
        this._setClass(path, this.CSS_OUT_REVERSE, setOut && this.reverse);
    }

    _setClass(path, css, on) {
        const route = this.routes.get(path)
        if (route) route.element.classList.toggle(css, on);
    }

    _log(...args) {
        if (this.$(this.__tagName).getAttribute('debug')) {
            console.log(...args);
        }
    }
}
