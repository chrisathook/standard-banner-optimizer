import React, {useReducer} from "react";
import Context from './utils/context';
import * as ACTIONS from '../app/store/actions/actions';
import * as Reducer1 from '../app/store/reducers/plain_reducer';
import * as FormReducer from '../app/store/reducers/form_reducer';
import Routes from "./routes";
const ContextState = () => {
    // generic reducer
    const [stateReducer1, dispatchReducer1] = useReducer(Reducer1.Reducer1, Reducer1.initialState);
    const handleDispatchTrue = () => {
        //    dispatchReducer1(type: "SUCCESS")
        //    dispatchReducer1(ACTIONS.SUCCESS)
        dispatchReducer1(ACTIONS.success())
    };
    const handleDispatchFalse = () => {
        //     dispatchReducer1(type: "FAILURE")
        //    dispatchReducer1(ACTIONS.FAILURE)
        dispatchReducer1(ACTIONS.failure())
    };
    /*
     Form Reducer
   */
    const [stateFormReducer, dispatchFormReducer] = useReducer(FormReducer.FormReducer, FormReducer.initialState);
    const handleFormChange = (event) => {
        dispatchFormReducer(ACTIONS.user_input_change(event.target.value))
    };
    const handleFormSubmit = (event) => {
        event.preventDefault();
        event.persist();
        dispatchFormReducer(ACTIONS.user_input_submit(event.target.useContext.value))
    };
    return (
        <div>
            <Context.Provider
                value={
                    {
                        stateProp1: stateReducer1.stateprop1,
                        stateProp2: stateReducer1.stateprop2,
                        dispatchContextTrue: () => handleDispatchTrue(),
                        dispatchContextFalse: () => handleDispatchFalse(),
                        //Form Reducer
                        useContextChangeState: stateFormReducer.user_textChange,
                        useContextSubmitState: stateFormReducer.user_textSubmit,
                        useContextSubmit: (event) => handleFormSubmit(event),
                        useContentChange: (event) => handleFormChange(event),
                    }
                }>
                <Routes/>
            </Context.Provider>
        </div>
    )
};
export default ContextState;
