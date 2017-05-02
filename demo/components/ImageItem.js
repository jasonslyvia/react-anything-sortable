import React from 'react';
import createReactClass from 'create-react-class';
import { SortableItemMixin } from '../../src/index.js';

export default createReactClass({
  mixins: [SortableItemMixin],
  getDefaultProps() {
    return {
      className: 'img-item'
    };
  },

  render() {
    return this.renderWithSortable(
      <img draggable={false} src={this.props.src} className={this.props.className} />
    );
  }
});

