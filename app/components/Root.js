// @flow
import React from 'react';
import ContextState from '../context_state_config';
import { hot } from 'react-hot-loader/root';
const Root = () => {
  return (
    <div>
      <ContextState/>
    </div>
  );
};
export default hot(Root);
