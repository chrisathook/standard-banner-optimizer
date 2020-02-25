// @flow
import React, {
  useState,
  useContext,
  useEffect,
  Fragment,
  useRef
} from 'react';
import { Context } from '../../store/Store';
import * as ACTIONS from '../../store/actions/actions';
import { remote, ipcRenderer } from 'electron';
import { isAbsoluteLinuxPath, isAbsoluteWindowsPath } from 'path-validation';
import {
  Form,
  Icon,
  Input,
  InputNumber,
  Button,
  Checkbox,
  Select,
  Row,
  Col,
  Typography
} from 'antd';
import ipcEvents from '../../constants/ipc_events';
const { TextArea } = Input;
const { Option } = Select;
const { dialog } = remote;
const { Title, Text } = Typography;
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
  let ipcMessagelistener = (event, message) => {
    setStatusText(message + '\n' + prevCountRef.current);
  };
  const prevCountRef = useRef();
  useEffect(() => {
    prevCountRef.current = statusText;
  }, [statusText]);
  useEffect(() => {
    formDispatch(ACTIONS.window_aspect_ratio_submit(window.devicePixelRatio));
    ipcRenderer.on(ipcEvents.MINIFICATION_STATUS_UPDATE, ipcMessagelistener);
    ipcRenderer.on(ipcEvents.END_MINIFICATION, ipcMessagelistener);
    return () => {
      ipcRenderer.removeListener(ipcEvents.END_MINIFICATION, ipcMessagelistener);
      ipcRenderer.removeListener(ipcEvents.MINIFICATION_STATUS_UPDATE, ipcMessagelistener);
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
    setStatusText('');
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
  const handleZipSizeChange = (value) => {
    formDispatch(ACTIONS.zip_file_size_limit(value));
    event.preventDefault();
  };
  const handleStaticSizeChange = (value) => {
    formDispatch(ACTIONS.static_file_size_limit(value));
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
  const handleOptionChange = (value, action) => {
    formDispatch(action(value));
  };
  // HOCs
  /**
   *
   * @param props
   * @returns {*}
   */
  const FormSelector = (props) => {
    return (
      <Fragment>
        <Form.Item>
          <Text>{props.title}</Text>
          <br/>
          <Select
            defaultValue={props.display_value}
            style={{ width: 120 }}
            onChange={(e) => {
              handleOptionChange(e, props.submit_function);
            }}>
            <Option value="true">YES</Option>
            <Option value="false">NO</Option>
          </Select>
        </Form.Item>
      </Fragment>
    );
  };
  return (
    <div className={styles.main_div}>

      <Row>
        <Col><Title>Standard Banner Minifier</Title></Col>
      </Row>


      <Form onSubmit={handleSubmit}>


        <Row>
          <Col><Text>Paste Directory Path of Source Files:</Text></Col>

        </Row>
        <Row>
          <Col span={12}><Form.Item>
            <input
              id="source_path_field"
              className={styles.minifier_form_input}
              type="text"
              value={formState.sourcePathText}
              onChange={handleInputSource}
              placeholder="Paste Path to Source Folder"
            />
          </Form.Item></Col>
          <Col style={{ paddingLeft: '10px' }} span={12}><Button
            onClick={(e) => {
              spawnDialog(e, ACTIONS.source_input_change);
            }}
            type="primary">Use File Browser</Button></Col>
        </Row>


        <Row>
          <Col span={12}><Form.Item>
            <input
              id="output_path_field"
              className={styles.minifier_form_input}
              type="text"
              value={formState.outputPathText}
              onChange={handleInputOutput}
              placeholder="Paste Path to Output Folder"
            />
          </Form.Item></Col>
          <Col style={{ paddingLeft: '10px' }} span={12}><Button
            onClick={(e) => {
              spawnDialog(e, ACTIONS.output_input_change);
            }}
            type="primary">Use File Browser</Button></Col>
        </Row>

        <Row>
          <Col>
            <Title level={2}>Minifier Options</Title>
          </Col>
        </Row>
        <Row>
          <Col className={styles.min_col} span={8}> <FormSelector
            title="Minify HTML"
            display_value={formState.htmlMinOption}
            submit_function={ACTIONS.html_min_submit}
          /></Col>
          <Col className={styles.min_col} span={8}> <FormSelector
            title="Minify JS"
            display_value={formState.jsMinOption}
            submit_function={ACTIONS.js_min_submit}
          /></Col>
          <Col className={styles.min_col} span={8}><FormSelector
            title="Minify CSS"
            display_value={formState.cssMinOption}
            submit_function={ACTIONS.css_min_submit}
          /></Col>
        </Row>
        <Row>
          <Col className={styles.min_col} span={8}><FormSelector
            title="Optimize Images"
            display_value={formState.optimizeImages}
            submit_function={ACTIONS.optimize_images_submit}
          /></Col>
          <Col className={styles.min_col} span={8}><FormSelector
            title="Make Zips"
            display_value={formState.createZips}
            submit_function={ACTIONS.zips_submit}
          /></Col>
          <Col className={styles.min_col} span={8}>
            <Text>Zip File Size Limit in KB</Text><br/>
            <InputNumber style={{marginTop:"10px"}} min={50} max={500}
                         defaultValue={formState.zipFileSizeLimit}
                         onChange={handleZipSizeChange}/>


          </Col>
        </Row>

        <Row>
          <Col className={styles.min_col} span={8}>
            <Text>Static File Size Limit in KB</Text><br/>
            <InputNumber min={20} max={500}
                         defaultValue={formState.staticFileSizeLimit}
                         onChange={handleStaticSizeChange}/>
          </Col>
        </Row>
<br/>
        <Row>
          <Col className={styles.min_col}>
            <Form.Item>
              <TextArea
                className={styles.min_col}
                rows={4}
                readOnly
                placeholder="Results Updated Here"
                value={statusText}
              />
            </Form.Item>

          </Col>
        </Row>
        <Row>
          <Col style={{paddingTop:'10px'}}><Form.Item>
            <input type="submit" value="Submit"/>
          </Form.Item></Col>
        </Row>
      </Form>
    </div>
  );
};
export default Home;
