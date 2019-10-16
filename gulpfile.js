const { src, dest } = require(`gulp`);
const htmlCompressor = require(`gulp-htmlmin`);

let compressHTML = () => {
    return src(`app/*.html`)
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(`prod/`));
}

let validateHTML = () => {
    return src(`html/*.html`)
        .pipe(dest(`app/`));
		
}

gulp dev = validateHTML;
gulp build = compressHTML;