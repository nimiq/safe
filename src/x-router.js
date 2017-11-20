class XRouter {
    constructor() {
        addEventListener('popstate', (e) => {
            this._setState();
        });
        this._setState();
    }
    _setState() {
        const state = location.hash.substr(1);
        if (state === '') {
            location = '#home';
            return;
        }
        document.body.className = 'state-' + state;
        // console.log(state);
    }
    _callAppState(state){
        
    }
}
window.router = new XRouter();