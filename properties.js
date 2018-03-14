export default class Properties {
    constructor(element) {
        this._map = new Map();
        this._element = element;
    }

    get(key) {
        return this._map.get(key);
    }

    set(key, value) {
        const result = this._map.set(key, value);
        if (this._element.onPropertyChanged === 'function') {
            this._element.onPropertyChanged(key, value);
        }
        return result;
    }

    delete(key) {
        return this._map.delete(key);
    }
}