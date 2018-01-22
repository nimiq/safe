import XElement from "/library/x-element/x-element.js";

export default class XSuccessMark extends XElement {
    html() {
        return `
            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>`;
    }

    animate() {
        this.$el.classList.add('animate-success-mark');
    }
}


// Todo: Outline should be a hexagon :)
// Todo: Use XElement.prototype.animate and resolve name clash of animate method
// Todo: rename the animations in x-success-mark.css with a namespace