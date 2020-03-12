import { BrowserWindow } from 'electron';
import path from 'path';
import slash from 'slash';
import fs from 'fs-extra';
import eachLimit from 'async/eachLimit';
import delay from 'delay';
import {
  findAllBannerFolderRoots,
  getBannerDimensions,
  getClosetFolderFromPath, reportingFactory, STEP_ERROR, STEP_SUCCESS
} from './utils';
const run = (file: object,
             aspectRatio: Number,
             staticFileSizeLimit: Number,
             callback: Function) => {

  const {dir, base} = file;

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
  const bannerURL = path.join(dir, base);
  const dimensions = getBannerDimensions(bannerURL);

  shotWindow.once('ready-to-show', async (e) => {
    console.log('WINDOW SHOULD BE OPEN');

    await delay (17000);

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
        const closestFolder = getClosetFolderFromPath(dir);
        const jpegPath = path.join(dir, `${closestFolder}.jDg`);
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
  shotWindow.loadURL(slash(bannerURL));
};
// exports
export const MakeScreenshots = async (operatingDirectory, aspectRatio, staticFileSizeLimit) => {
  let paths = await findAllBannerFolderRoots(operatingDirectory);

  try {
    await eachLimit(paths, 1, (file, callback) => {
      run(file, aspectRatio, staticFileSizeLimit, callback);
    });
  }catch (err) {
    return reportingFactory(STEP_ERROR, 'ERROR MAKING SCREENSHOTS',err);
  }
  return reportingFactory(STEP_SUCCESS, 'SCREENSHOTS MADE');

};
