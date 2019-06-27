import XElement from '../lib/x-element/x-element';
import Vue, { VueConstructor } from 'vue';
import { mixins } from 'vue-class-component';

let _mixinSingletonAppContainer: Element;

export function setMixinSingletonAppContainer(container: Element) {
    _mixinSingletonAppContainer = container;
}

export function MixinSingletonX(XElementBase: typeof XElement) {
    return class Singleton extends XElementBase {
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
                    (_mixinSingletonAppContainer || document.body).appendChild(this._instance.$el);
                }
            }
            return this._instance as InstanceType<T>;
        }

        private static _instance: Singleton;

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

// Vue components do not support inherited and mixed-in static methods and properties, therefore we're implementing
// the singleton differently for Vue components
const vueSingletonInstances = new Map<VueConstructor, Vue>();

function MixinSingletonV(VueBase: VueConstructor) {
    class Singleton extends Vue {
        protected created() {
            const ctor = this.constructor as VueConstructor;
            if (vueSingletonInstances.has(ctor)) {
                throw Error('Singleton already has an instance.');
            }
            vueSingletonInstances.set(ctor, this);
        }

        protected destroyed() {
            vueSingletonInstances.delete(this.constructor as VueConstructor);
        }
    }
    return mixins(Singleton, VueBase);
}

namespace MixinSingletonV { // tslint:disable-line:no-namespace
    export function getInstance<T extends VueConstructor>(ctor: T): InstanceType<T> {
        if (vueSingletonInstances.has(ctor)) return vueSingletonInstances.get(ctor)! as InstanceType<T>;
        const element = document.createElement('div');
        const instance = new ctor();
        vueSingletonInstances.set(ctor, instance);
        instance.$mount(element);
        (_mixinSingletonAppContainer || document.body).appendChild(instance.$el);
        return instance as InstanceType<T>;
    }
}

export { MixinSingletonV };
