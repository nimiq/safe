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
        this.$background = this.$('[background]');
        
        this.$('[use-camera]').addEventListener('click', e => this.fire('x-address-page-select', 'scanner'));
        this.$('[use-fallback]').addEventListener('click', e => this.fire('x-address-page-select', 'fallback'));
        requestAnimationFrame(e => this._positionBackground())
    }

    onShow() {
        this._positionBackground();
        window.addEventListener('resize', e => this._positionBackground());
    }

    onHide() {
        window.removeEventListener('resize', e => this._positionBackground());
    }

    _positionBackground() {
        const imageRatio = 0.5455;
        const pageHeight = this.$el.offsetHeight;
        const pageWidth = this.$el.offsetWidth;
        const growthFactor = Math.log(Math.log(Math.log(pageHeight)));
        const imageHeight = 0.3 * pageHeight + growthFactor * pageHeight;
        const imageWidth = imageHeight * imageRatio;
        const imageTop = 0.09 * pageHeight + 0.18 * imageHeight;
        // x offset according to the image size to center the phone along the x axis
        const imageRight = 0.5 * pageWidth - 0.3 * imageWidth;
        this.$background.style.width = imageWidth + 'px';
        this.$background.style.height = imageHeight + 'px';
        this.$background.style.top = imageTop + 'px';
        this.$background.style.right = imageRight + 'px';
    }
}