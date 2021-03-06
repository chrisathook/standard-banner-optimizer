// @flow
import * as ACTION_TYPES from '../actions/action_types';
export const initialState = {
  sourcePathText: 'D:\\ScratchDesktop\\minifier-test\\Source',
  sourcePathSubmit: '',
  outputPathText: 'D:\\ScratchDesktop\\minifier-test\\Output',
  outputPathSubmit: '',
  htmlMinOption: 'true',
  jsMinOption: 'true',
  cssMinOption: 'true',
  svgMinOption: 'true',
  optimizeImages: 'false',
  createZips: 'true',
  devicePixelRatio:1,
  zipFileSizeLimit:150,
  staticFileSizeLimit:40
};
export const FormReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.SOURCE_PATH_INPUT_CHANGE:
      return {
        ...state,
        sourcePathText: action.payload
      };
    case ACTION_TYPES.SOURCE_PATH_INPUT_SUBMIT:
      return {
        ...state,
        sourcePathSubmit: action.payload
      };
    case ACTION_TYPES.OUTPUT_PATH_INPUT_CHANGE:
      return {
        ...state,
        outputPathText: action.payload
      };
    case ACTION_TYPES.OUTPUT_PATH_INPUT_SUBMIT:
      return {
        ...state,
        outputPathSubmit: action.payload
      };
    case ACTION_TYPES.HTML_MIN_CHANGE:
      return {
        ...state,
        htmlMinOption: action.payload
      };
    case ACTION_TYPES.JS_MIN_CHANGE:
      return {
        ...state,
        jsMinOption: action.payload
      };
    case ACTION_TYPES.CSS_MIN_CHANGE:
      return {
        ...state,
        cssMinOption: action.payload
      };
    case ACTION_TYPES.OPTIMIZE_IMAGES_SUBMIT:
      return {
        ...state,
        optimizeImages: action.payload
      };
    case ACTION_TYPES.MAKE_ZIPS_SUBMIT:
      return {
        ...state,
        createZips: action.payload
      };
    case ACTION_TYPES.WINDOW_ASPECT_RATIO_CHANGE:
      return {
        ...state,
        devicePixelRatio: action.payload
      };
    case ACTION_TYPES.ZIP_FILE_SIZE_LIMIT:
      return {
        ...state,
        zipFileSizeLimit: action.payload
      };
    case ACTION_TYPES.STATIC_FILE_SIZE_LIMIT:
      return {
        ...state,
        staticFileSizeLimit: action.payload
      };
    default:
      throw new Error();
  }
};
