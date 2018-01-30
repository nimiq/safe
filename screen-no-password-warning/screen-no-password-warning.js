import XScreen from '../x-screen/x-screen.js';
export default class ScreenNoPasswordWarning extends XScreen {
    html() {
        return `
          <span icon-warning></span>
          <h2>WARNING:</h2>
          <h2>NOT FOR REAL USE</h2>
          <h2 secondary>Your account is totally unsafe and should just be used for checking out this app.
          Don't put any money here! It will be lost easily.</h2>
          <button>I understand</button>
          <button secondary>Take me back</button>
        `
    }
}
