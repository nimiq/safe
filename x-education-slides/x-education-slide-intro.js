import XEducationSlide from './x-education-slide.js';

export default class XEducationSlideIntro extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                Welcome to the Nimiq Wallet &amp; Nimiq Safe
            </h1>
            <div class="modal-body">
                <div class="has-side-image">
                    <div>
                        <div class="warning">
                            <p>Please take some time to understand this for your own safety. 🙏</p>
                            <p>Your funds will be stolen if you do not heed these warnings.</p>
                        </div>
                        <div class="warning">
                            We cannot recover your funds or freeze your account if you visit a phishing site or lose your private key.
                        </div>
                        <h3>What are the Nimiq Wallet &amp; Nimiq Safe?</h3>
                        <ul>
                            <li>The Nimiq Wallet and Nimiq Safe are free, open-source, client-side interfaces.</li>
                            <li>They allow you to interact directly with the Nimiq blockchain while remaining in full control of your keys & your funds.</li>
                            <li><strong>You</strong> and <strong>only you</strong> are responsible for your security.</li>
                        </ul>
                    </div>
                    <div class="side-image-intro"></div>
                </div>
                
                <button next class="center">Nimiq is not a Bank</button>
            </div>
        `;
    }
}
