import XElement from '../../libraries/x-element/x-element.js';

export default class XPasswordIndicator extends XElement {
    html() {
        return `
            <div class="label">Strength:</div>
            <meter max="130" low="10" optimum="100"></meter>
        `;
    }

    setStrength(strength) { // 0 for none, 1 for bad, 2 for ok, 3 for good
      this.$('meter').setAttribute('value', this._getMeterValue(strength));
    }

    _getMeterValue(strength) {
      switch(strength) {
        case 0:
          return 0;
        case 1:
          return 10;
        case 2:
          return 70;
        case 3:
          return 100;
        case 4:
          return 130;
      }
    }
}
