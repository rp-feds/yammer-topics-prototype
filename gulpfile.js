/// <vs SolutionOpened='watch' />

// Plugins
// -------------------------------------------------------------
var gulp = require("gulp"); // duh
var jshint = require("gulp-jshint"); // lints JS
var uglify = require("gulp-uglify"); // minifies JS
var less = require("gulp-less"); // compiles LESS
var minify = require("gulp-minify-css"); // minifies CSS
var autoprefixer = require('gulp-autoprefixer'); // adds vendor prefixes to CSS
var del = require("del"); // delete files
var handlebars = require('gulp-compile-handlebars'); // compliles Handlebar templates
var rename = require("gulp-rename"); // renames files
var concat = require("gulp-concat"); // combines files
var plumber = require('gulp-plumber'); // prevents pipe breaking from plugins
var livereload = require("gulp-livereload"); // reloads browser
var notify = require("gulp-notify"); // writes output, creates toasts
var map = require("map-stream"); // constructs pipes of streams and events
var beep = require("beepbeep"); // emits system noise
var inject = require("gulp-inject"); // adds script/link tags to cshtml
var reveasy = require("gulp-rev-easy"); // appends revision querystrings to file paths
var ifpipe = require("gulp-if"); // logic branching for pipes
var stylish = require("jshint-stylish"); // fancy output for jshint
var sourcemaps = require("gulp-sourcemaps"); // For creating sourcemaps
var babel = require("gulp-babel"); // for gulp compling

// Configuration
// -------------------------------------------------------------
var options = {
    watching: false
};

var paths = {
    js: "./src/scripts/**/*.js",
    less: "./src/styles/**/*.less",
    templates: "./src/views/**/*.handlebars",
    dist: "./dist"
};

// Error handling
// -------------------------------------------------------------
var gulp_src = gulp.src;
gulp.src = function () {
    return gulp_src.apply(gulp, arguments)
      .pipe(plumber(function (error) { errorHandler(error); })
    );
};

var finalizeError = function () {
    // if watching, just show and keep running
    // otherwise, fail (i.e. build server) 
    if (options.watching) {
        beep();
        notify("Error has occured. Please check the console output.");
        this.emit("end");
    } else {
        process.exit(1);
    }
}

var writeMsBuildError = function (e) {
    var filename = e.filename || e.fileName || "";
    var line = e.line || e.lineNumber || 0;
    var column = e.column || 0;
    var message = e.message || "";
    var errorMessage = filename + ' (' + line + ',' + column + '): ' + 'ERROR: ' + message;

    console.log(errorMessage);
}

var errorHandler = function (e) {
    writeMsBuildError(e);
    finalizeError();
};

var jshintErrorHandler = map(function (file, cb) {
    if (!file.jshint.success) {
        file.jshint.results.forEach(function (r) {
            if (r) {
                writeMsBuildError({
                    filename: r.file,
                    line: r.error.line,
                    column: r.error.character,
                    message: r.error.code + ': ' + r.error.reason
                });
            }
        });

        finalizeError();
    }
    cb(null, file);
});

var isBuild = function () {
    return !isWatch();
};

var isWatch = function () {
    return options.watching === true;
}

// Tasks
// -------------------------------------------------------------
gulp.task("lint:js", function () {
    return gulp.src(paths.js)
        .pipe(jshint())
        .pipe(ifpipe(isBuild(), jshintErrorHandler))
        .pipe(ifpipe(isWatch(), jshint.reporter(stylish)))
        .on("error", errorHandler);
});

gulp.task("compile:js", function () {
    return gulp.src([
        "./src/scripts/**/*.js"
    ])
        .pipe(sourcemaps.init())
        .pipe(babel())
        .pipe(concat("scripts.js"))
        .pipe(gulp.dest(paths.dist + '/scripts/'))
        .pipe(rename("scripts.min.js"))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .on("error", errorHandler)
        .pipe(gulp.dest(paths.dist + '/scripts/'))
        .pipe(livereload());
});

gulp.task("compile:less", function () {
    return gulp.src([
        "./src/styles/yammer.less"
    ])
        .pipe(less())
        .pipe(autoprefixer('last 10 versions', 'ie 8'))
        .pipe(concat("styles.css"))
        .pipe(gulp.dest(paths.dist + '/styles/'))
        .pipe(minify({ compatibility: 'ie8', keepBreaks: false }))
        .pipe(concat("styles.min.css"))
        .pipe(gulp.dest(paths.dist + '/styles/'))
        .pipe(livereload());
});

gulp.task("compile:views", function () {
    var options = {
            ignorePartials: true,
            batch: [ "./src/views/partials" ]
        };

    return gulp.src([
        paths.templates,
        "!./src/views/partials/*.handlebars"
    ])
        .pipe(handlebars(null, options))
        .pipe(rename({ extname: '.html' }))
        .pipe(gulp.dest(paths.dist));
});


gulp.task("clean:views", function() {
    return del(paths.dist + "**/*.html");
});

gulp.task("clean:js", function () {
    return del(paths.dist + "/scripts/*.js");
});

gulp.task("clean:css", function () {
    return del(paths.dist + "/styles/*.css");
});

gulp.task("watch", function () {
    livereload.listen();
    options.watching = true;

    gulp.watch(paths.js, ["clean:js", "lint:js", "compile:js"]);
    gulp.watch(paths.less, ["clean:css", "compile:less"]);
    gulp.watch(paths.templates, ["clean:views", "compile:views"]);
});

gulp.task("default", ["clean", "lint", "compile"]);
gulp.task("build", ["clean", "lint", "compile"]);
gulp.task("lint", ["lint:js"]);
gulp.task("compile", ["compile:js", "compile:less", "compile:views"]);
gulp.task("clean", ["clean:views", "clean:js", "clean:css"]);
