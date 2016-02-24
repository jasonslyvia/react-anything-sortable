/**
 * @file react-anything-sortable
 * @author jasonslyvia
 */

/*eslint new-cap:0, consistent-return: 0 */

'use strict';

/**
 * @dependency
 */
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { on, off, isFunction, isNumeric, position, closest, get,
        assign, addClass, removeClass, hasClass } from './utils';
import SortableItemMixin from './SortableItemMixin';


/**
 * @class Sortable
 */
const Sortable = React.createClass({
  propTypes: {
    /**
     * callback fires after sort operation finish
     * function (dataSet){
     *   //dataSet sorted
     * }
     */
    onSort: PropTypes.func,
    className: PropTypes.string,
    containment: PropTypes.bool
  },

  getInitialState() {
    return {
      draggingIndex: null,
      dragOverIndex: null,
      orderArr: this.props.children.map((e, i) => i) || [],
    };
  },

  handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData("text/html", e.currentTarget);

    const target = closest(e.target, '.ui-sortable-item');
    if (!target) {
      return;
    }

    const draggingIndex = parseInt(target.getAttribute('data-index'), 10);
    this.setState({
      draggingIndex,
    });

    this._draggingEl = target;
    // this._placeholder = target.cloneNode(false);
    // addClass(this._placeholder, 'ui-sortable-placeholder');
    this._draggingEl.style.display = 'none';
  },

  handleDragOver(e) {
    e.preventDefault();

    const target = closest(e.target, '.ui-sortable-item');
    if (!target || (target && hasClass(target, 'ui-sortable-dragging'))) {
      return;
    }

    const dragOverIndex = parseInt(target.getAttribute('data-index'), 10);
    if (dragOverIndex && dragOverIndex !== this.state.dragOverIndex) {
      try {
        target.parentNode.removeChild(this._placeholder);
      }
      catch (e) {

      }
      finally {
        target.parentNode.insertBefore(this._placeholder, target);
      }
    }

    this.setState({
      dragOverIndex: dragOverIndex || this.state.dragOverIndex,
    });
  },

  handleDragEnd(e) {
    const { draggingIndex, dragOverIndex, orderArr } = this.state;
    const pos = draggingIndex < dragOverIndex ? dragOverIndex - 1 : dragOverIndex;
    const newOrderArr = orderArr.slice();

    newOrderArr.splice(pos, 0, newOrderArr.splice(draggingIndex, 1)[0]);
    this.setState({
      draggingIndex: null,
      dragOverIndex: null,
      orderArr: newOrderArr
    });

    if (this._draggingEl) {
      this._draggingEl.parentNode.removeChild(this._placeholder);
      this._draggingEl.style.display = 'block';
      this._draggingEl = null;
      this._placeholder = null;
    }
  },

  renderItems() {
    const { draggingIndex, orderArr } = this.state;
    return orderArr.map(orderIndex => {
      const el = this.props.children[orderIndex];
      return React.cloneElement(el, {
        ref: orderIndex,
        className: `ui-sortable-item ${el.props.className || ''}`,
        draggable: true,
        'data-index': orderIndex
      });
    });
  },

  render() {
    console.log('render');
    const className = 'ui-sortable ' + (this.props.className || '');
    const items = this.renderItems();

    return (
      <div className={className}
           onDragOver={this.handleDragOver}
           onDragStart={this.handleDragStart}
           onDragEnd={this.handleDragEnd}>
        {items}
      </div>
    );
  }
});

Sortable.SortableItemMixin = SortableItemMixin();
Sortable.sortable = SortableItemMixin;

export default Sortable;
