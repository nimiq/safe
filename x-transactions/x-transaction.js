import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/secure-elements/mixin-redux/mixin-redux.js';
import XIdenticon from '/secure-elements/x-identicon/x-identicon.js';
import XAmount from '../x-amount/x-amount.js';

export default class XTransaction extends MixinRedux(XElement) {
    html() {
        return `
            <div class="timestamp" title="">pending...</div>
            <x-identicon sender></x-identicon>
            <div class="label" sender></div>
            <div><i class="material-icons">arrow_forward</i></div>
            <x-identicon recipient></x-identicon>
            <div class="label" recipient></div>
            <x-amount></x-amount>
        `
    }

    children() { return [ XIdenticon, XAmount ] }

    onCreate() {
        super.onCreate();
        this.$senderIdenticon = this.$identicon[0];
        this.$senderLabel = this.$('div.label[sender]');
        this.$recipientIdenticon = this.$identicon[1];
        this.$recipientLabel = this.$('div.label[recipient]');

        this.$timestamp = this.$('div.timestamp');

        this._timeagoUpdateInterval = null;
    }

    listeners() {
        return {
            'click': this._onTransactionSelected
        }
    }

    static mapStateToProps(state, props) {
        return Object.assign({},
            state.transactions.entries.get(props.hash),
            {
                currentHeight: state.network.height
            }
        )
    }

    _onPropertiesChanged(changes) {
        for (const prop in changes) {
            if (changes[prop] !== undefined) {
                // Update display
                this[prop] = changes[prop];

                if (prop === 'timestamp' && !this._timeagoUpdateInterval) {
                    this._timeagoUpdateInterval = setInterval(_ => this._updateTimeago(), 60 * 1000); // Update every minute
                }

                continue;
            }

            // Doesn't need to be in else{}, because of 'continue' statement above
            switch (prop) {
                case 'timestamp':
                    this.$timestamp.textContent = 'pending...';
                    this.$timestamp.setAttribute('title', '');
                    break;
                case 'blockHeight':
                    this.blockHeight = 0;
                    break;
                default:
                    // console.warn('Possible unhandled reset of property', prop);
                    break;
            }
        }

        if (!this.properties.timestamp) this.$el.classList.add('pending'); // Used for gradient animation
        else this.$el.classList.remove('pending');
    }


    set sender(address) {
        this.$senderIdenticon.address = address;
    }

    set senderLabel(label) {
        this.$senderLabel.textContent = label;
    }

    set recipient(address) {
        this.$recipientIdenticon.address = address;
    }

    set recipientLabel(label) {
        this.$recipientLabel.textContent = label;
    }

    set value(value) {
        this.$amount.value = value;
    }

    set timestamp(timestamp) {
        const time = moment.unix(timestamp);

        const before12hours = moment().subtract(12, 'hours');
        if (time.isAfter(before12hours)) {
            // If the time was less than 12 hours ago, display timeago
            this.$timestamp.textContent = time.format('HH:mm');
        } else {
            // If the time was yesterday or earlier, display date
            this.$timestamp.textContent = time.format('D MMM');
        }

        this.$timestamp.setAttribute('title', time.toDate().toLocaleString());
    }

    set type(type) {
        this.$amount.type = type;

        this.$el.classList.remove('incoming', 'outgoing', 'transfer');
        this.$el.classList.add(type);
    }

    set transaction(transaction) {
        // Preserve currentHeight property through hard setting
        transaction.currentHeight = this.properties.currentHeight;

        this.setProperties(transaction, true);
    }

    get transaction() {
        return this.properties;
    }

    _onTransactionSelected() {
        this.fire('x-transaction-selected', this.transaction.hash);
    }

    _updateTimeago() {
        // Trigger timeago update
        if (this.properties.timestamp) this.timestamp = this.properties.timestamp;
    }
}
