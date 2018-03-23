import XElement from "/libraries/x-element/x-element.js";

export default class XSuccessMark extends XElement {
    html() {
        const uniqueId = 'circleFill' + Math.round(Math.random() * 1000000).toString();
        return `
            <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 168 168">
                <radialGradient id="${uniqueId}" gradientUnits="userSpaceOnUse" gradientTransform="translate(-4, -4)">
                    <stop offset="1" stop-color="transparent">
                        <animate dur="0.4s" attributeName="offset" begin="indefinite" fill="freeze" from="1" to="0"
                        values="1;0"
                        keyTimes="0;1"
                        keySplines=".42 0 .58 1"
                        calcMode="spline" />
                    </stop>
                    <stop offset="1" stop-color="#64FFDA">
                        <animate dur="0.4s" attributeName="offset" begin="indefinite" fill="freeze" from="1" to="0"
                        values="1;0"
                        keyTimes="0;1"
                        keySplines=".42 0 .58 1"
                        calcMode="spline" />
                    </stop>
                </radialGradient>
                <path class="checkmark__circle" d="M88.1247411,2.6381084 L142.907644,34.2670322 C147.858061,37.125157 150.907644,42.4071893 150.907644,48.1234387 L150.907644,111.381286 C150.907644,117.097536 147.858061,122.379568 142.907644,125.237693 L88.1247411,156.866617 C83.1743239,159.724741 77.0751584,159.724741 72.1247411,156.866617 L17.3418381,125.237693 C12.3914209,122.379568 9.34183808,117.097536 9.34183808,111.381286 L9.34183808,48.1234387 C9.34183808,42.4071893 12.3914209,37.125157 17.3418381,34.2670322 L72.1247411,2.6381084 C77.0751584,-0.220016318 83.1743239,-0.220016318 88.1247411,2.6381084 Z" fill="url(#${uniqueId})" transform="translate(84.124741, 79.752363) rotate(30.000000) translate(-80.124741, -79.752363)"></path>
                <path class="checkmark__check" fill="none" d="M42.3 81.6l21.3 21.6 50.1-50.4" transform="translate(4, 4)" />
            </svg>`;
    }

    onCreate() {
        this.$$animate = this.$$('animate');
        this._hasAnimated = false;
    }

    animate() {
        if (this._hasAnimated) this._reset();
        this._hasAnimated = true;

        this.$el.classList.add('animate-success-mark');
        setTimeout(() => this.$$animate.forEach(el => el.beginElement()), 400);
        return new Promise(resolve => setTimeout(resolve, 3000))
    }

    _reset() {
        this.$el.classList.remove('animate-success-mark');
        this.$el.innerHTML = this.html();
        this.onCreate();
    }
}
