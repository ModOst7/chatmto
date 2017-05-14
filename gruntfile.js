module.exports = function(grunt) {

    // 1. Вся настройка находится здесь
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: [
                'public/js/lib/*.js',
                'public/js/models/*.js',
                'public/webSocket.js',
                'public/js/collections/*.js',              
                'public/js/views/*.js'
                ],
                dest: 'public/production.js'
            }
        },

        uglify: {
            build: {
                src: 'public/production.js',
                dest: 'public/production.min.js'
            }
        },

        imagemin: {
            dynamic: {
                files: [{
                    expand: true,
                    cwd: 'public/img/',
                    src: ['**/*.{png,jpg,gif}'],
                    dest: 'public/img/adaptive'
                }]
            }
        },

        watch: {
            scripts: {
                files: [
                'public/js/lib/*.js',
                'public/js/models/*.js',
                'public/webSocket.js',
                'public/js/collections/*.js',              
                'public/js/views/*.js'
                ],
                tasks: ['concat', 'uglify'],
                options: {
                    spawn: false
                }
            },
            css: {
                files: ['public/assets/*.scss'],
                tasks: ['sass'],
                options: {
                    spawn: false
                }
            }
        },

        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'public/assets/user.css': 'public/assets/user.scss',
                    'public/assets/admin.css': 'public/assets/admin.scss'
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.registerTask('default', ['concat', 'uglify', 'imagemin', 'sass', 'watch']);

};