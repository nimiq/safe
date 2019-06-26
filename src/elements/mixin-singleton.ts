import XElement from '../lib/x-element/x-element';
import Vue, { VueConstructor } from 'vue';
import { mixins } from 'vue-class-component';

function MixinSingletonXElement(XElementBase: typeof XElement) {
    return class Singleton extends XElementBase {
        private static _instance: Singleton;

        // To be able to access properties on the instance that come from child classes and not Singleton itself, we
        // have to type the instance in a polymorphic way. As typescript does not support polymorphic this types
        // (https://www.typescriptlang.org/docs/handbook/advanced-types.html#polymorphic-this-types) as return type of
        // static methods, we emulate them (https://github.com/Microsoft/TypeScript/issues/5863#issuecomment-410887254).
        // Note that generics are not supported on accessors / getters. Therefore defining getInstance as method.
        public static getInstance<T extends typeof Singleton>(this: T): InstanceType<T> {
            if (this._instance) return this._instance as InstanceType<T>;
            const element = document.querySelector(this.tagName) || document.querySelector(`.${this.tagName}`);
            if (element) {
                this._instance = new this(element as HTMLElement);
            } else {
                this._instance = this.createElement();
                if (!this._instance.$el.parentNode) {
                    (MixinSingleton.appContainer || document.body).appendChild(this._instance.$el);
                }
            }
            return this._instance as InstanceType<T>;
        }

        public destroy() {
            super.destroy();
            delete Singleton._instance;
        }

        protected onCreate() {
            if (Singleton._instance) {
                throw Error('Singleton already has an instance.');
            }
            Singleton._instance = this;
            super.onCreate();
        }
    };
}

function MixinSingletonVue(VueBase: VueConstructor) {
    class Singleton extends Vue {
        private static _instance: Singleton;

        public static getInstance<T extends typeof Singleton>(this: T): InstanceType<T> {
            if (this._instance) return this._instance as InstanceType<T>;
            const element = document.createElement('div');
            this._instance = new this();
            this._instance.$mount(element);
            (MixinSingleton.appContainer || document.body).appendChild(this._instance.$el);
            return this._instance as InstanceType<T>;
        }

        protected created() {
            if (Singleton._instance) {
                throw Error('Singleton already has an instance.');
            }
            Singleton._instance = this;
        }

        protected destroyed() {
            delete Singleton._instance;
        }
    }

    return mixins(Singleton, VueBase);
}

function isTypeOfXElement(cls: VueConstructor | typeof XElement): cls is typeof XElement {
    return cls === XElement || cls.prototype instanceof XElement;
}

function MixinSingleton<T extends VueConstructor | typeof XElement>(BaseClass: T): T {
    if (isTypeOfXElement(BaseClass)) {
        return MixinSingletonXElement(BaseClass) as any;
    } else {
        return MixinSingletonVue(BaseClass as VueConstructor) as any;
    }
}

namespace MixinSingleton { // tslint:disable-line:no-namespace
    export let appContainer: HTMLElement;
}

export default MixinSingleton;
