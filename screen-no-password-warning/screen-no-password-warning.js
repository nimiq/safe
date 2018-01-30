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
          <a secondary>Take me back</button>
        `
    }

    get route() { return ['no-password']; }

    onCreate() {
        this.$button = this.$('button');
        this.$a = this.$('a');
        this.$button.addEventListener('click', e => this._onConfirm());
        this.$a.addEventListener('click', e => this.goTo('password'));
    }

    _onConfirm() {
        const password = '';
        this.fire('x-encrypt-backup', password);
        this.goTo('encrypt');
    }
}
