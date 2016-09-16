var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var gulp = require('gulp');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');
var sass = require('gulp-ruby-sass');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
gulp.task('sass-cmarp', function(){
	return sass('sass/main.sass', {sourcemap: true})
		.on('error', sass.logError)
		.pipe(cleanCSS())
		.pipe(autoprefixer({
			browsers: ['last 10 versions'],
			cascade: false
		}))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(sourcemaps.write('./', {
			includeContent: false,
			sourceRoot: 'sass/main.sass'
		}))
		.pipe(gulp.dest('css'))
		.pipe(browserSync.stream({match: '**/*.css'}));
});
gulp.task('deal-js', function(){
	return gulp.src([
			'js/main.js'
		])
		.pipe(sourcemaps.init())
		.pipe(concat('all.min.js'))
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('js/'))
});
gulp.task('default', function(){
	gulp.start('sass-cmarp', 'deal-js');
	browserSync.init({
		server: {
			baseDir: './'
		}
	});
	gulp.watch('sass/*.sass', ['sass-cmarp']);
	gulp.watch(['js/*.js', '!js/all.min.js'], ['deal-js']);
	gulp.watch('js/all.min.js').on('change', browserSync.reload);
	gulp.watch('**/*.html').on('change', browserSync.reload);
});