'use strict';

import React from 'react/addons';
import {SortableItemMixin} from '../lib/index.js';

export default React.createClass({
  mixins: [SortableItemMixin],
  getDefaultProps () {
    return {
      className: 'demo-image-item'
    };
  },

  render () {
    return this.renderWithSortable(
      <img draggable={false} src={this.props.src} className={this.props.className} />
    );
  }
});

