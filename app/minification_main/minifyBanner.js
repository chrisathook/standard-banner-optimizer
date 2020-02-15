// @flow
import fs from 'fs-extra';
import moment from 'moment';
import path from 'path';
import glob from 'glob-promise';
import * as HTMLMinifier from 'html-minifier';
function copySource(sourcePath, destPath) {
  return new Promise(((resolve, reject) => {
    let timestamp = moment().format('YYYYMMDD_HHmmSS');
    let finalPath = path.join(destPath, timestamp);
    try {
      fs.copySync(sourcePath, finalPath);
      console.log('success!');
    } catch (err) {
      console.error(err);
      reject();
    }
    resolve(finalPath);
  }));
}
function minifyHTML(rootPath) {
  return new Promise(((resolve, reject) => {
    let run = async (file) => {
      console.log('!!!', file);
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
    glob(path.join(rootPath, '**/*.html'))
      .then(files => {
        files.forEach(run);
      })
      .then(resolve);
  }));
}
function nullPromise(...args) {
  return Promise.resolve(...args);
}
export default (event, config) => {
  return new Promise(((resolve, reject) => {
    const { sourcePathText, outputPathText, htmlMinOption } = config;
    copySource(sourcePathText, outputPathText)
      .then(htmlMinOption ==='true' ? minifyHTML : nullPromise)
      .then(resolve);
  }));
};
