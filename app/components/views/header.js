// @flow
import React, { useEffect } from 'react';
import Routes from '../../constants/routes';
import styles from './header.module.scss';
import {
  Button,
  Row,
  Col
} from 'antd';
const AppHeader = (props) => {

  const clickHandler = (event,data) =>{
    props.history.push (data);
  };

  return (
    <div>

      <Row>
        <Col className={styles.header_button}  span={24}>

          <Button className={styles.header_button} onClick={(e)=>{clickHandler(e,Routes.HOME)}} >HOME</Button>
          <Button className={styles.header_button} onClick={(e)=>{clickHandler(e,Routes.MINIFIER)}} >MINIFIER</Button>
          <Button className={styles.header_button} onClick={(e)=>{clickHandler(e,Routes.VALIDATOR)}} >VALIDATOR</Button>
          <Button className={styles.header_button} onClick={(e)=>{clickHandler(e,Routes.SERVER)}}>SERVER</Button>
        </Col>
      </Row>



    </div>
  );
};
export default AppHeader;
