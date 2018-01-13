class ViewIdenticons extends XElement {

    onCreate() {
        this.$container = this.$('x-container');
        this.$address = this.$('x-address');
        this.$('[secondary]').addEventListener('click', e => this._generateIdenticons());
        this.$('[button]').addEventListener('click', e => this._onConfirm(e));
        this.$('x-backdrop').addEventListener('click', e => this._clearSelection());
    }

    onShow() {
        this._generateIdenticons();
    }

    onHide() {
        this._clearIdenticons();
    }

    onApiReady(api) {
        this._api = api;
        if (this._generated) return;
        this._generateIdenticons();
    }

    async _generateIdenticons() {
        if (!this._api) return;
        this._clearIdenticons();
        this._generated = true;
        const promises = [];
        for (var i = 0; i < 7; i++) { promises.push(this._api.generateKeyPair()) }
        const keyPairs = await Promise.all(promises);
        keyPairs.forEach(keyPair => this._generateIdenticon(keyPair));
        setTimeout(e => this.$el.setAttribute('active', true), 100);
    }

    _generateIdenticon(keyPair) {
        const identicon = XIdenticon.createElement();
        this.$container.appendChild(identicon.$el);
        identicon.address = keyPair.address;
        identicon.addEventListener('click', e => this._onIdenticonSelected(keyPair, identicon));
    }

    _onIdenticonSelected(keyPair, identicon) {
        this._clearSelection();
        this._selectedKeyPair = keyPair;
        this._selectedIdenticon = identicon;
        this.$el.setAttribute('selected', true);
        identicon.$el.setAttribute('selected', true);
        this.$address.textContent = keyPair.address;
    }

    _clearSelection() {
        this._selectedKeyPair = null;
        if (!this._selectedIdenticon) return;
        this.$el.removeAttribute('selected');
        this._selectedIdenticon.$el.removeAttribute('selected');
    }

    _clearIdenticons() {
        this._clearSelection()
        this.$container.innerHTML = '';
        this.$el.removeAttribute('active');
    }

    _onConfirm(e) {
        this.fire('x-keypair', this._selectedKeyPair)
        e.stopPropagation();
    }

    html(){
        return `
            <x-header>
                <a href="#welcome" icon-back></a>
                <h1>Choose Avatar</h1>
            </x-header>
            <x-container></x-container>
            <x-address></x-address>
            <x-backdrop></x-backdrop>
            <a secondary>Generate More</a>
            <a button>Confirm</a>`
    }
}