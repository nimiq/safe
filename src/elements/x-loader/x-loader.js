import XElement from '../../lib/x-element/x-element.js';

export default class XLoader extends XElement {

    html() { return `
        <div class="x-loading-animation"></div>
        <h2>Loading&hellip;</h2>
        `;
    }

    set loading(loading) {
        this.$el.classList.toggle('showing', loading);
    }

    set label(label) {
        this.$('h2').innerText = label;
    }
}
