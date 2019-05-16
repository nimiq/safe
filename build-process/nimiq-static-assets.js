'use strict';

var fs = require('fs');
var path = require('path');
var through = require('through2');
var Vinyl = require('vinyl');
var PluginError = require('plugin-error');

var PLUGIN_NAME = 'nimiq-static-assets';

function getFileName(path) {
    return path.substr(path.lastIndexOf('/') + 1);
}

function parseAssets(file, reference, opts, push) {
	var rootPath = opts['rootPath'];

	var pattern = new RegExp(/@asset\(.+?\)/g);

	var contents = file.contents;

	var code = contents.toString();
	var result = code;
	if (Buffer.from(code).length === contents.length) {
		let match;
		while(match = pattern.exec(code)) {
			const slice = match[0].slice(7, -1);

			const url = slice.split(',')[0];
			const subdir = slice.split(',')[1];

			const absoluteFilePath = url.startsWith('/') ? path.join(rootPath, url) : url;
			const fileName = getFileName(absoluteFilePath);

			console.log('Extracting static file:', url);

			result = result.replace(new RegExp(url, 'g'), fileName);

			const file = new Vinyl({
				path: path.join(path.dirname(absoluteFilePath), subdir || '', path.basename(absoluteFilePath)),
				base: path.dirname(absoluteFilePath),
				contents: fs.readFileSync(absoluteFilePath)
			});
			push(file);
		}
	}

	file = file.clone();
	file.contents = Buffer.from(result);
	push(file);
}

function staticAssets(opts) {
	opts = opts || {};
	var rootPath = opts['rootPath'] || `${__dirname}/../../`;

	return through.obj(function (file, enc, cb) {
		if (file.isNull()) {
			return cb();
		} else if (file.isStream()) {
			cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
		} else if (file.isBuffer()) {
			parseAssets(file, null, {
				rootPath: rootPath
			}, this.push.bind(this));
			cb();
		}
	});
}

module.exports = staticAssets;
