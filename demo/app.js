import React from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, hashHistory, Link, Redirect } from 'react-router';

import Containment from './pages/containment';
import Dynamic from './pages/dynamic';
import HOC from './pages/hoc';
import Image from './pages/image';
import Handle from './pages/handle';

const App = ({ children }) => (
  <div className="wrapper">
    <ul>
      <li><Link to="/normal" activeClassName="active">Normal</Link></li>
      <li><Link to="/image" activeClassName="active">Image</Link></li>
      <li><Link to="/dynamic" activeClassName="active">Dynamic</Link></li>
      <li><Link to="/containment" activeClassName="active">Containment</Link></li>
      <li><Link to="/handle" activeClassName="active">Handle</Link></li>
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
      <Route path="/handle" component={Handle} />
      <Redirect to="/normal" />
    </Route>
  </Router>
);

ReactDOM.render(routes, document.getElementById('app'));
