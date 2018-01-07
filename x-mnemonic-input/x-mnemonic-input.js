class XMnemonicInput extends XElement {

    onCreate() {
        const $body = document.querySelector('body')
        $body.insertBefore(document.createTextNode('v5'), $body.firstChild);

        this.$fields = [];
        this.$form = document.createElement('form');
        this.$form.setAttribute('autocomplete', 'off');
        for (let i = 0; i < 24; i++) {
            const field = XMnemonicInputField.createElement();
            this.$form.appendChild(field.$el);
            this.$fields.push(field);
        }
        this.$el.appendChild(this.$form);

        if(this._hasDatalistSupport()) this._createDatalist();
        else this.$fields.forEach(field => field.setupAutocomplete());

        this.addEventListener('complete', e => this._onFieldComplete(e));

        this.$fields[0].$input.focus();
    }

    _hasDatalistSupport() {
    	return !!( 'list' in document.createElement( 'input' ) ) &&
    		   !!( document.createElement( 'datalist' ) && window.HTMLDataListElement );
    }

    _createDatalist() {
        const datalist = document.createElement('datalist');
        datalist.setAttribute('id', 'x-mnemonic-wordlist');
        for( let i = 0; i < MnemonicPhrase.DEFAULT_WORDLIST.length; i++) {
            const option = document.createElement('option');
            option.textContent = MnemonicPhrase.DEFAULT_WORDLIST[i];
            datalist.appendChild(option);
        }
        this.$el.appendChild(datalist);
    }

    _onFieldComplete(e) {
        if (e.detail[0].$input === document.activeElement && !e.detail[1]) {
            // Find active field
            const index = Array.prototype.indexOf.call(this.$fields, e.detail[0]);
            if (index < this.$fields.length - 1)
                // Set focus to next field
                this.$fields[index + 1].$input.focus();
        }

        this._checkPhraseComplete();
    }

    _checkPhraseComplete() {
        const check = this.$fields.find(field => !field._complete);
        if (typeof check !== 'undefined') return;
        const mnemonic = this.$fields.map(field => field.$input.value).join(' ');
        try {
            const privateKey = MnemonicPhrase.mnemonicToKey(mnemonic);
            this.fire('recovered', privateKey);
            this._animateSuccess();
        }
        catch(e) {
            console.log(e.message);
        }
    }

    _animateSuccess() {
        //
    }
}

class XMnemonicInputField extends XElement {
    onCreate() {
        this.$input = this.$('input');

        this.$input.addEventListener('keydown', e => this._onKeyDown(e));
        this.$input.addEventListener('input', e => this._onInput(e));
        this.$input.addEventListener('blur', e => this._onBlur(e));

        this._value = '';
    }

    setupAutocomplete() {
        this.autocomplete = new autoComplete({
            selector: this.$input,
            source: (term, response) => {
                const list = MnemonicPhrase.DEFAULT_WORDLIST.filter(word => {
                    return word.slice(0, term.length) === term;
                });
                response(list);
            },
            minChars: 3,
            delay: 0,
            onSelect: () => {
                // Emulate the event from selecting a datalist item
                const e = { type: 'input' };
                this._onKeyDown(e);
            }
        });
    }

    _onKeyDown(e) {
        // console.log('_onKeyDown', e.keyCode, e.type);
        const value = this.$input.value;
        if (e.keyCode === 32 /* space */ || e.keyCode === 9 /* tab */ || e.type === 'blur' || e.type === 'input') {
            if (value.length >= 3) {
                const index = MnemonicPhrase.DEFAULT_WORDLIST.indexOf(value);
                if (index > -1) {
                    this._complete = true;
                    this.fire('complete', [this, e.keyCode === 9 /* tab */ ]);
                    this.$input.classList.add('complete');
                }
                else {
                    this.$input.classList.add('invalid');
                }
            }

            if (e.keyCode === 32 /* space */ ) e.preventDefault();
        }
    }

