import moment from 'moment';
import path from 'path';
import fs from 'fs-extra';
import glob from 'glob-promise';
import cheerio from 'cheerio';
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
export const getBannerDimensions = (filePath) => {
  let fileData = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(fileData);
  let sizing: string = $(`meta[name='ad.size']`).attr('content');
  const width = Number(sizing.split(',')[0].split('=')[1]);
  const height = Number(sizing.split(',')[1].split('=')[1]);
  console.log(width, height);
  return { width, height };
};
