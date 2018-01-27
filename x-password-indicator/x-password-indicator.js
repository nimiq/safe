import XElement from "../../library/x-element/x-element.js";

export default class XPasswordIndicator extends XElement {
    html() {
        return `
            <meter max="30" id="password-strength-meter"></meter>
        `;
    }

    setPassword(password) {
      const strength = password.length;
      this.$("meter").setAttribute("value", strength);
    }
}