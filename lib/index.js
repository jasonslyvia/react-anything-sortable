/**
 * @file react-anything-sortable
 * @author jasonslyvia
 */

/*eslint new-cap:0, consistent-return: 0 */

'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * @dependency
 */

var _reactAddons = require('react/addons');

var _reactAddons2 = _interopRequireDefault(_reactAddons);

var _utilsJs = require('./utils.js');

var CX = _reactAddons2['default'].addons.classSet;
var CloneWithProps = _reactAddons2['default'].addons.cloneWithProps;

/**
 * @class Sortable
 */
exports['default'] = _reactAddons2['default'].createClass({
  displayName: 'index',

  propTypes: {
    /**
     * callback fires after sort operation finish
     * function (dataSet){
     *   //dataSet sorted
     * }
     */
    onSort: _reactAddons2['default'].PropTypes.func,
    className: _reactAddons2['default'].PropTypes.string },

  getInitialState: function getInitialState() {
    //keep tracking the dimension and coordinates of all children
    this._dimensionArr = this.props.children ? Array.isArray(this.props.children) ? this.props.children.map(function () {
      return {};
    }) : [{}] : [];

    //keep tracking the order of all children
    this._orderArr = [];
    var i = 0;
    while (i < this._dimensionArr.length) {
      this._orderArr.push(i++);
    }

    return {
      isDragging: false,
      placeHolderIndex: null,
      left: null,
      top: null
    };
  },

  componentDidMount: function componentDidMount() {
    this.containerWidth = this.getDOMNode().offsetWidth;
  },

  componentWillUnmount: function componentWillUnmount() {
    this.unbindEvent();
  },

  bindEvent: function bindEvent() {
    var _this = this;

    //so that the focus won't be lost if cursor moving too fast
    this.__mouseMoveHandler = function (e) {
      /**
       * Since Chrome may trigger redundant mousemove event evne if
       * we didn't really move the mouse, we should make sure that
       * mouse coordinates really changed then respond to mousemove
       * event
       * @see https://code.google.com/p/chromium/issues/detail?id=327114
       */
      if ((e.pageX || e.clientX) === _this._prevX && (e.pageY || e.clientY) === _this._prevY || _this._prevX === null && _this._prevY === null) {
        return false;
      }

      _this.handleMouseMove.call(_this, e);
    };

    this.__mouseUpHandler = function (e) {
      _this.handleMouseUp.call(_this, e);
    };

    (0, _utilsJs.on)(document, 'mousemove', this.__mouseMoveHandler);
    (0, _utilsJs.on)(document, 'mouseup', this.__mouseUpHandler);
  },

  unbindEvent: function unbindEvent() {
    (0, _utilsJs.off)(document, 'mousemove', this.__mouseMoveHandler);
    (0, _utilsJs.off)(document, 'mouseup', this.__mouseUpHandler);

    this.__mouseMoveHandler = null;
    this.__mouseUpHandler = null;
  },

  /**
   * getting ready for dragging
   * @param  {object} e     React event
   * @param  {numbner} index index of pre-dragging item
   */
  handleMouseDown: function handleMouseDown(e, index) {
    this._draggingIndex = index;
    this._prevX = e.pageX || e.clientX;
    this._prevY = e.pageY || e.clientY;
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
  handleMouseMove: function handleMouseMove(e) {
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

    this._prevX = e.pageX || e.clientX;
    this._prevY = e.pageY || e.clientY;
  },

  /**
   * replace placeholder with dragging item
   * @param  {object} e     React event
   */
  handleMouseUp: function handleMouseUp() {
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
      if ((0, _utilsJs.isFunction)(this.props.onSort)) {
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
  handleChildUpdate: function handleChildUpdate(offset, width, height, fullWidth, fullHeight, index) {
    (0, _utilsJs.assign)(this._dimensionArr[index], {
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
  getIndexByOffset: function getIndexByOffset(offset, direction) {
    var _this2 = this;

    if (!offset || !(0, _utilsJs.isNumeric)(offset.top) || !(0, _utilsJs.isNumeric)(offset.left)) {
      return 0;
    }

    var _dimensionArr = this._dimensionArr;
    var offsetX = offset.left;
    var offsetY = offset.top;
    var prevIndex = this.state.placeHolderIndex !== null ? this.state.placeHolderIndex : this._draggingIndex;
    var newIndex;

    _dimensionArr.every(function (coord, index) {
      var relativeLeft = offsetX - coord.left;
      var relativeTop = offsetY - coord.top;

      if (offsetX < 0) {
        newIndex = 0;
        return false;
      } else if (offsetX > _this2.containerWidth) {
        newIndex = _dimensionArr.length - 1;
        return false;
      } else if (relativeLeft < coord.fullWidth && relativeTop < coord.fullHeight) {
        if (relativeLeft < coord.fullWidth / 2 && direction === 'left') {
          newIndex = index;
        } else if (relativeLeft > coord.fullWidth / 2 && direction === 'right') {
          newIndex = Math.min(index + 1, _dimensionArr.length - 1);
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
  swapArrayItemPosition: function swapArrayItemPosition(arr, src, to) {
    if (!arr || !(0, _utilsJs.isNumeric)(src) || !(0, _utilsJs.isNumeric)(to)) {
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
  calculateNewOffset: function calculateNewOffset(e) {
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
  calculateNewIndex: function calculateNewIndex(e) {
    var placeHolderIndex = this.state.placeHolderIndex !== null ? this.state.placeHolderIndex : this._draggingIndex;

    // Since `mousemove` is listened on document, when cursor move too fast,
    // `e.target` may be `body` or some other stuff instead of
    // `.ui-sortable-item`
    var target = (0, _utilsJs.closest)(e.target || e.srcElement, '.ui-sortable-item') || (0, _utilsJs.get)('.ui-sortable-dragging');
    var offset = (0, _utilsJs.position)(target);
    var direction = this._prevX > (e.pageX || e.clientX) ? 'left' : 'right';

    var newIndex = this.getIndexByOffset(offset, direction);
    if (newIndex !== placeHolderIndex) {
      this._dimensionArr = this.swapArrayItemPosition(this._dimensionArr, placeHolderIndex, newIndex);
      this._orderArr = this.swapArrayItemPosition(this._orderArr, placeHolderIndex, newIndex);
    }

    return newIndex;
  },

  getSortData: function getSortData() {
    var _this3 = this;

    return this._orderArr.map(function (itemIndex, index) {
      if (_this3._dimensionArr[index].isDeleted) {
        return undefined;
      }
      var item = Array.isArray(_this3.props.children) ? _this3.props.children[itemIndex] : _this3.props.children;
      if (!item) {
        return undefined;
      }
      return item.props.sortData;
    });
  },

  /**
   * render all sortable children which mixined with SortableItemMixin
   */
  renderItems: function renderItems() {
    var _this4 = this;

    var _dimensionArr = this._dimensionArr;
    var _orderArr = this._orderArr;

    var draggingItem;

    var items = _orderArr.map(function (itemIndex, index) {
      var item = Array.isArray(_this4.props.children) ? _this4.props.children[itemIndex] : _this4.props.children;
      if (_dimensionArr[index].isDeleted) {
        return undefined;
      }
      if (!item) {
        return undefined;
      }
      if (index === _this4._draggingIndex) {
        draggingItem = _this4.renderDraggingItem(item);
      }

      var isPlaceHolder = _dimensionArr[index].isPlaceHolder;
      var itemClassName = CX({
        'ui-sortable-item': true,
        'ui-sortable-placeholder': isPlaceHolder,
        'visible': _this4.state.isDragging && isPlaceHolder
      });

      return CloneWithProps(item, {
        key: index,
        sortableClassName: itemClassName,
        sortableIndex: index,
        onSortableItemMouseDown: isPlaceHolder ? undefined : function (e) {
          _this4.handleMouseDown.call(_this4, e, index);
        },
        onSortableItemMount: _this4.handleChildUpdate
      });
    });

    return items.concat([draggingItem]);
  },

  /**
   * render the item that being dragged
   * @param  {object} item a reference of this.props.children
   */
  renderDraggingItem: function renderDraggingItem(item) {
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

  render: function render() {
    var className = 'ui-sortable ' + (this.props.className || '');

    return _reactAddons2['default'].createElement(
      'div',
      { className: className },
      this.renderItems()
    );
  }
});

/**
 * @class SortableItemMixin
 */
var SortableItemMixin = {
  getDefaultProps: function getDefaultProps() {
    return {
      sortableClassName: '',
      sortableStyle: {},
      onSortableItemMount: function onSortableItemMount() {},
      onSortableItemUnmount: function onSortableItemUnmount() {},
      onSortableItemMouseDown: function onSortableItemMouseDown() {}
    };
  },

  handleSortableItemMouseDown: function handleSortableItemMouseDown(e) {
    var target = (0, _utilsJs.closest)(e.target || e.srcElement, '.ui-sortable-item');
    var evt = {
      pageX: e.pageX || e.clientX,
      pageY: e.pageY || e.clientY,
      offset: (0, _utilsJs.position)(target)
    };

    this.props.onSortableItemMouseDown(evt, this.props.sortableIndex);
  },

  componentDidMount: function componentDidMount() {
    var node = this.getDOMNode();

    (0, _utilsJs.on)(node, 'selectstart', function (e) {
      if (e.preventDefault) {
        e.preventDefault();
      } else {
        e.returnValue = false;
      }
    });
    this.props.onSortableItemMount((0, _utilsJs.position)(node), (0, _utilsJs.width)(node), (0, _utilsJs.height)(node), (0, _utilsJs.outerWidthWithMargin)(node), (0, _utilsJs.outerHeightWithMargin)(node), this.props.sortableIndex);
  },

  componentDidUpdate: function componentDidUpdate() {
    var node = this.getDOMNode();
    this.props.onSortableItemMount((0, _utilsJs.position)(node), (0, _utilsJs.width)(node), (0, _utilsJs.height)(node), (0, _utilsJs.outerWidthWithMargin)(node), (0, _utilsJs.outerHeightWithMargin)(node), this.props.sortableIndex);
  },

  renderWithSortable: function renderWithSortable(item) {
    return _reactAddons2['default'].addons.cloneWithProps(item, {
      className: this.props.sortableClassName,
      style: this.props.sortableStyle,
      key: this.props.sortableIndex,
      onMouseDown: this.handleSortableItemMouseDown
    });
  }
};

exports.SortableItemMixin = SortableItemMixin;