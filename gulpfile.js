
/*************************************
 *  Packages
 *************************************/

const gulp        = require('gulp');
const concat      = require('gulp-concat');
const uglify      = require('gulp-uglify');
const babel       = require('gulp-babel');
const sourcemaps  = require('gulp-sourcemaps');
const sass        = require('gulp-sass');
const autoprefix  = require('gulp-autoprefixer');
const watch       = require('gulp-watch');
const del         = require('del');

/*************************************
 *  Tasks
 *************************************/

// SASS

gulp.task('sass', function () {
    del(['./source/assets/css/*']);

    gulp.src('./assets/sass/build.scss')
        .pipe(autoprefix('last 2 version'))
        .pipe(
            sass({outputStyle: 'compressed'})
            .on('error', sass.logError)
        )
        .pipe(gulp.dest('./source/assets/css'));
});

// JS

gulp.task('js', function () {
    del(['./source/assets/js/*']);
    gulp.src([

            './assets/js/core.js',
            './assets/js/main.js'
        ])

        .pipe(sourcemaps.init())
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(concat('main.js'))
            .pipe(uglify())
        .pipe(sourcemaps.write('./'))

        .pipe(gulp.dest('./source/assets/js'))
});

// Watchers

gulp.task('sass:watch', function () {
    gulp.watch('./assets/sass/**/*.scss', ['sass']);
});

gulp.task('js:watch', function () {
    gulp.watch('./assets/js/**/*.js', ['js']);
});

/*************************************
 *  Grouped Tasks
 *************************************/

gulp.task('watch', ['sass:watch','js:watch']);
gulp.task('default', ['sass','js']);
