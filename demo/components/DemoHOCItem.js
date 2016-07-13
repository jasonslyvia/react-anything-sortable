import React from 'react';
import { sortable } from '../../src/index.js';

@sortable
class DemoHOCItem extends React.Component {
  render() {
    return (
      <div
        className={this.props.className}
        style={this.props.style}
        onMouseDown={this.props.onMouseDown}
        onTouchStart={this.props.onTouchStart}
      >
        {this.props.children}
      </div>
    );
  }
}

export default DemoHOCItem;

