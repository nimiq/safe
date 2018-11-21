import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import XAccount from './x-account.js';
import XAmount from '/elements/x-amount/x-amount.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import ValidationUtils from '/libraries/secure-utils/validation-utils/validation-utils.js';
import { dashToSpace } from '/libraries/nimiq-utils/parameter-encoding/parameter-encoding.js';
import XPopupMenu from '/elements/x-popup-menu/x-popup-menu.js';
import AccountType from '/libraries/account-manager/account-type.js';

export default class XAccountModal extends MixinModal(XAccount) {
    html() {
        return `
            <div class="modal-header">
                <x-popup-menu left-align>
                    <button rename><i class="material-icons">mode_edit</i> Rename</button>
                    <button backupWords><i class="material-icons">text_format</i> Backup Recovery Words</button>
                    <button confirmLedgerAddress><i class="material-icons">check_circle</i> Check Address on Ledger</button>
                    <button logout><i class="material-icons">exit_to_app</i> Logout</button>
                </x-popup-menu>
                <i x-modal-close class="material-icons">close</i>
                <h2>Account</h2>
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
                    <button send class="small">Send from this account</button>
                    <button payout class="small display-none">Pay out</button>
                </div>
            </div>
        `
    }

    children() { return [ ...super.children(), XPopupMenu ] }

    onCreate() {
        this.$availableAmount = this.$amount[1];
        this.$balanceSection = this.$('.x-account-bottom');
        this.$vestingInfo = this.$('.vesting-info');
        this.$sendButton = this.$('button[send]');
        this.$payoutButton = this.$('button[payout]');

        this.$renameButton = this.$('button[rename]');
        this.$backupWordsButton = this.$('button[backupWords]');

        this.$confirmLedgerAddressButton = this.$('button[confirmLedgerAddress]');

        this._height = 0;
        super.onCreate();
    }

    listeners() {
        return {
            'click button[backupWords]': _ => this.fire('x-account-modal-backup-words', this.properties.walletId),
            'click button[rename]': _ => this.fire('x-account-modal-rename', this.properties.address),
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
            'click button[confirmLedgerAddress]': () => this.fire('x-confirm-ledger-address', this.properties.address),
            'click button[logout]': () => this.fire('x-account-modal-logout', this.properties.walletId),
        }
    }

    static mapStateToProps(state, props) {
        return Object.assign({},
            state.accounts.entries.get(props.address),
            {
                height: state.network.height
            }
        )
    }

    _onPropertiesChanged(changes) {
        for (const prop in changes) {
            if (changes[prop] !== undefined) {
                // Update display
                this[prop] = changes[prop];
            }
        }

        if (changes.type === AccountType.VESTING || (!changes.type && this.properties.type === AccountType.VESTING)) {
            this.$balanceSection.classList.add('display-none');
            // Is a vesting contract
            if (changes.start
             || changes.stepAmount
             || changes.stepBlocks
             || changes.totalAmount
             || changes.height
             || changes.balance
            ) {
                this._height = this.properties.height;
                const balance = changes.balance || this.properties.balance || 0;
                const start = changes.start || this.properties.start || 0;
                const stepAmount = changes.stepAmount || this.properties.stepAmount;
                const stepBlocks = changes.stepBlocks || this.properties.stepBlocks;
                const totalAmount = changes.totalAmount || this.properties.totalAmount;

                const steps = [];

                const numberSteps = Math.ceil(totalAmount/stepAmount);

                for (let i = 1; i <= numberSteps; i++) {
                    const stepHeight = start + stepBlocks * i;
                    const stepHeightDelta = stepHeight - this._height;
                    steps.push({
                        height: stepHeight,
                        heightDelta: stepHeightDelta,
                        amount: i < numberSteps ? stepAmount : totalAmount - stepAmount * (i - 1),
                    });
                }

                const pastSteps = steps.filter(step => step.heightDelta <= 0);

                const availableAmount = (balance - totalAmount) + pastSteps.reduce((acc, step) => acc + step.amount, 0);
                const futureSteps = steps.filter(step => step.heightDelta > 0);

                this.$availableAmount.value = availableAmount;
                if (availableAmount > 0) this.$payoutButton.disabled = false;
                else                     this.$payoutButton.disabled = true;

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

        if (balance > 0) this.$sendButton.disabled = false;
        else             this.$sendButton.disabled = true;
    }

    set type(type) {
        super.type = type;

        // Disable send button, enable payout button for Vesting
        this.$sendButton.classList.toggle('display-none', type === AccountType.VESTING);
        this.$payoutButton.classList.toggle('display-none', type !== AccountType.VESTING);

        // Enable rename button only for Safe
        this.$renameButton.classList.toggle('display-none', true); // type !== AccountType.KEYGUARD_HIGH);

        // Enable confirm ledger address button only for ledger accounts
        this.$confirmLedgerAddressButton.classList.toggle('display-none', type !== AccountType.LEDGER);
    }

    set isLegacy(isLegacy) {
        // Disable popup menu for multi-wallet accounts
        this.$popupMenu.$el.classList.toggle('display-none', !isLegacy);
    }

    set account(account) {
        // Preserve height property through hard setting
        account.height = this.properties.height;

        super.account = account;
    }

    allowsShow(address) {
        if (!address) return true;

        address = dashToSpace(address);
        return ValidationUtils.isValidAddress(address);
    }

    onShow(address) {
        if (!address) return;

        address = dashToSpace(address);

        let account = MixinRedux.store.getState().accounts.entries.get(address);
        if (!account) account = { address };
        this.account = account;
    }
}
