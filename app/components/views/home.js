// @flow
import React, { useState, useContext, useEffect } from 'react';
import { Context } from '../../store/Store';
import * as ACTIONS from '../../store/actions/actions';
import { remote, ipcRenderer } from 'electron';
import { isAbsoluteLinuxPath, isAbsoluteWindowsPath } from 'path-validation';
import { Form, Icon, Input, Button, Checkbox, Select } from 'antd';
import ipcEvents from '../../constants/ipc_events';
const { TextArea } = Input;
const { Option } = Select;
const { dialog } = remote;
//
import styles from './home.module.scss';
const Home = () => {
  //context state
  const [formState, formDispatch] = useContext(Context);
  //local state
  const [statusText, setStatusText] = useState('');
  const validatePath = (winValidator, osxValidator, path) => {
    return !!(winValidator(path) || osxValidator(path));
  };
  // effects
  useEffect(() => {
    let listener = (event, arg) => {
      setStatusText('minification complete');
    };
    ipcRenderer.on(ipcEvents.END_MINIFICATION, listener);
    return () => {
      ipcRenderer.removeListener(ipcEvents.END_MINIFICATION, listener);
    };
  }, []);
  // handlers
  const handleSubmit = event => {
    event.preventDefault();
    const { sourcePathText, outputPathText } = formState;
    if (!validatePath(isAbsoluteWindowsPath, isAbsoluteLinuxPath, sourcePathText)) {
      setStatusText('Your Source Path is Not Value');
      return;
    }
    if (!validatePath(isAbsoluteWindowsPath, isAbsoluteLinuxPath, outputPathText)) {
      setStatusText('Your Output Path is Not Value');
      return;
    }
    if (sourcePathText === outputPathText) {
      setStatusText('Your Source and Output paths can\'t be equal');
      return;
    }
    setStatusText('Processing');
    ipcRenderer.send(ipcEvents.START_MINIFICATION, formState);
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

  const handleOptionChange = (value, action)=>{
    formDispatch(action(value));
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
          Minify HTML
          <Select
            defaultValue={formState.htmlMinOption}
            style={{ width: 120 }}
            onChange={(e)=>{handleOptionChange (e, ACTIONS.html_min_submit)}}>
            <Option value="true">YES</Option>
            <Option value="false">NO</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          Minify JS
          <Select
            defaultValue={formState.jsMinOption}
            style={{ width: 120 }}
            onChange={(e)=>{handleOptionChange (e, ACTIONS.js_min_submit)}}>
            <Option value="true">YES</Option>
            <Option value="false">NO</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          Minify CSS
          <Select
            defaultValue={formState.cssMinOption}
            style={{ width: 120 }}
            onChange={(e)=>{handleOptionChange (e, ACTIONS.css_min_submit)}}>
            <Option value="true">YES</Option>
            <Option value="false">NO</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          Minify CSS
          <Select
            defaultValue={formState.svgMinOption}
            style={{ width: 120 }}
            onChange={(e)=>{handleOptionChange (e, ACTIONS.svg_min_submit)}}>
            <Option value="true">YES</Option>
            <Option value="false">NO</Option>
          </Select>
        </Form.Item>
        <br/>
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
