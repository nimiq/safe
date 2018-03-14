import XElement from '/libraries/x-element/x-element.js';
// import XLoadingAnimation from '/elements/x-loading-animation/x-loading-animation.js';

export default class XLoader extends XElement {

    html() { return `
        <x-loading-animation></x-loading-animation>
        <h2>Loading&hellip;</h2>
        `;
    }

    set loading(loading) {
        this.$el.classList.toggle('showing', loading);
    }

    set label(label) {
        this.$('h2').innerText = label;
    }

    // children() { return [ XLoadingAnimation ]; }
}
