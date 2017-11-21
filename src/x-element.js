class XElement {
    /* Private API */
    constructor(parent) {
        this.__bindDOM(parent);
        this.__createChildren();
        this.$el.state = this; // This DOM-Element gets a reference to this XElement (nice for debugging)
        if (this.onCreate) this.onCreate();
    }

    __bindDOM(parent) {
        if (parent instanceof XElement) this.$el = parent.$(this.__tagName);
        else this.$el = document.querySelector(this.__tagName);
    }

    __createChildren() { // Create all children recursively 
        if (!this.children) return;
        this.children().forEach(child => { // bind all this.$myChildElement = new MyChildElement(this);
            if (typeof child === 'string') this.__bindFromSelector(selector);
            else this[child.__toChildName()] = new child(this);
        })
    }

    static __toChildName() {
        return '$' + this.name[0].toLowerCase() + this.name.substring(1); // AnyConstructorName -> $anyConstructorName
    }

    get __tagName() { // The tagName of this DOM-Element
        const name = this.constructor.name.split(/(?=[A-Z])/).join('-').toLowerCase(); // AnyConstructorName -> any-constructor-name
        if (name.startsWith('view-')) return name; // Views aren't prefixed
        else return 'x-' + name; // All other elements are prefixed with "x-" 
    }

    static __bindFromSelector(selector) {
        this['$' + selector] = this.$(selector);
    }

    /* Public API */
    $(selector) { return this.$el.querySelector(selector) } // Query inside of this DOM-Element
    fire(eventType, detail) { this.$el.dispatchEvent(new CustomEvent(eventType, { detail: detail })) } // Fire DOM-Event

    onCreate() {}
    onShow() {}
    onHide() {}
}