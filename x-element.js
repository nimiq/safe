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
        if (this.$el.innerHTML.trim() === '' && this.html) this.__fromHtml();
    }

    __createChildren() { // Create all children recursively 
        if (!this.children) return;
        this.children().forEach(child => this.__createChild(child))
    }

    __createChild(child) { // bind all this.$myChildElement = new MyChildElement(this);
        if (child instanceof Array) return this.__createArrayOfChild(child[0])
        this[child.__toChildName()] = new child(this);
    }

    __createArrayOfChild(child) {
        const name = child.__toChildName() + 's';
        const tagName = XElement.__toTagName(child.name);
        const children = this.$$(tagName);
        this[name] = []
        children.forEach(c => this[name].push(new child(c)))
    }

    static __toChildName() {
        let name = this.name;
        if (name.match(/^X[A-Z][a-z]*/)) name = name.substring(1); // replace XAnyConstructorName -> AnyConstructorName
        return '$' + name[0].toLowerCase() + name.substring(1); // AnyConstructorName -> $anyConstructorName
    }

    __fromHtml() {
        this.$el.innerHTML = this.html();
    }

    get __tagName() { // The tagName of this DOM-Element
        return XElement.__toTagName(this.constructor.name);
    }

    static __toTagName(name) {
        return name.split(/(?=[A-Z])/).join('-').toLowerCase(); // AnyConstructorName -> any-constructor-name
    }

    /* Public API */
    static createElement() {
        const name = this.__toTagName(this.name);
        const element = document.createElement(name);
        return new this(element);
    }

    $(selector) { return this.$el.querySelector(selector) } // Query inside of this DOM-Element
    $$(selector) { return this.$el.querySelectorAll(selector) } // QueryAll inside of this DOM-Element
    clear() { while (this.$el.firstChild) this.$el.removeChild(this.$el.firstChild) } // Clear all DOM-Element children
    addEventListener(type, listener) { return this.$el.addEventListener(type, listener, false) }

    fire(eventType, detail = null, bubbles = false) { // Fire DOM-Event
        const params = { detail: detail, bubbles: bubbles }
        this.$el.dispatchEvent(new CustomEvent(eventType, params))
    }
}