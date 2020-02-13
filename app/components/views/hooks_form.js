import React, {useContext, useState, useReducer, useEffect} from 'react';
import * as ACTIONS from './actions';
import * as FormReducer from './form_reducer';
import Context from './context';


const HooksForm = () => {
    const context = useContext(Context);

    const [valueChange, setValueChange] = useState('');
    const [valueSubmit, setValueSubmit] = useState('');

    const [useEffectValue, setUseEffectValue] = useState(0);

    useEffect(() => {
        console.log ('repaint local');
        setUseEffectValue((u)=>{return u + 1})
    }, [valueSubmit]);



    const [state, dispatch] = useReducer(FormReducer.FormReducer,
        FormReducer.initialState);

    const [useLocalReducerEffectValue, setLocalReducerEffectValue] = useState(0);
    useEffect(() => {
        console.log ('repaint reducer');
        setLocalReducerEffectValue((u)=>{return u + 1})
    }, [state.user_textSubmit]);
    const handleuseStateChange = (event) => (
        setValueChange(event.target.value)
    );

    const handleuseStateSubmit = (event) => {
        event.preventDefault();
        setValueSubmit(event.target.useState.value)
    };

    const handleuseReducerChange = (event) => (
        dispatch(ACTIONS.user_input_change(event.target.value))
    );

    const handleuseReducerSubmit = (event) => {
        event.preventDefault();
        dispatch(ACTIONS.user_input_submit(event.target.useReducer.value))
    };


    return (
        <div>
            <form onSubmit={handleuseStateSubmit}>
                <label> React useState: </label>
                <input id="useState" onChange={handleuseStateChange} type="text" />
                <button type="submit"> Submit </button>
            </form>
            <br />
            <form onSubmit={handleuseReducerSubmit}>
                <label> React useReducer: </label>
                <input id="useReducer" onChange={handleuseReducerChange} type="text" />
                <button type="submit"> Submit </button>
            </form>
            <br />
            <form onSubmit={context.useContextSubmit}>
                <label> React useContext: </label>
                <input id="useContext" onChange={context.useContentChange} type="text" />
                <button type="submit"> Submit </button>
            </form>
            <br />

            <h3>React useState:</h3>
            <p>Change: {valueChange}</p>
            <p>Submit: {valueSubmit}</p>
            <p>effect Value on submit: {useEffectValue}</p>
            <br />

            <h3>React useReducer:</h3>
            <p>Change: {state.user_textChange}</p>
            <p>Submit: {state.user_textSubmit}</p>
            <p>effect Value on submit: {useLocalReducerEffectValue}</p>
            <br />
            <h3>React useContext:</h3>
            <p>Change: {context.useContextChangeState}</p>
            <p>Submit: {context.useContextSubmitState}</p>
            <br />
            <br />



        </div>
    )
};


export default HooksForm;
