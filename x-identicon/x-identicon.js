class XIdenticon extends XElement {
    set address(address) {
        Identicon.render(address, this.$el);
    }
}