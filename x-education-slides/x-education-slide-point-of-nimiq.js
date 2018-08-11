import XEducationSlide from './x-education-slide.js';

export default class XEducationSlidePointOfNimiq extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                Why can't Nimiq Safe do those things?
            </h1>
            <div class="modal-body">
                <div class="has-side-image">
                    <div class="side-image-point-of-nimiq"></div>
                    <div>
                        <ul>
                            <li>Because that is the point of decentralization and the blockchain.</li>
                            <li>You don't have to rely on your bank, government, or anyone else when you want to move your funds.</li>
                            <li>You don't have to rely on the security of an exchange or bank to keep your funds safe.</li>
                            <li>If you don't find these things valuable, ask yourself why you think the blockchain and cryptocurrencies are valuable. 😉</li>
                        </ul>
                    </div>
                </div>

                <div class="button-bar">
                    <button back>But... Why?</button>
                    <button next>Protect your Funds</button>
                </div>
                <div class="spacing-top center">
                    <a secondary class="skip">Skip AT YOUR OWN RISK</a>
                </div> 
            </div>
        `;
    }
}
