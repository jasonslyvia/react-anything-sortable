/**
 * @fileOverview demo of react-anything-sortable
 */
'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import Sortable from '../src/index.js';
import Item from './DemoItem.js';
import ImageItem from './ImageItem.js';
import ActionItem from './ActionItem.js';

ReactDOM.render(
  <Sortable onSort={handleSort} className="style-for-test">
    <Item className="item-1" sortData="react" key={1}>
      React
    </Item>
    <Item className="item-2" sortData="angular" key={2}>
      Angular
    </Item>
    <Item className="item-3" sortData="backbone" key={3}>
      Backbone
    </Item>
  </Sortable>
, document.getElementById('react'));

function handleSort(data){
  document.getElementById('result').innerText = data.join(' ');
}

ReactDOM.render(
  <Sortable onSort={handleSort1}>
    <ImageItem src="http://ww4.sinaimg.cn/large/831e9385gw1equsc4s1hbj207y02xmx9.jpg"
               sortData="react" />
    <ImageItem src="http://ww4.sinaimg.cn/large/831e9385gw1equsc3q8lej20fz04waa8.jpg"
               sortData="angular" />
    <ImageItem src="http://ww4.sinaimg.cn/large/831e9385gw1equsc46m7zj20ff02zq3h.jpg"
               sortData="backbone" />
  </Sortable>
, document.getElementById('react1'));

function handleSort1(data){
  document.getElementById('result1').innerText = data.join(' ');
}



ReactDOM.render(
  <Sortable>
    <ActionItem>Ember</ActionItem>
    <ActionItem>jQuery</ActionItem>
    <ActionItem>YUI</ActionItem>
  </Sortable>
, document.getElementById('react2'));


class DynamicDemo extends React.Component {
  constructor() {
    super();
    this.state = {
      arr: [998, 225, 13]
    };
    this._sortableKey = 0;
  }

  handleSort(sortedArray) {
    this._sortableKey++;
    this.setState({
      arr: sortedArray
    });
  }

  handleAddElement() {
    this._sortableKey++;
    this.setState({
      arr: this.state.arr.concat(Math.round(Math.random() * 1000))
    });
  }

  handleRemoveElement(index) {
    const newArr = this.state.arr.slice()
    newArr.splice(index, 1);
    this._sortableKey++;

    this.setState({
      arr: newArr
    });
  }

  render() {
    return (
      <div className="dynamic-demo">
        <button onClick={::this.handleAddElement}>Add 1 element</button>
        <Sortable key={this._sortableKey} onSort={::this.handleSort}>
          {this.state.arr.map((num, index) => {
            return (
              <Item key="index" className="dynamic-item" sortData={num}>
                {num}
                <span className="delete" onMouseDown={this.handleRemoveElement.bind(this, index)}>&times;</span>
              </Item>
            );
          })}
        </Sortable>
      </div>
    );
  }
}

ReactDOM.render(<DynamicDemo />, document.getElementById('react3'));


ReactDOM.render(
  <Sortable className="containment-demo" containment>
    <Item className="item-1" sortData="react" key={1}>
      React
    </Item>
    <Item className="item-2" sortData="angular" key={2}>
      Angular
    </Item>
    <Item className="item-3" sortData="backbone" key={3}>
      Backbone
    </Item>
  </Sortable>
, document.getElementById('react4'));
