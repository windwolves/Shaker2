var gulp = require('gulp');
var del = require('del');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var useref = require('gulp-useref');
var htmlmin = require('gulp-htmlmin');
// var imagemin = require('gulp-imagemin');

var paths = {
    srcDir: 'src',
    distDir: 'dist',
    concat: {
        'js/common.js': ['./src/lib/zepto.js', './src/lib/template.js', './src/lib/swiper.js', './src/js/wechat.js', './src/js/device.js'],
        'entity/join/index.js': ['./src/lib/flow.js', './src/entity/join/index.js', './src/lib/cropper.js']
    },
    js: ['./src/entity/**/*.js', '!./src/entity/join/index.js'],
    html: ['./src/**/*.html'],
    img: ['./src/**/img/*'],
    css: ['./src/**/*.css']
};

// 注册"clean"任务：删除“部署目录”
gulp.task('clean', function(cb) {
    del([paths.distDir], cb);
});

// 注册"concat"任务：合并混淆js文件
gulp.task('concat', function() {
    var tasks = [];

    var func = function(files, key) {
        var task = 'concat-' + key;

        gulp.task(task, ['clean'], function() {
            return gulp.src(files)
                .pipe(concat(key))
                .pipe(uglify())
                .pipe(gulp.dest(paths.distDir));
        });

        tasks.push(task);
    }

    for(var key in paths.concat) {
        func(paths.concat[key], key)
    }

    return tasks;
}());

// 注册"jsmin"任务：混淆压缩js文件
gulp.task('jsmin', ['clean', 'concat'], function() {
    return gulp.src(paths.js, { base: paths.srcDir })
        .pipe(uglify())
        .pipe(gulp.dest(paths.distDir));
});

// 注册"htmlmin"任务：压缩html文件
gulp.task('htmlmin', ['clean'], function() {
    return gulp.src(paths.html)
        .pipe(useref())
        .pipe(htmlmin({
            collapseWhitespace: true,
            minifyJS: true,
            minifyCSS: true
        }))
        .pipe(gulp.dest(paths.distDir));
});

// 注册"imgmin"任务：压缩img文件
gulp.task('imgmin', ['clean'], function() {
    return gulp.src(paths.img)
        // .pipe(imagemin())
        .pipe(gulp.dest(paths.distDir));
});

// 注册"cssmin"任务：压缩css文件
gulp.task('cssmin', ['clean'], function() {
    return gulp.src(paths.css)
        .pipe(gulp.dest(paths.distDir));
});

gulp.task('build', ['clean', 'concat', 'jsmin', 'htmlmin', 'imgmin', 'cssmin']);
