const { src, dest, watch, series } = require(`gulp`);
const htmlCompressor = require(`gulp-htmlmin`);
const htmlValidator = require(`gulp-html`);
const browserSync = require(`browser-sync`);
const reload = browserSync.reload;

let dev = () => {
    return src(`app/*.html`)
		.pipe(htmlValidator());	
};

let build = () => {
    return src(`app/*.html`)
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(`prod/`));

};

let serve = () => {
    browserSync({
        notify: true,
        reloadDelay: 0,
        server: {      
            baseDir: [
                `temp`,
                `html`
            ]
        }
    });

    watch(`app/*.html`, series(dev)).on(`change`, reload);
};

exports.dev = dev;
exports.build = build;
exports.serve = series(dev, serve);