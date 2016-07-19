/**
 * @file react-anything-sortable
 * @author jasonslyvia
 */

/* eslint new-cap:0, consistent-return: 0, react/prefer-es6-class: 0, react/sort-comp: 0 */
/**
 * @dependency
 */
import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { on, off, isFunction, isNumeric, position, closest, get,
        assign, findMostOften } from './utils';
import SortableItemMixin from './SortableItemMixin';


const STACK_SIZE = 6;
const getSortTarget = (child) => {
  // `onSortableItemReadyToMove` only exist when using mixins or decorators
  return child && child.props && isFunction(child.props.onSortableItemReadyToMove);
};

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
    sortHandle: PropTypes.string,
    containment: PropTypes.bool,
    dynamic: PropTypes.bool,
    direction: PropTypes.string,
    children: PropTypes.arrayOf(PropTypes.node)
  },

  setArrays(currentChildren) {
    const children = Array.isArray(currentChildren) ?
                     currentChildren :
                     [currentChildren];

    const sortChildren = children.filter(getSortTarget);
    this.sortChildren = sortChildren;

    // keep tracking the dimension and coordinates of all children
    this._dimensionArr = sortChildren.map(() => ({}));

    // keep tracking the order of all children
    this._orderArr = [];
    let i = 0;
    while (i < this._dimensionArr.length) {
      this._orderArr.push(i++);
    }
  },

  getInitialState() {
    this.setArrays(this.props.children);

    return {
      isDragging: false,
      placeHolderIndex: null,
      left: null,
      top: null
    };
  },

  componentDidUpdate() {
    const container = ReactDOM.findDOMNode(this);
    const rect = container.getBoundingClientRect();

    this._top = rect.top + document.body.scrollTop;
    this._left = rect.left + document.body.scrollLeft;
    this._bottom = this._top + rect.height;
    this._right = this._left + rect.width;
  },

  componentWillReceiveProps(nextProps) {
    const { children, dynamic } = this.props;
    if (dynamic && nextProps.children !== children) {
      this.setArrays(nextProps.children);
    }
  },

  componentWillUnmount() {
    this.unbindEvent();
  },

  bindEvent() {
    // so that the focus won't be lost if cursor moving too fast
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

    this.__touchMoveHandler = (e) => {
      // blocks the default scrolling as we sort an element
      e.preventDefault();

      this.handleMouseMove.call(this, {
        target: e.target,
        clientX: e.touches[0].clientX,
        clientY: e.touches[0].clientY,
        pageX: e.touches[0].pageX,
        pageY: e.touches[0].pageY
      });
    };

    this.__touchEndOrCancelHandler = (e) => {
      this.handleMouseUp.call(this, e);
    };

    on(document, 'touchmove', this.__touchMoveHandler);
    on(document, 'touchend', this.__touchEndOrCancelHandler);
    on(document, 'touchcancel', this.__touchEndOrCancelHandler);
    on(document, 'mousemove', this.__mouseMoveHandler);
    on(document, 'mouseup', this.__mouseUpHandler);
  },

  unbindEvent() {
    off(document, 'touchmove', this.__touchMoveHandler);
    off(document, 'touchend', this.__touchEndOrCancelHandler);
    off(document, 'touchcancel', this.__touchEndOrCancelHandler);
    off(document, 'mousemove', this.__mouseMoveHandler);
    off(document, 'mouseup', this.__mouseUpHandler);

    this.__mouseMoveHandler = null;
    this.__mouseUpHandler = null;
    this.__touchMoveHandler = null;
    this.__touchEndOrCancelHandler = null;
  },

  /**
   * getting ready for dragging
   * @param  {object} e     React event
   * @param  {numbner} index index of pre-dragging item
   */
  handleMouseDown(e, index) {
    this._draggingIndex = index;
    this._prevX = (e.pageX || e.clientX);
    this._prevY = (e.pageY || e.clientY);
    this._initOffset = e.offset;
    this._isReadyForDragging = true;
    this._hasInitDragging = false;

    // start listening mousemove and mouseup
    this.bindEvent();
  },

  /**
   * `add` a dragging item and re-calculating position of placeholder
   * @param  {object} e     React event
   */
  handleMouseMove(e) {
    this._isMouseMoving = true;

    if (!this._isReadyForDragging) {
      return false;
    }

    if (!this._hasInitDragging) {
      this._dimensionArr[this._draggingIndex].isPlaceHolder = true;
      this._hasInitDragging = true;
    }

    if (this.props.containment) {
      const x = e.pageX || e.clientX;
      const y = e.pageY || e.clientY;

      if (x < this._left || x > this._right || y < this._top || y > this._bottom) {
        return false;
      }
    }

    const newOffset = this.calculateNewOffset(e);
    const newIndex = this.calculateNewIndex(e);

    this._draggingIndex = newIndex;

    this.setState({
      isDragging: true,
      top: this.props.direction === 'horizontal' ? this._initOffset.top : newOffset.top,
      left: this.props.direction === 'vertical' ? this._initOffset.left : newOffset.left,
      placeHolderIndex: newIndex
    });

    this._prevX = (e.pageX || e.clientX);
    this._prevY = (e.pageY || e.clientY);
  },

  /**
   * replace placeholder with dragging item
   * @param  {object} e     React event
   */
  handleMouseUp() {
    const _hasMouseMoved = this._isMouseMoving;
    this.unbindEvent();

    const draggingIndex = this._draggingIndex;
    // reset temp lets
    this._draggingIndex = null;
    this._isReadyForDragging = false;
    this._isMouseMoving = false;
    this._initOffset = null;
    this._prevX = null;
    this._prevY = null;

    if (this.state.isDragging) {
      this._dimensionArr[this.state.placeHolderIndex].isPlaceHolder = false;

      if (_hasMouseMoved) {
        this.setState({
          isDragging: false,
          placeHolderIndex: null,
          left: null,
          top: null
        });
      }

      // sort finished, callback fires
      if (isFunction(this.props.onSort)) {
        const sortData = this.getSortData();
        this.props.onSort(sortData, sortData[draggingIndex], draggingIndex);
      }
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
  handleChildUpdate(offset, width, height, fullWidth, fullHeight, index) {
    assign(this._dimensionArr[index], {
      top: offset.top,
      left: offset.left,
      width,
      height,
      fullWidth,
      fullHeight
    });
  },

  /**
   * get new index of all items by cursor position
   * @param {object} offset {left: 12, top: 123}
   * @param {string} direction cursor moving direction, used to aviod blinking when
   *                 interchanging position of different width elements
   * @return {number}
   */
  getIndexByOffset(offset, direction) {
    if (!offset || !isNumeric(offset.top) || !isNumeric(offset.left)) {
      return 0;
    }

    const _dimensionArr = this._dimensionArr;
    const offsetX = offset.left;
    const offsetY = offset.top;
    const prevIndex = this.state.placeHolderIndex !== null ?
                   this.state.placeHolderIndex :
                   this._draggingIndex;
    let newIndex;

    _dimensionArr.every((item, index) => {
      const relativeLeft = offsetX - item.left;
      const relativeTop = offsetY - item.top;

      if (relativeLeft < item.fullWidth && relativeTop < item.fullHeight) {
        if (relativeLeft < item.fullWidth / 2 && direction === 'left') {
          newIndex = index;
        } else if (relativeLeft > item.fullWidth / 2 && direction === 'right') {
          newIndex = Math.min(index + 1, _dimensionArr.length - 1);
        } else if (relativeTop < item.fullHeight / 2 && direction === 'up') {
          newIndex = index;
        } else if (relativeTop > item.fullHeight / 2 && direction === 'down') {
          newIndex = Math.min(index + 1, _dimensionArr.length - 1);
        } else {
          return true;
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
  swapArrayItemPosition(arr, src, to) {
    if (!arr || !isNumeric(src) || !isNumeric(to)) {
      return arr;
    }

    const srcEl = arr.splice(src, 1)[0];
    arr.splice(to, 0, srcEl);
    return arr;
  },

  /**
   * calculate new offset
   * @param  {object} e MouseMove event
   * @return {object}   {left: 1, top: 1}
   */
  calculateNewOffset(e) {
    const deltaX = this._prevX - (e.pageX || e.clientX);
    const deltaY = this._prevY - (e.pageY || e.clientY);

    const prevLeft = this.state.left !== null ? this.state.left : this._initOffset.left;
    const prevTop = this.state.top !== null ? this.state.top : this._initOffset.top;
    const newLeft = prevLeft - deltaX;
    const newTop = prevTop - deltaY;

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
  calculateNewIndex(e) {
    const placeHolderIndex = this.state.placeHolderIndex !== null ?
                           this.state.placeHolderIndex :
                           this._draggingIndex;

    // Since `mousemove` is listened on document, when cursor move too fast,
    // `e.target` may be `body` or some other stuff instead of
    // `.ui-sortable-item`
    const target = get('.ui-sortable-dragging') ||
                   closest((e.target || e.srcElement), '.ui-sortable-item');
    const offset = position(target);

    const currentX = e.pageX || e.clientX;
    const currentY = e.pageY || e.clientY;

    const deltaX = Math.abs(this._prevX - currentX);
    const deltaY = Math.abs(this._prevY - currentY);

    let direction;
    if (deltaX > deltaY) {
      // tend to move left/right
      direction = this._prevX > currentX ? 'left' : 'right';
    } else {
      // tend to move up/down
      direction = this._prevY > currentY ? 'up' : 'down';
    }

    const newIndex = this.getIndexByOffset(offset, this.getPossibleDirection(direction));
    if (newIndex !== placeHolderIndex) {
      this._dimensionArr = this.swapArrayItemPosition(this._dimensionArr,
                                                      placeHolderIndex,
                                                      newIndex);
      this._orderArr = this.swapArrayItemPosition(this._orderArr, placeHolderIndex, newIndex);
    }

    return newIndex;
  },

  getSortData() {
    return this._orderArr.map((itemIndex) => {
      const item = this.sortChildren[itemIndex];
      if (!item) {
        return undefined;
      }

      return item.props.sortData;
    });
  },

  getPossibleDirection(direction) {
    this._stack = this._stack || [];
    this._stack.push(direction);
    if (this._stack.length > STACK_SIZE) {
      this._stack.shift();
    }

    if (this._stack.length < STACK_SIZE) {
      return direction;
    }

    return findMostOften(this._stack);
  },

  /**
   * render all sortable children which mixined with SortableItemMixin
   */
  renderItems() {
    const { _dimensionArr, _orderArr } = this;
    let draggingItem;

    const items = _orderArr.map((itemIndex, index) => {
      const item = this.sortChildren[itemIndex];
      if (!item) {
        return;
      }

      if (index === this._draggingIndex) {
        draggingItem = this.renderDraggingItem(item);
      }

      const isPlaceHolder = _dimensionArr[index].isPlaceHolder;
      const itemClassName = `ui-sortable-item
                             ${isPlaceHolder && 'ui-sortable-placeholder'}
                             ${this.state.isDragging && isPlaceHolder && 'visible'}`;

      const sortableProps = {
        sortableClassName: `${item.props.className} ${itemClassName}`,
        sortableIndex: index,
        onSortableItemReadyToMove: isPlaceHolder ? undefined : (e) => {
          this.handleMouseDown.call(this, e, index);
        },
        onSortableItemMount: this.handleChildUpdate,
        sortHandle: this.props.sortHandle
      };

      if (item.key === undefined) {
        sortableProps.key = index;
      }

      return React.cloneElement(item, sortableProps);
    });

    const children = Array.isArray(this.props.children) ?
                     this.props.children :
                     [this.props.children];

    const result = children.map(child => {
      if (getSortTarget(child)) {
        return items.shift();
      }
      return child;
    }).concat([draggingItem]);

    return result;
  },

  /**
   * render the item that being dragged
   * @param  {object} item a reference of this.props.children
   */
  renderDraggingItem(item) {
    if (!item) {
      return;
    }

    const style = {
      top: this.state.top,
      left: this.state.left,
      width: this._dimensionArr[this._draggingIndex].width,
      height: this._dimensionArr[this._draggingIndex].height
    };
    return React.cloneElement(item, {
      sortableClassName: `${item.props.className} ui-sortable-item ui-sortable-dragging`,
      key: '_dragging',
      sortableStyle: style,
      isDragging: true,
      sortHandle: this.props.sortHandle
    });
  },

  render() {
    const className = `ui-sortable ${this.props.className || ''}`;

    return (
      <div className={className}>
        {this.renderItems()}
      </div>
    );
  }
});

const SortableContainer = ({
  className, style, onMouseDown, onTouchStart, children,
}) => {
  if (React.isValidElement(children)) {
    return React.cloneElement(children, {
      className, style, onMouseDown, onTouchStart
    });
  } else {
    return React.createElement('div', {
      className, style, onMouseDown, onTouchStart, children
    });
  }
};

Sortable.SortableItemMixin = SortableItemMixin();
Sortable.sortable = SortableItemMixin;
Sortable.SortableContainer = SortableItemMixin(SortableContainer);

export default Sortable;
