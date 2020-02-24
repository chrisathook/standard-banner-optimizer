// @flow
import fs from 'fs-extra';
import moment from 'moment';
import { BrowserWindow, ipcMain, NativeImage, Rectangle } from 'electron';
import path from 'path';
import glob from 'glob-promise';
import deleteEmpty from 'delete-empty';
import winston from 'winston';
import { copySource } from './utils';
import { minifyHTML, minifyJS, minifyCSS, tinifyImages } from './fileMinifiers';
import { makeZips, copyZips } from './zipFunctions';
import { MakeScreenshots } from './screenshotFunctions';
import ipcEvents from '../constants/ipc_events';
// minification
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
// screenshots
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
  let jobVars = {
    timestamp,
    finalRootPath,
    finalBannerSourcePath,
    finalZipPath
  };
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    defaultMeta: { service: 'user-service' },
    transports: [
      new winston.transports.File({
        filename: path.join(finalZipPath, 'error.log'),
        level: 'error'
      }),
      new winston.transports.File({ filename: path.join(finalZipPath, 'combined.log') })
    ]
  });
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));

  event.reply(ipcEvents.MINIFICATION_STATUS_UPDATE, 'Starting Minification');
  let status = await copySource(sourcePathText, finalBannerSourcePath);
  event.reply(ipcEvents.MINIFICATION_STATUS_UPDATE, 'Source Copied');
  status =  htmlMinOption === 'true' ? await minifyHTML(finalBannerSourcePath) : await nullPromise();
  event.reply(ipcEvents.MINIFICATION_STATUS_UPDATE, 'HTML Minified');
  status =  jsMinOption === 'true' ? await minifyJS(finalBannerSourcePath) : await nullPromise();
  event.reply(ipcEvents.MINIFICATION_STATUS_UPDATE, 'JS Minified');
  status =  cssMinOption === 'true' ? await minifyCSS(finalBannerSourcePath) : await nullPromise();
  event.reply(ipcEvents.MINIFICATION_STATUS_UPDATE, 'CSS Minified');
  status =  optimizeImages === 'true' ? await tinifyImages(finalBannerSourcePath) : await nullPromise();
  event.reply(ipcEvents.MINIFICATION_STATUS_UPDATE, 'Images Minified');
  status =  createZips === 'true' ? await makeZips(finalBannerSourcePath) : await nullPromise();
  event.reply(ipcEvents.MINIFICATION_STATUS_UPDATE, 'Zips Created');
  status =  createZips === 'true' ? await copyZips(finalBannerSourcePath, finalZipPath) : await nullPromise();
  event.reply(ipcEvents.MINIFICATION_STATUS_UPDATE, 'Zips Copied');
  status = createZips === 'true' ? await MakeScreenshots(finalZipPath, devicePixelRatio, staticFileSizeLimit) : await nullPromise();
  event.reply(ipcEvents.MINIFICATION_STATUS_UPDATE, 'Statics Generated');
  /*
  .then(createZips === 'true' ? (pathObj) => {
    return testZips(pathObj, zipFileSizeLimit, staticFileSizeLimit);
  } : nullPromise)
  .then(createZips === 'true' ? cleanUp : nullPromise)*/
  return '';
};

