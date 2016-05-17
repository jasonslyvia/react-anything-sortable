import React from 'react';
import Sortable from '../../src/';
import DemoItem from '../components/DemoItem';

export default class Dynamic extends React.Component {
  constructor() {
    super();
    this.state = {
      arr: [998, 225, 13]
    };
  }

  handleSort(sortedArray) {
    this.setState({
      arr: sortedArray
    });
  }

  handleAddElement() {
    this.setState({
      arr: this.state.arr.concat(Math.round(Math.random() * 1000))
    });
  }

  handleRemoveElement(index) {
    const newArr = this.state.arr.slice();
    newArr.splice(index, 1);

    this.setState({
      arr: newArr
    });
  }

  render() {
    function renderItem(num, index) {
      return (
        <DemoItem key={num} className="dynamic-item" sortData={num}>
          {num}
          <span className="delete"
            onClick={this.handleRemoveElement.bind(this, index)}
          >&times;</span>
        </DemoItem>
      );
    }

    return (
      <div className="demo-container">
        <h4 className="demo-title">
          Dynamically adding/removing children
          <a href="https://github.com/jasonslyvia/react-anything-sortable/tree/master/demo/pages/dynamic.js" target="_blank">source</a>
        </h4>
        <div className="dynamic-demo">
          <button onClick={::this.handleAddElement}>Add 1 element</button>
          <Sortable onSort={::this.handleSort} dynamic>
            {this.state.arr.map(renderItem, this)}
          </Sortable>
        </div>
      </div>
    );
  }
}
