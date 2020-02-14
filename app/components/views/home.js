import React, { useState,useContext, useEffect } from 'react';
import {Context} from "../../store/Store";
import * as ACTIONS from "../../store/actions/actions";
import { remote } from 'electron';
import { isAbsoluteLinuxPath, isAbsoluteWindowsPath } from 'path-validation';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
const { TextArea } = Input;
//
import styles from './home.module.scss';
const Home = () => {

  const [formState, formDispatch] = useContext(Context);

  const isWin = remote.getGlobal('userSharedObject').isWin;
  const [statusText, setStatusText] = useState('');
  const handleSubmit = event => {
    event.preventDefault();
    let validatePath = (winValidator, osxValidator, path) => {
      return !!(winValidator(path) || osxValidator(path));

    };
    if (!validatePath(isAbsoluteWindowsPath, isAbsoluteLinuxPath,formState.sourcePathText)) {
      setStatusText ('Your Source Path is Not Value');
      return;
    }
    if (!validatePath(isAbsoluteWindowsPath, isAbsoluteLinuxPath,formState.outputPathText)) {
      setStatusText ('Your Output Path is Not Value');
      return;
    }

    if (formState.sourcePathText === formState.outputPathText) {
      setStatusText ("Your Source and Output paths can't be equal");
      return;
    }

    setStatusText ('Processing');
  };
  const handleInputSource = (event) => {

    formDispatch (ACTIONS.source_input_change(event.target.value));

    event.preventDefault();
  };
  const handleInputOutput = (event) => {
    formDispatch (ACTIONS.output_input_change(event.target.value));
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
            id="source_path_field"
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
            id="output_path_field"
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
