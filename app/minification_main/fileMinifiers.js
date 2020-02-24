import fs from 'fs-extra';
import * as HTMLMinifier from 'html-minifier';
import glob from 'glob-promise';
import path from 'path';
import * as JSMinifier from 'uglify-js';
import CleanCSS from 'clean-css';
import tinify from 'tinify';
import KEYS from '../constants/api_keys';
import eachLimit from 'async/eachLimit';
import { reportingFactory, STEP_ERROR, STEP_SUCCESS } from './utils';
//
export const minifyHTML = async (operatingDirectory) => {
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
  let files = await glob(path.join(operatingDirectory, '**/*.html'));

 try {
   await eachLimit(files, 1, run);
 }catch (err) {
   return reportingFactory(STEP_ERROR, 'ERROR HTML MINIFIER',err);
 }

  return reportingFactory(STEP_SUCCESS, 'HTML MINIFIED');
};
export const minifyJS = async (operatingDirectory) => {
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
  let files = glob(path.join(operatingDirectory, '**/*.js'));
  try {
    await eachLimit(files, 1, run);
  }catch (err) {
    return reportingFactory(STEP_ERROR, 'ERROR JS MINIFIER',err);
  }
  return reportingFactory(STEP_SUCCESS, 'JS MINIFIED');
};
export const minifyCSS = async (operatingDirectory) => {
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
  let files = await glob(path.join(operatingDirectory, '**/*.css'));
  try {
    await eachLimit(files, 1, run);
  }catch (err) {
    return reportingFactory(STEP_ERROR, 'ERROR CSS MINIFIER',err);
  }
  return reportingFactory(STEP_SUCCESS, 'CSS MINIFIED');
};
export const tinifyImages = async (operatingDirectory) => {
  tinify.key = KEYS.TINIFY;
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
  let files = await glob(path.join(operatingDirectory, '**/*.{jpg,png}'));
  try {
    await eachLimit(files, 1, run);
  }catch (err) {
    return reportingFactory(STEP_ERROR, 'ERROR IMAGES MINIFIER',err);
  }
  return reportingFactory(STEP_SUCCESS, 'IMAGES MINIFIED');
};

