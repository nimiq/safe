const gulp = require('gulp');

const NimiqBuild = require('../../meta/build-process/nimiq-base-gulpfile.js');

gulp.task('build', () => NimiqBuild.build({
    jsEntry: 'src/safe.js',
    cssEntry: 'src/safe.css',
    htmlEntry: 'src/index.html',
    rootPath: `${__dirname}/../../`,
    distPath: 'dist',
    minify: false
}));

gulp.task('default', ['build']);
