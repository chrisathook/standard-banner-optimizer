import fs from 'fs-extra';
import * as HTMLMinifier from 'html-minifier';
import glob from 'glob-promise';
import path from 'path';
import * as JSMinifier from 'uglify-js';
import CleanCSS from 'clean-css';
import tinify from 'tinify';
import KEYS from '../constants/api_keys';
export const minifyHTML = (operatingDirectory) => {
  return new Promise(((resolve, reject) => {
    let run = async (file) => {
      //console.log('!!!', file);
      let data = await fs.readFile(file, 'utf8');
      data = HTMLMinifier.minify(data, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        html5: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true
      });
      await fs.writeFile(file, data);
    };
    glob(path.join(operatingDirectory, '**/*.html'))
      .then(files => {
        files.forEach(run);
      })
      .then(() => resolve());
  }));
};
export const minifyJS = (operatingDirectory) => {
  return new Promise(((resolve, reject) => {
    let run = async (file) => {
      // console.log('!!!', file);
      let data = await fs.readFile(file, 'utf8');
      data = JSMinifier.minify(data, {
        compress: {
          drop_console: true,
          keep_fnames: true
        }
      }).code;
      await fs.writeFile(file, data);
    };
    glob(path.join(operatingDirectory, '**/*.js'))
      .then(files => {
        files.forEach(run);
      })
      .then(() => resolve());
  }));
};
export const minifyCSS = (operatingDirectory) => {
  return new Promise(((resolve, reject) => {
    let run = async (file) => {
      //console.log('!!!', file);
      let data = await fs.readFile(file, 'utf8');
      let css = new CleanCSS({ returnPromise: true });
      data = await css.minify(data);
      data = data.styles;
      await fs.writeFile(file, data);
    };
    glob(path.join(operatingDirectory, '**/*.css'))
      .then(files => {
        files.forEach(run);
      })
      .then(() => resolve());
  }));
};
export const tinifyImages = (operatingDirectory) => {
  tinify.key = KEYS.TINIFY;
  // console.log('!!', rootPath);
  return new Promise(((resolve, reject) => {
    let run = async (file) => {
      // console.log('!!!', file);
      let data = await fs.readFile(file);
      data = await new Promise(((resolve1, reject1) => {
        tinify.fromBuffer(data).toBuffer((err, resultData) => {
          if (err) {
            throw err;
          }
          resolve1(resultData);
        });
      }));
      await fs.writeFile(file, data);
    };
    glob(path.join(operatingDirectory, '**/*.{jpg,png}'))
      .then(files => {
        files.forEach(run);
      })
      .then(() => resolve());
  }));
};
