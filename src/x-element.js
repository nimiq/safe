class XElement {
    /* Private API */
    constructor(root) {
        this.__bindDOM(root);
        this.__createChildren();
        this.$el.state = this; // This DOM-Element gets a reference to this XElement (nice for debugging)
        if (this.onCreate) this.onCreate();
    }

    __bindDOM(root) {
        this.$el = XElement.__fromTemplate(this.__tagName); // try to find a template
        if (this.$el) root.$el.appendChild(this.$el) // if template found bind content to parent 
        else if (root instanceof XElement) this.$el = root.$(this.__tagName); // query in root for tag name
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
        return '$' + this.name[0].toLowerCase() + this.name.substring(1); // AnyConstructorName -> $anyConstructorName
    }

    get __tagName() { // The tagName of this DOM-Element
        return XElement.__toTagName(this.constructor.name);
    }

    static __toTagName(name) {
        name = name.split(/(?=[A-Z])/).join('-').toLowerCase(); // AnyConstructorName -> any-constructor-name
        if (name.startsWith('view-')) return name; // Views aren't prefixed
        if (name.startsWith('x-')) return name; // XConstructorName isn't prefixed
        else return 'x-' + name; // All other elements are prefixed with "x-" 
    }

    __fromHTML() {
        // const element = document.createElement(this.__tagName);
        // element.innerHTML = this.html();
        this.$el.innerHTML = this.html();
    }

    static __fromTemplate(name) {
        const template = document.getElementById(name); // query for <template id="x-my-element">
        if (!template) return;
        if (template.nodeName !== 'TEMPLATE') return;
        const element = document.createElement(name);
        const content = document.importNode(template.content, true);
        element.appendChild(content);
        return element;
    }

    /* Public API */
    $(selector) { return this.$el.querySelector(selector) } // Query inside of this DOM-Element

    fire(eventType, detail = null) { // Fire DOM-Event
        const params = { detail: detail, bubbles: true }
        this.$el.dispatchEvent(new CustomEvent(eventType, params))
    }

    clear() {
        while (this.$el.firstChild) this.$el.removeChild(this.$el.firstChild);
    }

    addEventListener(type, listener) { return this.$el.addEventListener(type, listener, false) }

    add(element) {
        if (!(element instanceof XElement)) return;
        this.$el.appendChild(element.$el);
    }

    static createElement() {
        const name = this.__toTagName(this.name);
        const element = this.__fromTemplate(name) || document.createElement(name);
        return new this(element);
    }
}