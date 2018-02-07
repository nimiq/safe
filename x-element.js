export default class XElement {
    /**
     * Creates an instance of XElement.
     * @param {XElement | Element | null} parent
     * @memberof XElement
     */
    constructor(parent) {
        this.__bindDOM(parent);
        this.__createChildren();
        this.$el.xDebug = this; // This DOM-Element gets a reference to this XElement (nice for debugging)
        if (this.onCreate) this.onCreate();
    }

    /**
     * 
     * 
     * @param {XElement | Element | null} parent
     * @memberof XElement
     */
    __bindDOM(parent) {
        if (parent instanceof XElement) this.$el = parent.$(this.__tagName); // query in parent for tag name
        else if (parent instanceof Element) this.$el = parent; // The parent is this DOM-Element
        else this.$el = document.querySelector(this.__tagName); // query in document for tag name
        this.__fromHtml();
        this.__bindStyles(this.styles);
    }

    /**
     * 
     * 
     * @returns 
     * @memberof XElement
     */
    __createChildren() { // Create all children recursively
        if (!this.children) return;
        this.children().forEach(child => this.__createChild(child));
    }

    /**
     * 
     * 
     * @param {XElement | XElement[]} child
     * @returns {void}
     * @memberof XElement
     */
    __createChild(child) { // bind all this.$myChildElement = new MyChildElement(this);
        if (child instanceof Array) return this.__createArrayOfChild(child[0]);
        this[child.__toChildName()] = new child(this);
    }

    /**
     * 
     * 
     * @param {XElement} child
     * @memberof XElement
     */
    __createArrayOfChild(child) {
        const name = child.__toChildName() + 's';
        const tagName = XElement.__toTagName(child.name);
        const children = this.$$(tagName);
        this[name] = [];
        children.forEach(c => this[name].push(new child(c)));
    }
    /**
     * 
     * 
     * @static
     * @param {string} str
     * @returns {string}
     * @memberof XElement
     */
    static camelize(str) {
        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match) => {
            if (+match === 0) return '';// or if (/\s+/.test(match)) for white spaces
            return match.toUpperCase();
        });
    }

    /**
     * 
     * 
     * @static
     * @returns {string}
     * @memberof XElement
     */
    static __toChildName() {
        let name = this.name;
        if (name.match(/^X[A-Z][a-z]*/)) name = name.substring(1); // replace XAnyConstructorName -> AnyConstructorName
        return '$' + name[0].toLowerCase() + name.substring(1); // AnyConstructorName -> $anyConstructorName
    }

    /**
     * 
     * 
     * @returns 
     * @memberof XElement
     */
    __fromHtml() {
        if (!this.html) return;
        const html = this.html().trim();
        const currentContent = this.$el.innerHTML.trim();
        this.$el.innerHTML = html;
        if (currentContent === '') return;
        const $content = this.$('[content]');
        if (!$content) return;
        $content.innerHTML = currentContent;
        $content.removeAttribute('content');
    }

    /**
     * 
     * 
     * @readonly
     * @memberof XElement
     */
    get __tagName() { // The tagName of this DOM-Element
        return XElement.__toTagName(this.constructor.name);
    }

    /**
     * 
     * 
     * @static
     * @param {string} name
     * @returns 
     * @memberof XElement
     */
    static __toTagName(name) {
        return name.split(/(?=[A-Z])/).join('-').toLowerCase(); // AnyConstructorName -> any-constructor-name
    }

    /**
     * 
     * 
     * @static
     * @returns 
     * @memberof XElement
     */
    static createElement() {
        const name = this.__toTagName(this.name);
        const element = document.createElement(name);
        return new this(element);
    }

    /**
     * 
     * 
     * @param {string} selector
     * @returns {Element}
     * @memberof XElement
     */
    $(selector) { return this.$el.querySelector(selector) } // Query inside of this DOM-Element

    /**
     * 
     * 
     * @param {string} selector
     * @returns {Element[]}
     * @memberof XElement
     */
    $$(selector) { return this.$el.querySelectorAll(selector) } // QueryAll inside of this DOM-Element
    /**
     * 
     * 
     * @memberof XElement
     */
    clear() { while (this.$el.firstChild) this.$el.removeChild(this.$el.firstChild) } // Clear all DOM-Element children

    /**
     * 
     * 
     * @param {any} type 
     * @param {any} callback 
     * @memberof XElement
     */
    addEventListener(type, callback) { this.$el.addEventListener(type, callback, false) }
    /**
     * 
     * 
     * @param {string} eventType
     * @param {any} [detail=null] 
     * @param {boolean} [bubbles=true] 
     * @memberof XElement
     */
    fire(eventType, detail = null, bubbles = true) { // Fire DOM-Event
        const params = { detail: detail, bubbles: bubbles };
        this.$el.dispatchEvent(new CustomEvent(eventType, params));
    }
    /**
     * 
     * 
     * @param {string} type
     * @param {function} callback
     * @param {Element} $el
     * @memberof XElement
     */
    listenOnce(type, callback, $el) {
        const listener = e => {
            $el.removeEventListener(type, listener);
            callback(e);
        }
        $el.addEventListener(type, listener, false);
    }

    /**
     * 
     * 
     * @param {string} styleClass
     * @memberof XElement
     */
    addStyle(styleClass) { this.$el.classList.add(styleClass) }
    /**
     * 
     * 
     * @param {string} styleClass
     * @memberof XElement
     */
    removeStyle(styleClass) { this.$el.classList.remove(styleClass) }
    /**
     * 
     * 
     * @param {() => string[]} styles
     * @returns 
     * @memberof XElement
     */
    __bindStyles(styles) {
        if (super.styles) super.__bindStyles(super.styles); // Bind styles of all parent types recursively
        if (!styles) return;
        styles().forEach(style => this.addStyle(style));
    }

    /**
     * 
     * 
     * @param {string} className
     * @param {Element | string} $el
     * @param {() => void} afterStartCallback
     * @param {() => void} beforeEndCallback
     * @returns
     * @memberof XElement
     */
    animate(className, $el, afterStartCallback, beforeEndCallback) {
        const $screen = this;

        return new Promise(resolve => {
            $el = $el || this.$el;
            // 'animiationend' is a native DOM event that fires upon CSS animation completion
            this.listenOnce('animationend', e => {
                if (e.target !== $el) return;
                if (beforeEndCallback) beforeEndCallback();
                this.stopAnimate(className, $el);
                resolve();
            }, $el);
            $el.classList.add(className);
            if (afterStartCallback) afterStartCallback();
        })
    }
    /**
     * 
     * 
     * @param {string} className
     * @param {Element | string} $el
     * @memberof XElement
     */
    stopAnimate(className, $el) {
        $el = $el || this.$el;
        $el.classList.remove(className);
    }

    types() {
        /** @type{() => (typeof XElement)[]} */
        this.children = null;
        /** @type {string} */
        this.name = null;
        /** @types {() => string[]} */
        this.styles = null;
    }
}