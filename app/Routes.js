import React from 'react';
import { Router, Route, Switch } from 'react-router';
import history from './utils/history';
import Header from './components/views/header';
import Home from './components/views/home';
export default () => {
  return (
    <div>
      <Router history={history}>
        <Header history={history}/>
        <br/>
        <br/>
        <div>
          <Switch>
            <Route exact path='/' component={Home}/>
          </Switch>
        </div>
      </Router>

    </div>
  );
}