    _onInput(e) {
        // console.log('_onInput', e.data);
        if(typeof e.data === 'undefined') { // No key pressed, but autocomplete selected
            this._onKeyDown(e);
            return;
        }

        let value = this.$input.value;

        if (value.toLowerCase() !== value) {
            this.$input.value = value.toLowerCase();
            value = this.$input.value;
        }

        if(value.length > 2) this.$input.setAttribute('list', 'x-mnemonic-wordlist');
        else this.$input.removeAttribute('list');

        if (this._value === value) return;

        this._complete = false;
        this.$input.classList.remove('complete');
        this.$input.classList.remove('invalid'); // Multiple classes in remove() are not supported by IE
        this._value = value;
    }

    _onBlur(e) {
        // console.log('_onBlur');
        if (this._complete) return;
        this._onKeyDown(e);
    }

    html() {
        return `<input type="text" autocorrect="off" autocapitalize="none" spellcheck="false">`;
    }
}

// JavaScript autoComplete v1.0.4
// https://github.com/Pixabay/JavaScript-autoComplete
var autoComplete=function(){function e(e){function t(e,t){return e.classList?e.classList.contains(t):new RegExp("\\b"+t+"\\b").test(e.className)}function o(e,t,o){e.attachEvent?e.attachEvent("on"+t,o):e.addEventListener(t,o)}function s(e,t,o){e.detachEvent?e.detachEvent("on"+t,o):e.removeEventListener(t,o)}function n(e,s,n,l){o(l||document,s,function(o){for(var s,l=o.target||o.srcElement;l&&!(s=t(l,e));)l=l.parentElement;s&&n.call(l,o)})}if(document.querySelector){var l={selector:0,source:0,minChars:3,delay:150,offsetLeft:0,offsetTop:1,cache:1,menuClass:"",renderItem:function(e,t){t=t.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&");var o=new RegExp("("+t.split(" ").join("|")+")","gi");return'<div class="autocomplete-suggestion" data-val="'+e+'">'+e.replace(o,"<b>$1</b>")+"</div>"},onSelect:function(){}};for(var c in e)e.hasOwnProperty(c)&&(l[c]=e[c]);for(var a="object"==typeof l.selector?[l.selector]:document.querySelectorAll(l.selector),u=0;u<a.length;u++){var i=a[u];i.sc=document.createElement("div"),i.sc.className="autocomplete-suggestions "+l.menuClass,i.autocompleteAttr=i.getAttribute("autocomplete"),i.setAttribute("autocomplete","off"),i.cache={},i.last_val="",i.updateSC=function(e,t){var o=i.getBoundingClientRect();if(i.sc.style.left=Math.round(o.left+(window.pageXOffset||document.documentElement.scrollLeft)+l.offsetLeft)+"px",i.sc.style.top=Math.round(o.bottom+(window.pageYOffset||document.documentElement.scrollTop)+l.offsetTop)+"px",i.sc.style.width=Math.round(o.right-o.left)+"px",!e&&(i.sc.style.display="block",i.sc.maxHeight||(i.sc.maxHeight=parseInt((window.getComputedStyle?getComputedStyle(i.sc,null):i.sc.currentStyle).maxHeight)),i.sc.suggestionHeight||(i.sc.suggestionHeight=i.sc.querySelector(".autocomplete-suggestion").offsetHeight),i.sc.suggestionHeight))if(t){var s=i.sc.scrollTop,n=t.getBoundingClientRect().top-i.sc.getBoundingClientRect().top;n+i.sc.suggestionHeight-i.sc.maxHeight>0?i.sc.scrollTop=n+i.sc.suggestionHeight+s-i.sc.maxHeight:0>n&&(i.sc.scrollTop=n+s)}else i.sc.scrollTop=0},o(window,"resize",i.updateSC),document.body.appendChild(i.sc),n("autocomplete-suggestion","mouseleave",function(){var e=i.sc.querySelector(".autocomplete-suggestion.selected");e&&setTimeout(function(){e.className=e.className.replace("selected","")},20)},i.sc),n("autocomplete-suggestion","mouseover",function(){var e=i.sc.querySelector(".autocomplete-suggestion.selected");e&&(e.className=e.className.replace("selected","")),this.className+=" selected"},i.sc),n("autocomplete-suggestion","mousedown",function(e){if(t(this,"autocomplete-suggestion")){var o=this.getAttribute("data-val");i.value=o,l.onSelect(e,o,this),i.sc.style.display="none"}},i.sc),i.blurHandler=function(){try{var e=document.querySelector(".autocomplete-suggestions:hover")}catch(t){var e=0}e?i!==document.activeElement&&setTimeout(function(){i.focus()},20):(i.last_val=i.value,i.sc.style.display="none",setTimeout(function(){i.sc.style.display="none"},350))},o(i,"blur",i.blurHandler);var r=function(e){var t=i.value;if(i.cache[t]=e,e.length&&t.length>=l.minChars){for(var o="",s=0;s<e.length;s++)o+=l.renderItem(e[s],t);i.sc.innerHTML=o,i.updateSC(0)}else i.sc.style.display="none"};i.keydownHandler=function(e){var t=window.event?e.keyCode:e.which;if((40==t||38==t)&&i.sc.innerHTML){var o,s=i.sc.querySelector(".autocomplete-suggestion.selected");return s?(o=40==t?s.nextSibling:s.previousSibling,o?(s.className=s.className.replace("selected",""),o.className+=" selected",i.value=o.getAttribute("data-val")):(s.className=s.className.replace("selected",""),i.value=i.last_val,o=0)):(o=40==t?i.sc.querySelector(".autocomplete-suggestion"):i.sc.childNodes[i.sc.childNodes.length-1],o.className+=" selected",i.value=o.getAttribute("data-val")),i.updateSC(0,o),!1}if(27==t)i.value=i.last_val,i.sc.style.display="none";else if(13==t||9==t){var s=i.sc.querySelector(".autocomplete-suggestion.selected");s&&"none"!=i.sc.style.display&&(l.onSelect(e,s.getAttribute("data-val"),s),setTimeout(function(){i.sc.style.display="none"},20))}},o(i,"keydown",i.keydownHandler),i.keyupHandler=function(e){var t=window.event?e.keyCode:e.which;if(!t||(35>t||t>40)&&13!=t&&27!=t){var o=i.value;if(o.length>=l.minChars){if(o!=i.last_val){if(i.last_val=o,clearTimeout(i.timer),l.cache){if(o in i.cache)return void r(i.cache[o]);for(var s=1;s<o.length-l.minChars;s++){var n=o.slice(0,o.length-s);if(n in i.cache&&!i.cache[n].length)return void r([])}}i.timer=setTimeout(function(){l.source(o,r)},l.delay)}}else i.last_val=o,i.sc.style.display="none"}},o(i,"keyup",i.keyupHandler),i.focusHandler=function(e){i.last_val="\n",i.keyupHandler(e)},l.minChars||o(i,"focus",i.focusHandler)}this.destroy=function(){for(var e=0;e<a.length;e++){var t=a[e];s(window,"resize",t.updateSC),s(t,"blur",t.blurHandler),s(t,"focus",t.focusHandler),s(t,"keydown",t.keydownHandler),s(t,"keyup",t.keyupHandler),t.autocompleteAttr?t.setAttribute("autocomplete",t.autocompleteAttr):t.removeAttribute("autocomplete"),document.body.removeChild(t.sc),t=null}}}}return e}();!function(){"function"==typeof define&&define.amd?define("autoComplete",function(){return autoComplete}):"undefined"!=typeof module&&module.exports?module.exports=autoComplete:window.autoComplete=autoComplete}();
