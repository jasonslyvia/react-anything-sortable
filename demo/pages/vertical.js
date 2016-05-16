import React from 'react';
import Sortable from '../../src/';
import DemoHOCItem from '../components/DemoHOCItem.js';

export default class Vertical extends React.Component {
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
          Using decorators
          <a href="https://github.com/jasonslyvia/react-anything-sortable/tree/master/demo/pages/vertical.js" target="_blank">source</a>
        </h4>
        <p className="sort-result">result: {this.state.result}</p>
        <Sortable onSort={::this.handleSort} className="vertical-container">
          <DemoHOCItem className="vertical" sortData="react" key={1}>
            React
          </DemoHOCItem>
          <DemoHOCItem className="vertical" sortData="angular" key={2}>
            Angular
          </DemoHOCItem>
          <DemoHOCItem className="vertical" sortData="backbone" key={3}>
            Backbone
          </DemoHOCItem>
        </Sortable>
      </div>
    );
  }
}
