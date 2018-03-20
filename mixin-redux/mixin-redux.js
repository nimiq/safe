import { bindActionCreators } from '/libraries/redux/src/index.js';

const MixinRedux = XElementBase => class extends XElementBase {
    onCreate() {
        super.onCreate();

        if (!MixinRedux.store) return;

        const { actions, mapStateToProps } = this.constructor;

        if (actions) {
            this.actions = bindActionCreators(actions, MixinRedux.store.dispatch);
        }

        if (mapStateToProps) {
            this._unsubscribe = MixinRedux.store.subscribe(() => {
                const properties = mapStateToProps(MixinRedux.store.getState());

                this.setProperties(properties);
            });
        }
    }

    destroy() {
        super.destroy();

        if (this._unsubscribe) {
            this._unsubscribe();
        }
    }
};

export default MixinRedux;