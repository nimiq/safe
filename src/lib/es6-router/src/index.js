const log = message => {
  console.log(
    `%c[Router]%c ${message}`,
    'color: rgb(255, 105, 100);',
    'color: inherit'
  );
};

/**
 * Client side router with hash history
 */
export default class Router {
  /**
   * Create a new instance of a client side router
   * @param {Object} options Router options
   * @param {boolean} [options.debug=false] - Enable debugging console messages
   * @param {Object} [options.context=window] - Context to listen for changes on
   * @param {boolean} [options.startListening=true] - Initiate listen on construct
   */
  constructor(options) {
    this.options = Object.assign({}, {
      debug: false,
      context: window,
      startListening: true,
    }, options);

    this.isListening = false;
    this.routes = [];
    this.onHashChange = this.check.bind(this);

    if (this.options.startListening) {
      this.listen();
    }
  }

  /**
   * Add a new route
   * @param {string|RegExp|function} route - Name of route to match
   * @param {function} handler - Method to execute when route matches
   * @returns {Router} - This router instance
   */
  add(route, handler) {
    // let newRoute = Router.cleanPath(route);
    let newRoute = route;
    let params = null;

    if (typeof route === 'function') {
        [ newRoute, handler ] = [ '', route ];
    }

    if (!(route instanceof RegExp)) {
        let params = newRoute.match(/({\w+})/gi);

        if (params) {
            for (const param of params) {
                newRoute = newRoute.replace(param, '(\[\\w-+*=()$|,;%{}:"\\[\\]\]+)');
            }

            params = params.map(param => param.substr(1, param.length - 2));
        }

        newRoute = new RegExp(newRoute);
    }

    this.routes.push({
      route: newRoute,
      handler,
      params
    });

    return this;
  }

  /**
   * Recheck the path and reload the page
   * @returns {Router} - This router instance
   */
  check() {
    const hash = this.currentRoute;

    for (const route of this.routes) {
      const match = hash.match(route.route);

      if (match !== null) {
        match.shift();

        let args = new Map();

        for (let i = 0; i < match.length; i++) {
          args.set(route.params[i], match[i]);
        }

        route.handler(args);

        if (this.options.debug) {
          log(`Fetching: /${hash}`);
        }

        return this;
      }
    }

    return this.navigateError(hash);
  }

  /**
   * Start listening for hash changes on the context
   * @param {any} [instance=Window] - Context to start listening on
   * @returns {Router} - This router instance
   */
  listen(instance) {
    this.check();

    if (!this.isListening || instance) {
      (instance || this.options.context).addEventListener(
        'hashchange',
        this.onHashChange
      );

      this.isListening = true;
    }

    return this;
  }

  /**
   * Stop listening for hash changes on the context
   * @param {any} [instance=Window] - Context to stop listening on
   * @returns {Router} - This router instance
   */
  stopListen(instance) {
    if (this.isListening || instance) {
      (instance || this.options.context).removeEventListener(
        'hashchange',
        this.onHashChange
      );

      this.isListening = false;
    }

    return this;
  }

  /**
   * Navigate router to path
   * @param {string} path - Path to navigate the router to
   * @returns {Router} - This router instance
   */
  navigate(path) {
    if (this.options.debug) {
      log(`Redirecting to: /${ Router.cleanPath(path || '') }`);
    }

    const cleanPath = Router.cleanPath(path || '');
    this.options.context.history.pushState({ path: cleanPath }, null, `#/${ cleanPath }`);

    if (path !== 'error') {
      window.dispatchEvent(new Event('hashchange'));
    }

    return this;
  }

  /**
   * Navigate to the error page
   * @param {string} hash
   * @returns {Router} - This router instance
   */
  navigateError(hash) {
    if (this.options.debug) {
      log(`Fetching: /${hash}, not a valid route.`);
    }

    this.navigate('error');

    return this;
  }

  /**
   * Name of the current route
   * @returns {string} - Current route
   */
  get currentRoute() {
    return Router.cleanPath(this.options.context.location.hash);
  }

  /**
   * Strip the path of slashes and hashes
   * @param {string} path - Path to clean of hashes
   * @returns {string} - Cleaned path
   */
  static cleanPath(path) {
    if (!path) {
      return '';
    }

    // return String(path).replace(/^#+\/+|^\/+#+|^\/+|^#+|\/+$|\?(.*)$/g, '');
    // keep trailing slashes! it's important to differ between folder and folder/ for recursive routing
    return String(path).replace(/^#+\/+|^\/+#+|^\/+|^#+|\?(.*)$/g, '');
  }

  static parseRoute(route) {
    return Router.cleanPath(route).split('/');
  }
}
