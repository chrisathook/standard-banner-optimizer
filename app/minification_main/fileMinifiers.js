import fs from 'fs-extra';
import * as HTMLMinifier from 'html-minifier';
import glob from 'glob-promise';
import path from 'path';
import * as JSMinifier from 'uglify-js';
import CleanCSS from 'clean-css';
import tinify from 'tinify';
import KEYS from '../constants/api_keys';
import eachLimit from 'async/eachLimit';
//
export const minifyHTML = (operatingDirectory) => {
  return new Promise(((resolve, reject) => {
    let run = (file, callback) => {
      //console.log('!!!', file);
      let data = fs.readFileSync(file, 'utf8');
      data = HTMLMinifier.minify(data, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        html5: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true
      });
      fs.writeFileSync(file, data);
      callback();
    };
    glob(path.join(operatingDirectory, '**/*.html'))
      .then(files => {
        return eachLimit(files, 1, run);
      })
      .then(resolve);
  }));
};
export const minifyJS = (operatingDirectory) => {
  return new Promise(((resolve, reject) => {
    let run = (file, callback) => {
      //console.log('!!!', file);
      let data = fs.readFileSync(file, 'utf8');
      let data2 = JSMinifier.minify(data, {
        compress: {
          drop_console: true,
          keep_fnames: true
        }
      }).code;
      fs.writeFileSync(file, data2);
      callback();
    };
    glob(path.join(operatingDirectory, '**/*.js'))
      .then(files => {
        return eachLimit(files, 1, run);
      })
      .then(resolve);
  }));
};
export const minifyCSS = (operatingDirectory) => {
  return new Promise(((resolve, reject) => {
    let run = (file, callback) => {
      //console.log('!!!', file);
      let data = fs.readFileSync(file, 'utf8');
      let css = new CleanCSS({ returnPromise: true });
      css.minify(data)
        .then(result => {
          return result.styles;
        })
        .then((result) => {
          fs.writeFileSync(file, result);
          callback();
        });
    };
    glob(path.join(operatingDirectory, '**/*.css'))
      .then(files => {
        return eachLimit(files, 1, run);
      })
      .then(resolve);
  }));
};
export const tinifyImages = (operatingDirectory) => {
  tinify.key = KEYS.TINIFY;
  return new Promise(((resolve, reject) => {
    let run = (file, callback) => {
      // console.log('!!!', file);
      let data = fs.readFileSync(file);
      tinify.fromBuffer(data).toBuffer((err, resultData) => {
        if (err) {
          throw err;
        }
        fs.writeFileSync(file, resultData);
        callback();
      });
    };
    glob(path.join(operatingDirectory, '**/*.{jpg,png}'))
      .then(files => {
        return eachLimit(files, 1, run);
      })
      .then(resolve);
  }));
};

