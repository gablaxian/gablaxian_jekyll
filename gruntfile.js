module.exports = function(grunt) {

    require('jit-grunt')(grunt, {
        'cssmetrics': 'grunt-css-metrics',
        'sass': 'grunt-sass'
    });

    // 1. All configuration goes here 
    grunt.initConfig({
        env: 'dist',
        pkg: grunt.file.readJSON('package.json'),
        clean: {},

        watch: {
            options: {
                livereload: false,
            },
            css: {
                files: ['assets/sass/**/*.scss'],
                tasks: ['css', 'js']
            },
            js: {
                files: ['assets/js/*.js'],
                tasks: ['css', 'js']
            },
        },

        // concat: {
        //     dist: {
        //         src: [
        //             'assets/js/*.js', // All JS in the libs folder
        //         ],
        //         dest: 'assets/build/js/production.js',
        //     }
        // },

        clean: ['assets/build/css', 'assets/build/js'],

        uglify: {
            dist: {
                src: ['assets/js/*.js'],
                dest: 'assets/build/js/production.min.js'
            }
        },

        sass: {
            dist: {
                options: {
                    outputStyle: 'compressed',
                    sourceMap: false
                },
                files: {
                    'assets/build/css/all.css': 'assets/sass/build.scss'
                }
            } 
        },

        autoprefixer: {
            options: {
                browsers: ['last 2 versions','> 5%']
            },
            dist: {
                src: 'assets/build/css/all.css',
                dest: 'assets/build/css/all.css'
            },
          },

        concurrent: {
            first: ['css', 'js']
        }

    });

    // Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('css', ['sass', 'autoprefixer']);
    grunt.registerTask('js', ['uglify']);

    grunt.registerTask('default', ['concurrent:first']);

};