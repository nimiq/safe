import XElement from '../../lib/x-element/x-element.js';
import { QrCode } from '@nimiq/vue-components';

export default class XQrCodeOverlay extends XElement {
    private _qrCode?: QrCode | null;
    private $message!: HTMLElement;

    public show(data: string, message: string = 'Scan this QR code') {
        if (!data) {
            throw new Error('No data specified');
        }

        // lazily create qr code only if needed (to avoid unnecessary memory for qr canvas)
        if (!this._qrCode) {
            this._qrCode = new QrCode();
            this._qrCode.$mount(this.$('[qr-code]')!);
        }

        this._qrCode.data = data;
        this.$message.textContent = message;

        this.$el.style.display = 'block';
        this.$el.removeEventListener('animationend', this._onHideEnd);
        if (this.$el.classList.contains('hide')) {
            this.$el.classList.remove('hide');
            // tslint:disable:next-line no-unused-expression
            this.$el.offsetWidth; // style update
        }
        this.$el.classList.add('show');
    }

    public hide() {
        if (this.$el.classList.contains('show')) {
            this.$el.classList.remove('show');
            // tslint:disable:next-line no-unused-expression
            this.$el.offsetWidth; // style update
        }
        this.$el.classList.add('hide');
        this.$el.addEventListener('animationend', this._onHideEnd);
    }

    protected html() {
        return `
            <div qr-code></div>
            <div message>
                Scan this QR code to
                send to this address
            </div>
        `;
    }

    protected onCreate() {
        this.$message = this.$('[message]')!;
        this._onHideEnd = this._onHideEnd.bind(this);
    }

    protected listeners() {
        return {
            click: () => this.hide(),
            animationend: () => this.$el.classList.remove('hide', 'show'),
        };
    }

    private _onHideEnd() {
        this.$el.removeEventListener('animationend', this._onHideEnd);
        this.$el.style.display = 'none';
        if (this._qrCode) {
            const $qrCanvas = this._qrCode.$el;
            this._qrCode.$destroy();
            this._qrCode = null;
            // replace the qr canvas by the placeholder div to free up the canvas memory
            const $placeholder = document.createElement('div');
            $placeholder.setAttribute('qr-code', '');
            $qrCanvas.parentElement!.replaceChild($placeholder, $qrCanvas);
        }
    }
}
