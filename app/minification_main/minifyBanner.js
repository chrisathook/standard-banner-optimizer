// @flow
import fs from 'fs-extra';
import moment from 'moment';
import { promisify } from 'util';
import path from 'path';
import glob from 'glob-promise';
import * as HTMLMinifier from 'html-minifier';
import * as JSMinifier from 'uglify-js';
import CleanCSS from 'clean-css';
import tinify from 'tinify';
import archiver from 'archiver';
import deleteEmpty from 'delete-empty';
import KEYS from '../constants/api_keys';
import Client from 'ssh2-sftp-client';
import slash from 'slash';
function copySource(sourcePath, destPath) {
  return new Promise(((resolve, reject) => {
    let timestamp = moment().format('YYYYMMDD_HHmmSS');
    let finalRootPath = path.join(destPath, timestamp);
    let finalBannerPath = path.join(finalRootPath, 'source');
    let finalZipPath = path.join(finalRootPath, 'final_zips');
    try {
      fs.copySync(sourcePath, finalBannerPath);
      //console.log('success!');
    } catch (err) {
      console.error(err);
      reject();
    }
    resolve({ finalRootPath, finalBannerPath, finalZipPath, timestamp });
  }));
}
function minifyHTML(pathObj) {
  const { finalRootPath, finalBannerPath, finalZipPath } = pathObj;
  return new Promise(((resolve, reject) => {
    let run = async (file) => {
      //console.log('!!!', file);
      let data = await fs.readFile(file, 'utf8');
      data = HTMLMinifier.minify(data, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        html5: true,
        minifyCSS: true,
        minifyJS: true,
        removeComments: true
      });
      await fs.writeFile(file, data);
    };
    glob(path.join(finalBannerPath, '**/*.html'))
      .then(files => {
        files.forEach(run);
      })
      .then(() => resolve(pathObj));
  }));
}
function minifyJS(pathObj) {
  const { finalRootPath, finalBannerPath, finalZipPath } = pathObj;
  return new Promise(((resolve, reject) => {
    let run = async (file) => {
      // console.log('!!!', file);
      let data = await fs.readFile(file, 'utf8');
      data = JSMinifier.minify(data, {
        compress: {
          drop_console: true,
          keep_fnames: true
        }
      }).code;
      await fs.writeFile(file, data);
    };
    glob(path.join(finalBannerPath, '**/*.js'))
      .then(files => {
        files.forEach(run);
      })
      .then(() => resolve(pathObj));
  }));
}
function minifyCSS(pathObj) {
  const { finalRootPath, finalBannerPath, finalZipPath } = pathObj;
  return new Promise(((resolve, reject) => {
    let run = async (file) => {
      //console.log('!!!', file);
      let data = await fs.readFile(file, 'utf8');
      let css = new CleanCSS({ returnPromise: true });
      data = await css.minify(data);
      data = data.styles;
      await fs.writeFile(file, data);
    };
    glob(path.join(finalBannerPath, '**/*.css'))
      .then(files => {
        files.forEach(run);
      })
      .then(() => resolve(pathObj));
  }));
}
function tinifyImages(pathObj) {
  const { finalRootPath, finalBannerPath, finalZipPath } = pathObj;
  tinify.key = KEYS.TINIFY;
  // console.log('!!', rootPath);
  return new Promise(((resolve, reject) => {
    let run = async (file) => {
      // console.log('!!!', file);
      let data = await fs.readFile(file);
      data = await new Promise(((resolve1, reject1) => {
        tinify.fromBuffer(data).toBuffer((err, resultData) => {
          if (err) {
            throw err;
          }
          resolve1(resultData);
        });
      }));
      await fs.writeFile(file, data);
    };
    glob(path.join(finalBannerPath, '**/*.{jpg,png}'))
      .then(files => {
        files.forEach(run);
      })
      .then(() => resolve(pathObj));
  }));
}
// minification
function makeZips(pathObj) {
  const { finalRootPath, finalBannerPath, finalZipPath } = pathObj;
  return new Promise(((resolve, reject) => {
    let makeZip = async (bannerRootParse) => {
      await new Promise(((resolve1, reject1) => {
        const { dir, root, base, name, ext } = bannerRootParse;
        const closestFolder = dir.split('/').slice(-1).pop();
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
 * @returns {Promise<string[]>}
 */
function findAllBannerFolderRoots(targetPath) {
  return new Promise((resolve, reject) => {
    glob(path.join(targetPath, '**/index.html'))
      .then(files => {
        return files.map(path.parse);
      })
      .then((paths) => resolve(paths));
  });
}
 function copyZips(pathObj) {
  const { finalRootPath, finalBannerPath, finalZipPath } = pathObj;
  return  new Promise((resolve => {
    setTimeout(() => {
      fs.mkdirSync(finalZipPath);
      fs.copySync(finalBannerPath, finalZipPath);
      setTimeout(()=>{resolve(pathObj)}, 500);
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
function testZipSize(filePath, loggingStream) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats['size'];
  const fileSizeInKilobytes = fileSizeInBytes / 1000.0;
  const maxSize = 150.0;
  const isUnder = fileSizeInKilobytes <= maxSize;
  const testFailed = !isUnder;
  loggingStream.write(`Running Zip Size Test : \n`);
  if (testFailed) {
    loggingStream.write(`TEST FAILED  !! --------------- File size in KB ${fileSizeInKilobytes} is > ${maxSize} \n `);
  } else {
    loggingStream.write(`  TEST PASSED *** File size in KB ${fileSizeInKilobytes} is <= ${maxSize} \n `);
  }
  return {
    isUnder,
    fileSizeInBytes,
    fileSizeInKilobytes,
    maxSize,
    testFailed
  };
}
function testZips(pathObj) {
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
      const sizeResults = testZipSize(file, wstream);
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
async function uploadAllFiles(localRoot, remoteRoot, sftp) {

  const rslt = await sftp.uploadDir (localRoot,remoteRoot);
  console.log (rslt)

}
// screenshots
 function MakeScreenshots(pathObj) {
  return new Promise (async (resolve, reject) => {
    const { finalRootPath, finalBannerPath, finalZipPath, timestamp } = pathObj;
    const remoteRoot = KEYS.FTP_ROOT + `/${timestamp}`;
    const sftp = new Client();
    await sftp.connect({
      host: KEYS.FTP_DOMAIN,
      port: 22,
      username: KEYS.FTP_USER,
      password: KEYS.FTP_PW
    });
    await sftp.mkdir(remoteRoot);
    await uploadAllFiles(finalZipPath, remoteRoot, sftp);
    sftp.end();
    resolve (pathObj) ;
  })


}
function nullPromise(...args) {
  return Promise.resolve(...args);
}
tinify.key = KEYS.TINIFY;
tinify.validate(function(err) {
  if (err) throw err;
  console.log('!!!! API KEY GOOD');
});
export default (event, config) => {
  return new Promise(((resolve, reject) => {
    const {
      sourcePathText,
      outputPathText,
      htmlMinOption,
      jsMinOption,
      cssMinOption,
      optimizeImages,
      createZips
    } = config;
    copySource(sourcePathText, outputPathText)
      .then(htmlMinOption === 'true' ? minifyHTML : nullPromise)
      .then(jsMinOption === 'true' ? minifyJS : nullPromise)
      .then(cssMinOption === 'true' ? minifyCSS : nullPromise)
      .then(optimizeImages === 'true' ? tinifyImages : nullPromise)
      .then(createZips === 'true' ? makeZips : nullPromise)
      .then(createZips === 'true' ? copyZips : nullPromise)
      .then(createZips === 'true' ? testZips : nullPromise)
      .then(createZips === 'true' ? MakeScreenshots : nullPromise)
      .then(createZips === 'true' ? cleanUp : nullPromise)
      .then(resolve);
  }));
};
