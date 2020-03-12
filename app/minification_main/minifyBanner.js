// @flow
import fs from 'fs-extra';
import moment from 'moment';
import { BrowserWindow, ipcMain, NativeImage, Rectangle } from 'electron';
import path from 'path';
import glob from 'glob-promise';
import deleteEmpty from 'delete-empty';
import winston from 'winston';
import {
  cleanUp,
  copySource,
  reportingFactory,
  STEP_ERROR,
  STEP_SUCCESS
} from './utils';
import { minifyHTML, minifyJS, minifyCSS, tinifyImages } from './fileMinifiers';
import { makeZips, copyZips } from './zipFunctions';
import { MakeScreenshots } from './screenshotFunctions';
import { testZips } from './testing';
import ipcEvents from '../constants/ipc_events';
// minification
// tests
// screenshots

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
    format: winston.format.simple(),
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
  const processLogging = (statusObject: Object = null, message: string = '') => {
    if (statusObject === null) {
      logger.info(message);
      return;
    }
    if (statusObject.status === STEP_SUCCESS) {
      event.reply(ipcEvents.MINIFICATION_STATUS_UPDATE, statusObject.message);
      logger.info(statusObject.message);
    }
    if (statusObject.status === STEP_ERROR) {
      event.reply(ipcEvents.MINIFICATION_STATUS_UPDATE, statusObject.message + ' Check Log File');
      logger.error(statusObject.message, statusObject.data);
    }
  };
  event.reply(ipcEvents.MINIFICATION_STATUS_UPDATE, 'Starting Minification');
  let status = await copySource(sourcePathText, finalBannerSourcePath);
  processLogging(status);
  if (status.status === STEP_ERROR) return "!!! Process Halted Due To Error";
  status = htmlMinOption === 'true' ? await minifyHTML(finalBannerSourcePath) : reportingFactory(STEP_SUCCESS, 'BYPASS HTML MIN');
  processLogging(status);
  if (status.status === STEP_ERROR) return "!!! Process Halted Due To Error";
  status = jsMinOption === 'true' ? await minifyJS(finalBannerSourcePath) : reportingFactory(STEP_SUCCESS, 'BYPASS JS MIN');
  processLogging(status);
  if (status.status === STEP_ERROR) return "!!! Process Halted Due To Error";
  status = cssMinOption === 'true' ? await minifyCSS(finalBannerSourcePath) : reportingFactory(STEP_SUCCESS, 'BYPASS CSS MIN');
  processLogging(status);
  if (status.status === STEP_ERROR) return "!!! Process Halted Due To Error";
  status = optimizeImages === 'true' ? await tinifyImages(finalBannerSourcePath) : reportingFactory(STEP_SUCCESS, 'BYPASS IMAGE MIN');
  processLogging(status);
  if (status.status === STEP_ERROR) return "!!! Process Halted Due To Error";
  status = createZips === 'true' ? await makeZips(finalBannerSourcePath) : reportingFactory(STEP_SUCCESS, 'BYPASS Make Zips');
  processLogging(status);
  if (status.status === STEP_ERROR) return "!!! Process Halted Due To Error";
  status = createZips === 'true' ? await copyZips(finalBannerSourcePath, finalZipPath) : reportingFactory(STEP_SUCCESS, 'BYPASS Copy Zips');
  processLogging(status);
  if (status.status === STEP_ERROR) return "!!! Process Halted Due To Error";
  status = createZips === 'true' ? await MakeScreenshots(finalZipPath, devicePixelRatio, staticFileSizeLimit) : reportingFactory(STEP_SUCCESS, 'BYPASS Screenshots');
  processLogging(status);
  if (status.status === STEP_ERROR) return "!!! Process Halted Due To Error";
  status =  await cleanUp(finalBannerSourcePath, finalZipPath);
  processLogging(status);
  if (status.status === STEP_ERROR) return "!!! Process Halted Due To Error";
  status = createZips === 'true' ? await testZips(finalZipPath, zipFileSizeLimit,staticFileSizeLimit) : reportingFactory(STEP_SUCCESS, 'BYPASS Tests');
  processLogging(status);
  return 'Process Successful Files are in : '+finalRootPath;
};

