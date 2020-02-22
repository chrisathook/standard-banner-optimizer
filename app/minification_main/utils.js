import moment from 'moment';
import path from 'path';
import fs from 'fs-extra';
import glob from 'glob-promise';
export const copySource = (sourcePath, destPath) => {
  return new Promise(((resolve, reject) => {
    try {
      fs.copySync(sourcePath, destPath);
      //console.log('success!');
    } catch (err) {
      console.error(err);
      reject();
    }
    resolve();
  }));
};
/**
 * takes in path and finds all banner roots assuming index.html file
 * @param targetPath {string}
 * @returns {Promise<object[]>}
 */
export const findAllBannerFolderRoots = (targetPath) => {
  return new Promise((resolve, reject) => {
    glob(path.join(targetPath, '**/index.html'))
      .then(files => {
        resolve(files.map(path.parse));
      });
  });
};
/**
 *
 * @param path {string}
 * @returns {string}
 */
export const getClosetFolderFromPath = (path: string) => {
  return path.split('/').slice(-1).pop();
};
