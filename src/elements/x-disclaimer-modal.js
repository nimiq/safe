import XElement from '../lib/x-element/x-element.js';
import MixinModal from './mixin-modal/mixin-modal.js';

export default class XDisclaimerModal extends MixinModal(XElement) {
    html() {
        return `
            <div class="modal-header">
                <i x-modal-close class="material-icons">close</i>
                <h2>Disclaimer</h2>
            </div>
            <div class="modal-body">
                <p>Always backup your Recovery Words, Password and Login Files. Please note that safe.nimiq.com, hub.nimiq.com, keyguard.nimiq.com &amp; miner.nimiq.com are <strong>not</strong> "hosted wallets". <strong>You do not create a hosted account or give Nimiq your funds to hold onto.</strong> You hold your keys that control the funds at your account addresses on your device. Nimiq only makes it easy for you, through a browser, to create, save, and access your information and interact with the blockchain.</p>

                <p>Nimiq is not responsible for any loss. Nimiq, safe.nimiq.com, hub.nimiq.com, keyguard.nimiq.com &amp; miner.nimiq.com, and some of the underlying libraries are under active development. While Nimiq tests thoroughly, there is always the possibility something unexpected happens that causes your funds to be lost. Please do not place more than you are willing to lose, and please be careful.</p>

                <p><strong>MIT License Copyright © 2018-2019 Nimiq Foundation</strong></p>

                <p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>

                <p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>

                <p>THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
            </div>
        `
    }
}
