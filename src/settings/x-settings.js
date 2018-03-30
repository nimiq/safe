import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';

export default class XSettings extends MixinRedux(XElement) {
    html(){
        return `
             <x-card>
                <h2>Settings</h2>
                <hr>
                <a href="#" onclick="localStorage.removeItem('persistedState'); window.skipPersistingState = true; location.reload();">Delete persistence and reload</a></small>
             </x-card>
        `
    }

    static mapStateToProps(state) {
        /*return {
            settings: state.accounts.settings
        };*/
    }

    _onPropertiesChanged(changes) {

    }
}
