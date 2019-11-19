const { src, dest, watch, series } = require(`gulp`);
const del = require(`del`);
const sass = require(`gulp-sass`);
const HTMLPreprocessor = require(`gulp-nunjucks-render`);
const data = require(`gulp-data`);
const fs = require(`fs`);
const htmlCompressor = require(`gulp-htmlmin`);
const htmlValidator = require(`gulp-html`);
const imageCompressor = require(`gulp-imagemin`);
const browserSync = require(`browser-sync`);
const reload = browserSync.reload;
const TEMP_FOLDER = `.tmp/`;
const VIEWS_FOLDER = `app/views/`;
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

let compileHTML = () => {
    HTMLPreprocessor.nunjucks.configure({watch: false});

    return src(`app/views/html/nunjuck/contact.html`)
		.pipe(data(function () {
				return JSON.parse(fs.readFileSync(`./app/models/links-file.json`));
		}))
		.pipe(HTMLPreprocessor())
		.pipe(dest('prod/'));
};

let dev = () => {
    return src(`app/views/*.html`)
		.pipe(htmlValidator());
};

let build = () => {
    return src(`app/views/*.html`)
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(`prod/`));
};

let cssDev = () => {
    return src(`app/views/styles/*.scss`)
        .pipe(sass({
            outputStyle: `expanded`,
            precision: 10
        }).on(`error`, sass.logError))
        .pipe(dest(`temp/styles`));
};

let cssProd = () => {
    return src(`app/views/styles/*.scss`)
        .pipe(sass({
            outputStyle: `compressed`,
            precision: 10
        }).on(`error`, sass.logError))
        .pipe(dest(`prod/styles`));
};

let compressImages = () => {
    return src(`app/views/img/**/*`)
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
                `TEMP_FOLDER`,
                `VIEWS_FOLDER`
            ]
        }
    });
		watch([
				`./app/views/*.html`,
        `./app/views/css/*.css`,
        `./app/controllers/*.*`,
        `./app/controllers/**/**`,
        `./app/models/*.json`
			],
        series(compileHTML)
    ).on(`change`, reload);
};

exports.safari = series(safari, serve);
exports.firefox = series(firefox, serve);
exports.chrome = series(chrome, serve);
exports.opera = series(opera, serve);
exports.edge = series(edge, serve);
exports.safari = series(safari, serve);
exports.allBrowsers = series(allBrowsers, serve);
exports.compressImages = compressImages;
exports.cssDev = cssDev;
exports.cssProd = cssProd;
exports.dev = dev;
exports.build = build;
exports.compileHTML = compileHTML;
exports.serve = series(compileHTML, serve);
