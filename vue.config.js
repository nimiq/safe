const CopyWebpackPlugin = require('copy-webpack-plugin');
const WriteFileWebpackPlugin = require('write-file-webpack-plugin');
const path = require('path');
const fs = require('fs');
const browserWarning = fs.readFileSync(__dirname + '/node_modules/@nimiq/browser-warning/dist/browser-warning.html.template');

const buildName = process.env.build
    ? process.env.build
    : process.env.NODE_ENV === 'production'
        ? 'testnet'
        : 'local';

console.log('Building for:', buildName);

const configureWebpack = {
    plugins: [
        new CopyWebpackPlugin([
            { from: 'node_modules/@nimiq/vue-components/dist/img', to: 'img' },
            { from: 'node_modules/@nimiq/browser-warning/dist', to: './' }
        ]),
        new WriteFileWebpackPlugin()
    ],
    // Resolve config for yarn build
    resolve: {
        alias: {
            config: path.join(__dirname, `src/config/config.${buildName}.ts`)
        }
    },
    // Fix sourcemaps (https://www.mistergoodcat.com/post/the-joy-that-is-source-maps-with-vuejs-and-typescript)
    devtool: 'eval-source-map',
    output: {
        devtoolModuleFilenameTemplate: info => {
            var $filename = 'sources://' + info.resourcePath;
            if (info.resourcePath.match(/\.vue$/) && !info.query.match(/type=script/)) {
                $filename = 'webpack-generated:///' + info.resourcePath + '?' + info.hash;
            }
            return $filename;
        },
        devtoolFallbackModuleFilenameTemplate: 'webpack:///[resource-path]?[hash]'
    },
    devServer: {
        port: 8888,
        clientLogLevel: 'warn'
    }
};

module.exports = {
    pages: {
        index: {
            // entry for the page
            entry: 'src/safe.js',
            // the source template
            template: 'src/index.html',
            // insert browser warning html templates
            browserWarning,
            // output as dist/index.html
            filename: 'index.html',
            // chunks to include on this page, by default includes
            // extracted common chunks and vendor chunks.
            chunks: ['chunk-vendors', 'chunk-common', 'index']
        }
    },
    configureWebpack,
    pluginOptions: {
        uglifyOptions: {
            mangle: false,
            keep_classnames: true,
            keep_fnames: true,
        }
    },
    chainWebpack: config => {
        config.module
            .rule('ts')
            .use('ts-loader')
            .loader('ts-loader')
            .tap(options => {
                options.configFile = `tsconfig.${buildName}.json`;
                return options;
            });
    }
}
