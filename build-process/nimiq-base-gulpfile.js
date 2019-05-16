const gulp = require('gulp');

const clean = require('gulp-clean');
const sourcemaps = require('gulp-sourcemaps');

const rollup = require('gulp-better-rollup');
const rollupRoot = require('rollup-plugin-root-import');
const babel = require('gulp-babel'); // TODO do minification with uglify-es

const cssImport = require('gulp-cssimport'); // TODO apparently gulp-clean-css can also inline imports ?
const cleanCss = require('gulp-clean-css');
const concat = require('gulp-concat');

const replace = require('gulp-replace');
const htmlReplace = require('gulp-html-replace');
const rename = require('gulp-rename');
const merge = require('merge2');

const staticAssets = require('./nimiq-static-assets');

class NimiqBuild {
    /**
     * Bundle js imports.
     * @param {string} jsEntry - entry point for the js from where other js files can be imported
     * @param {string} rootPath - The root path of the nimiq project structure. Must be an absolute path! (e.g. based on __dirname)
     * @param {boolean} [minify] - Optional. Whether to minify the js code. Defaults to false. If true, it is important to also add babel-preset-minify to the gulpfile of your project as otherwise babel won't find it.
     * @param {boolean} [collectAssets] - Optional. Whether to collect the assets annotated by @asset and copy them to the stream.
     * @param {string|null} [distPath] - Optional. Write the bundled file to this path.
     * @returns {Stream}
     */
    static bundleJs(jsEntry, rootPath, minify=false, collectAssets=true, distPath=null) {
        let jsStream = gulp.src(jsEntry)
            .pipe(sourcemaps.init())
            .pipe(rollup({
                context: 'window',
                plugins: [
                    rollupRoot({
                        // specify absolute paths in order for rollup plugins to match module IDs
                        root: rootPath,
                        extensions: '.js'
                    })
                ]
            }, {
                format: 'iife'
            }))
            .pipe(concat(NimiqBuild.getFileName(jsEntry)));
        if (collectAssets) {
            jsStream = jsStream.pipe(staticAssets({ rootPath }));
        }
        // TODO minification doesn't work on stream with collected assets, but we have to do minification on that stream, as staticAssets also changes the paths to assets in the source file -> consider changing staticAssets in a way such that it only collects the assetPaths and then replace them using moveAssets
        if (minify) {
            jsStream = jsStream
                .pipe(babel({
                    presets: ['minify']
                }));
        }

        if (distPath) {
            jsStream = NimiqBuild._writeStream(jsStream, distPath);
        }
        return jsStream;
    }

    /**
     * Bundle css imports.
     * @param {string} cssEntry - entry point for the css from where other css files can be imported
     * @param {string} rootPath - The root path of the nimiq project structure. Must be an absolute path! (e.g. based on __dirname)
     * * @param {boolean} [collectAssets] - Optional. Whether to collect the assets annotated by @asset and copy them to the stream.
     * @param {string|null} [distPath] - Optional. Write the bundled file to this path.
     * @returns {Stream}
     */
    static bundleCss(cssEntry, rootPath, collectAssets=true, distPath = null) {
        let cssStream = gulp.src(cssEntry)
            .pipe(sourcemaps.init())
            .pipe(cssImport({
                includePaths: [rootPath],
                // transform absolute paths relative to root path
                transform: path => path.startsWith('/')? rootPath + path : path
            }))
            .pipe(concat(NimiqBuild.getFileName(cssEntry)));
        if (collectAssets) {
            cssStream = cssStream.pipe(staticAssets({ rootPath }));
        }
        /*
        // TODO check whether actually needed... and check whether cleanCss messes the added assets up
        // the css import will inline the same css multiple times if imported multiple times thus we'll clean it up.
        cssStream = cssStream.pipe(cleanCss({
            level: 2
        }));*/
        if (distPath) {
            cssStream = NimiqBuild._writeStream(cssStream, distPath);
        }
        return cssStream;
    }

    /**
     * Bundle js and css builds and browser-warning into the html.
     * @param {string} htmlEntry - The original html file.
     * @param {string} jsBundle - Path to the bundled js file, relative to the output html file.
     * @param {string} cssBundle - Path to the bundled css file, relative to the output html file.
     * @param {string} rootPath - The root path of the nimiq project structure. Must be an absolute path! (e.g. based on __dirname)
     * @param {Array[]} replaceHTMLStrings - Replacements
     * @param {boolean} [collectAssets] - Optional. Whether to collect the assets annotated by @asset and copy them to the stream.
     * @param {string|null} [distPath] - Optional. Write the bundled file to this path.
     * @returns {Stream}
     */
    static bundleHtml(htmlEntry, jsBundle, cssBundle, rootPath, replaceHTMLStrings = [], collectAssets=true, distPath = null) {
        const bundles = {};
        const timestamp = Math.round(Date.now() / 1000);
        if (jsBundle) {
            bundles.js = {
                src: jsBundle + '?t=' + timestamp,
                tpl: '<script src="%s" type="text/javascript" defer></script>'
            };
        }
        if (cssBundle) {
            bundles.css = cssBundle + '?t=' + timestamp;
        }

        bundles['browser-warning'] = gulp.src(rootPath + '/elements/browser-warning/browser-warning.html.template');

        let stream = gulp.src(htmlEntry)
            .pipe(htmlReplace(bundles));

        for (const [search, replacement] of replaceHTMLStrings) {
            const regex = new RegExp(search, 'g');
            stream = stream.pipe(replace(regex, replacement));
        }

        if (collectAssets) {
            stream = stream.pipe(staticAssets({ rootPath }));
        }
        if (distPath) {
            stream = NimiqBuild._writeStream(stream, distPath);
        }
        return stream;
    }

