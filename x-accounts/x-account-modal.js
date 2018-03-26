import MixinModal from '/elements/mixin-modal/mixin-modal.js';
import XAccount from './x-account.js';
import XAmount from '/elements/x-amount/x-amount.js';
import MixinRedux from '/elements/mixin-redux/mixin-redux.js';

export default class XAccountModal extends MixinModal(XAccount) {
    html() {
        return `
            <div class="modal-header">
                <h2 class="x-account-label">&nbsp;</h2>
            </div>
            <div class="modal-body">
                <center>
                    <x-identicon></x-identicon>
                    <i class="display-none account-icon"></i>
                    <x-address></x-address>

                    <div class="x-account-bottom">
                        <x-amount display label="Balance"></x-amount>
                    </div>

                    <div class="vesting-info">
                        <x-amount display available-amount label="Available now"></x-amount>
                    </div>
                </center>

                <div class="action-buttons">
                    <hr>

                    <button export class="secondary small">Backup</button>
                    <button rename class="secondary small">Rename</button>
                    <button send class="small">Send from this account</button>
                </div>
            </div>
        `
    }

    onCreate() {
        this.$availableAmount = this.$amount[1];
        this.$balanceSection = this.$('.x-account-bottom');
        this.$vestingInfo = this.$('.vesting-info');
        this.$sendButton = this.$('button[send]');
        this.$actionButtons = this.$('.action-buttons');
        this._height = 0;
        super.onCreate();
    }

    listeners() {
        return {
            'click button[export]': _ => this.fire('x-account-modal-export', this.properties.address),
            'click button[rename]': _ => this.fire('x-account-modal-rename', this.properties.address),
            'click button[send]': _ => this.fire('x-account-modal-new-tx', this.properties.address)
        }
    }

    _onPropertiesChanged(changes) {
        for (const prop in changes) {
            if (changes[prop] !== undefined) {
                // Update display
                this[prop] = changes[prop];
            }
        }

        if (changes.type === 4 || (!changes.type && this.properties.type === 4)) {
            this.$balanceSection.classList.add('display-none');
            // Is a vesting contract
            if (changes.start
             || changes.stepAmount
             || changes.stepBlocks
             || changes.totalAmount
             || (changes.height && !this._height)
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
                if (availableAmount > 0) this.$sendButton.disabled = false;
                else                     this.$sendButton.disabled = true;

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

    onEntry(address) {
        address = this._dashToSpace(address);

        let account = MixinRedux.store.getState().accounts.entries.get(address);
        if (!account) account = { address };
        this.account = account;
        super.onEntry();
    }

    _dashToSpace(string) {
        return string.replace(/-/gi, ' ');
    }

}
