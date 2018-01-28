import XElement from '/library/x-element/x-element.js';
export default class XAddressIntroPage extends XElement {
    html() {
        return `
            <div background class="move-bottom-in"></div>
            <h1>Address Scanner</h1>
            <h2>Use your camera to scan addresses</h2>
            <x-grow></x-grow>
            <button use-camera>Enable camera</button>
            <a secondary use-fallback>Continue without camera</a>`;
    }

    onCreate() {
        this.$('[use-camera]').addEventListener('click', e => this.fire('x-address-page-select', 'scanner'));
        this.$('[use-fallback]').addEventListener('click', e => this.fire('x-address-page-select', 'fallback'));
    }
}