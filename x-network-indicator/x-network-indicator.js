import XElement from '/libraries/x-element/x-element.js';
import MixinRedux from '/elements/mixin-redux/mixin-redux.js';

export default class XNetworkIndicator extends MixinRedux(XElement) {
    html() {
        return `
            <div><label>Consensus</label> <strong consensus></strong></div>
            <div><label>Height</label> <strong height></strong></div>
            <div><label>Peer count</label> <strong peerCount></strong></div>
            <div><label>Global hashrate</label> <strong globalHashrate></strong></div>
        `;
    }

    onCreate() {
        this.$consensus = this.$('strong[consensus]');
        this.$height = this.$('strong[height]');
        this.$peerCount = this.$('strong[peerCount]');
        this.$globalHashrate = this.$('strong[globalHashrate]');
        super.onCreate();
    }

    static mapStateToProps(state) {
        return state.network
    }

    _onPropertiesChanged(changes) {
        for (const prop in changes) {
            this[prop] = changes[prop];
        }
    }

    set consensus(consensus) {
        this.$consensus.textContent = consensus;
    }

    set height(height) {
        this.$height.textContent = `#${height}`;
    }

    set peerCount(peerCount) {
        this.$peerCount.textContent = peerCount;
    }

    set globalHashrate(globalHashrate) {
        this.$globalHashrate.textContent = `~${globalHashrate} H/s`;
    }
}
