import React, { useState, useEffect } from 'react';
import styles from './home.module.scss';
import { remote } from 'electron';
import { isAbsoluteLinuxPath, isAbsoluteWindowsPath } from 'path-validation';
const Home = () => {
  const isWin = remote.getGlobal('userSharedObject').isWin;
  const [sourcePath, setSourcePath] = useState('');
  const [outputPath, setOutputPath] = useState('');
  const handleSubmit = event => {
    event.preventDefault();
    if (isWin) {
      console.log (isAbsoluteWindowsPath(sourcePath));
      console.log (isAbsoluteWindowsPath(outputPath));
    } else {
      console.log (isAbsoluteLinuxPath(sourcePath));
      console.log (isAbsoluteLinuxPath(outputPath));
    }
  };
  const handleInputSource = (event) => {
    setSourcePath(event.target.value);
    event.preventDefault();
  };
  const handleInputOutput = (event) => {
    setOutputPath(event.target.value);
    event.preventDefault();
  };
  return (
    <div>
      <h1>Standard Banner Minifier</h1>
      <form  onSubmit={handleSubmit}>
        Paste Directory Path of Source Files
        <br/>

        <input className={styles.minifier_form_input} type="text" onChange={handleInputSource}/>
        <br/>
        <br/>
        Paste Directory Path of Output Files
        <br/>
        
        <input className={styles.minifier_form_input} type="text" onChange={handleInputOutput}/>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );
};
export default Home;
