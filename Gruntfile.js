var fs = require('fs');

var sassFiles = {};

fs.readdirSync('./src/entity/').forEach(function(dir) {
    sassFiles['src/entity/' + dir + '/css/style.css'] = 'src/entity/' + dir + '/css/style.scss';
});

fs.readdirSync('./src/page/').forEach(function(dir) {
    sassFiles['src/page/' + dir + '/css/style.css'] = 'src/page/' + dir + '/css/style.scss';
});

fs.readdirSync('./src/module/').forEach(function(dir) {
    sassFiles['src/module/' + dir + '/css/main.css'] = 'src/module/' + dir + '/css/main.scss';
});

module.exports = function(grunt) {
    'use strict';

    //grunt config
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        watch: {
            css: {
                files: ['src/**/*.scss'],
                tasks: ['sass:dist']
            },
            js: {
                files: ['Gruntfile.js', 'src/**/*.js'],
                tasks: ['jshint']
            }
        },

        sass: {
            options: {
                cacheLocation: 'src/css/.sass-cache'
            },
            dev: {
                options: {
                    style: 'expanded',
                    lineNumbers: true
                },
                files: sassFiles
            },
            dist: {
                options: {
                    style: 'compressed'
                },
                files: sassFiles
            }
        },

        jshint: {
            options: {
                node: true,
                esnext: true,
                curly: false,
                indent: 4,
                quotmark: 'single',
                expr: true,
                globals: {
                    jQuery: true
                },
                ignores: ['src/lib/**/*.js']
            },
            all: ['Gruntfile.js', 'src/**/*.js']
        }
    });

    //load all grunt tasks
    require('load-grunt-tasks')(grunt);

    //define tasks
    grunt.registerTask('default', ['watch']);
};
