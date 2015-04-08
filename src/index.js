/**
 * @file react-anything-sortable
 * @author jasonslyvia
 */

/*eslint new-cap:0, consistent-return: 0 */

'use strict';

/**
 * @dependency
 */
import React from 'react/addons';
import {on, off, isFunction, isNumeric, position, closest, get,
        assign, width, height,
        outerWidthWithMargin, outerHeightWithMargin} from './utils.js';

var CX = React.addons.classSet;
var CloneWithProps = React.addons.cloneWithProps;

/**
 * @class Sortable
 */
export default React.createClass({
  propTypes: {
    /**
     * callback fires after sort operation finish
     * function (dataSet){
     *   //dataSet sorted
     * }
     */
    onSort: React.PropTypes.func,
    className: React.PropTypes.string,
  },

  getInitialState () {
    //keep tracking the dimension and coordinates of all children
    this._dimensionArr = this.props.children ?
                         this.props.children.map(() => {return {}; }) :
                         [];

    //keep tracking the order of all children
    this._orderArr = [];
    var i = 0;
    while(i < this._dimensionArr.length){
      this._orderArr.push(i++);
    }

    return {
      isDragging: false,
      placeHolderIndex: null,
      left: null,
      top: null
    };
  },

  componentDidMount () {
    this.containerWidth = this.getDOMNode().offsetWidth;
  },

  componentWillUnmount () {
    this.unbindEvent();
  },

  bindEvent () {
    //so that the focus won't be lost if cursor moving too fast
    this.__mouseMoveHandler = (e) => {
      /**
       * Since Chrome may trigger redundant mousemove event evne if
       * we didn't really move the mouse, we should make sure that
       * mouse coordinates really changed then respond to mousemove
       * event
       * @see https://code.google.com/p/chromium/issues/detail?id=327114
       */
      if (((e.pageX || e.clientX) === this._prevX && (e.pageY || e.clientY) === this._prevY) ||
          (this._prevX === null && this._prevY === null)) {
        return false;
      }

      this.handleMouseMove.call(this, e);
    };

    this.__mouseUpHandler = (e) => {
      this.handleMouseUp.call(this, e);
    };

    on(document, 'mousemove', this.__mouseMoveHandler);
    on(document, 'mouseup', this.__mouseUpHandler);
  },

  unbindEvent () {
    off(document, 'mousemove', this.__mouseMoveHandler);
    off(document, 'mouseup', this.__mouseUpHandler);

    this.__mouseMoveHandler = null;
    this.__mouseUpHandler = null;
  },

  /**
   * getting ready for dragging
   * @param  {object} e     React event
   * @param  {numbner} index index of pre-dragging item
   */
  handleMouseDown (e, index) {
    this._draggingIndex = index;
    this._prevX = (e.pageX || e.clientX);
    this._prevY = (e.pageY || e.clientY);
    this._initOffset = e.offset;
    this._isReadyForDragging = true;
    this._hasInitDragging = false;

    //start listening mousemove and mouseup
    this.bindEvent();
  },

  /**
   * `add` a dragging item and re-calculating position of placeholder
   * @param  {object} e     React event
   */
  handleMouseMove (e) {
    this._isMouseMoving = true;

    if (!this._isReadyForDragging) {
      return false;
    }

    if (!this._hasInitDragging) {
      this._dimensionArr[this._draggingIndex].isPlaceHolder = true;
      this._hasInitDragging = false;
    }

    var newOffset = this.calculateNewOffset(e);
    var newIndex = this.calculateNewIndex(e);

    this._draggingIndex = newIndex;

    this.setState({
      isDragging: true,
      top: newOffset.top,
      left: newOffset.left,
      placeHolderIndex: newIndex
    });

    this._prevX = (e.pageX || e.clientX);
    this._prevY = (e.pageY || e.clientY);
  },

  /**
   * replace placeholder with dragging item
   * @param  {object} e     React event
   */
  handleMouseUp () {
    var _hasMouseMoved = this._isMouseMoving;
    this.unbindEvent();

    //reset temp vars
    this._draggingIndex = null;
    this._isReadyForDragging = false;
    this._isMouseMoving = false;
    this._initOffset = null;
    this._prevX = null;
    this._prevY = null;

    if (this.state.isDragging) {
      this._dimensionArr[this.state.placeHolderIndex].isPlaceHolder = false;

      //sort finished, callback fires
      if (isFunction(this.props.onSort)) {
        this.props.onSort(this.getSortData());
      }
    }

    if (this.isMounted() && _hasMouseMoved) {
      this.setState({
        isDragging: false,
        placeHolderIndex: null,
        left: null,
        top: null
      });
    }
  },

  /**
   * when children mounted, return its size(handled by SortableItemMixin)
   * @param  {object} offset {top:1, left:2}
   * @param  {number} width
   * @param  {number} height
   * @param  {number} fullWidth  (with margin)
   * @param  {number} fullHeight (with margin)
   * @param  {number} index
   */
  handleChildUpdate (offset, width, height, fullWidth, fullHeight, index) {
    assign(this._dimensionArr[index], {
      top: offset.top,
      left: offset.left,
      width: width,
      height: height,
      fullWidth: fullWidth,
      fullHeight: fullHeight
    });
  },

  /**
   * get new index of all items by cursor position
   * @param {object} offset {left: 12, top: 123}
   * @param {string} direction cursor moving direction, used to aviod blinking when
   *                 interchanging position of different width elements
   * @return {number}
   */
  getIndexByOffset (offset, direction) {
    if (!offset || !isNumeric(offset.top) || !isNumeric(offset.left)) {
      return 0;
    }

    var _dimensionArr = this._dimensionArr;
    var offsetX = offset.left;
    var offsetY = offset.top;
    var prevIndex = this.state.placeHolderIndex !== null ?
                   this.state.placeHolderIndex :
                   this._draggingIndex;
    var newIndex;

    _dimensionArr.every((coord, index) => {
      var relativeLeft = offsetX - coord.left;
      var relativeTop = offsetY - coord.top;

      if (offsetX < 0) {
        newIndex = 0;
        return false;
      }
      else if (offsetX > this.containerWidth) {
        newIndex = _dimensionArr.length - 1;
        return false;
      }
      else if (relativeLeft < coord.fullWidth && relativeTop < coord.fullHeight) {
        if (relativeLeft < coord.fullWidth / 2 && direction === 'left') {
          newIndex = index;
        }
        else if(relativeLeft > coord.fullWidth / 2 && direction === 'right'){
          newIndex = Math.min(index+1, _dimensionArr.length-1);
        }
        return false;
      }
      return true;
    });

    return newIndex !== undefined ? newIndex : prevIndex;
  },

  /**
   * untility function
   * @param  {array} arr
   * @param  {number} src
   * @param  {number} to
   * @return {array}
   */
  swapArrayItemPosition (arr, src, to) {
    if (!arr || !isNumeric(src) || !isNumeric(to)) {
      return arr;
    }

    var srcEl = arr.splice(src, 1)[0];
    arr.splice(to, 0, srcEl);
    return arr;
  },

  /**
   * calculate new offset
   * @param  {object} e MouseMove event
   * @return {object}   {left: 1, top: 1}
   */
  calculateNewOffset (e) {
    var deltaX = this._prevX - (e.pageX || e.clientX);
    var deltaY = this._prevY - (e.pageY || e.clientY);

    var prevLeft = this.state.left !== null ? this.state.left : this._initOffset.left;
    var prevTop = this.state.top !== null ? this.state.top : this._initOffset.top;
    var newLeft = prevLeft - deltaX;
    var newTop = prevTop - deltaY;

    return {
      left: newLeft,
      top: newTop
    };
  },

  /**
   * calculate new index and do swapping
   * @param  {object} e MouseMove event
   * @return {number}
   */
  calculateNewIndex (e) {
    var placeHolderIndex = this.state.placeHolderIndex !== null ?
                           this.state.placeHolderIndex :
                           this._draggingIndex;

    // Since `mousemove` is listened on document, when cursor move too fast,
    // `e.target` may be `body` or some other stuff instead of
    // `.ui-sortable-item`
    var target = closest((e.target || e.srcElement), '.ui-sortable-item') || get('.ui-sortable-dragging');
    var offset = position(target);
    var direction = this._prevX > (e.pageX || e.clientX) ? 'left' : 'right';

    var newIndex = this.getIndexByOffset(offset, direction);
    if (newIndex !== placeHolderIndex) {
      this._dimensionArr = this.swapArrayItemPosition(this._dimensionArr, placeHolderIndex, newIndex);
      this._orderArr = this.swapArrayItemPosition(this._orderArr, placeHolderIndex, newIndex);
    }

    return newIndex;
  },

  getSortData () {
    return this._orderArr.map((itemIndex, index) => {
      if (this._dimensionArr[index].isDeleted) {
        return undefined;
      }
      return this.props.children[itemIndex].props.sortData;
    });
  },

  /**
   * render all sortable children which mixined with SortableItemMixin
   */
  renderItems () {
    var _dimensionArr = this._dimensionArr;
    var _orderArr = this._orderArr;

    var draggingItem;

    var items = _orderArr.map((itemIndex, index) => {
      var item = this.props.children[itemIndex];
      if (_dimensionArr[index].isDeleted) {
        return undefined;
      }
      if (index === this._draggingIndex) {
        draggingItem = this.renderDraggingItem(item);
      }

      var isPlaceHolder = _dimensionArr[index].isPlaceHolder;
      var itemClassName = CX({
        'ui-sortable-item': true,
        'ui-sortable-placeholder': isPlaceHolder,
        'visible': this.state.isDragging && isPlaceHolder
      });

      return CloneWithProps(item, {
        key: index,
        sortableClassName: itemClassName,
        sortableIndex: index,
        onSortableItemMouseDown: isPlaceHolder ? undefined : (e) => {
          this.handleMouseDown.call(this, e, index);
        },
        onSortableItemMount: this.handleChildUpdate
      });
    });

    return items.concat([draggingItem]);
  },

  /**
   * render the item that being dragged
   * @param  {object} item a reference of this.props.children
   */
  renderDraggingItem (item) {
    if (!item) {
      return;
    }

    var style = {
      top: this.state.top,
      left: this.state.left,
      width: this._dimensionArr[this._draggingIndex].width,
      height: this._dimensionArr[this._draggingIndex].height
    };
    return CloneWithProps(item, {
      sortableClassName: 'ui-sortable-item ui-sortable-dragging',
      key: this._dimensionArr.length,
      sortableStyle: style,
      isDragging: true
    });
  },

  render () {
    var className = 'ui-sortable ' + (this.props.className || '');

    return (
      <div className={className}>
        {this.renderItems()}
      </div>
    );
  }
});


/**
 * @class SortableItemMixin
 */
var SortableItemMixin = {
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
    var target = closest((e.target || e.srcElement), '.ui-sortable-item');
    var evt = {
      pageX: (e.pageX || e.clientX),
      pageY: (e.pageY || e.clientY),
      offset: position(target)
    };

    this.props.onSortableItemMouseDown(evt, this.props.sortableIndex);
  },

  componentDidMount () {
    var node = this.getDOMNode();

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
    var node = this.getDOMNode();
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

export { SortableItemMixin };
