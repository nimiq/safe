import { ValidationUtils } from '../../../node_modules/@nimiq/utils/dist/module/ValidationUtils.js';
import XToast from '../x-toast/x-toast.js';

export const TypeKeys = {
    SET_CONTACT: 'contacts/set-contact',
    REMOVE_CONTACT: 'contacts/remove-contact'
};

export function reducer(state, action) {
    if (state === undefined) {
        return {};
    }

    switch (action.type) {
        case TypeKeys.SET_CONTACT:
            const newContact = {};
            newContact[action.address] = {
                label: action.label,
                address: action.address
            };
            const unorderedContacts = Object.assign({}, state, newContact);
            const orderedContacts = {};
            Object.values(unorderedContacts)
            .sort((a, b) => a.label < b.label ? -1 : a.label > b.label ? 1 : 0)
            .forEach(function(contact) {
                orderedContacts[contact.address] = contact;
            });
            return orderedContacts;

        case TypeKeys.REMOVE_CONTACT:
            const newState = Object.assign({}, state);
            delete newState[action.address];
            return newState;

        default:
            return state
    }
}

export function setContact(label, address) {
    // Validate address
    try {
        // This throws on validation error, but returns undefined on success
        ValidationUtils.isUserFriendlyAddress(address);
    } catch (error) {
        XToast.error(error.message);
        throw error;
    }

    // Format address
    address = address.toUpperCase().replace(/[ +-]+/g, '').replace(/.{4}/g, '$& ').trim();

    return {
        type: TypeKeys.SET_CONTACT,
        label,
        address
    };
}

export function removeContact(address) {
    return {
        type: TypeKeys.REMOVE_CONTACT,
        address
    };
}
