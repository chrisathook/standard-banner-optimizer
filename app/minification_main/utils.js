import moment from 'moment';
import path from "path";
import fs from 'fs-extra';

export const copySource =(sourcePath, destPath)=> {
  return new Promise(((resolve, reject) => {

    try {
      fs.copySync(sourcePath, destPath);
      //console.log('success!');
    } catch (err) {
      console.error(err);
      reject();
    }
    resolve();
  }));
};
