'use strict';

import React from 'react';
import { SortableItemMixin } from '../src/index.js';

export default React.createClass({
  mixins: [SortableItemMixin],
  getDefaultProps () {
    return {
      className: 'img-item'
    };
  },

  render () {
    return this.renderWithSortable(
      <img draggable={false} src={this.props.src} className={this.props.className} />
    );
  }
});

