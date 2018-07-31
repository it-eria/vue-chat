// Imports
import gulp from 'gulp';
import wait from 'gulp-wait';
import globSass from 'gulp-sass-glob';
import sourcemap from 'gulp-sourcemaps';
import sass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import cleanCSS from 'gulp-clean-css';
import del from 'del';
import browserSync from 'browser-sync';
import sysConfig from './system-config.json';

// Variables
let bs = browserSync.create();

// Tasks
// Cleaners from build folder
export const cleanStyles = () => del(sysConfig.paths.clear.styles);
export const cleanHtml = () => del(sysConfig.paths.clear.html);
export const cleanImages = () => del(sysConfig.paths.clear.images);
export const cleanFonts = () => del(sysConfig.paths.clear.fonts);
export const cleanBuild = () => del(sysConfig.paths.clear.build);

// Compile styles
export function styles() {
  return gulp.src(sysConfig.paths.src.scss+'style.scss')
        .pipe(wait(500))
        .pipe(globSass())
        .pipe(sourcemap.init())
          .pipe(sass().on('error', sass.logError))
          .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
          }))
        .pipe(sourcemap.write())
        .pipe(gulp.dest(sysConfig.paths.build.css))
        .pipe(browserSync.stream());
}

export function html() {
  return gulp.src(sysConfig.paths.src.html+'*.html')
        .pipe(gulp.dest(sysConfig.paths.build.html))
        .pipe(browserSync.stream());
}

// Move images
export function images() {
  return gulp.src(sysConfig.paths.src.img+'**/*.*')
        .pipe(gulp.dest(sysConfig.paths.build.img))
        .pipe(browserSync.stream());
}

// Move fonts
export function fonts() {
  return gulp.src(sysConfig.paths.src.fonts+'**/*.*')
        .pipe(gulp.dest(sysConfig.paths.build.fonts))
        .pipe(browserSync.stream());
}

// Start Server
export function serverStart() {
  bs.init(sysConfig.serverConf);
}

export function serverReload(done) {
  bs.reload();
  return done();
}

// Watch
export function watch() {
  // Styles
  gulp.watch([sysConfig.paths.watch.scss], gulp.series(cleanStyles, styles, serverReload));
  // HTML
  gulp.watch([sysConfig.paths.watch.html], gulp.series(cleanHtml, html ,serverReload));
  // Images
  gulp.watch([sysConfig.paths.watch.img], gulp.series(cleanImages, images, serverReload));
  // Fonts
  gulp.watch([sysConfig.paths.watch.fonts], gulp.series(cleanFonts, fonts, serverReload));
}

// Build Task
gulp.task('build', gulp.series(
  cleanBuild,
  gulp.parallel(styles, html, fonts, images)
));

// Dev Task
gulp.task('dev', gulp.series(
  styles,
  html,
  fonts,
  images,
  gulp.parallel(watch, serverStart)
));