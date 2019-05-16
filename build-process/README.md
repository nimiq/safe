# build-process
Base build process for frontend apps.


## Setup

Run the following command to install the build dependencies:
```
cd build-process
npm install
```

## Usage

In your project that you want to build create a `gulpfile.js` and import the base build process as
```js
const NimiqBuild = require(path);
```
where path is a relative path to `nimiq-base-gulpfile.js` contained in this repository, e.g. `'../../meta/build-process/nimiq-base-gulpfile.js'`. Then you can call the methods provided by `nimiq-base-gulpfile.js` within your gulp tasks.

For example:
```js
gulp.task('build', () => NimiqBuild.build('app.js', 'app.css', 'index.html', [], `${__dirname}/../../`, 'dist'));
```

## API

### build

Create a new Nimiq app build. Parameters are given as object with the following properties:

| Parameter  | Type           | Description |
| ---------- | -------------- | ----------- |
| jsEntry    | string         | Optional. Entry point for the js from where other js files can be imported. |
| cssEntry   | string         | Optional. Entry point for the css from where other css files can be imported |
| htmlEntry  | string         | optional. Entry point for the html which should include `<!-- build:css -->`, `<!-- build:js -->` and `<!-- build:browser-warning -->` |
| assetPaths | Array.&lt;string&gt; | A list of assets that should be copied over to the dist folder. Specified by their path (either absolute to `rootPath` or relative to the project folder) |
| rootPath   | string         | The root path of the nimiq project structure. Must be an absolute path (e.g. based on __dirname) |
| distPath   | string         | Where the output should be written to |
| minify     | boolean        | Optional. Whether to minify the javascript. |

Returns a gulp stream.


### cleanBuild

Clean a build folder

| Parameter  | Type           | Description |
| ---------- | -------------- | ----------- |
| distFolder | string         | The folder to delete |

Returns a gulp stream.


### bundleJs

Bundle js imports.

| Parameter  | Type           | Description |
| ---------- | -------------- | ----------- |
| jsEntry    | string         | Entry point for the js from where other js files can be imported |
| rootPath   | string         | The root path of the nimiq project structure. Must be an absolute path (e.g. based on __dirname) |
| minify     | boolean        | Optional. Whether to minify the javascript.   |
| collectAssets | boolean     | Optional. Collect assets annotated by @asset and add them as a copy to the stream. Paths pointing to that asset will be replaced. |
| distPath   | string         | Optional. Write the bundled file to this path. |

Returns a gulp stream.


### bundleCss

Bundle css imports.

| Parameter  | Type           | Description |
| ---------- | -------------- | ----------- |
| cssEntry   | string         | Entry point for the css from where other css files can be imported |
| rootPath   | string         | The root path of the nimiq project structure. Must be an absolute path (e.g. based on __dirname) |
| collectAssets | boolean     | Optional. Collect assets annotated by @asset and add them as a copy to the stream. Paths pointing to that asset will be replaced. |
| distPath   | string         | Optional. Write the bundled file to this path. |

Returns a gulp stream.


### bundleHtml

Bundle js and css builds and add a browser warning (from `/elements/browser-warning/browser-warning.html.template`) into the html.

| Parameter  | Type           | Description |
| ---------- | -------------- | ----------- |
| htmlEntry  | string         | The original html file which should include `<!-- build:css -->`, `<!-- build:js -->` and `<!-- build:browser-warning -->`. |
| jsBundle   | string         | Path to the bundled js file, relative to the output html file. |
| cssBundle  | string         | Path to the bundled css file, relative to the output html file. |
| rootPath   | string         | The root path of the nimiq project structure. Must be an absolute path (e.g. based on __dirname) |
| collectAssets | boolean     | Optional. Collect assets annotated by @asset and add them as a copy to the stream. Paths pointing to that asset will be replaced. |
| distPath   | string         | Optional. Write the bundled file to this path. |

Returns a gulp stream.


### moveAssets

Copy assets and change paths in html, js and css to relative paths to the copied files.

| Parameter  | Type           | Description |
| ---------- | -------------- | ----------- |
| assetPaths | Array.&lt;String&gt;  | A list of assets that should be copied over to the dist folder specified by their path (either absolute to `rootPath` or relative to the project folder) |
| htmlStream | Gulp Stream    | A gulp stream for the HTML to process |
| jsStream   | Gulp Stream    | A gulp stream for the JavaScript to process |
| cssStream  | Gulp Stream    | A gulp stream for the CSS to process |
| rootPath   | string         | The root path of the nimiq project structure. Must be an absolute path (e.g. based on __dirname) |
| distPath   | string         | Optional. Write the bundled file to this path. |

Returns the array `[assetsStream, htmlStream, jsStream, cssStream]`.


## Full Example

```js
const gulp = require('gulp');

const NimiqBuild = require('../../meta/build-process/nimiq-base-gulpfile.js');

gulp.task('build', () => NimiqBuild.build({
    // jsEntry, cssEntry and htmlEntry only have to be specified if you actually have js/css/html
    jsEntry: 'app.js',
    cssEntry: 'app.css',
    htmlEntry: 'index.html',
    assetsPaths: ['images/image.png'],
    rootPath: `${__dirname}/../../`,
    distPath: 'dist'
}));

gulp.task('clean', () => NimiqBuild.cleanBuild('dist'));
```