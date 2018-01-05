class WalletBackup extends XElement {
    onCreate() {
        this.$canvas = document.querySelector('canvas');
        this.$a = document.querySelector('a');
    }

    paint(address, privateKey) {
        const image = new WalletBackup(this.$canvas, address, privateKey);
        setTimeout(e => this.$a.href = image.toDataUrl(), 1000);
        $a.download = address + '.png';
    }
}