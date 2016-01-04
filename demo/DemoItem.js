'use strict';

import React from 'react';
import { SortableItemMixin } from '../src/index.js';

export default React.createClass({
  mixins: [SortableItemMixin],
  getDefaultProps () {
    return {
      className: 'demo-item'
    };
  },

  render () {
    return this.renderWithSortable(
      <div className={this.props.className}>
        {this.props.children}
      </div>
    );
  }
});

