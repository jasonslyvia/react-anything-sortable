import React from 'react';
import createReactClass from 'create-react-class';
import { SortableItemMixin } from '../../src/index.js';

export default createReactClass({  //eslint-disable-line
  mixins: [SortableItemMixin],
  getDefaultProps() {
    return {
      className: 'action-item'
    };
  },

  getInitialState() {
    return {
      clicked: false
    };
  },

  handleClick() {
    this.setState({
      clicked: !this.state.clicked
    });
  },

  render() {
    return this.renderWithSortable(
      <div className={this.props.className}>
        {this.props.children}
        <span className="close" onClick={this.handleClick}>{this.state.clicked ? '⌘' : 'ℹ'}</span>
      </div>
    );
  }
});

