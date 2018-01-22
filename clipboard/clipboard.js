navigator.copy = function(text) {
    // A <span> contains the text to copy
    var span = document.createElement('span')
    span.textContent = text
    span.style.whiteSpace = 'pre' // Preserve consecutive spaces and newlines

    // An <iframe> isolates the <span> from the page's styles
    var iframe = document.createElement('iframe')
    iframe.sandbox = 'allow-same-origin'
    document.body.appendChild(iframe)

    var win = iframe.contentWindow
    win.document.body.appendChild(span)

    var selection = win.getSelection()

    // Firefox fails to get a selection from <iframe> window, so fallback
    if (!selection) {
        win = window
        selection = win.getSelection()
        document.body.appendChild(span)
    }

    var range = win.document.createRange()
    selection.removeAllRanges()
    range.selectNode(span)
    selection.addRange(range)

    var success = false
    try {
        success = win.document.execCommand('copy')
    } catch (err) {}

    selection.removeAllRanges()
    span.remove()
    iframe.remove()

    return success
}

// Todo: Add paste api


// https://dzone.com/articles/cross-browser-javascript-copy-and-paste
// function paste(target) {
//     function waitForPaste() {
//         if (!systemPasteReady) {
//             setTimeout(waitForPaste, 250);
//             return;
//         }
//         target.innerHTML = systemPasteContent;
//         systemPasteReady = false;
//         document.body.removeChild(textArea);
//         textArea = null;
//     }
//     // FireFox requires at least one editable
//     // element on the screen for the paste event to fire
//     textArea = document.createElement('textarea');
//     textArea.setAttribute
//         ('style', 'width:1px;border:0;opacity:0;');
//     document.body.appendChild(textArea);
//     textArea.select();
//     waitForPaste();
// }
// function systemPasteListener(evt) {
//     systemPasteContent = 
//         evt.clipboardData.getData('text/plain');
//     systemPasteReady = true;
//     evt.preventDefault();
// }
// window.addEventListener('paste',systemPasteListener);