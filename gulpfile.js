const gulp = require('gulp');

const NimiqBuild = require('../../meta/build-process/nimiq-base-gulpfile.js');

gulp.task('clean', () => NimiqBuild.cleanBuild('deployment-safe-next/dist'));

gulp.task('build', gulp.series('clean', () => NimiqBuild.build({
    jsEntry: [
        '../../libraries/nimiq-utils/moment/moment.min.js',
        '../../elements/vue-components/lib/vue.min.js', // Production version
        '../../elements/vue-components/lib/vue-async-computed.js',
        '../../elements/vue-components/dist/NimiqComponents.umd.min.js',
        'src/safe.js'
    ],
    cssEntry: [
        '../../elements/vue-components/dist/NimiqComponents.css',
        'src/safe.css'
    ],
    htmlEntry: 'src/index.html',
    rootPath: `${__dirname}/../../`,
    distPath: 'deployment-safe-next/dist',
    minify: false
})));

gulp.task('build-network-client', () => NimiqBuild.bundleJs(
    './src/network-client.js',
    `${__dirname}/../../`,
    false,
    true,
    'dist',
));

gulp.task('default', gulp.parallel('build', 'build-network-client'));
