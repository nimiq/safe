const gulp = require('gulp');

const argv = require('yargs').argv;

const NimiqBuild = require('../../meta/build-process/nimiq-base-gulpfile.js');

gulp.task('build', () => NimiqBuild.build(
    'src/safe.js',
    'src/safe.css',
    'src/index.html',
    [],
    `${__dirname}/../../`,
    'dist',
    argv.config,
    true
));