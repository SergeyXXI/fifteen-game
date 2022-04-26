const gulp = require("gulp");
const sass = require("gulp-sass")(require('sass'));
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const autoprefixer = require("autoprefixer");
const postcss = require("gulp-postcss");

const dist = "dist/";
const distCss = `${dist}/css/`;

const srcScss = "src/scss/index.scss",      
      srcJs   = "src/js/main.js",
      distJs  = "js/index.js";

function scss()
{
    return gulp.src(srcScss)
               .pipe(sass().on("error", sass.logError))
               .pipe(postcss([autoprefixer()]))                
               .pipe(gulp.dest(distCss));  
}

function js()
{
    return gulp.src(srcJs)
               .pipe(webpackStream(
                   {
                        mode: "development",
                        output: { filename: distJs },
                        devtool: "source-map",
                        module:
                        {
                            rules:
                            [
                                {
                                    test: /\.m?js$/,
                                    exclude: /node_modules/,                                    
                                    use:
                                    {
                                        loader: "babel-loader",
                                        options:
                                        {
                                            presets: ['@babel/preset-env']
                                        }
                                    }
                                }
                            ]
                        }
                   }, webpack))               
               .pipe(gulp.dest(dist)); 
}

function production()
{
    gulp.src(srcJs)
        .pipe(webpackStream(
            {
                mode: "production",
                output: { filename: distJs },                
                module:
                {
                    rules:
                    [
                        {
                            test: /\.m?js$/,                                    
                            use:
                            {
                                loader: "babel-loader",
                                options:
                                {
                                    presets: ['@babel/preset-env']
                                }
                            }
                        }
                    ]
                }
            }, webpack))               
        .pipe(gulp.dest(dist));     
    
    return gulp.src(srcScss)
               .pipe(sass().on("error", sass.logError))
               .pipe(postcss([autoprefixer()]))               
               .pipe(gulp.dest(distCss));

}

function watch()
{       
    gulp.watch("src/scss/*.scss", scss);
    gulp.watch("src/js/*.js", js);
    
}

module.exports =
{
    scss, watch, production,
    default: gulp.series(scss, js, watch)
};
