import XScreenFit from '../x-screen/x-screen-fit.js';
import XPrivacyAgent from '../x-privacy-agent/x-privacy-agent.js';
export default class ScreenLoading extends XScreenFit {
    html() {
        return `
			<h2 secondary>First make sure your enviroment is safe.</h2>
            <x-privacy-agent></x-privacy-agent>
            <x-grow></x-grow>
        `
    }

    children() { return [XPrivacyAgent] }
}
