import XEducationSlide from './x-education-slide.js';

export default class XEducationSlideNotABank extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                Nimiq Safe is <strong>not</strong> part of a bank
            </h1>
            <div class="modal-body">
                <div class="has-side-image">
                    <div class="side-image-not-a-bank"></div>
                    <div>
                        <h3>Nimiq Safe is an Interface.</h3>
                        <ul>
                            <li>When you create an account in Nimiq Safe, you are generating a cryptographic set of numbers: your private key (via 24 Recovery Words) and associated account number (public key).</li>
                            <li>The handling of your keys happens entirely on your computer, inside your browser.</li>
                            <li>We never transmit, receive or store your private key, 24 Recovery Words, Pass Phrase, PIN, account access file or other account information.</li>
                            <li>You are simply using our interface to <strong>interact directly with the blockchain</strong>.</li>
                            <li>If you send your account number (public key) to someone, they can send you NIM.</li>
                            <li>If you send your private key, 24 Recovery Words or account access file with PIN / Pass Phrase to someone, they now have full control of your account.</li>
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
