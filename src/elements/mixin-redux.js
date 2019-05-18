import { bindActionCreators } from '/libraries/redux/src/index.js';

const MixinRedux = XElementBase => class extends XElementBase {
    onCreate() {
        super.onCreate();

        const store = MixinRedux.store;

        if (!store) return;

        const { actions, mapStateToProps } = this.constructor;

        if (actions) {
            this.actions = bindActionCreators(actions, store.dispatch);
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

    destroy() {
        super.destroy();

        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }
};

export default MixinRedux;

// todo [later] Only listen to state updates while element is visible