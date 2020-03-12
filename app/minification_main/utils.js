import moment from 'moment';
import path from 'path';
import fs from 'fs-extra';
import glob from 'glob-promise';
import cheerio from 'cheerio';
import deleteEmpty from 'delete-empty';
export const copySource = async (sourcePath, destPath) => {
  try {
    fs.copySync(sourcePath, destPath, {
      filter: (file) => {
        const ext = path.parse(file).ext;
        const allowed = ['.html', '.jpg', '.css', '.js', '.png', '.svg', '.json',''];
        let isAllowed = false;
        allowed.forEach(item => {
          if (ext === item) {
            isAllowed = true;
          }
        });
        return isAllowed;
      }
    });
    //console.log('success!');
  } catch (err) {
    return reportingFactory(STEP_ERROR, 'ERROR COPYING SOURCE', err);
  }
  return reportingFactory(STEP_SUCCESS, 'SOURCE COPY SUCCESSFUL');
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
export const STEP_ERROR = 'STEP_ERROR';
export const STEP_SUCCESS = 'STEP_SUCCESS';
export const reportingFactory = (status: string, message: string = '', data: Object = {}) => {
  return {
    status,
    message,
    data,
    isError: status !== STEP_SUCCESS
  };
};
export const cleanUp = async (finalBannerPath, finalZipPath) => {
  let files = await glob(path.join(finalZipPath, '**/*.{html,jpg,png,svg,js,css}'));
  files.forEach(file => {
    //console.log('111 delete file', file);
    fs.removeSync(file);
  });
  await deleteEmpty(finalZipPath);
  let files2 = await glob(path.join(finalBannerPath, '**/*.zip'));
  files2.forEach(file => {
    //console.log('111 delete file', file);
    fs.removeSync(file);
  });
  let files3 = await glob(path.join(finalZipPath, '**/*.jDg'));
  files3.forEach(file => {
    //console.log('111 delete file', file);
    fs.renameSync(file, file.replace('jDg', 'jpg'));
  });
  return reportingFactory(STEP_SUCCESS, 'CLEAN UP SUCCESS');
};
