import XEducationSlide from './x-education-slide.js';

export default class XEducationSlideBlockchain extends XEducationSlide {
    html() {
        return `
            <h1 class="modal-header">
                Wait, what is a Blockchain?
            </h1>
            <div class="modal-body">
                <div class="has-side-image">
                    <ul>
                        <li>The blockchain is like a huge, global, decentralized spreadsheet.</li>
                        <li>It keeps track of who sent how many coins to whom, and what the balance of every account is.</li>
                        <li>It is stored and maintained by thousands of people (miners) across the globe connected to the blockchain with their computers.</li>
                        <li>When you see your balance on safe.nimiq.com or view your transactions on nimiq.watch, you are seeing data on the blockchain, not in our personal systems.</li>
                        <li>Again: <strong>Nimiq Safe accounts are not part of a bank.</strong></li>
                    </ul>
                    <div class="side-image-blockchain"></div>
                </div>

                <div class="button-bar">
                    <button back>Not a Bank</button>
                    <button next>But... Why?</button>
                </div>
            </div>
        `;
    }
}
