const { src, dest, watch, series } = require(`gulp`);
const sass = require(`gulp-sass`);
const htmlCompressor = require(`gulp-htmlmin`);
const htmlValidator = require(`gulp-html`);
const imageCompressor = require(`gulp-imagemin`);
const browserSync = require(`browser-sync`);
const reload = browserSync.reload;
let browserChoice = `default`;

async function safari () {
    browserChoice = `safari`;
}

async function firefox () {
    browserChoice = `firefox`;
}

async function chrome () {
    browserChoice = `google chrome`;
}

async function opera () {
    browserChoice = `opera`;
}

async function edge () {
    browserChoice = `microsoft-edge`;
}

async function allBrowsers () {
    browserChoice = [
        `safari`,
        `firefox`,
        `google chrome`,
        `opera`,
        `microsoft-edge`
    ];
}

let dev = () => {
    return src(`app/*.html`)
		.pipe(htmlValidator());
};

let build = () => {
    return src(`app/*.html`)
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(`prod/`));
};

let compressImages = () => {
    return src(`dev/img/**/*`)
        .pipe(cache(
            imageCompressor({
                optimizationLevel: 3, // For PNG files. Accepts 0 – 7; 3 is default.
                progressive: true,    // For JPG files.
                multipass: false,     // For SVG files. Set to true for compression.
                interlaced: false     // For GIF files. Set to true for compression.
            })
        ))
        .pipe(dest(`prod/img`));
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

exports.safari = series(safari, serve);
exports.firefox = series(firefox, serve);
exports.chrome = series(chrome, serve);
exports.opera = series(opera, serve);
exports.edge = series(edge, serve);
exports.safari = series(safari, serve);
exports.allBrowsers = series(allBrowsers, serve);
exports.validateHTML = validateHTML;
exports.compressHTML = compressHTML;
exports.compressImages = compressImages;
exports.dev = dev;
exports.build = build;
exports.serve = series(dev, serve);
