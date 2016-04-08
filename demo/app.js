import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, IndexRoute, hashHistory, Link, Redirect } from 'react-router';

import Containment from './pages/containment';
import Dynamic from './pages/dynamic';
import HOC from './pages/hoc';
import Image from './pages/image';

const App = ({ children }) => (
  <div className="wrapper">
    <ul>
      <li><Link to="/normal" activeClassName="active">Normal</Link></li>
      <li><Link to="/image" activeClassName="active">Image</Link></li>
      <li><Link to="/dynamic" activeClassName="active">Dynamic</Link></li>
      <li><Link to="/containment" activeClassName="active">Containment</Link></li>
    </ul>
    {children}
  </div>
);

const routes = (
  <Router history={hashHistory}>
    <Route path="/" component={App}>
      <Route path="/normal" component={HOC} />
      <Route path="/image" component={Image} />
      <Route path="/dynamic" component={Dynamic} />
      <Route path="/containment" component={Containment} />
      <Redirect to="/normal" />
    </Route>
  </Router>
);

ReactDOM.render(routes, document.getElementById('app'));
