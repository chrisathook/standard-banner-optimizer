import * as ACTION_TYPES from './action_types';
export const source_input_change = (text) => {
  return {
    type: ACTION_TYPES.SOURCE_PATH_INPUT_CHANGE,
    payload: text
  };
};
export const source_input_submit = (text) => {
  return {
    type: ACTION_TYPES.SOURCE_PATH_INPUT_SUBMIT,
    payload: text
  };
};

export const output_input_change = (text) => {
  return {
    type: ACTION_TYPES.OUTPUT_PATH_INPUT_CHANGE,
    payload: text
  };
};
export const output_input_submit = (text) => {
  return {
    type: ACTION_TYPES.OUTPUT_PATH_INPUT_SUBMIT,
    payload: text
  };
};
export const html_min_submit = (text) => {
  return {
    type: ACTION_TYPES.HTML_MIN_CHANGE,
    payload: text
  };
};
export const js_min_submit = (text) => {
  return {
    type: ACTION_TYPES.JS_MIN_CHANGE,
    payload: text
  };
};
export const css_min_submit = (text) => {
  return {
    type: ACTION_TYPES.CSS_MIN_CHANGE,
    payload: text
  };
};
export const svg_min_submit = (text) => {
  return {
    type: ACTION_TYPES.SVG_MIN_CHANGE,
    payload: text
  };
};
export const zips_submit = (text) => {
  return {
    type: ACTION_TYPES.MAKE_ZIPS_SUBMIT,
    payload: text
  };
};
export const optimize_images_submit = (text) => {
  return {
    type: ACTION_TYPES.OPTIMIZE_IMAGES_SUBMIT,
    payload: text
  };
};
export const window_aspect_ratio_submit = (text) => {
  return {
    type: ACTION_TYPES.WINDOW_ASPECT_RATIO_CHANGE,
    payload: text
  };
};
