var gulp        = require('gulp');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var sourcemaps  = require('gulp-sourcemaps');
var sass        = require('gulp-sass');
var autoprefix  = require('gulp-autoprefixer');
var watch       = require('gulp-watch');
var del         = require('del');


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

gulp.task('js', function () {
    del(['./source/assets/js/*']);
    gulp.src([

            './assets/js/core.js',
            './assets/js/main.js'
        ])

        .pipe(sourcemaps.init())
            .pipe(concat('main.js'))
            .pipe(uglify())
        .pipe(sourcemaps.write('./'))

        .pipe(gulp.dest('./source/assets/js'))
});

gulp.task('sass:watch', function () {
    gulp.watch('./assets/sass/**/*.scss', ['sass']);
});

gulp.task('js:watch', function () {
    gulp.watch('./assets/js/**/*.js', ['js']);
});

// main tasks
gulp.task('watch', ['sass:watch','js:watch']);
gulp.task('default', ['sass','js']);
