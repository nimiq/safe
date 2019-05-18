const MixinSingleton = XElementBase => class extends XElementBase {
    onCreate() {
        if (this.constructor._instance) {
            throw Error('Singleton already has an instance.');
        }
        this.constructor._instance = this;
        super.onCreate();
    }

    static get instance() {
        if (this._instance) return this._instance;
        const element = document.querySelector(this.tagName);
        if (element) {
            this._instance = new this(element);
        } else {
            this._instance = this.createElement();
            if (!this._instance.$el.parentNode) {
                (MixinSingleton.appContainer || document.body).appendChild(this._instance.$el);
            }
        }
        return this._instance;
    }

    static destroyInstance() {
        if (!this._instance) return;
        this._instance.destroy();
        this._instance = null;
    }
};
export default MixinSingleton;
