# x-element
A webapp framework designed for simplicity. Lightweight, fast and standards-compliant. 

Features:
- client-side HTML preprocessing via xslt
	- recursively stamps xhtml templates
	- if an element is used multiple times its scripts and styles are imported only once

Development:
- Browser: open index.xhtml
- Build: `xsltproc index.xhtml > index.html`

## Todo
- refactor filters for style and script in single template with param
- advanced features:
	- define clear app and element structure
	- automatically prefix css classes with element-name 
	- automatically set children() in XElement instances
	- sublime template for elements
	- import arbitrary cdata'd files
	- filter for html5 `<template>` tags? 
	- allow imports with absolute path
