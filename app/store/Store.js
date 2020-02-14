import React, {createContext, useReducer} from "react";
import * as FormReducer from "./reducers/form_reducer";

const Store = ({children}) => {
  const [formState, formDispatch] = useReducer(FormReducer.FormReducer, FormReducer.initialState);
  return (
    <Context.Provider value={[formState, formDispatch]}>
      {children}
    </Context.Provider>
  )
};

export const Context = createContext(FormReducer.initialState);
export default Store;
