import React from 'react/addons';
import {on, position, closest, width, height,
        outerWidthWithMargin, outerHeightWithMargin} from './utils';

/**
 * @class SortableItemMixin
 */
export default {
  getDefaultProps () {
    return {
      sortableClassName: '',
      sortableStyle: {},
      onSortableItemMount: () => {},
      onSortableItemUnmount: () => {},
      onSortableItemMouseDown: () => {}
    };
  },

  handleSortableItemMouseDown (e) {
    const target = closest((e.target || e.srcElement), '.ui-sortable-item');
    const evt = {
      pageX: (e.pageX || e.clientX),
      pageY: (e.pageY || e.clientY),
      offset: position(target)
    };

    this.props.onSortableItemMouseDown(evt, this.props.sortableIndex);
  },

  componentDidMount () {
    const node = React.findDOMNode(this);

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

  componentDidUpdate () {
    const node = React.findDOMNode(this);
    this.props.onSortableItemMount(position(node),
                                   width(node),
                                   height(node),
                                   outerWidthWithMargin(node),
                                   outerHeightWithMargin(node),
                                   this.props.sortableIndex);
  },

  renderWithSortable (item) {
    return React.addons.cloneWithProps(item, {
      className: this.props.sortableClassName,
      style: this.props.sortableStyle,
      key: this.props.sortableIndex,
      onMouseDown: this.handleSortableItemMouseDown
    });
  }
};
