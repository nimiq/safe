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
        this.__fromHtml();
        this.__bindStyles(this.styles);
    }

    __createChildren() { // Create all children recursively 
        if (!this.children) return;
        this.children().forEach(child => this.__createChild(child));
    }

    __createChild(child) { // bind all this.$myChildElement = new MyChildElement(this);
        if (child instanceof Array) return this.__createArrayOfChild(child[0]);
        this[child.__toChildName()] = new child(this);
    }

    __createArrayOfChild(child) {
        const name = child.__toChildName() + 's';
        const tagName = XElement.__toTagName(child.name);
        const children = this.$$(tagName);
        this[name] = [];
        children.forEach(c => this[name].push(new child(c)));
    }

    static __toChildName() {
        let name = this.name;
        if (name.match(/^X[A-Z][a-z]*/)) name = name.substring(1); // replace XAnyConstructorName -> AnyConstructorName
        return '$' + name[0].toLowerCase() + name.substring(1); // AnyConstructorName -> $anyConstructorName
    }

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

    get __tagName() { // The tagName of this DOM-Element
        return XElement.__toTagName(this.constructor.name);
    }

    static __toTagName(name) {
        return name.split(/(?=[A-Z])/).join('-').toLowerCase(); // AnyConstructorName -> any-constructor-name
    }

    static createElement() {
        const name = this.__toTagName(this.name);
        const element = document.createElement(name);
        return new this(element);
    }

    /* DOM Manipulation */
    $(selector) { return this.$el.querySelector(selector) } // Query inside of this DOM-Element
    $$(selector) { return this.$el.querySelectorAll(selector) } // QueryAll inside of this DOM-Element
    clear() { while (this.$el.firstChild) this.$el.removeChild(this.$el.firstChild) } // Clear all DOM-Element children

    /* Events */
    addEventListener(type, callback) { this.$el.addEventListener(type, callback, false) }

    fire(eventType, detail = null, bubbles = true) { // Fire DOM-Event
        const params = { detail: detail, bubbles: bubbles };
        this.$el.dispatchEvent(new CustomEvent(eventType, params));
    }

    /* Style Manipulation */
    addStyle(styleClass) { this.$el.classList.add(styleClass) }

    removeStyle(styleClass) { this.$el.classList.remove(styleClass) }

    __bindStyles(styles) {
        if (super.styles) super.__bindStyles(super.styles); // Bind styles of all parent types recursively 
        if (!styles) return;
        styles().forEach(style => this.addStyle(style));
    }

    /* Animations */
    animate(className, $el, animationDuration) {
        $el = $el || this.$el;
        const listener = () => {
            $el.removeEventListener('transitionend', listener);
            $el.removeEventListener('animationend', listener);
            $el.removeEventListener('animationcancel', listener);
            this.stopAnimation(className, $el);
        };
        $el.addEventListener('transitionend', listener, false);
        $el.addEventListener('animationend', listener, false);
        $el.addEventListener('animationcancel', listener, false); // unfortunately still has bad browser support
        if (animationDuration) {
            $el.style.animationDuration = animationDuration + 's';
            $el.style.transition = 'all ' + animationDuration + 's';
        }
        $el.classList.add(className);
    }

    stopAnimation(className, $el) {
        $el = $el || this.$el;
        $el.style.animationDuration = '';
        $el.style.transition = '';
        $el.classList.remove(className);
    }
}