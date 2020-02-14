import React, { useState, useEffect } from 'react';
import styles from './home.module.scss';
import { remote } from 'electron';
import { isAbsoluteLinuxPath, isAbsoluteWindowsPath } from 'path-validation';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
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
      <Form   onSubmit={handleSubmit}>
        Paste Directory Path of Source Files
        <br/>
        <Form.Item>
        <input
          className={styles.minifier_form_input}
          type="text"
          onChange={handleInputSource}
          placeholder="Paste Path to Source Folder"
        />
        </Form.Item>
        <br/>
        <br/>
        Paste Directory Path of Output Files
        <br/>
        <Form.Item>
        <input
          className={styles.minifier_form_input}
          type="text"
          onChange={handleInputOutput}
          placeholder="Paste Path to Output Folder"
        />
        </Form.Item>
        <br/>
        <Form.Item>
        <input type="submit" value="Submit" />
        </Form.Item>
      </Form >
    </div>
  );
};
export default Home;
