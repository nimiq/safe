class XElement {
    /* Private API */
    constructor(root) {
        this.__bindDOM(root);
        this.__createChildren();
        this.$el.state = this; // This DOM-Element gets a reference to this XElement (nice for debugging)
        if (this.onCreate) this.onCreate();
    }

    __bindDOM(root) {
        if (root instanceof XElement) this.$el = root.$(this.__tagName); // query in parent for tag name
        else if (root instanceof Element) this.$el = root;
        else this.$el = document.querySelector(this.__tagName);
    }

    __createChildren() { // Create all children recursively 
        if (!this.children) return;
        this.children().forEach(child => { // bind all this.$myChildElement = new MyChildElement(this);
            this[child.__toChildName()] = new child(this);
        })
    }

    static __toChildName() {
        return '$' + this.name[0].toLowerCase() + this.name.substring(1); // AnyConstructorName -> $anyConstructorName
    }

    get __tagName() { // The tagName of this DOM-Element
        return XElement.__toTagName(this.constructor.name);
    }

    static __toTagName(name) {
        name = name.split(/(?=[A-Z])/).join('-').toLowerCase(); // AnyConstructorName -> any-constructor-name
        if (name.startsWith('view-')) return name; // Views aren't prefixed
        else return 'x-' + name; // All other elements are prefixed with "x-" 
    }

    static __fromTemplate(name) {
        const template = document.getElementById(name); // query for <template id="x-my-element">
        if (!template) return;
        return template.cloneNode();
    }

    /* Public API */
    $(selector) { return this.$el.querySelector(selector) } // Query inside of this DOM-Element
    fire(eventType, detail) { this.$el.dispatchEvent(new CustomEvent(eventType, { detail: detail || null })) } // Fire DOM-Event
    addEventListener(type, listener) { return this.$el.addEventListener(type, listener) }

    add(element) {
        if (!(element instanceof XElement)) return;
        this.$el.appendChild(element.$el);
    }

    onCreate() {}
    onShow() {}
    onHide() {}

    static createElement() {
        const name = this.__toTagName(this.name);
        const element = this.__fromTemplate(name) || document.createElement(this.__toTagName(this.name));
        return new this(element);
    }
}