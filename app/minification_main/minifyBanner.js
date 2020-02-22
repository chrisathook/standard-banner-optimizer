// @flow
import fs from 'fs-extra';
import moment from 'moment';
import { BrowserWindow, ipcMain, NativeImage, Rectangle } from 'electron';
import path from 'path';
import glob from 'glob-promise';
import tinify from 'tinify';
import archiver from 'archiver';
import deleteEmpty from 'delete-empty';
import KEYS from '../constants/api_keys';
import slash from 'slash';
import eachLimit from 'async/eachLimit';
import cheerio from 'cheerio';
import { copySource } from './utils';
import { minifyHTML, minifyJS, minifyCSS,tinifyImages } from './fileMinifiers';
function getClosetFolderFromPath(path: string) {
  return path.split('/').slice(-1).pop();
}
// minification
function makeZips(pathObj) {
  const { finalRootPath, finalBannerPath, finalZipPath } = pathObj;
  return new Promise(((resolve, reject) => {
    let makeZip = async (bannerRootParse) => {
      await new Promise(((resolve1, reject1) => {
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
          resolve1();
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
      }));
    };
    // find all banners
    findAllBannerFolderRoots(finalBannerPath)
      .then(paths => {
        paths.forEach(makeZip);
      })
      .then(() => resolve(pathObj));
  }));
}
/**
 * takes in path and finds all banner roots assuming index.html file
 * @param targetPath
 * @returns {Promise<object[]>}
 */
