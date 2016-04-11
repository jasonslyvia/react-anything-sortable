import React from 'react';
import Sortable from '../../src/';
import DemoItem from '../components/DemoItem.js';

export default class Containment extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  handleSort(data) {
    this.setState({
      result: data.join(' ')
    });
  }

  render() {
    return (
      <div className="demo-container">
        <h4 className="demo-title">
          Sort handle
          <a href="https://github.com/jasonslyvia/react-anything-sortable/tree/master/demo/pages/handle.js" target="_blank">source</a>
        </h4>
        <p className="sort-result">{this.state.result}</p>
        <Sortable className="handle-demo" sortHandle="handle">
          <DemoItem sortData="react" key={1}>
            React
            <span className="handle">↔</span>
          </DemoItem>
          <DemoItem sortData="angular" key={2}>
            Angular
            <span className="handle">↔</span>
          </DemoItem>
          <DemoItem sortData="backbone" key={3}>
            Backbone
            <span className="handle">↔</span>
          </DemoItem>
        </Sortable>
      </div>
    );
  }
}
