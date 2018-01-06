class XElement {
    /* Private API */
    constructor(root) {
        this.__bindDOM(root);
        this.__createChildren();
        this.$el.state = this; // This DOM-Element gets a reference to this XElement (nice for debugging)
        if (this.onCreate) this.onCreate();
    }

    __bindDOM(root) {
        if (root instanceof XElement) this.$el = root.$(this.__tagName); // query in root for tag name
        else if (root instanceof Element) this.$el = root; // The root is this DOM-Element
        else this.$el = document.querySelector(this.__tagName); // query in document for tag name
        if (this.html) this.__fromHTML(); // use html if it is set
    }

    __createChildren() { // Create all children recursively 
        if (!this.children) return;
        this.children().forEach(child => { // bind all this.$myChildElement = new MyChildElement(this);
            this[child.__toChildName()] = new child(this);
        })
    }

    static __toChildName() {
        let name = this.name;
        if (name.match(/^X[A-Z][a-z]*/)) name = name.substring(1); // replace XAnyConstructorName -> AnyConstructorName
        return '$' + name[0].toLowerCase() + name.substring(1); // AnyConstructorName -> $anyConstructorName
    }

    get __tagName() { // The tagName of this DOM-Element
        return XElement.__toTagName(this.constructor.name);
    }

    static __toTagName(name) {
        return name.split(/(?=[A-Z])/).join('-').toLowerCase(); // AnyConstructorName -> any-constructor-name
    }

    __fromHTML() {
        this.$el.innerHTML = this.html();
    }

    /* Public API */
    static createElement() {
        const name = this.__toTagName(this.name);
        const element = document.createElement(name);
        return new this(element);
    }

    $(selector) { return this.$el.querySelector(selector) } // Query inside of this DOM-Element
    $$(selector) { return this.$el.querySelectorAll(selector) } // QueryAll inside of this DOM-Element
    clear() { while (this.$el.firstChild) this.$el.removeChild(this.$el.firstChild) }
    addEventListener(type, listener) { return this.$el.addEventListener(type, listener, false) }

    fire(eventType, detail = null) { // Fire DOM-Event
        const params = { detail: detail, bubbles: true }
        this.$el.dispatchEvent(new CustomEvent(eventType, params))
    }
}