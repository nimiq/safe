import XElement from '/libraries/x-element/x-element.js';
import Router from '/libraries/es6-router/src/index.js';

export default class XRouter extends XElement {

    //constructor(parent) { super(parent); }

    onCreate() {
        this.router = new Router({ debug: true, startListening: false });
        //console.log(JSON.stringify(this.router.routes[0].route));
        this.parseRoutes(this.$$('x-route'));
        console.log(JSON.stringify(this.router.routes[0].route));
        this.router.listen();
        this.addEventListener('animationend', e => {
            console.log('animationend');
            this._toggleInOut(this.previous, false, false);
        });

        //.add(/\/{path}/, (path) => {
        //    console.log(this.routes[path]);
        //})
        //.add(/\/{path}|{params}/, (path, params) => {
        //    console.log(this.routes[path], params);
        //})
        //.add(/^\/?$/, (path) => {
        //    console.log("root");
        //});
    }

    parseRoutes(routeElements) {
        this.routes = {};
        for (const element of routeElements) {
            const path = element.attributes.path.value.trim();
            if (!path || path === '' || path ==='/') { // root
                this.routes._root = { path, element }
                this.router.add(() => {
                    console.log('root route', path);
                    this.routeTo('_root');
                });
            } else {
                this.routes[path] = { path, element, regex: new RegExp(path) }
                this.router.add(new RegExp(path), () => {
                    this.routeTo(path);
                    console.log('normal route', path);
                });
            }
        }
    }

    routeTo(path) {
        if (path === this.current) return
        this._toggleInOut(this.current, false)
        this._toggleInOut(path, true);
        [ this.previous, this.current ] = [ this.current, path ];
    }

    _toggleInOut(path, setIn, setOut = !setIn) {
        //if (setOut == undefined) setOut = !setIn;
        this.setClass(path, 'from-left-in', setIn);
        this.setClass(path, 'from-right-out', setOut);
    }

    setClass(path, css, on) {
        if (this.routes[path]) this.routes[path].element.classList.toggle(css, on);
    }
}
