import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/elements/mixin-redux/mixin-redux.js';

export default class XSettings extends MixinRedux(XElement) {
    html(){
        return `
             <x-card>
                <h2>Settings</h2>
                <label><input type="checkbox">Offline-mode</label>
             </x-card>
        `
    }

    static mapStateToProps(state) {
        return {
            settings: state.accounts.settings
        };
    }

    _onPropertiesChanged(changes) {

    }
}
