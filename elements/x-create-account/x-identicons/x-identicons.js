import XElement from '/libraries/x-element/x-element.js';
import XIdenticon from '/elements/x-identicon/x-identicon.js';
import keyguardPromise from '../../../keyguard.js';
import reduxify from '/libraries/redux/src/redux-x-element.js';
import store from '../../../store/store.js';
import XRouter from '/elements/x-router/x-router.js';

export default class XIdenticons extends XElement {

    html() {
        return `
            <h1>Choose Your Account Avatar</h1>
            <h2>The Avatar will be 'unique' to this Account. You can not change it later.</h2>
            <x-container>
                <div class="center" id="loading">
                    <x-loading-animation></x-loading-animation>
                    <h2>Mixing colors</h2>
                </div>
            </x-container>
            <a secondary class="generate-more">Generate New</a>
            <x-backdrop class="center">
                <x-address></x-address>
                <a button>Confirm</a>
                <a secondary>Back</a>
            </x-backdrop>
            `
    }

    onCreate() {
        this.$container = this.$('x-container');
        this.$loading = this.$('#loading');
        this.$address = this.$('x-address');
    }

    listeners() {
        return {
            'click .generate-more': e => this._generateIdenticons(),
            'click [button]': e => this._onConfirm(e),
            'click x-backdrop': e => this._clearSelection()
        }
    }

    // set actions from outside?? use store here?? dumb component?? singleton keyguard-client?

    onEntry() {
        // todo let this be called from router
        return this._generateIdenticons();
    }

    onExit(){
        this._clearIdenticons();
    }

    async _generateIdenticons() {
        const keyguard = await keyguardPromise;
        const volatileKeys = await keyguard.createVolatile(7);
        this.$container.textContent = '';
        volatileKeys.forEach(keyPair => this._generateIdenticon(keyPair));
        setTimeout(e => this.$el.setAttribute('active', true), 100);
    }

    _generateIdenticon(address) {
        const $identicon = XIdenticon.createElement();
        this.$container.appendChild($identicon.$el);
        $identicon.address = address;
        $identicon.addEventListener('click', e => this._onIdenticonSelected(address, $identicon));
    }

    _onIdenticonSelected(address, $identicon) {
        this.$('x-identicon.returning') && this.$('x-identicon.returning').classList.remove('returning');
        this._selectedAddress = address;
        this._selectedIdenticon = $identicon;
        this.$el.setAttribute('selected', true);
        $identicon.$el.setAttribute('selected', true);
        this.$address.textContent = address;
    }

    _clearSelection() {
        this._selectedKeyPair = null;
        if (!this._selectedIdenticon) return;
        this._selectedIdenticon.$el.classList.add('returning');
        this.$el.removeAttribute('selected');
        this._selectedIdenticon.$el.removeAttribute('selected');
    }

    async _onConfirm(e) {
        const keyguard = await keyguardPromise;
        if (await keyguard.persist(this._selectedAddress)) {
            XRouter.root.goTo('success');
        } else {
            XRouter.root.goTo('error');
        }
    }
}


// Todo: [low priority] remove hack for overlay and find a general solution

// Todo: use store provider which recursively sets store in all children? Or decouple store import in a different way
