// @flow
import fs from 'fs-extra';
import moment from 'moment';
import path from 'path';
import glob from 'glob-promise';
import * as HTMLMinifier from 'html-minifier';
import * as JSMinifier from 'uglify-js';
import CleanCSS from 'clean-css';
import tinify from 'tinify';
import archiver from 'archiver';
import KEYS from '../constants/api_keys';
function copySource(sourcePath, destPath) {
  return new Promise(((resolve, reject) => {
    let timestamp = moment().format('YYYYMMDD_HHmmSS');
    let finalPath = path.join(destPath, timestamp);
    try {
      fs.copySync(sourcePath, finalPath);
      //console.log('success!');
    } catch (err) {
      console.error(err);
      reject();
    }
    resolve(finalPath);
  }));
}
function minifyHTML(rootPath) {
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
    glob(path.join(rootPath, '**/*.html'))
      .then(files => {
        files.forEach(run);
      })
      .then(() => resolve(rootPath));
  }));
}
function minifyJS(rootPath) {
  //console.log('!!', rootPath);
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
    glob(path.join(rootPath, '**/*.js'))
      .then(files => {
        files.forEach(run);
      })
      .then(() => resolve(rootPath));
  }));
}
function minifyCSS(rootPath) {
  return new Promise(((resolve, reject) => {
    let run = async (file) => {
      //console.log('!!!', file);
      let data = await fs.readFile(file, 'utf8');
      let css = new CleanCSS({ returnPromise: true });
      data = await css.minify(data);
      data = data.styles;
      await fs.writeFile(file, data);
    };
    glob(path.join(rootPath, '**/*.css'))
      .then(files => {
        files.forEach(run);
      })
      .then(() => resolve(rootPath));
  }));
}
function tinifyImages(rootPath) {
  tinify.key = KEYS.TINIFY;
  // console.log('!!', rootPath);
  return new Promise(((resolve, reject) => {
    let run = async (file) => {
      // console.log('!!!', file);
      let data = await fs.readFile(file);
      data = await new Promise(((resolve1, reject1) => {
        tinify.fromBuffer(data).toBuffer((err,resultData)=>{
          if (err) {
            throw err;
          }
          resolve1(resultData);
        })
      }));
      await fs.writeFile(file, data);
    };
    glob(path.join(rootPath, '**/*.{jpg,png}'))
      .then(files => {
        files.forEach(run);
      })
      .then(() => resolve(rootPath));
  }));
}
// minification



function makeZips (rootPath) {
  return new Promise(((resolve, reject) => {
    let makeZip = async (bannerRootParse) => {

      await new Promise(((resolve1, reject1) => {


      let {dir, root, base, name, ext} = bannerRootParse;
      let closestFolder = dir.split ("/").slice (-1).pop();

      const output = fs.createWriteStream (path.join(dir,`${closestFolder}.zip`));
      const archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
      });
      output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
      });
      archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
          console.warn(err)
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
        resolve1 ()
      });
      archive.pipe(output);

      archive.glob(
        path.join ('**/*.{html,jpg,png,svg,js,css}'),
        {
          cwd:dir,
          root:dir
        });
      archive.finalize();
      }));
    };


    glob(path.join(rootPath, '**/index.html'))
      .then(files => {
       return files.map(path.parse);
      })
      .then (paths =>{
        paths.forEach(makeZip)
      })


  }));
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
      .then(resolve);
  }));
};
