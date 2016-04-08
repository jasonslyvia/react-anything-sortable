import React from 'react';
import { SortableItemMixin } from '../../src/index.js';

export default React.createClass({
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

