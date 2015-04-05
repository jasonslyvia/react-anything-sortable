'use strict';

import React from 'react/addons';
import {SortableItemMixin} from '../lib/index.js';

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

