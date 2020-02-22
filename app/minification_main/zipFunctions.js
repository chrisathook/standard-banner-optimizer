import path from 'path';
import fs from 'fs-extra';
import archiver from 'archiver';
import eachLimit from 'async/eachLimit';
import { findAllBannerFolderRoots, getClosetFolderFromPath } from './utils';
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
export const makeZips = (operatingDirectory) => {
  return new Promise(((resolve, reject) => {
    // find all banners
    findAllBannerFolderRoots(operatingDirectory)
      .then(files => {
        return eachLimit(files, 1, makeZip);
      })
      .then(resolve);
  }));
};
export const copyZips = (sourcePath, destPath) => {
  return new Promise((resolve => {
    setTimeout(() => {
      fs.mkdirSync(destPath);
      fs.copySync(sourcePath, destPath);
      // give OS time to finish updating file system
      setTimeout(() => {
        resolve();
      }, 500);
    }, 500);
  }));
};
