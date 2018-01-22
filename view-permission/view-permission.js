import XView from '/x-element/x-view.js';

export default class ViewPermission extends XView {
    html() {
        return `
			<h1>Identicon Scanner</h1>
			<h2>Grant camera access to continue</h2>
			<x-permisson-bg></x-permisson-bg>
		`
    }
}