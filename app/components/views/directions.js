// @flow
import React, {
  Fragment
} from 'react';
import styles from "./directions.module.scss"
import { Typography } from 'antd';

const { Title,Text  } = Typography;
const Directions = (props) => {
  return (
    <div className={styles.main_div}>
      <Title>Directions Go Here</Title>

    </div>
  );
};
export default Directions;