    /**
     * Copy assets and change paths in html, js and css to relative paths to the copied files.
     * @param {Array<String>} assetPaths - a list of assets that should be copied over to the dist folder
     * @param {Stream} htmlStream - A gulp stream for the HTML to process
     * @param {Stream} jsStream - A gulp stream for the JavaScript to process
     * @param {Stream} cssStream - A gulp stream for the CSS to process
     * @param {string} rootPath - The root path of the nimiq project structure. Must be an absolute path! (e.g. based on __dirname)
     * @param {string|null} [distPath] - Optional. Write the bundled file to this path.
     * @returns {[Stream,Stream,Stream,Stream]}
     */
    static moveAssets(assetPaths, htmlStream, jsStream, cssStream, rootPath, distPath = null) {
        const assetFileNames = assetPaths.map(path => NimiqBuild.getFileName(path));
        const resolvedAssetPaths = assetPaths.map(path => path.startsWith('/')? rootPath+path : path);
        const assetsStream = resolvedAssetPaths.length == 0 ? null : gulp.src(resolvedAssetPaths); // copy assets unchanged
        // replace the asset path in sources
        for (let i=0; i<assetPaths.length; ++i) {
            const regex = new RegExp(assetPaths[i], 'g');
            jsStream = jsStream? jsStream.pipe(replace(regex, assetFileNames[i])) : null;
            cssStream = cssStream? cssStream.pipe(replace(regex, assetFileNames[i])) : null;
            htmlStream = htmlStream? htmlStream.pipe(replace(regex, assetFileNames[i])) : null;
        }
        if (distPath) {
            jsStream = jsStream? NimiqBuild._writeStream(jsStream, distPath) : null;
            cssStream = jsStream? NimiqBuild._writeStream(cssStream, distPath) : null;
            htmlStream = htmlStream? NimiqBuild._writeStream(htmlStream, distPath) : null;
        }
        return [assetsStream, htmlStream, jsStream, cssStream];
    }

    /**
     * Create a new nimiq app build
     * @param {string|null} jsEntry - entry point for the js from where other js files can be imported
     * @param {string|null} cssEntry - entry point for the css from where other css files can be imported
     * @param {string|null} htmlEntry - entry point for the html which should include <!-- build:css -->, <!-- build:js --> and <!-- build:browser-warning -->
     * @param {Array.<String>} assetPaths - a list of assets that should be copied over to the dist folder
     * @param {string} rootPath - The root path of the nimiq project structure. Must be an absolute path! (e.g. based on __dirname)
     * @param {string} distPath - Where the output should be written to
     * @param {boolean} [minify] - Optional. Whether to minify the js code. Defaults to false.
     * @returns {Stream}
     */
    static build({
                     jsEntry,
                     cssEntry,
                     htmlEntry,
                     assetPaths=[],
                     rootPath,
                     distPath,
                     minify = false,
                     replaceHTMLStrings
    }) {
        let jsStream = jsEntry? NimiqBuild.bundleJs(jsEntry, rootPath, minify) : null;
        let cssStream = cssEntry? NimiqBuild.bundleCss(cssEntry, rootPath) : null;
        let htmlStream = htmlEntry? NimiqBuild.bundleHtml(htmlEntry, jsEntry && NimiqBuild.getFileName(jsEntry),
            cssEntry && NimiqBuild.getFileName(cssEntry), rootPath, replaceHTMLStrings) : null;
        let assetsStream;
        [assetsStream, htmlStream, jsStream, cssStream] =
            NimiqBuild.moveAssets(assetPaths, htmlStream, jsStream, cssStream, rootPath);

        return NimiqBuild._writeStream(
            merge([jsStream, cssStream, htmlStream, assetsStream].filter(s => s!==null)),
            distPath
        );
    }

    /**
     * Clean a build
     * @param {String} distFolder - where the app was built.
     * @returns {Stream}
     */
    static cleanBuild(distFolder) {
        return gulp.src(distFolder, {read: false, allowEmpty: true})
            .pipe(clean());
    }

    static getFileName(path) {
        if (Object.prototype.toString.call(path) === '[object Array]') path = path[path.length - 1];
        return path.substr(path.lastIndexOf('/') + 1);
    }

    static _writeStream(stream, distPath) {
        return stream.pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(distPath));
    }
}

module.exports = NimiqBuild;
