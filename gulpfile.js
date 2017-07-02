/**
 *
 *  Web Starter Kit
 *  Copyright 2015 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */

'use strict';

// Include Gulp & Tools We'll Use
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var reload = browserSync.reload;
var ngrok = require('ngrok');
var site = '';

// Lint JavaScript
gulp.task('jshint', function() {
  return gulp.src(['app/js/*.js', 'app/views/*.js'])
    .pipe(reload({stream: true, once: true}))
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.if(!browserSync.active, $.jshint.reporter('fail')));
});


// Optimize Images
gulp.task('images', function() {
  return gulp.src('app/img/*')
    .pipe(gulp.dest('dist/img'))
    .pipe($.size({title: 'images'}));
});
gulp.task('imagemin', function() {
  return gulp.src('app/img/*')
      .pipe($.imagemin())
      .pipe(gulp.dest('dist/img'))
      .pipe($.size({title: 'images'}));
});

// Copy All Files At The Root Level (app)
gulp.task('copy', function() {
  return gulp.src([
    'app/*',
    '!app/*.html',
    'node_modules/apache-server-configs/dist/.htaccess'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'))
    .pipe($.size({title: 'copy'}));
});

// Copy All Filescopy-workerscripts At The Root Level (app)
gulp.task('copy-workerscripts', function() {
  return gulp.src('app/js/*.js')
    .pipe(gulp.dest('dist/js/'))
    .pipe($.size({title: 'copy-workerscripts'}));
});

// Copy Web Fonts To Dist
gulp.task('fonts', function() {
  return gulp.src(['app/fonts/**'])
    .pipe(gulp.dest('dist/fonts'))
    .pipe($.size({title: 'fonts'}));
});

// Compile and Automatically Prefix Stylesheets
gulp.task('styles', function() {

  var AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ];

  // For best performance, don't add Sass partials to `gulp.src`
  return gulp.src([
    'app/sass/*.scss',
    'app/css/*.css'
  ])
    .pipe($.changed('styles', {extension: '.scss'}))
    .pipe($.sass({
      precision: 10,
      onError: console.error.bind(console, 'Sass error:')
    }))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('app/.tmp'))
    // Concatenate And Minify Styles
    .pipe($.if('*.css', $.csso()))
    .pipe(gulp.dest('dist/css/'))
    .pipe($.size({title: 'styles'}));
});

// Concatenate And Minify JavaScript
gulp.task('scripts', function() {
  var sources = ['app/js/*.js',];
  return gulp.src(sources)
    .pipe($.concat('main.js'))
    // .pipe($.uglify({preserveComments: 'some'}))
    // Output Files
    .pipe(gulp.dest('dist/js'))
    .pipe($.size({title: 'scripts'}));
});

// Scan Your HTML For Assets & Optimize Them
gulp.task('html', function() {
  var assets = $.useref.assets({searchPath: '{.tmp,app}'});

  return gulp.src('app/**/**/*.html')
    .pipe(assets)
    // Remove Any Unused CSS
    // Note: If not using the Style Guide, you can delete it from
    // the next line to only include styles your project uses.
    .pipe($.if('*.css', $.uncss({
      html: [
        'app/index.html',
      ],
      // CSS Selectors for UnCSS to ignore
      ignore: []
    })))

    // Concatenate And Minify Styles
    // In case you are still using useref build blocks
    .pipe($.if('*.css', $.csso()))
    .pipe(assets.restore())
    .pipe($.useref())
    // Minify Any HTML
    .pipe($.if('*.html', $.minifyHtml()))
    // Output Files
    .pipe(gulp.dest('dist'))
    .pipe($.size({title: 'html'}));
});

// Clean Output Directory
gulp.task('clean', del.bind(null, ['.tmp', 'dist/*',  '!dist/img','!dist/.git'], {dot: true}));

// Watch Files For Changes & Reload
gulp.task('serve', ['styles'], function() {
  browserSync({
    notify: false,
    // Customize the BrowserSync console logging prefix
    logPrefix: 'WSK',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'app']
  });

  gulp.watch(['app/*.html'], reload);
  gulp.watch(['app/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/js/*.js',], ['jshint']);
  gulp.watch(['app/img/*'], reload);
});
// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], function() {
  browserSync({
    notify: false,
    logPrefix: 'WSK',
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist',
    baseDir: "dist",
    port: 80
  });
});

  // Run ngrok
  gulp.task('ngrok-url', function(cb) {
    return ngrok.connect(80, function (err, url) {
      site = url;
      console.log('serving your tunnel from: ' + site);
      cb();
    });
  });
// Build Production Files, the Default Task
gulp.task('default', ['ngrok-url', 'clean'], function(cb) {
  runSequence('styles', ['html', 'copy-workerscripts'], cb);
});

// Run PageSpeed Insights
// Update `url` below to the public URL for your site
// gulp.task('pagespeed', pagespeed.bind(null, {
//   // By default, we use the PageSpeed Insights
//   // free (no API key) tier. You can use a Google
//   // Developer API key if you have one. See
//   // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
//   url: 'https://da10c93a.ngrok.io',
//   strategy: 'mobile'
// }));
  // gulp.task('pagespeed', function() {
  //   return pagespeed(site, {
  //       // key: key
  //       nokey: 'true',
  //       strategy: 'mobile',
  //   }).then(function (data) {
  //       console.log('Speed score: ' + data.ruleGroups.SPEED.score);
  //       console.log('Usability score: ' + data.ruleGroups.USABILITY.score);
  //   });
  // });


  // psi-sequence
  // gulp.task('psi-seq', function (cb) {
  //   return runSequence(
  //     'ngrok-url',
  //     'pagespeed',
  //     cb
  //     );
  // });

  // exit out of the sequence once it was complete
  // gulp.task('psi', ['psi-seq'], function(){
  //   console.log('Woohoo! Check out your page speed scores!');
  //   process.exit();
  // });
// Load custom tasks from the `tasks` directory
// try { require('require-dir')('tasks'); } catch (err) { console.error(err); }
