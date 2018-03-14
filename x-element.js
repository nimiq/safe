export default class XElement {
    /**
     * Creates an instance of XElement.
     * @param {XElement | Element | null} parent
     * @memberof XElement
     */
    constructor(parent) {
        /** @type {string} */
        this.name = null;
        this.__bindDOM(parent);
        this.__createChildren();
        this.__bindListeners();

        if (this.onCreate) this.onCreate();
    }

    styles() { return []; }

    /** @returns{(typeof XElement)[]} */
    children() { return []; }

    /**
     * @param {XElement | Element | null} parent
     */
    __bindDOM(parent) {
        if (parent instanceof XElement) this.$el = parent.$(this.__tagName + ':not([data-x-initialized])'); // query in parent for tag name
        else if (parent instanceof Element) this.$el = parent; // The parent is this DOM-Element
        else this.$el = document.querySelector(this.__tagName); // query in document for tag name
        this.$el.setAttribute('data-x-initialized', true);
        this.__fromHtml();
        this.__bindStyles(this.styles());
    }

    /**
     * @returns
     */
    __createChildren() { // Create all children recursively
        this.children().forEach(child => this.__createChild(child));
    }

    /**
     * @param {XElement} child
     */
    __createChild(child) {
        const name = child.__toChildName();
        const tagName = XElement.__toTagName(child.name);
        const foundChildren = this.$$(tagName + ':not([x-initialized])');

        if (foundChildren.length < 1) return;

        this[name] = [];
        foundChildren.forEach(c => this[name].push(new child(this)));

        // if there is only one child of this kind, unwrap it from the array
        if (this[name].length === 1) this[name] = this[name][0];
    }

    __bindListeners() {
        if (!(this.listeners instanceof Function)) return;
        const listeners = this.listeners();
        for (const key in listeners) {
            if (!listeners[key]) continue;
            let event, selector;
            if (key.includes(' ')) [ event, selector ] = key.split(' ');
            else [ event, selector ] = [ key, undefined ];
            const target = selector ? this.$(selector) : this;
            target.addEventListener(event, e => {
                const method = listeners[key];
                const event = e.detail !== undefined ? e.detail : e;
                if (method instanceof Function) method.call(this, event);
                else this[method](event);
            });
        }
    }

    /*
     * @static
     * @param {string} str
     * @returns {string}
     */
    static camelize(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match) => {
            if (+match === 0) return '';// or if (/\s+/.test(match)) for white spaces
            return match.toUpperCase();
        });
    }

    /**
     * @static
     * @returns {string}
     */
    static __toChildName() {
        let name = this.name;
        if (name.match(/^X[A-Z][a-z]*/)) name = name.substring(1); // replace XAnyConstructorName -> AnyConstructorName
        return '$' + name[0].toLowerCase() + name.substring(1); // AnyConstructorName -> $anyConstructorName
    }

    /**
     * @returns
     */
    __fromHtml() {
        if (!(this.html instanceof Function)) return;
        const html = this.html().trim()
        const currentContent = this.$el.innerHTML.trim();
        this.$el.innerHTML = html;
        if (currentContent === '') return;
        const $content = this.$('[data-x-content]');
        if (!$content) return;
        $content.innerHTML = currentContent;
        $content.removeAttribute('data-x-content');
    }

    /**
     * @readonly
     */
    get __tagName() { // The tagName of this DOM-Element
        return XElement.__toTagName(this.constructor.name);
    }

    /**
     * @static
     * @param {string} name
     * @returns
     */
    static __toTagName(name) {
        return name.split(/(?=[A-Z])/).join('-').toLowerCase(); // AnyConstructorName -> any-constructor-name
    }

    /**
     * @static
     * @returns
     */
    static createElement() {
        const name = this.__toTagName(this.name);
        const element = document.createElement(name);
        return new this(element);
    }

    /**
     * Find the first match of a selector within this element.
     *
     * @param {string} selector
     * @returns {Element}
     */
    $(selector) { return this.$el.querySelector(selector) } // Query inside of this DOM-Element

    /**
     * Finds all matches of a selector within this element.
     *
     * @param {string} selector
     * @returns {NodeList}
     */
    $$(selector) { return this.$el.querySelectorAll(selector) }

    /**
     * Clear all DOM-Element children
     */
    clear() { while (this.$el.firstChild) this.$el.removeChild(this.$el.firstChild) } //

    /**
     * @param {string} type
     * @param {function} callback
     */
    addEventListener(type, callback) { this.$el.addEventListener(type, callback, false) }

    /**
     * @param {string} eventType
     * @param {any} [detail=null]
     * @param {boolean} [bubbles=true]
     */
    fire(eventType, detail = null, bubbles = true) { // Fire DOM-Event
        const params = { detail: detail, bubbles: bubbles };
        this.$el.dispatchEvent(new CustomEvent(eventType, params));
    }

    attribute(name) { return this.$el.getAttribute(name); }

    /**
     * @param {string} type
     * @param {function} callback
     * @param {Element | window} $el
     */
    listenOnce(type, callback, $el) {
        const listener = e => {
            $el.removeEventListener(type, listener);
            callback(e);
        }
        $el.addEventListener(type, listener, false);
    }

    /**
     * @param {string} styleClass
     */
    addStyle(styleClass) { this.$el.classList.add(styleClass) }

    /**
     * @param {string} styleClass
     */
    removeStyle(styleClass) { this.$el.classList.remove(styleClass) }

    /**
     * @param {() => string[]} styles
     * @returns
     */
    __bindStyles(styles) {
        if (super.styles) super.__bindStyles(super.styles()); // Bind styles of all parent types recursively
        styles.forEach(style => this.addStyle(style));
    }

    /**
     * @param {string} className
     * @param {Element | string} $el
     * @param {() => void} afterStartCallback
     * @param {() => void} beforeEndCallback
     * @returns
     */
    animate(className, $el, afterStartCallback, beforeEndCallback) {
        return new Promise(resolve => {
            $el = $el || this.$el;
            // 'animiationend' is a native DOM event that fires upon CSS animation completion
            const listener = e => {
                if (e.target !== $el) return;
                if (beforeEndCallback) beforeEndCallback();
                this.stopAnimate(className, $el);
                this.$el.removeEventListener('animationend', listener);
                resolve();
            };
            this.$el.addEventListener('animationend', listener);
            $el.classList.add(className);
            if (afterStartCallback) afterStartCallback();
        })
    }

    /**
     * @param {string} className
     * @param {Element | string} $el
     */
    stopAnimate(className, $el) {
        $el = $el || this.$el;
        $el.classList.remove(className);
    }

}
