import React, { useState, useContext, useEffect } from 'react';
import { Context } from '../../store/Store';
import * as ACTIONS from '../../store/actions/actions';
import { remote } from 'electron';
import { isAbsoluteLinuxPath, isAbsoluteWindowsPath } from 'path-validation';
import { Form, Icon, Input, Button, Checkbox } from 'antd';
const { TextArea } = Input;
const { dialog } = remote;
//
import styles from './home.module.scss';
const Home = () => {
  const [formState, formDispatch] = useContext(Context);
  const isWin = remote.getGlobal('userSharedObject').isWin;
  const [statusText, setStatusText] = useState('');
  const validatePath = (winValidator, osxValidator, path) => {
    return !!(winValidator(path) || osxValidator(path));
  };
  const handleSubmit = event => {
    event.preventDefault();
    if (!validatePath(isAbsoluteWindowsPath, isAbsoluteLinuxPath, formState.sourcePathText)) {
      setStatusText('Your Source Path is Not Value');
      return;
    }
    if (!validatePath(isAbsoluteWindowsPath, isAbsoluteLinuxPath, formState.outputPathText)) {
      setStatusText('Your Output Path is Not Value');
      return;
    }
    if (formState.sourcePathText === formState.outputPathText) {
      setStatusText('Your Source and Output paths can\'t be equal');
      return;
    }
    setStatusText('Processing');
  };
  const handleInputSource = (event) => {
    formDispatch(ACTIONS.source_input_change(event.target.value));
    event.preventDefault();
  };
  const handleInputOutput = (event) => {
    formDispatch(ACTIONS.output_input_change(event.target.value));
    event.preventDefault();
  };
  const spawnDialog = (event, action) => {
    event.preventDefault();
    let path = dialog.showOpenDialogSync({
      title: 'select input directory',
      properties: ['openDirectory']
    });
    if (typeof path !== 'undefined') {
      formDispatch(action(path[0]));
    }
  };
  return (
    <div>
      <h1>Standard Banner Minifier</h1>
      <Form onSubmit={handleSubmit}>
        Paste Directory Path of Source Files or <Button
        onClick={(e) => {
          spawnDialog(e, ACTIONS.source_input_change);
        }}
        type="primary">click here</Button>
        <br/>
        <Form.Item>
          <input
            id="source_path_field"
            className={styles.minifier_form_input}
            type="text"
            value={formState.sourcePathText}
            onChange={handleInputSource}
            placeholder="Paste Path to Source Folder"
          />
        </Form.Item>
        <br/>
        <br/>
        Paste Directory Path of Output Files or <Button
        onClick={(e) => {
          spawnDialog(e, ACTIONS.output_input_change);
        }}
        type="primary">click here</Button>
        <br/>
        <Form.Item>
          <input
            id="output_path_field"
            className={styles.minifier_form_input}
            type="text"
            value={formState.outputPathText}
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
