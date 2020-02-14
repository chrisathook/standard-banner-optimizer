// @flow
import * as ACTION_TYPES from '../actions/action_types';
export const initialState = {
    sourcePathText:'',
  sourcePathSubmit:'',
  outputPathText:'',
  outputPathSubmit:'',
};



export const FormReducer = (state, action) =>{
  switch (action.type) {
      case ACTION_TYPES.SOURCE_PATH_INPUT_CHANGE:
          return {
              ...state,
            sourcePathText: action.payload
          };
      case ACTION_TYPES.SOURCE_PATH_INPUT_SUBMIT:
          return {
              ...state,
            sourcePathSubmit:action.payload

          };
    case ACTION_TYPES.OUTPUT_PATH_INPUT_CHANGE:
      return {
        ...state,
        outputPathText: action.payload
      };
    case ACTION_TYPES.OUTPUT_PATH_INPUT_SUBMIT:
      return {
        ...state,
        outputPathSubmit:action.payload

      };
      default:
          throw new Error();
  }
};
