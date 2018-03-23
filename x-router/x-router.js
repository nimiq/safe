import XElement from '/libraries/x-element/x-element.js';
import Router from '/libraries/es6-router/src/index.js';

export default class XRouter extends XElement {

    constructor() {
        super(document.body);
    }

    onCreate() {
        this.reverse = false;
        this.routing = false;
        if (!XRouter.root) XRouter.root = window.xRouter = this;
        this.router = new Router({ debug: true, startListening: false });

        this.addEventListener('animationend', e => {
            if (!this.routing) return;
            this.routing = false;
            this._toggleInOut(this.previous, false, false);
            this._setClass(this.previous, 'out', true);
            this._toggleInOut(this.current, false, false);
            this._setClass(this.current, 'in', true);
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
        this.routes = {};
        for (const element of routeElements) {
            const path = element.attributes['x-route'].value.trim();
            if (!path || path === '' || path ==='/') { // root
                this.routes._root = { path, element }
                this.router.add(() => {
                    console.log('XRoute: root route', path);
                    this._show('_root');
                });
            } else {
                const regex = new RegExp(path[0] == '*' ? `.${ path }` : path);
                this.routes[path] = { path, element, regex }
                this.router.add(path, (params) => {
                    console.log('XRoute: normal route', path, params);
                    this._show(path);
                });
            }
        }
    }

    parseAside(routeElements) {
        this.asides = new Map();
        for (const element of routeElements) {
            const tag = element.attributes['x-route-aside'].value.trim();
            const regex = new RegExp(`.*_${ tag }_.*`);
            this.asides.set(tag, { tag, element, regex });
        }
    }

    hookUpLinks(links) {
        for (const link of links) {
            const path = link.attributes['x-href'].value.trim();
            link.href = `#${path}`;
            // do we need this? is the above line not enough?
            link.addEventListener('click', e => this.goTo(path))
        }
    }

    goTo(path, reverse = false) {
        this.reverse = reverse;
        this.router.navigate(path);
    }

    goBackTo(path) {
        this.goTo(path, true);
    }

    showAside(tag) {
        const aside = this.asides.get(tag);
        if (!aside) throw new Error(`XRouter: aside "${ tag } unknown"`);

        const path = this.router.currentRoute;
        if (!path.match(aside.regex)) {
            this.router.navigate(`${ path }_${ tag }_`);
        }
    }

    hideAside(tag) {
        this.router.navigate(this.router.currentRoute.replace(`_${tag}_`, ''));
    }

    _makePath() {
        let path = this.paths['root'];
    }

    async _show(path) {
        if (path === this.current) return;
        this.reverse = path == this.previous;
        [ this.previous, this.current ] = [ this.current, path ];
        this._toggleInOut(this.previous, false)
        this._setClass(this.previous, 'in', false);
        this._toggleInOut(this.current, true);
        this._setClass(this.current, 'out', false);
        this._doRouteCallback(this.previous, 'onBeforeExit');
        this._doRouteCallback(this.current, 'onEntry');
        this.routing = true;

        const hash = this.router.currentRoute;
        for (const [tag, aside] of this.asides) {
            if (hash.match(aside.regex) !== null) {
                aside.visible = true;
                console.log(`XRoute: aside "${ tag }" onEntry`);
                this._doCallback(aside.element, 'onEntry');
            } else if (aside.visible) {
                aside.visible = false;
                console.log(`XRoute: aside "${ tag }" onExit`);
                this._doCallback(aside.element, 'onExit');
            }
        }
    }

    _doRouteCallback(path, name, args = []) {
        if (!path) return;
        this._doCallback(this.routes[path].element, name, args);
    }

    _doCallback(el, name, args = []) {
        const element = XElement.get(el);
        // element is undefined if el is a plain html node, e.g. section, main, ...
        if (!element) return;

        if (element[name] instanceof Function) {
            element[name](...args);
        } else console.warn(`XRouter: ${ element.tagName }.${ name } not found.`);
    }

    // TODO [sven] use attribute "animations to configure CSS classes to be used"
    _toggleInOut(path, setIn, setOut = !setIn) {
        this._setClass(path, 'from-left-in', setIn && this.reverse);
        this._setClass(path, 'from-right-in', setIn && !this.reverse);
        this._setClass(path, 'from-right-out', setOut && this.reverse);
        this._setClass(path, 'from-left-out', setOut && !this.reverse);
    }

    _setClass(path, css, on) {
        if (this.routes[path]) this.routes[path].element.classList.toggle(css, on);
    }
}
