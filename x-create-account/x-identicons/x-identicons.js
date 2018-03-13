import XElement from '/libraries/x-element/x-element.js';
import XIdenticon from '/elements/x-identicon/x-identicon.js';
import KeyguardClient from '/libraries/keyguard-client/keyguard-client.js';

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
        this.$('.generate-more').addEventListener('click', e => this._generateIdenticons());
        this.$('[button]').addEventListener('click', e => this._onConfirm(e));
        this.$('x-backdrop').addEventListener('click', e => this._clearSelection());
    }

    // set actions from outside?? use store here?? dumb component?? singleton keyguard-client?

    onEntry() {
        return this._generateIdenticons();
    }

    onExit(){
        this._clearIdenticons();
    }

    async _generateIdenticons() {
        keyPairs.forEach(keyPair => this._generateIdenticon(keyPair));
        setTimeout(e => this.$el.setAttribute('active', true), 100);
        if(!this.$loading) return;
        this.$container.removeChild(this.$loading);
        this.$loading = null;
    }

    _generateIdenticon(keyPair) {
        const $identicon = XIdenticon.createElement();
        this.$container.appendChild($identicon.$el);
        $identicon.address = keyPair.address;
        $identicon.addEventListener('click', e => this._onIdenticonSelected(keyPair, $identicon));
    }

    _onIdenticonSelected(keyPair, $identicon) {
        this.$('x-identicon.returning') && this.$('x-identicon.returning').classList.remove('returning');
        this._selectedKeyPair = keyPair;
        this._selectedIdenticon = $identicon;
        this.$el.setAttribute('selected', true);
        $identicon.$el.setAttribute('selected', true);
        this.$address.textContent = keyPair.address;
    }

    _clearSelection() {
        this._selectedKeyPair = null;
        if (!this._selectedIdenticon) return;
        this._selectedIdenticon.$el.classList.add('returning');
        this.$el.removeAttribute('selected');
        this._selectedIdenticon.$el.removeAttribute('selected');
    }

    _clearIdenticons() {
        this._clearSelection()
        while(this.$container.querySelector('x-identicon')) {
            this.$container.removeChild(this.$container.querySelector('x-identicon'));
        }
        this.$el.removeAttribute('active');
    }

    _onConfirm(e) {
        this.fire('x-keypair', this._selectedKeyPair)
        e.stopPropagation();
    }
}

// Todo: [low priority] remove hack for overlay and find a general solution
