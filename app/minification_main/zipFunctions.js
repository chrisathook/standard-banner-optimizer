import path from 'path';
import fs from 'fs-extra';
import archiver from 'archiver';
import eachLimit from 'async/eachLimit';
import delay from 'delay';
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
  await eachLimit(files, 1, makeZip);
  return reportingFactory(STEP_SUCCESS, 'ZIPS CREATED');
};
export const copyZips = async (sourcePath, destPath) => {
  await delay(500);
  try {
    fs.mkdirSync(destPath);
    fs.copySync(sourcePath, destPath);
  } catch (err) {
    return reportingFactory(STEP_ERROR, 'ERROR MOVING ZIPS', err);
  }
  await delay(500);
  return reportingFactory(STEP_SUCCESS, 'ZIPS MOVED');
};
