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
        let name = this.constructor.name;
        name = name.split(/(?=[A-Z])/).join('-').toLowerCase(); // AnyConstructorName -> any-constructor-name
        if (name.startsWith('view-')) return name; // Views aren't prefixed
        if (name.startsWith('x-')) return name; // XConstructorName isn't prefixed
        else return 'x-' + name; // All other elements are prefixed with "x-" 
    }

    __fromHTML() {
        this.$el.innerHTML = this.html();
    }

    /* Public API */
    $(selector) { return this.$el.querySelector(selector) } // Query inside of this DOM-Element
    $$(selector) { return this.$el.querySelectorAll(selector) } // QueryAll inside of this DOM-Element

    fire(eventType, detail = null) { // Fire DOM-Event
        const params = { detail: detail, bubbles: true }
        this.$el.dispatchEvent(new CustomEvent(eventType, params))
    }

    clear() {
        while (this.$el.firstChild) this.$el.removeChild(this.$el.firstChild);
    }

    addEventListener(type, listener) { return this.$el.addEventListener(type, listener, false) }
}