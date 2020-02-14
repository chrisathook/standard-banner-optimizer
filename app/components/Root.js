// @flow
import React from 'react';
import { hot } from 'react-hot-loader/root';
import Routes from '../Routes';
import Store from '../store/Store';
const Root = () => {
  return (
    <div>
      <Store>
        <Routes/>
      </Store>
    </div>
  );
};
export default hot(Root);
