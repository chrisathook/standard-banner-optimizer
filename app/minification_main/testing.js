import fs from 'fs-extra';
import path from 'path';
import glob from 'glob-promise';
import { eachLimit, mapLimit } from 'async';
import { reportingFactory, STEP_ERROR, STEP_SUCCESS } from './utils';
import winston from 'winston';
function testZipSize(filePath: String, zipFileSizeLimit: Number, logger) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats['size'];
  const fileSizeInKilobytes = fileSizeInBytes / 1000.0;
  const isUnder = fileSizeInKilobytes <= zipFileSizeLimit;
  const testFailed = !isUnder;
  const testType = 'ZIP FILE SIZE';
  let returnitem = {
    isUnder,
    fileSizeInBytes,
    fileSizeInKilobytes,
    zipFileSizeLimit,
    testFailed,
    filePath,
    testType
  };
  if (testFailed) {
    logger.warn(`zip failed size test : ${filePath}`);
    logger.warn(` ${fileSizeInKilobytes}KB >  ${zipFileSizeLimit}KB`);
  } else {
    logger.info(`zip passed size test : ${filePath}`);
    logger.info(` ${fileSizeInKilobytes}KB <=  ${zipFileSizeLimit}KB`);
  }
  logger.info('----------------------');
  return returnitem;
}
export const testZips = async (finalZipPath, zipFileSizeLimit) => {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),

    transports: [
      new winston.transports.File({ filename: path.join(finalZipPath, 'tests.log') }),
      new winston.transports.Console({
        format: winston.format.simple()
      })
    ]
  });
  const files = await glob(path.join(finalZipPath, '**/*.zip'));
  let failedTests = [];
  try {
    logger.info('RUNNING ZIP SIZE TESTS');
    await eachLimit(files, 1, (file,callback) => {
      let result = testZipSize(file, zipFileSizeLimit, logger);
      if (result.testFailed) {
        failedTests.push(result);
      }
      callback ();
    });
    logger.info('-------------------------------------------');
  } catch (err) {
    return reportingFactory(STEP_ERROR, 'ERRORS WITH TESTING', err);
  }
  if (failedTests.length !== 0) {
    logger.info('SUMMARY OF ALL ERRORS');
    await eachLimit(failedTests, 1, (file,callback) => {
      logger.warn (file.filePath);
      logger.warn (`FAILED TEST ${file.testType}`);
      callback ();
    });
    return reportingFactory(STEP_SUCCESS, `TESTING COMPLETED WITH FAILURES, Check Log File: \n${path.join(finalZipPath, 'tests.log')}`);
  }
  return reportingFactory(STEP_SUCCESS, 'TESTING COMPLETED WITHOUT ERRORS');
};
