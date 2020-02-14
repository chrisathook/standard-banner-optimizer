import React, { useContext,useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Context from '../../utils/context';

const Header = (props) => {
    const context = useContext(Context);

    useEffect(()=>{
      props.history.push ('/');
    });

    return(
        <div>
            <Link to='/' style={{padding: '5px'}}>
                Home
            </Link>
            <Link to='/basics' style={{padding: '5px'}}>
                basics
            </Link>

        </div>
    )};





export default Header;
