// @flow
import fs from 'fs-extra';
import moment from 'moment';
import path from 'path';
function copySource(sourcePath, destPath) {
  return new Promise(((resolve, reject) => {
    let timestamp = moment().format('MMDDYYYYHHmmSS');
    try {
      fs.copySync(sourcePath, path.join(destPath, timestamp));
      console.log('success!');
    } catch (err) {
      console.error(err);
      reject();
    }
    resolve();
  }));
}
export default (event, config) => {
  return new Promise(((resolve, reject) => {
    const { sourcePathText, outputPathText } = config;
    copySource(sourcePathText, outputPathText)
      .then(resolve);
  }));
};
