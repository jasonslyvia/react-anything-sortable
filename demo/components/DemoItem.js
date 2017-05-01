import React from 'react';
import createReactClass from 'create-react-class';
import { SortableItemMixin } from '../../src/index.js';

export default createReactClass({
  mixins: [SortableItemMixin],

  getDefaultProps() {
    return {
      className: 'demo-item'
    };
  },

  render() {
    const { className, children } = this.props;
    return this.renderWithSortable(
      <div className={className}>
        {children}
      </div>
    );
  }
});

