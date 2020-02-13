import React, {useContext} from 'react';
import Context from "./context";
const LazyTest = props => {
    const context = useContext(Context);
    return (
        <div>
            <h3> Lazy Test</h3>
            <br/>
            <h3> Basic Context</h3>
            {context.stateProp2
                ? <p> stateprop2 is true </p>
                : <p> stateprop2 is false </p>
            }
            <h3>React useContext:</h3>
            <p>Change: {context.useContextChangeState}</p>
            <p>Submit: {context.useContextSubmitState}</p>
            <br/>
            <br/>
            <img src='./logo512.png' alt=""/>
        </div>
    );
}
export default LazyTest;
