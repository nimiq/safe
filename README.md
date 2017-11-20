# x-element
A frontend framework designed for simplicity.

Features:
- client-side templating by pre-processing html via xslt
	- recursive xhtml templates
		- fetched automatically from /elements folder
	- if an element is used multiple times, its scripts and styles are imported only once

Development:
- Browser: open index.xhtml
- Build: `xsltproc index.xhtml > index.html`

## Todo
- refactor filters for style and script in single template with param
- advanced features:
	- automatically prefix css classes with element-name for css scoping
	- automatically parse children() in XElement.js instances
	- import arbitrary cdata'd files
	- add filter for html5 `<template>` tags? 
	- allow imports with absolute path
	- clean up example code, define clear app and element structure
		- sublime template for app/view/element boilerplate
	- write simple docs
