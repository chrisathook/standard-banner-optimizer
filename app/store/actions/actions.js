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
