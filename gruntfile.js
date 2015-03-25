module.exports = function(grunt) {

    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            dist: {
                src: [
                    'assets/js/*.js', // All JS in the libs folder
                ],
                dest: 'assets/build/js/production.js',
            }
        },

        uglify: {
            build: {
                src: 'assets/build/js/production.js',
                dest: 'assets/build/js/production.min.js'
            }
        },

        sass: {
            dist: {
                files: {
                    'assets/build/css/main.css': 'assets/css/main.scss'
                }
            } 
        },

        watch: {
            options: {
                livereload: true,
            },
            css: {
                files: ['assets/css/*.scss'],
                tasks: ['css']
            },
            js: {
                files: ['assets/js/*.js'],
                tasks: ['js'],
                options: {
                    spawn: false,
                },
            },
            grunt: {
                files: ['gruntfile.js'],
                tasks: ['default']
            } 
        }

    });

    // 3. Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('css', ['sass']);
    grunt.registerTask('js', ['concat', 'uglify']);

    grunt.registerTask('default', ['css', 'js']);

};