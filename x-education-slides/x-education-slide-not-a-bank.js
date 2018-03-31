import XEducationSlide from './x-education-slide.js';

export default class XEducationSlideNotABank extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                Nimiq Wallet &amp; Safe are <strong>not</strong> part of a bank.
            </h1>
            <div class="modal-body">
                <div class="has-side-image">
                    <div class="side-image-not-a-bank"></div>
                    <div>
                        <h3>Nimiq Wallet &amp; Safe are Interfaces.</h3>
                        <ul>
                            <li>When you create an account on Nimiq Wallet or Safe you are generating a cryptographic set of numbers: your private key (via 24 recovery words) and associated account number (public key).</li>
                            <li>The handling of your keys happens entirely on your computer, inside your browser.</li>
                            <li>You can generate an account access file that contains your private key encrypted with your passphrase or pin and save it on your computer</li>
                            <li>We never transmit, receive or store your private key, recovery words, passphrase, pin, account access file or other account information.</li>
                            <li>You are simply using our interface to <strong>interact directly with the blockchain</strong>.</li>
                            <li>If you send your account number (public key) to someone, they can send you NIM.</li>
                            <li>If you send your private key, 24 recovery words or account access file with passphrase to someone, they now have full control of your account.</li>
                        </ul>
                    </div>
                </div>
                
                <div class="button-bar">
                    <button back>Introduction</button>
                    <button next>What is a Blockchain?</button>    
                </div>
            </div>
        `;
    }
}
