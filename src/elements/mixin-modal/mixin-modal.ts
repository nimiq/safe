import { MixinSingletonX, MixinSingletonV } from '../mixin-singleton';
import XModals from './x-modals';
import XModalContainer from './x-modal-container';
import XElement from '../../lib/x-element/x-element';
import Vue, { VueConstructor } from 'vue';
import { mixins } from 'vue-class-component';

type Constructor<T = {}> = new (...args: any[]) => T;

// Public interface for Modals, not including static methods as typescript doesn't support static methods in interfaces
// without ugly hacks like https://github.com/Microsoft/TypeScript/issues/13462#issuecomment-295685298.
export type IModal<T = {}> = T & {
    readonly container: XModalContainer;
    readonly route: string;
    show(...parameters: any[]): void;
    hide(force?: boolean): void
    allowsShow(...parameters: any[]): boolean;
    allowsHide(incomingModal: IModal<T>): boolean;
    onShow(...parameters: any[]): void;
    onHide(): void;
    onEntry(...parameters: any[]): void;
    onExit(): void;
};
export type ModalComponent = IModal<XElement | Vue>;

function MixinModalCommon<T extends Constructor>(BaseClass: T) {
    return class extends BaseClass implements IModal {
        protected _container!: XModalContainer;
        protected _route!: string;
        protected $closeButton!: Element | null;

        public show(...parameters: any[]) {
            XModals.show(false, this, ...parameters);
        }

        public hide(force = false) {
            XModals.hide(false, this, force);
        }

        public allowsShow(...parameters: any[]) {
            return true;
        }

        public allowsHide(incomingModal: IModal<any>) {
            return true;
        }

        public get container() {
            return this._container;
        }

        public get route() {
            return this._route;
        }

        public onShow(...parameters: any[]) {
            // abstract method
        }

        public onHide() {
            // abstract method
        }

        // callbacks for router
        public onEntry(...parameters: any[]) {
            XModals.show(true, this, ...parameters);
        }

        public onExit() {
            XModals.hide(true, this);
        }
    };
}

export function MixinModalX(XElementBase: typeof XElement) {
    return class Modal extends MixinModalCommon(MixinSingletonX(XElementBase)) {
        public static show(...parameters: any[]) {
            this.getInstance().show(...parameters);
        }

        public static hide() {
            this.getInstance().hide();
        }

        protected onCreate() {
            super.onCreate();
            this._route = this.attribute('x-route-aside');
            this._container = XModalContainer.createFor(this);
            this._container.$el.appendChild(this.$el); // append to the container if not already the case
            XModals.getInstance().$el.appendChild(this._container.$el); // append to x-modals if not already the case
            this.$closeButton = this.$el.querySelector('[x-modal-close]');
            if (this.$closeButton) this.$closeButton.addEventListener('click', () => this.hide());
        }

        protected styles() {
            return [ ...super.styles(), 'nimiq-dark' ];
        }
    };
}

export function MixinModalV(VueBase: VueConstructor) {
    // Vue components do not support inherited and mixed-in static methods, therefore we don't provide them for vue
    class Modal extends MixinModalCommon(MixinSingletonV(VueBase)) {
        protected created() {
            this._route = this.$el.getAttribute('x-route-aside') || '';
            this._container = XModalContainer.createFor(this);
            this._container.$el.appendChild(this.$el); // append to the container if not already the case
            XModals.getInstance().$el.appendChild(this._container.$el); // append to x-modals if not already the case
            this.$closeButton = this.$el.querySelector('[x-modal-close]');
            if (this.$closeButton) this.$closeButton.addEventListener('click', () => this.hide());
            this.$el.classList.add('modal', 'nimiq-dark');
        }
    }

    return mixins(Modal, VueBase);
}
