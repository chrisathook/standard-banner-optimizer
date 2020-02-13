// @flow
import React, { Component  } from 'react';
import {ipcRenderer} from 'electron';
import styles from './Home.scss';

type Props = {};

ipcRenderer.on('asynchronous-reply', (event, arg) => {
  console.log(" !!! RENDER",arg); // prints "pong"
});

let clickTest = ()=>{
  ipcRenderer.send('asynchronous-message', 'ping')
};

export default class Home extends Component<Props> {
  props: Props;



  render() {
    return (
      <div className={styles.container} data-tid="container">
        <h2>Home</h2>
        <button onClick={clickTest}>test send</button>
      </div>
    );
  }
}
