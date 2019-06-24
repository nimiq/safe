import { bindActionCreators } from 'redux';
import XElement from '../lib/x-element/x-element';

function MixinRedux(XElementBase: typeof XElement) {
    return class extends XElementBase {
        // tslint:disable:next-line ban-types
        protected actions!: { [name: string]: Function };
        private _unsubscribe?: Function;

        public destroy() {
            super.destroy();

            if (this._unsubscribe) {
                this._unsubscribe();
            }
        }

        protected onCreate() {
            super.onCreate();

            const store = MixinRedux.store;

            if (!store) return;

            // @ts-ignore
            const {actions, mapStateToProps} = this.constructor;

            if (actions) {
                this.actions = bindActionCreators(actions, store.dispatch);
            } else {
                this.actions = {};
            }

            if (mapStateToProps) {
                requestAnimationFrame(() => {
                    // set initial properties after DOM was created
                    const initialProperties = mapStateToProps(store.getState(), this.properties);
                    this.setProperties(initialProperties);
                });

                // subscribe to state updates
                this._unsubscribe = store.subscribe(() => {
                    const properties = mapStateToProps(store.getState(), this.properties);

                    this.setProperties(properties);
                });
            }
        }

        // setProperties(props, reset) {
        //     let newProps = {...this.properties, props};

        //     if (mapStateToProps.length > 1) {
        //         newProps = mapStateToProps(store.getState(), newProps);
        //     }

        //     super.setProperties(newProps, reset);
        // }
    };
}

namespace MixinRedux { // tslint:disable-line:no-namespace
    export let store: any;
}

export default MixinRedux;
