const gulp = require('gulp');

const NimiqBuild = require('../../meta/build-process/nimiq-base-gulpfile.js');

gulp.task('clean', () => NimiqBuild.cleanBuild('deployment-safe/dist'));

gulp.task('build', ['clean'], () => NimiqBuild.build({
    jsEntry: 'src/safe.js',
    cssEntry: 'src/safe.css',
    htmlEntry: 'src/index.html',
    rootPath: `${__dirname}/../../`,
    distPath: 'deployment-safe/dist',
    minify: false
}));

gulp.task('default', ['build']);
