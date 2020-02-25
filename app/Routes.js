import React, { useEffect } from 'react';
import { Router, Route, Switch } from 'react-router';
import Routes from "./constants/routes"
import history from './utils/history';
import { Layout } from 'antd';
const { Header, Footer, Sider, Content } = Layout;
import AppHeader from './components/views/header';
import Home from './components/views/home';
import Directions from "./components/views/directions"

export default () => {
  useEffect(() => {
    history.push('/');
  });
  return (
    <Router history={history}>

      <Layout>
        <Header>
          <AppHeader history={history}/>
        </Header>

        <Content>
          <Switch>
            <Route exact path={Routes.HOME} component={Directions}/>
          </Switch>
          <Switch>
            <Route exact path={Routes.MINIFIER} component={Home}/>
          </Switch>
        </Content>
      </Layout>
    </Router>
  );
}

