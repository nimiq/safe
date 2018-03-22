import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/elements/mixin-redux/mixin-redux.js';
import { setPage } from './transactions-redux.js';

export default class XPaginator extends MixinRedux(XElement) {
    html() {
        return `
            <button toStart class="small">&larrb;</button>
            <button prev class="small">&lt;</button>
            <button next class="small">&gt;</button>
            <button toEnd class="small">&rarrb;</button>
        `
    }

    onCreate() {
        this.$toStart = this.$('button[toStart]');
        this.$prev = this.$('button[prev]');
        this.$next = this.$('button[next]');
        this.$toEnd = this.$('button[toEnd]');
        this.setProperty('storePath', this.attributes.storePath);
        super.onCreate();
    }

    listeners() {
        return {
            'click button[toStart]': () => this._pageSelected(1),
            'click button[prev]': () => this._pageSelected(this.properties.page - 1),
            'click button[next]': () => this._pageSelected(this.properties.page + 1),
            'click button[toEnd]': () => this._pageSelected(this.properties.totalPages)
        }
    }

    static get actions() {
        return {
            setPage
        }
    }

    static mapStateToProps(state, props) {
        if (!props.storePath) return;
        return {
            page: state[props.storePath].page,
            itemsPerPage: state[props.storePath].itemsPerPage,
            totalPages: state[props.storePath].totalPages
        }
    }

    /**
     * @param {Array|Set|Map} items
     * @param {integer} page 1-indexed
     * @param {integer} itemsPerPage
     * @param {boolean} [backwards]
     * @returns {Array|Set|Map} Returns the same type that is items
     */
    static getPagedItems(items, page, itemsPerPage, backwards) {
        console.log("items", items);
        const keys = items instanceof Map
            ? [...items.keys()]
            : items instanceof Set
                ? [...items]
                : items instanceof Array
                    ? items
                    : false;

        if (!keys) throw new Error('Cannot paginate type', items.__proto__.constructor.name);

        if (backwards) keys.reverse();

        // Pagination
        const indexStart = (page - 1) * itemsPerPage;
        const indexEnd = indexStart + itemsPerPage;
        const pagedKeys = keys.slice(indexStart, indexEnd);

        if (backwards) pagedKeys.reverse();

        if (items instanceof Array) return pagedKeys;
        if (items instanceof Set) return new Set(pagedKeys);

        // items instanceof Map
        const pagedItems = new Map();
        pagedKeys.forEach(key => pagedItems.set(key, items.get(key)));
        console.log("pagedItems", pagedItems);
        return pagedItems;
    }

    _onPropertiesChanged(changes) {
        const page = changes.page || this.properties.page;
        const totalPages = changes.totalPages || this.properties.totalPages;

        if (page === 1) {
            this.$toStart.disabled = true;
            this.$prev.disabled = true;
        } else {
            this.$toStart.disabled = false;
            this.$prev.disabled = false;
        }

        if (page === totalPages) {
            this.$toEnd.disabled = true;
            this.$next.disabled = true;
        } else {
            this.$toEnd.disabled = false;
            this.$next.disabled = false;
        }
    }

    _pageSelected(page) {
        if (page < 1 || page > this.properties.totalPages) return;
        this.actions.setPage(page);
    }
}
