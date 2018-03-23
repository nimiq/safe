import XElement from '/libraries/x-element/x-element.js';
import Router from '/libraries/es6-router/src/index.js';

export default class XRouter extends XElement {

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
                    console.log('root route', path);
                    this._show('_root');
                });
            } else {
                this.routes[path] = { path, element, regex: new RegExp(path) }
                this.router.add(path, (params) => {
                    console.log('normal route', path, params);
                    this._show(path);
                });
            }
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

    goTo(path) {
        this.reverse = false;
        this.router.navigate(path);
    }

    goBackTo(path) {
        this.reverse = true;
        this.router.navigate(path);
    }

    async _show(path) {
        if (path === this.current) return;
        // if (this.first) {
        //     this.first = false;
        //     setTimeout(_ => this._show(path), 10);
        // }
        this.reverse = path == this.previous;
        [ this.previous, this.current ] = [ this.current, path ];
        this._toggleInOut(this.previous, false)
        this._setClass(this.previous, 'in', false);
        this._toggleInOut(this.current, true);
        this._setClass(this.current, 'out', false);
        this._doCallback(this.previous, 'onBeforeExit');
        this._doCallback(this.current, 'onEntry');
        this.routing = true;
    }

    _doCallback(path, name, args = []) {
        if (!path) return;
        const element = XElement.get(this.routes[path].element);
        if (element && element[name] instanceof Function) {
            element[name](...args);
        }
    }

    _toggleInOut(path, setIn, setOut = !setIn) {
        //this.setClass(path, this.reverse ? 'from-right-in' : 'from-left-in', setIn);
        //this.setClass(path, this.reverse ? 'from-left-out' : 'from-right-out', setOut);
        this._setClass(path, 'from-left-in', setIn && this.reverse);
        this._setClass(path, 'from-right-in', setIn && !this.reverse);
        this._setClass(path, 'from-right-out', setOut && this.reverse);
        this._setClass(path, 'from-left-out', setOut && !this.reverse);
    }

    _setClass(path, css, on) {
        if (this.routes[path]) this.routes[path].element.classList.toggle(css, on);
    }
}
