import XElement from "/libraries/x-element/x-element.js";
import XIdenticon from "../x-identicon/x-identicon.js";

export default class Transaction extends XElement {
    children() { return [XIdenticon] }
    onCreate() {
        this.tx = {
            address: 'NQ95 I32O SA47 1KHL R1FV MP0O SVNI 73BS IJQT',
            value: 23
        };
    }

    set tx(tx) {
        this._value = tx.value;
        this._address = tx.address;
    }

    set _value(value) {
        this.$('x-value').textContent = value;
    }

    set _address(address) {
        this.$identicon.address = address;
        this.$('x-address').textContent = address;
    }
}