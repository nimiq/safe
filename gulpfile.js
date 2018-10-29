const gulp = require('gulp');

const NimiqBuild = require('../../meta/build-process/nimiq-base-gulpfile.js');

gulp.task('clean', () => NimiqBuild.cleanBuild('deployment-safe-next/dist'));

gulp.task('build', gulp.series('clean', () => NimiqBuild.build({
    jsEntry: [
        '../../libraries/nimiq-utils/moment/moment.min.js',
        '../../elements/vue-components/lib/vue.min.js', // Production version
        'node_modules/@nimiq/vue-components/dist/NimiqVueComponents.umd.min.js',
        'src/safe.js'
    ],
    cssEntry: [
        'node_modules/@nimiq/vue-components/dist/NimiqVueComponents.css',
        'src/safe.css'
    ],
    htmlEntry: 'src/index.html',
    rootPath: `${__dirname}/../../`,
    distPath: 'deployment-safe-next/dist',
    minify: false
})));

gulp.task('default', gulp.parallel('build'));
