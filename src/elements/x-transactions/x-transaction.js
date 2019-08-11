import XElement from '../../lib/x-element/x-element.js';
import MixinRedux from '../mixin-redux.js';
import XIdenticon from '../x-identicon/x-identicon.js';
import XAmount from '../x-amount/x-amount.js';
import { CashlinkDirection } from '../../cashlink-redux.js';
import { TransactionType } from '../../selectors/transaction$.js';

export default class XTransaction extends MixinRedux(XElement) {
    html() {
        return `
            <td class="timestamp" title="">pending...</td>
            <td class="identicon hidden-when-info"><x-identicon sender></x-identicon></td>
            <td class="label hidden-when-info" sender></td>
            <td class="hidden-when-info"><i class="material-icons">arrow_forward</i></td>
            <td class="identicon hidden-when-info"><x-identicon recipient></x-identicon></td>
            <td class="label hidden-when-info" recipient></td>
            <td class="info-line desktop" colspan="5">
                Cashlink from
                <strong class="funding-date"></strong>
                claimed by
                <x-identicon recipient></x-identicon>
                <span class="label" recipient></span>
            </td>
            <td class="info-line mobile" colspan="5">
                Cashlink claimed
            </td>
            <td><x-amount></x-amount></td>
        `
    }

    styles() { return ['x-transaction']; }

    children() { return [ XIdenticon, XAmount ] }

    onCreate() {
        super.onCreate();
        this.$senderIdenticon = this.$identicon[0];
        this.$senderLabel = this.$('.label[sender]');
        this.$recipientIdenticons = this.$identicon.slice(1);
        this.$recipientLabels = this.$$('.label[recipient]');

        this.$timestamp = this.$('.timestamp');
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
        // TODO Prevent update when update is handled by transaction list
        // delete changes.triggeredByList;

        for (const prop in changes) {
            if (changes[prop] !== undefined || prop === 'isCashlink' || prop === 'pairedTx') {
                // Update display
                this[prop] = changes[prop];

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
                case 'removed':
                case 'expired':
                    this.$el.classList.remove('removed', 'expired');
                    if (this.properties.timestamp) this.timestamp = this.properties.timestamp;
                    else {
                        this.$timestamp.textContent = 'pending...';
                        this.$timestamp.setAttribute('title', '');
                    }
                case 'extraData':
                    this.extraData = this.properties.extraData;
                default:
                    // console.warn('Possible unhandled reset of property', prop);
                    break;
            }
        }

        if (!this.properties.timestamp) this.$el.classList.add('pending'); // Used for gradient animation
        else this.$el.classList.remove('pending');

        if (this.properties.removed) {
            this.$timestamp.textContent = 'removed';
            this.$timestamp.setAttribute('title', 'Transaction was removed');
        }

        if (this.properties.expired) {
            this.$timestamp.textContent = 'expired';
            this.$timestamp.setAttribute('title', 'Transaction has expired');
        }

        if (this.properties.isCashlink === CashlinkDirection.CLAIMING && this.properties.pairedTx) {
            this.sender = this.properties.pairedTx.sender;
            this.senderLabel = this.properties.pairedTx.senderLabel;
        }

        if (this.properties.isCashlink === CashlinkDirection.FUNDING && this.properties.pairedTx) {
            this.recipient = this.properties.pairedTx.recipient;
            this.recipientLabel = this.properties.pairedTx.recipientLabel;
        }
    }

    set sender(address) {
        if (this.properties.isCashlink === CashlinkDirection.CLAIMING && !this.properties.pairedTx) {
            this.$senderIdenticon.address = '';
        } else {
            this.$senderIdenticon.address = address;
        }
    }

    set senderLabel(label) {
        this.$senderLabel.textContent = label;
    }

    set recipient(address) {
        if (this.properties.isCashlink === CashlinkDirection.FUNDING && !this.properties.pairedTx) {
            this.$recipientIdenticons.forEach(e => e.address = '');
        } else {
            this.$recipientIdenticons.forEach(e => e.address = address);
        }
    }

    set recipientLabel(label) {
        this.$recipientLabels.forEach(e => e.textContent = label);
    }

    set isCashlink(value) {
        this.$el.classList.toggle('cashlink', !!value);
        this.$senderIdenticon.isCashlink = value === CashlinkDirection.CLAIMING;
        this.$recipientIdenticons.forEach(e => e.isCashlink = value === CashlinkDirection.FUNDING);
    }

    set value(value) {
        this.$amount.value = value;
    }

    set timestamp(timestamp) {
        const dateTime = moment.unix(timestamp);

        if (dateTime.isSame(moment(), 'day')) {
            this.$timestamp.textContent = dateTime.format('HH:mm');
        } else {
            this.$timestamp.textContent = dateTime.format('DD MMM');
        }

        this.$timestamp.setAttribute('title', dateTime.toDate().toLocaleString());
    }

    set type(type) {
        this.$amount.type = type;

        this.$el.classList.remove.apply(this.$el.classList, Object.values(TransactionType));
        type && this.$el.classList.add(type);
    }

    set pairedTx(pairedTx) {
        if (pairedTx && this.properties.type === TransactionType.CASHLINK_REMOTE_CLAIM) {
            const dateTime = moment.unix(pairedTx.timestamp);
            const $fundingDate = this.$('.funding-date');
            if (!$fundingDate) return;

            if (dateTime.isSame(moment(), 'day')) {
                $fundingDate.textContent = dateTime.format('HH:mm');
            } else {
                $fundingDate.textContent = dateTime.format('DD MMM');
            }

            $fundingDate.setAttribute('title', dateTime.toDate().toLocaleString());
        }
    }

    set removed(removed) {
        this.$el.classList.add('removed');
    }

    set expired(expired) {
        this.$el.classList.add('expired');
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
        let hash = this.transaction.hash;
        if (this.transaction.type === TransactionType.CASHLINK_REMOTE_CLAIM && this.transaction.pairedTx) {
            hash = this.transaction.pairedTx.hash;
        }
        this.fire('x-transaction-selected', hash);
    }
}
