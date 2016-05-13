import React from 'react';
import Sortable from '../../src/';
import ImageItem from '../components/ImageItem.js';

export default class HOC extends React.Component {
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
          Images
          <a href="https://github.com/jasonslyvia/react-anything-sortable/tree/master/demo/pages/image.js" target="_blank">source</a>
        </h4>
        <p className="sort-result">{this.state.result}</p>
        <Sortable onSort={::this.handleSort}>
          <ImageItem src="http://ww4.sinaimg.cn/large/831e9385gw1equsc4s1hbj207y02xmx9.jpg"
                     sortData="react" key={1} />
          <ImageItem src="http://ww4.sinaimg.cn/large/831e9385gw1equsc3q8lej20fz04waa8.jpg"
                     sortData="angular" key={2} />
          <ImageItem src="http://ww4.sinaimg.cn/large/831e9385gw1equsc46m7zj20ff02zq3h.jpg"
                     sortData="backbone" key={3} />
        </Sortable>
      </div>
    );
  }
}
