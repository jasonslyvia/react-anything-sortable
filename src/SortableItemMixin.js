import React from 'react';
import ReactDOM from 'react-dom';
import {on, position, closest, width, height,
        outerWidthWithMargin, outerHeightWithMargin} from './utils';

/**
 * @class SortableItemMixin
 */
export default {
  getDefaultProps() {
    return {
      sortableClassName: '',
      sortableStyle: {},
      onSortableItemMount: () => {},
      onSortableItemReadyToMove: () => {}
    };
  },

  handleSortableItemReadyToMove(e) {
    const target = closest((e.target || e.srcElement), '.ui-sortable-item');
    const evt = {
      pageX: (e.pageX || e.clientX || e.touches[0].pageX),
      pageY: (e.pageY || e.clientY || e.touches[0].pageY),
      offset: position(target)
    };

    this.props.onSortableItemReadyToMove(evt, this.props.sortableIndex);
  },

  componentDidMount() {
    const node = ReactDOM.findDOMNode(this);

    on(node, 'selectstart', (e) => {
      if (e.preventDefault) {
        e.preventDefault();
      }
      else {
        e.returnValue = false;
      }
    });
    this.props.onSortableItemMount(position(node),
                                   width(node),
                                   height(node),
                                   outerWidthWithMargin(node),
                                   outerHeightWithMargin(node),
                                   this.props.sortableIndex);
  },

  componentDidUpdate() {
    const node = ReactDOM.findDOMNode(this);
    this.props.onSortableItemMount(position(node),
                                   width(node),
                                   height(node),
                                   outerWidthWithMargin(node),
                                   outerHeightWithMargin(node),
                                   this.props.sortableIndex);
  },

  renderWithSortable(item) {
    return React.cloneElement(item, {
      className: this.props.sortableClassName,
      style: this.props.sortableStyle,
      key: this.props.sortableIndex,
      onMouseDown: this.handleSortableItemReadyToMove,
      onTouchStart: this.handleSortableItemReadyToMove
    });
  }
};