function findAllBannerFolderRoots(targetPath) {
  return new Promise((resolve, reject) => {
    glob(path.join(targetPath, '**/index.html'))
      .then(files => {
        return files.map(path.parse);
      })
      .then((paths: object[]) => resolve(paths));
  });
}
function copyZips(pathObj) {
  const { finalRootPath, finalBannerPath, finalZipPath } = pathObj;
  return new Promise((resolve => {
    setTimeout(() => {
      fs.mkdirSync(finalZipPath);
      fs.copySync(finalBannerPath, finalZipPath);
      setTimeout(() => {
        resolve(pathObj);
      }, 500);
    }, 500);
  }));
}
async function cleanUp(pathObj) {
  const { finalRootPath, finalBannerPath, finalZipPath } = pathObj;
  await new Promise((resolve => {
    glob(path.join(finalZipPath, '**/*.{html,jpg,png,svg,js,css}'))
      .then(files => {
        files.forEach(file => {
          //console.log('111 delete file', file);
          fs.removeSync(file);
        });
      })
      .then(resolve);
  }));
  await deleteEmpty(finalZipPath);
  await new Promise((resolve => {
    glob(path.join(finalBannerPath, '**/*.zip'))
      .then(files => {
        files.forEach(file => {
          //console.log('111 delete file', file);
          fs.removeSync(file);
        });
      })
      .then(resolve);
  }));
}
// tests
function testZipSize(filePath: String, zipFileSizeLimit: Number, loggingStream) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats['size'];
  const fileSizeInKilobytes = fileSizeInBytes / 1000.0;
  const isUnder = fileSizeInKilobytes <= zipFileSizeLimit;
  const testFailed = !isUnder;
  loggingStream.write(`Running Zip Size Test : \n`);
  if (testFailed) {
    loggingStream.write(`TEST FAILED  !! --------------- File size in KB ${fileSizeInKilobytes} is > ${zipFileSizeLimit} \n `);
  } else {
    loggingStream.write(`  TEST PASSED *** File size in KB ${fileSizeInKilobytes} is <= ${zipFileSizeLimit} \n `);
  }
  return {
    isUnder,
    fileSizeInBytes,
    fileSizeInKilobytes,
    zipFileSizeLimit,
    testFailed
  };
}
function testZips(pathObj, zipFileSizeLimit, staticFileSizeLimit) {
  return new Promise(async (resolve, reject) => {
    const { finalRootPath, finalBannerPath, finalZipPath } = pathObj;
    const wstream = fs.createWriteStream(path.join(finalZipPath, 'zip_tests.log'));
    const files = await glob(path.join(finalZipPath, '**/*.zip'));
    const failedFiles = [];
    wstream.on('finish', function() {
      resolve(pathObj);
    });
    const run = async (file) => {
      wstream.write(`BEGIN ALL TESTS ON Zip --- \n ${file}  `);
      const sizeResults = testZipSize(file, zipFileSizeLimit, wstream);
      if (sizeResults.testFailed) failedFiles.push(file);
    };
    files.forEach(run);
    wstream.write(`ZIP TESTING COMPLETE __________________________________ \n `);
    wstream.write(`THE FOLLOWING FILES HAVE FAILED TESTS \n `);
    failedFiles.forEach(file => {
      wstream.write(`FAILED ${file} \n `);
    });
    wstream.end();
  });
}
function getBannerDimensions(filePath) {
  let fileData = fs.readFileSync(filePath, 'utf8');
  const $ = cheerio.load(fileData);
  let sizing: string = $(`meta[name='ad.size']`).attr('content');
  const width = Number(sizing.split(',')[0].split('=')[1]);
  const height = Number(sizing.split(',')[1].split('=')[1]);
  console.log(width, height);
  return { width, height };
}
// screenshots
function MakeScreenshots(pathObj, aspectRatio, staticFileSizeLimit) {
  return new Promise(async (resolve, reject) => {
    const { finalRootPath, finalBannerPath, finalZipPath } = pathObj;
    let paths = await findAllBannerFolderRoots(finalZipPath);
    let run = (file, callback) => {
      const shotWindow = new BrowserWindow(
        {
          width: 1024,
          height: 728,
          show: false,
          backgroundColor: '#FF0000',
          webPreferences: {
            nodeIntegration: false,
            webSecurity: false,
            allowRunningInsecureContent: true,
            frame: false,
            devTools: false
          }
        });
      const bannerURL = path.join(file.dir, file.base);
      const dimensions = getBannerDimensions(bannerURL);
      shotWindow.loadURL(slash(bannerURL));
      shotWindow.once('ready-to-show', (e) => {
        console.log('WINDOW SHOULD BE OPEN');
        //shotWindow.show();
        //shotWindow.focus();
        shotWindow.capturePage()
          .then(img => {
            img = img.crop({
              x: 0,
              y: 0,
              width: Math.round(dimensions.width * aspectRatio),
              height: Math.round(dimensions.height * aspectRatio)
            });
            img = img.resize({
              width: dimensions.width,
              height: dimensions.height
            });
            const closestFolder = getClosetFolderFromPath(file.dir);
            const jpegPath = path.join(file.dir, `${closestFolder}.jpg`);
            let compression = 80;
            const optimize = () => {
              const imgBuffer = img.toJPEG(compression);
              fs.writeFileSync(jpegPath, imgBuffer);
              console.log('static saved', compression);
            };
            optimize();
            while (fs.statSync(jpegPath)['size'] / 1000.0 > staticFileSizeLimit && compression > 15) {
              compression--;
              optimize();
            }
            console.log('static optimized');
            callback();
          });
      });
    };
    await eachLimit(paths, 1, run);
    resolve(pathObj);
  });
}
function nullPromise(...args) {
  return Promise.resolve(...args);
}
/*
tinify.key = KEYS.TINIFY;
tinify.validate(function(err) {
  if (err) throw err;
  console.log('!!!! API KEY GOOD');
});*/
export default async (event, config) => {
  // vars from UI
  const {
    sourcePathText,
    outputPathText,
    htmlMinOption,
    jsMinOption,
    cssMinOption,
    optimizeImages,
    createZips,
    devicePixelRatio,
    zipFileSizeLimit,
    staticFileSizeLimit
  } = config;
  // generated vars
  let timestamp = moment().format('YYYYMMDD_HHmmSS');
  let finalRootPath = path.join(outputPathText, timestamp);
  let finalBannerSourcePath = path.join(finalRootPath, 'source');
  let finalZipPath = path.join(finalRootPath, 'final_zips');
  let jobVars = { timestamp, finalRootPath, finalBannerSourcePath, finalZipPath };
  await copySource(sourcePathText, finalBannerSourcePath);
  htmlMinOption === 'true' ? await minifyHTML(finalBannerSourcePath) : await nullPromise();
  jsMinOption === 'true' ? await minifyJS(finalBannerSourcePath) : await nullPromise();
  cssMinOption === 'true' ? await minifyCSS(finalBannerSourcePath) : await nullPromise();
  optimizeImages === 'true' ? await tinifyImages (finalBannerSourcePath) : await nullPromise();

  /*.then()
  .then(createZips === 'true' ? makeZips : nullPromise)
  .then(createZips === 'true' ? copyZips : nullPromise)
  .then(createZips === 'true' ? (pathObj) => {
    return MakeScreenshots(pathObj, devicePixelRatio, staticFileSizeLimit);
  } : nullPromise)
  .then(createZips === 'true' ? (pathObj) => {
    return testZips(pathObj, zipFileSizeLimit, staticFileSizeLimit);
  } : nullPromise)
 .then(createZips === 'true' ? cleanUp : nullPromise)*/
  return '';
};
