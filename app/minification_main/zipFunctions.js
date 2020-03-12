import path from 'path';
import fs from 'fs-extra';
import archiver from 'archiver';
import eachLimit from 'async/eachLimit';
import delay from 'delay';
import { isAbsoluteLinuxPath, isAbsoluteWindowsPath } from 'path-validation';
import {
  findAllBannerFolderRoots,
  getClosetFolderFromPath,
  reportingFactory,
  STEP_ERROR,
  STEP_SUCCESS
} from './utils';
const makeZip = (bannerRootParse, callback) => {
  const { dir, root, base, name, ext } = bannerRootParse;
  const closestFolder = getClosetFolderFromPath(dir);
  const zipName = path.join(dir, `${closestFolder}.zip`);
  const output = fs.createWriteStream(zipName);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });
  output.on('close', function() {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
    callback();
  });
  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.warn(err);
    } else {
      // throw error
      throw err;
    }
  });
  archive.on('error', function(err) {
    throw err;
  });
  output.on('end', function() {
    console.log('Data has been drained');
  });
  archive.pipe(output);
  archive.glob(
    path.join('**/*.{html,jpg,png,svg,js,css}'),
    {
      cwd: dir,
      root: dir
    });
  archive.finalize();
};
export const makeZips = async (operatingDirectory) => {
  // find all banners
  let files = await findAllBannerFolderRoots(operatingDirectory);
  try {
    await eachLimit(files, 1, makeZip);
  } catch (err) {
    return reportingFactory(STEP_ERROR, 'ERROR DURING ZIPS CREATION', err);
  }
  return reportingFactory(STEP_SUCCESS, 'ZIPS CREATED');
};
export const copyZips = async (sourcePath, destPath) => {
  await delay(500);
  try {
    //fs.mkdirSync(destPath);
    let options = {
      filter: (src, dest) => {
        console.log(src);
        return !(src.search('.jpg') !== -1 ||
          src.search('.svg') !== -1 ||
          src.search('.png') !== -1 ||
          src.search('.css') !== -1 ||
          src.search('.html') !== -1 ||
          src.search('.js') !== -1);
      }
    };
    fs.copySync(sourcePath, destPath);
    await delay(500);
  } catch (err) {
    return reportingFactory(STEP_ERROR, 'ERROR MOVING ZIPS', err);
  }
  return reportingFactory(STEP_SUCCESS, 'ZIPS MOVED');
};
