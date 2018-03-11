import XApp from '/elements/x-app/x-app.js';

import { bindActionCreators } from '/libraries/redux/src/index.js';

import { Store, default as store } from './store/store.js';

import { add, remove } from './store/sampleReducer.js';

Store.initialize({
    sample: {
        myMap: new Map(),
        counter: 5
    }
});

function update () {
    alert(JSON.stringify(store.getState().sample));
}

store.subscribe(update);

const actions = bindActionCreators({ add, remove }, store.dispatch);

actions.add('test', 1235);

window.app = new XApp();
