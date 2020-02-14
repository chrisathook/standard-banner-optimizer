import React, { useState, useEffect } from 'react';
import styles from './home.module.scss';
import { remote } from 'electron';
import { isAbsoluteLinuxPath, isAbsoluteWindowsPath } from 'path-validation';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
const { TextArea } = Input;
const Home = () => {
  const isWin = remote.getGlobal('userSharedObject').isWin;
  const [sourcePath, setSourcePath] = useState('');
  const [outputPath, setOutputPath] = useState('');
  const [statusText, setStatusText] = useState('');
  const handleSubmit = event => {
    event.preventDefault();
    let validatePath = (winValidator, osxValidator, path) => {
      return !!(winValidator(path) || osxValidator(path));

    };
    if (!validatePath(isAbsoluteWindowsPath, isAbsoluteLinuxPath,sourcePath)) {
      setStatusText ('Your Source Path is Not Value');
      return;
    }
    if (!validatePath(isAbsoluteWindowsPath, isAbsoluteLinuxPath,outputPath)) {
      setStatusText ('Your Output Path is Not Value');
      return;
    }

    if (sourcePath === outputPath) {
      setStatusText ("Your Source and Output paths can't be equal");
      return;
    }

    setStatusText ('Processing');
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
      <Form onSubmit={handleSubmit}>
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
          <input type="submit" value="Submit"/>
        </Form.Item>
        <Form.Item>
          <TextArea
            rows={4}
            readOnly
            placeholder="Results Updated Here"
            value={statusText}
          />
        </Form.Item>


      </Form>
    </div>
  );
};
export default Home;
