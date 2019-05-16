import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import XAccount from './x-account.js';
import XAmount from '/elements/x-amount/x-amount.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import ValidationUtils from '/libraries/secure-utils/validation-utils/validation-utils.js';
import { dashToSpace } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';
import AccountType from '/apps/safe/src/lib/account-type.js';
import { accounts$ } from '/apps/safe/src/selectors/account$.js';
import VQrCodeOverlay from '/elements/v-qr-code-overlay/v-qr-code-overlay.js';

export default class XAccountModal extends MixinModal(XAccount) {
    html() {
        return `
            <div class="modal-header">
                <a icon-qr class="header-button" href="javascript:void(0)"></a>
                <i x-modal-close class="material-icons">close</i>
                <h2>Address</h2>
            </div>
            <div class="modal-body">
                <div class="center">
                    <x-identicon></x-identicon>
                    <i class="display-none account-icon material-icons"></i>

                    <span class="x-account-label"></span>

                    <x-address></x-address>

                    <div class="x-account-bottom">
                        <x-amount display label="Balance"></x-amount>
                    </div>

                    <div class="vesting-info">
                        <x-amount display available-amount label="Available now"></x-amount>
                    </div>
                </div>

                <div class="action-button">
                    <button send class="small">Send from this address</button>
                    <button payout class="small display-none">Pay out</button>
                </div>
            </div>
            <v-qr-code-overlay></v-qr-code-overlay>
        `;
    }

    children() { return [ ...super.children(), VQrCodeOverlay ] }

    onCreate() {
        this.$availableAmount = this.$amount[1];
        this.$balanceSection = this.$('.x-account-bottom');
        this.$vestingInfo = this.$('.vesting-info');
        this.$sendButton = this.$('button[send]');
        this.$payoutButton = this.$('button[payout]');

        this._height = 0;
        super.onCreate();
    }

    listeners() {
        return {
            'click .header-button[icon-qr]': () => this._showQrCode(),
            'click button[send]': _ => this.fire('x-account-modal-new-tx', this.properties.address),
            'click button[payout]': _ => this.fire('x-account-modal-payout',
                {
                    vestingAccount: {
                        address: this.properties.address,
                        balance: this.$availableAmount.value,
                        label: this.properties.label,
                        type: this.properties.type
                    },
                    owner: this.properties.owner
                }
            ),
        }
    }

    _onPropertiesChanged(changes) {
        super._onPropertiesChanged(changes);

        const { type, balance, futureSteps } = this.properties;

        if (type === AccountType.VESTING && futureSteps && (changes.address || changes.balance)) {
            this.$balanceSection.classList.add('display-none');
            this.$availableAmount.value = balance;
            this.$payoutButton.disabled = balance === 0;

            // Remove all steps
            while (this.$vestingInfo.querySelector('x-amount:not([available-amount])')) {
                this.$vestingInfo.removeChild(this.$vestingInfo.querySelector('x-amount:not([available-amount])'));
            }

            // Add future steps
            futureSteps.forEach(step => {
                const time = Date.now() / 1000 + step.heightDelta * 60;
                const timeString = moment.unix(time).calendar();
                const $amount = XAmount.createElement([['label', `Available ${timeString}`]]);
                $amount.value = step.amount;
                this.$vestingInfo.appendChild($amount.$el);
            });

            this.$vestingInfo.classList.remove('display-none');
        }
        else {
            this.$vestingInfo.classList.add('display-none');
            this.$balanceSection.classList.remove('display-none');
        }

        if (this.properties.label === undefined) this.$el.classList.add('pending'); // Used for gradient animation
        else this.$el.classList.remove('pending');
    }

    set balance(balance) {
        super.balance = balance;

        this.$sendButton.disabled = balance === 0;
    }

    set type(type) {
        super.type = type;

        // Disable send button, enable payout button for Vesting
        this.$sendButton.classList.toggle('display-none', type === AccountType.VESTING);
        this.$payoutButton.classList.toggle('display-none', type !== AccountType.VESTING);
    }
    allowsShow(address) {
        if (!address) return true;

        address = dashToSpace(address);
        return ValidationUtils.isValidAddress(address);
    }

    onShow(address) {
        if (!address) return;

        address = dashToSpace(address);

        let account = accounts$(MixinRedux.store.getState()).get(address);
        if (!account) account = { address };
        this.account = account;
    }

    _showQrCode() {
        this.$vQrCodeOverlay.show(this.account.address, 'Scan this QR code\nto send to this address');
    }
}
