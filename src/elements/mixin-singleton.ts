import XElement from '../lib/x-element/x-element';
import Vue, { VueConstructor } from 'vue';
import { mixins } from 'vue-class-component';

interface Constructor<T> {
    new (...args: any[]): T;
}

// Common interface for Singleton for XElement and Vue
// As typescript does not support declaring static methods in an interface, we use this hack:
// https://github.com/Microsoft/TypeScript/issues/13462#issuecomment-295685298
interface ISingletonStatic<T> extends Constructor<T> {
    getInstance<T extends typeof XElement | VueConstructor>(this: T): InstanceType<T>;
}
/* class decorator */
function staticImplements<T>() {
    return (constructor: T) => {}
}

function MixinSingletonXElement(XElementBase: typeof XElement) {
    @staticImplements<ISingletonStatic<Singleton>>()
    class Singleton extends XElementBase {
        private static _instance: Singleton;

        // To be able to access properties on the instance that come from child classes and not Singleton itself, we
        // have to type the instance in a polymorphic way. As typescript does not support polymorphic this types
        // (https://www.typescriptlang.org/docs/handbook/advanced-types.html#polymorphic-this-types) as return type of
        // static methods, we emulate them (https://github.com/Microsoft/TypeScript/issues/5863#issuecomment-410887254).
        // Note that generics are not supported on accessors / getters. Therefore defining getInstance as method.
        public static getInstance<T extends typeof XElement | VueConstructor>(this: T): InstanceType<T> {
            const self = this as any as typeof Singleton;
            if (self._instance) return self._instance as InstanceType<T>;
            const element = document.querySelector(self.tagName) || document.querySelector(`.${self.tagName}`);
            if (element) {
                self._instance = new this(element as HTMLElement) as Singleton;
            } else {
                self._instance = self.createElement();
                if (!self._instance.$el.parentNode) {
                    (MixinSingleton.appContainer || document.body).appendChild(self._instance.$el);
                }
            }
            return self._instance as InstanceType<T>;
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
    }
    return Singleton;
}

function MixinSingletonVue(VueBase: VueConstructor) {
    @staticImplements<ISingletonStatic<Singleton>>()
    class Singleton extends Vue {
        private static _instance: Singleton;

        public static getInstance<T extends typeof XElement | VueConstructor>(this: T): InstanceType<T> {
            const self = this as any as typeof Singleton;
            if (self._instance) return self._instance as InstanceType<T>;
            const element = document.createElement('div');
            self._instance = new self();
            self._instance.$mount(element);
            (MixinSingleton.appContainer || document.body).appendChild(self._instance.$el);
            return self._instance as InstanceType<T>;
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

function MixinSingleton<T extends VueConstructor | typeof XElement>(BaseClass: T): T & ISingletonStatic<T> {
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
