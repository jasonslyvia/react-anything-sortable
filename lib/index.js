(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("react-dom"));
	else if(typeof define === 'function' && define.amd)
		define(["React", "ReactDOM"], factory);
	else if(typeof exports === 'object')
		exports["react-anything-sortable"] = factory(require("react"), require("react-dom"));
	else
		root["react-anything-sortable"] = factory(root["React"], root["ReactDOM"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_15__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * @file react-anything-sortable
	 * @author jasonslyvia
	 */
	
	/* eslint new-cap:0, consistent-return: 0, react/prefer-es6-class: 0, react/sort-comp: 0 */
	/**
	 * @dependency
	 */
	'use strict';
	
	exports.__esModule = true;
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _propTypes = __webpack_require__(2);
	
	var _propTypes2 = _interopRequireDefault(_propTypes);
	
	var _createReactClass = __webpack_require__(11);
	
	var _createReactClass2 = _interopRequireDefault(_createReactClass);
	
	var _reactDom = __webpack_require__(15);
	
	var _reactDom2 = _interopRequireDefault(_reactDom);
	
	var _utils = __webpack_require__(16);
	
	var _SortableItemMixin = __webpack_require__(17);
	
	var _SortableItemMixin2 = _interopRequireDefault(_SortableItemMixin);
	
	var STACK_SIZE = 6;
	var getSortTarget = function getSortTarget(child) {
	  // `onSortableItemReadyToMove` only exist when using mixins or decorators
	  return child && child.props && _utils.isFunction(child.props.onSortableItemReadyToMove);
	};
	
	/**
	 * @class Sortable
	 */
	var Sortable = _createReactClass2['default']({
	  propTypes: {
	    /**
	     * callback fires after sort operation finish
	     * function (dataSet){
	     *   //dataSet sorted
	     * }
	     */
	    onSort: _propTypes2['default'].func,
	    className: _propTypes2['default'].string,
	    sortHandle: _propTypes2['default'].string,
	    containment: _propTypes2['default'].bool,
	    dynamic: _propTypes2['default'].bool,
	    direction: _propTypes2['default'].string,
	    children: _propTypes2['default'].arrayOf(_propTypes2['default'].node)
	  },
	
	  setArrays: function setArrays(currentChildren) {
	    var children = Array.isArray(currentChildren) ? currentChildren : [currentChildren];
	
	    var sortChildren = children.filter(getSortTarget);
	    this.sortChildren = sortChildren;
	
	    // keep tracking the dimension and coordinates of all children
	    this._dimensionArr = sortChildren.map(function () {
	      return {};
	    });
	
	    // keep tracking the order of all children
	    this._orderArr = [];
	    var i = 0;
	    while (i < this._dimensionArr.length) {
	      this._orderArr.push(i++);
	    }
	  },
	
	  getInitialState: function getInitialState() {
	    this.setArrays(this.props.children);
	
	    return {
	      isDragging: false,
	      placeHolderIndex: null,
	      left: null,
	      top: null
	    };
	  },
	
	  componentDidUpdate: function componentDidUpdate() {
	    var container = _reactDom2['default'].findDOMNode(this);
	    var rect = container.getBoundingClientRect();
	
	    this._top = rect.top + document.body.scrollTop;
	    this._left = rect.left + document.body.scrollLeft;
	    this._bottom = this._top + rect.height;
	    this._right = this._left + rect.width;
	  },
	
	  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
	    var _props = this.props;
	    var children = _props.children;
	    var dynamic = _props.dynamic;
	
	    if (dynamic && nextProps.children !== children) {
	      this.setArrays(nextProps.children);
	    }
	  },
	
	  componentWillUnmount: function componentWillUnmount() {
	    this.unbindEvent();
	  },
	
	  bindEvent: function bindEvent() {
	    var _this = this;
	
	    // so that the focus won't be lost if cursor moving too fast
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
	
	    this.__touchMoveHandler = function (e) {
	      // blocks the default scrolling as we sort an element
	      e.preventDefault();
	
	      _this.handleMouseMove.call(_this, {
	        target: e.target,
	        clientX: e.touches[0].clientX,
	        clientY: e.touches[0].clientY,
	        pageX: e.touches[0].pageX,
	        pageY: e.touches[0].pageY
	      });
	    };
	
	    this.__touchEndOrCancelHandler = function (e) {
	      _this.handleMouseUp.call(_this, e);
	    };
	
	    _utils.on(document, 'touchmove', this.__touchMoveHandler);
	    _utils.on(document, 'touchend', this.__touchEndOrCancelHandler);
	    _utils.on(document, 'touchcancel', this.__touchEndOrCancelHandler);
	    _utils.on(document, 'mousemove', this.__mouseMoveHandler);
	    _utils.on(document, 'mouseup', this.__mouseUpHandler);
	  },
	
	  unbindEvent: function unbindEvent() {
	    _utils.off(document, 'touchmove', this.__touchMoveHandler);
	    _utils.off(document, 'touchend', this.__touchEndOrCancelHandler);
	    _utils.off(document, 'touchcancel', this.__touchEndOrCancelHandler);
	    _utils.off(document, 'mousemove', this.__mouseMoveHandler);
	    _utils.off(document, 'mouseup', this.__mouseUpHandler);
	
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
	  handleMouseDown: function handleMouseDown(e, index) {
	    this._draggingIndex = index;
	    this._prevX = e.pageX || e.clientX;
	    this._prevY = e.pageY || e.clientY;
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
	  handleMouseMove: function handleMouseMove(e) {
	    this._isMouseMoving = true;
	
	    if (!this._isReadyForDragging) {
	      return false;
	    }
	
	    if (!this._hasInitDragging) {
	      this._dimensionArr[this._draggingIndex].isPlaceHolder = true;
	      this._hasInitDragging = true;
	    }
	
	    if (this.props.containment) {
	      var x = e.pageX || e.clientX;
	      var y = e.pageY || e.clientY;
	
	      if (x < this._left || x > this._right || y < this._top || y > this._bottom) {
	        return false;
	      }
	    }
	
	    var newOffset = this.calculateNewOffset(e);
	    var newIndex = this.calculateNewIndex(e);
	
	    this._draggingIndex = newIndex;
	
	    this.setState({
	      isDragging: true,
	      top: this.props.direction === 'horizontal' ? this._initOffset.top : newOffset.top,
	      left: this.props.direction === 'vertical' ? this._initOffset.left : newOffset.left,
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
	
	    var draggingIndex = this._draggingIndex;
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
	      if (_utils.isFunction(this.props.onSort)) {
	        var sortData = this.getSortData();
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
	  handleChildUpdate: function handleChildUpdate(offset, width, height, fullWidth, fullHeight, index) {
	    _utils.assign(this._dimensionArr[index], {
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
	    if (!offset || !_utils.isNumeric(offset.top) || !_utils.isNumeric(offset.left)) {
	      return 0;
	    }
	
	    var _dimensionArr = this._dimensionArr;
	    var offsetX = offset.left;
	    var offsetY = offset.top;
	    var prevIndex = this.state.placeHolderIndex !== null ? this.state.placeHolderIndex : this._draggingIndex;
	    var newIndex = undefined;
	
	    _dimensionArr.every(function (item, index) {
	      var relativeLeft = offsetX - item.left;
	      var relativeTop = offsetY - item.top;
	
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
	  swapArrayItemPosition: function swapArrayItemPosition(arr, src, to) {
	    if (!arr || !_utils.isNumeric(src) || !_utils.isNumeric(to)) {
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
	    var target = _utils.get('.ui-sortable-dragging') || _utils.closest(e.target || e.srcElement, '.ui-sortable-item');
	    var offset = _utils.position(target);
	
	    var currentX = e.pageX || e.clientX;
	    var currentY = e.pageY || e.clientY;
	
	    var deltaX = Math.abs(this._prevX - currentX);
	    var deltaY = Math.abs(this._prevY - currentY);
	
	    var direction = undefined;
	    if (deltaX > deltaY) {
	      // tend to move left/right
	      direction = this._prevX > currentX ? 'left' : 'right';
	    } else {
	      // tend to move up/down
	      direction = this._prevY > currentY ? 'up' : 'down';
	    }
	
	    var newIndex = this.getIndexByOffset(offset, this.getPossibleDirection(direction));
	    if (newIndex !== placeHolderIndex) {
	      this._dimensionArr = this.swapArrayItemPosition(this._dimensionArr, placeHolderIndex, newIndex);
	      this._orderArr = this.swapArrayItemPosition(this._orderArr, placeHolderIndex, newIndex);
	    }
	
	    return newIndex;
	  },
	
	  getSortData: function getSortData() {
	    var _this2 = this;
	
	    return this._orderArr.map(function (itemIndex) {
	      var item = _this2.sortChildren[itemIndex];
	      if (!item) {
	        return undefined;
	      }
	
	      return item.props.sortData;
	    });
	  },
	
	  getPossibleDirection: function getPossibleDirection(direction) {
	    this._stack = this._stack || [];
	    this._stack.push(direction);
	    if (this._stack.length > STACK_SIZE) {
	      this._stack.shift();
	    }
	
	    if (this._stack.length < STACK_SIZE) {
	      return direction;
	    }
	
	    return _utils.findMostOften(this._stack);
	  },
	
	  /**
	   * render all sortable children which mixined with SortableItemMixin
	   */
	  renderItems: function renderItems() {
	    var _this3 = this;
	
	    var _dimensionArr = this._dimensionArr;
	    var _orderArr = this._orderArr;
	
	    var draggingItem = undefined;
	
	    var items = _orderArr.map(function (itemIndex, index) {
	      var item = _this3.sortChildren[itemIndex];
	      if (!item) {
	        return;
	      }
	
	      if (index === _this3._draggingIndex && _this3.state.isDragging) {
	        draggingItem = _this3.renderDraggingItem(item);
	      }
	
	      var isPlaceHolder = _dimensionArr[index].isPlaceHolder;
	      var itemClassName = 'ui-sortable-item\n                             ' + (isPlaceHolder && 'ui-sortable-placeholder') + '\n                             ' + (_this3.state.isDragging && isPlaceHolder && 'visible');
	
	      var sortableProps = {
	        sortableClassName: item.props.className + ' ' + itemClassName,
	        sortableIndex: index,
	        onSortableItemReadyToMove: isPlaceHolder ? undefined : function (e) {
	          _this3.handleMouseDown.call(_this3, e, index);
	        },
	        onSortableItemMount: _this3.handleChildUpdate,
	        sortHandle: _this3.props.sortHandle
	      };
	
	      if (item.key === undefined) {
	        sortableProps.key = index;
	      }
	
	      return _react2['default'].cloneElement(item, sortableProps);
	    });
	
	    var children = Array.isArray(this.props.children) ? this.props.children : [this.props.children];
	
	    var result = children.map(function (child) {
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
	    return _react2['default'].cloneElement(item, {
	      sortableClassName: item.props.className + ' ui-sortable-item ui-sortable-dragging',
	      key: '_dragging',
	      sortableStyle: style,
	      isDragging: true,
	      sortHandle: this.props.sortHandle
	    });
	  },
	
	  render: function render() {
	    var className = 'ui-sortable ' + (this.props.className || '');
	
	    return _react2['default'].createElement(
	      'div',
	      { className: className },
	      this.renderItems()
	    );
	  }
	});
	
	var SortableContainer = function SortableContainer(_ref) {
	  var className = _ref.className;
	  var style = _ref.style;
	  var onMouseDown = _ref.onMouseDown;
	  var onTouchStart = _ref.onTouchStart;
	  var children = _ref.children;
	
	  if (_react2['default'].isValidElement(children)) {
	    return _react2['default'].cloneElement(children, {
	      className: className, style: style, onMouseDown: onMouseDown, onTouchStart: onTouchStart
	    });
	  } else {
	    return _react2['default'].createElement('div', {
	      className: className, style: style, onMouseDown: onMouseDown, onTouchStart: onTouchStart, children: children
	    });
	  }
	};
	
	Sortable.SortableItemMixin = _SortableItemMixin2['default']();
	Sortable.sortable = _SortableItemMixin2['default'];
	Sortable.SortableContainer = _SortableItemMixin2['default'](SortableContainer);
	
	exports['default'] = Sortable;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */
	
	if (process.env.NODE_ENV !== 'production') {
	  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
	    Symbol.for &&
	    Symbol.for('react.element')) ||
	    0xeac7;
	
	  var isValidElement = function(object) {
	    return typeof object === 'object' &&
	      object !== null &&
	      object.$$typeof === REACT_ELEMENT_TYPE;
	  };
	
	  // By explicitly using `prop-types` you are opting into new development behavior.
	  // http://fb.me/prop-types-in-prod
	  var throwOnDirectAccess = true;
	  module.exports = __webpack_require__(4)(isValidElement, throwOnDirectAccess);
	} else {
	  // By explicitly using `prop-types` you are opting into new production behavior.
	  // http://fb.me/prop-types-in-prod
	  module.exports = __webpack_require__(10)();
	}
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ },
/* 3 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	
	
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	
	
	
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	process.prependListener = noop;
	process.prependOnceListener = noop;
	
	process.listeners = function (name) { return [] }
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */
	
	'use strict';
	
	var emptyFunction = __webpack_require__(5);
	var invariant = __webpack_require__(6);
	var warning = __webpack_require__(7);
	
	var ReactPropTypesSecret = __webpack_require__(8);
	var checkPropTypes = __webpack_require__(9);
	
	module.exports = function(isValidElement, throwOnDirectAccess) {
	  /* global Symbol */
	  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
	  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.
	
	  /**
	   * Returns the iterator method function contained on the iterable object.
	   *
	   * Be sure to invoke the function with the iterable as context:
	   *
	   *     var iteratorFn = getIteratorFn(myIterable);
	   *     if (iteratorFn) {
	   *       var iterator = iteratorFn.call(myIterable);
	   *       ...
	   *     }
	   *
	   * @param {?object} maybeIterable
	   * @return {?function}
	   */
	  function getIteratorFn(maybeIterable) {
	    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
	    if (typeof iteratorFn === 'function') {
	      return iteratorFn;
	    }
	  }
	
	  /**
	   * Collection of methods that allow declaration and validation of props that are
	   * supplied to React components. Example usage:
	   *
	   *   var Props = require('ReactPropTypes');
	   *   var MyArticle = React.createClass({
	   *     propTypes: {
	   *       // An optional string prop named "description".
	   *       description: Props.string,
	   *
	   *       // A required enum prop named "category".
	   *       category: Props.oneOf(['News','Photos']).isRequired,
	   *
	   *       // A prop named "dialog" that requires an instance of Dialog.
	   *       dialog: Props.instanceOf(Dialog).isRequired
	   *     },
	   *     render: function() { ... }
	   *   });
	   *
	   * A more formal specification of how these methods are used:
	   *
	   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
	   *   decl := ReactPropTypes.{type}(.isRequired)?
	   *
	   * Each and every declaration produces a function with the same signature. This
	   * allows the creation of custom validation functions. For example:
	   *
	   *  var MyLink = React.createClass({
	   *    propTypes: {
	   *      // An optional string or URI prop named "href".
	   *      href: function(props, propName, componentName) {
	   *        var propValue = props[propName];
	   *        if (propValue != null && typeof propValue !== 'string' &&
	   *            !(propValue instanceof URI)) {
	   *          return new Error(
	   *            'Expected a string or an URI for ' + propName + ' in ' +
	   *            componentName
	   *          );
	   *        }
	   *      }
	   *    },
	   *    render: function() {...}
	   *  });
	   *
	   * @internal
	   */
	
	  var ANONYMOUS = '<<anonymous>>';
	
	  // Important!
	  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
	  var ReactPropTypes = {
	    array: createPrimitiveTypeChecker('array'),
	    bool: createPrimitiveTypeChecker('boolean'),
	    func: createPrimitiveTypeChecker('function'),
	    number: createPrimitiveTypeChecker('number'),
	    object: createPrimitiveTypeChecker('object'),
	    string: createPrimitiveTypeChecker('string'),
	    symbol: createPrimitiveTypeChecker('symbol'),
	
	    any: createAnyTypeChecker(),
	    arrayOf: createArrayOfTypeChecker,
	    element: createElementTypeChecker(),
	    instanceOf: createInstanceTypeChecker,
	    node: createNodeChecker(),
	    objectOf: createObjectOfTypeChecker,
	    oneOf: createEnumTypeChecker,
	    oneOfType: createUnionTypeChecker,
	    shape: createShapeTypeChecker
	  };
	
	  /**
	   * inlined Object.is polyfill to avoid requiring consumers ship their own
	   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
	   */
	  /*eslint-disable no-self-compare*/
	  function is(x, y) {
	    // SameValue algorithm
	    if (x === y) {
	      // Steps 1-5, 7-10
	      // Steps 6.b-6.e: +0 != -0
	      return x !== 0 || 1 / x === 1 / y;
	    } else {
	      // Step 6.a: NaN == NaN
	      return x !== x && y !== y;
	    }
	  }
	  /*eslint-enable no-self-compare*/
	
	  /**
	   * We use an Error-like object for backward compatibility as people may call
	   * PropTypes directly and inspect their output. However, we don't use real
	   * Errors anymore. We don't inspect their stack anyway, and creating them
	   * is prohibitively expensive if they are created too often, such as what
	   * happens in oneOfType() for any type before the one that matched.
	   */
	  function PropTypeError(message) {
	    this.message = message;
	    this.stack = '';
	  }
	  // Make `instanceof Error` still work for returned errors.
	  PropTypeError.prototype = Error.prototype;
	
	  function createChainableTypeChecker(validate) {
	    if (process.env.NODE_ENV !== 'production') {
	      var manualPropTypeCallCache = {};
	      var manualPropTypeWarningCount = 0;
	    }
	    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
	      componentName = componentName || ANONYMOUS;
	      propFullName = propFullName || propName;
	
	      if (secret !== ReactPropTypesSecret) {
	        if (throwOnDirectAccess) {
	          // New behavior only for users of `prop-types` package
	          invariant(
	            false,
	            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
	            'Use `PropTypes.checkPropTypes()` to call them. ' +
	            'Read more at http://fb.me/use-check-prop-types'
	          );
	        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
	          // Old behavior for people using React.PropTypes
	          var cacheKey = componentName + ':' + propName;
	          if (
	            !manualPropTypeCallCache[cacheKey] &&
	            // Avoid spamming the console because they are often not actionable except for lib authors
	            manualPropTypeWarningCount < 3
	          ) {
	            warning(
	              false,
	              'You are manually calling a React.PropTypes validation ' +
	              'function for the `%s` prop on `%s`. This is deprecated ' +
	              'and will throw in the standalone `prop-types` package. ' +
	              'You may be seeing this warning due to a third-party PropTypes ' +
	              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.',
	              propFullName,
	              componentName
	            );
	            manualPropTypeCallCache[cacheKey] = true;
	            manualPropTypeWarningCount++;
	          }
	        }
	      }
	      if (props[propName] == null) {
	        if (isRequired) {
	          if (props[propName] === null) {
	            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
	          }
	          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
	        }
	        return null;
	      } else {
	        return validate(props, propName, componentName, location, propFullName);
	      }
	    }
	
	    var chainedCheckType = checkType.bind(null, false);
	    chainedCheckType.isRequired = checkType.bind(null, true);
	
	    return chainedCheckType;
	  }
	
	  function createPrimitiveTypeChecker(expectedType) {
	    function validate(props, propName, componentName, location, propFullName, secret) {
	      var propValue = props[propName];
	      var propType = getPropType(propValue);
	      if (propType !== expectedType) {
	        // `propValue` being instance of, say, date/regexp, pass the 'object'
	        // check, but we can offer a more precise error message here rather than
	        // 'of type `object`'.
	        var preciseType = getPreciseType(propValue);
	
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }
	
	  function createAnyTypeChecker() {
	    return createChainableTypeChecker(emptyFunction.thatReturnsNull);
	  }
	
	  function createArrayOfTypeChecker(typeChecker) {
	    function validate(props, propName, componentName, location, propFullName) {
	      if (typeof typeChecker !== 'function') {
	        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
	      }
	      var propValue = props[propName];
	      if (!Array.isArray(propValue)) {
	        var propType = getPropType(propValue);
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
	      }
	      for (var i = 0; i < propValue.length; i++) {
	        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
	        if (error instanceof Error) {
	          return error;
	        }
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }
	
	  function createElementTypeChecker() {
	    function validate(props, propName, componentName, location, propFullName) {
	      var propValue = props[propName];
	      if (!isValidElement(propValue)) {
	        var propType = getPropType(propValue);
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }
	
	  function createInstanceTypeChecker(expectedClass) {
	    function validate(props, propName, componentName, location, propFullName) {
	      if (!(props[propName] instanceof expectedClass)) {
	        var expectedClassName = expectedClass.name || ANONYMOUS;
	        var actualClassName = getClassName(props[propName]);
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }
	
	  function createEnumTypeChecker(expectedValues) {
	    if (!Array.isArray(expectedValues)) {
	      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
	      return emptyFunction.thatReturnsNull;
	    }
	
	    function validate(props, propName, componentName, location, propFullName) {
	      var propValue = props[propName];
	      for (var i = 0; i < expectedValues.length; i++) {
	        if (is(propValue, expectedValues[i])) {
	          return null;
	        }
	      }
	
	      var valuesString = JSON.stringify(expectedValues);
	      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
	    }
	    return createChainableTypeChecker(validate);
	  }
	
	  function createObjectOfTypeChecker(typeChecker) {
	    function validate(props, propName, componentName, location, propFullName) {
	      if (typeof typeChecker !== 'function') {
	        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
	      }
	      var propValue = props[propName];
	      var propType = getPropType(propValue);
	      if (propType !== 'object') {
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
	      }
	      for (var key in propValue) {
	        if (propValue.hasOwnProperty(key)) {
	          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
	          if (error instanceof Error) {
	            return error;
	          }
	        }
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }
	
	  function createUnionTypeChecker(arrayOfTypeCheckers) {
	    if (!Array.isArray(arrayOfTypeCheckers)) {
	      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
	      return emptyFunction.thatReturnsNull;
	    }
	
	    function validate(props, propName, componentName, location, propFullName) {
	      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
	        var checker = arrayOfTypeCheckers[i];
	        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
	          return null;
	        }
	      }
	
	      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
	    }
	    return createChainableTypeChecker(validate);
	  }
	
	  function createNodeChecker() {
	    function validate(props, propName, componentName, location, propFullName) {
	      if (!isNode(props[propName])) {
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }
	
	  function createShapeTypeChecker(shapeTypes) {
	    function validate(props, propName, componentName, location, propFullName) {
	      var propValue = props[propName];
	      var propType = getPropType(propValue);
	      if (propType !== 'object') {
	        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
	      }
	      for (var key in shapeTypes) {
	        var checker = shapeTypes[key];
	        if (!checker) {
	          continue;
	        }
	        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
	        if (error) {
	          return error;
	        }
	      }
	      return null;
	    }
	    return createChainableTypeChecker(validate);
	  }
	
	  function isNode(propValue) {
	    switch (typeof propValue) {
	      case 'number':
	      case 'string':
	      case 'undefined':
	        return true;
	      case 'boolean':
	        return !propValue;
	      case 'object':
	        if (Array.isArray(propValue)) {
	          return propValue.every(isNode);
	        }
	        if (propValue === null || isValidElement(propValue)) {
	          return true;
	        }
	
	        var iteratorFn = getIteratorFn(propValue);
	        if (iteratorFn) {
	          var iterator = iteratorFn.call(propValue);
	          var step;
	          if (iteratorFn !== propValue.entries) {
	            while (!(step = iterator.next()).done) {
	              if (!isNode(step.value)) {
	                return false;
	              }
	            }
	          } else {
	            // Iterator will provide entry [k,v] tuples rather than values.
	            while (!(step = iterator.next()).done) {
	              var entry = step.value;
	              if (entry) {
	                if (!isNode(entry[1])) {
	                  return false;
	                }
	              }
	            }
	          }
	        } else {
	          return false;
	        }
	
	        return true;
	      default:
	        return false;
	    }
	  }
	
	  function isSymbol(propType, propValue) {
	    // Native Symbol.
	    if (propType === 'symbol') {
	      return true;
	    }
	
	    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
	    if (propValue['@@toStringTag'] === 'Symbol') {
	      return true;
	    }
	
	    // Fallback for non-spec compliant Symbols which are polyfilled.
	    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
	      return true;
	    }
	
	    return false;
	  }
	
	  // Equivalent of `typeof` but with special handling for array and regexp.
	  function getPropType(propValue) {
	    var propType = typeof propValue;
	    if (Array.isArray(propValue)) {
	      return 'array';
	    }
	    if (propValue instanceof RegExp) {
	      // Old webkits (at least until Android 4.0) return 'function' rather than
	      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
	      // passes PropTypes.object.
	      return 'object';
	    }
	    if (isSymbol(propType, propValue)) {
	      return 'symbol';
	    }
	    return propType;
	  }
	
	  // This handles more types than `getPropType`. Only used for error messages.
	  // See `createPrimitiveTypeChecker`.
	  function getPreciseType(propValue) {
	    var propType = getPropType(propValue);
	    if (propType === 'object') {
	      if (propValue instanceof Date) {
	        return 'date';
	      } else if (propValue instanceof RegExp) {
	        return 'regexp';
	      }
	    }
	    return propType;
	  }
	
	  // Returns class name of the object, if any.
	  function getClassName(propValue) {
	    if (!propValue.constructor || !propValue.constructor.name) {
	      return ANONYMOUS;
	    }
	    return propValue.constructor.name;
	  }
	
	  ReactPropTypes.checkPropTypes = checkPropTypes;
	  ReactPropTypes.PropTypes = ReactPropTypes;
	
	  return ReactPropTypes;
	};
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	
	function makeEmptyFunction(arg) {
	  return function () {
	    return arg;
	  };
	}
	
	/**
	 * This function accepts and discards inputs; it has no side effects. This is
	 * primarily useful idiomatically for overridable function endpoints which
	 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
	 */
	var emptyFunction = function emptyFunction() {};
	
	emptyFunction.thatReturns = makeEmptyFunction;
	emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
	emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
	emptyFunction.thatReturnsNull = makeEmptyFunction(null);
	emptyFunction.thatReturnsThis = function () {
	  return this;
	};
	emptyFunction.thatReturnsArgument = function (arg) {
	  return arg;
	};
	
	module.exports = emptyFunction;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */
	
	'use strict';
	
	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */
	
	var validateFormat = function validateFormat(format) {};
	
	if (process.env.NODE_ENV !== 'production') {
	  validateFormat = function validateFormat(format) {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  };
	}
	
	function invariant(condition, format, a, b, c, d, e, f) {
	  validateFormat(format);
	
	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(format.replace(/%s/g, function () {
	        return args[argIndex++];
	      }));
	      error.name = 'Invariant Violation';
	    }
	
	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	}
	
	module.exports = invariant;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */
	
	'use strict';
	
	var emptyFunction = __webpack_require__(5);
	
	/**
	 * Similar to invariant but only logs a warning if the condition is not met.
	 * This can be used to log issues in development environments in critical
	 * paths. Removing the logging code for production environments will keep the
	 * same logic and follow the same code paths.
	 */
	
	var warning = emptyFunction;
	
	if (process.env.NODE_ENV !== 'production') {
	  (function () {
	    var printWarning = function printWarning(format) {
	      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	      }
	
	      var argIndex = 0;
	      var message = 'Warning: ' + format.replace(/%s/g, function () {
	        return args[argIndex++];
	      });
	      if (typeof console !== 'undefined') {
	        console.error(message);
	      }
	      try {
	        // --- Welcome to debugging React ---
	        // This error was thrown as a convenience so that you can use this stack
	        // to find the callsite that caused this warning to fire.
	        throw new Error(message);
	      } catch (x) {}
	    };
	
	    warning = function warning(condition, format) {
	      if (format === undefined) {
	        throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
	      }
	
	      if (format.indexOf('Failed Composite propType: ') === 0) {
	        return; // Ignore CompositeComponent proptype check.
	      }
	
	      if (!condition) {
	        for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
	          args[_key2 - 2] = arguments[_key2];
	        }
	
	        printWarning.apply(undefined, [format].concat(args));
	      }
	    };
	  })();
	}
	
	module.exports = warning;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ },
/* 8 */
/***/ function(module, exports) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */
	
	'use strict';
	
	var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';
	
	module.exports = ReactPropTypesSecret;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */
	
	'use strict';
	
	if (process.env.NODE_ENV !== 'production') {
	  var invariant = __webpack_require__(6);
	  var warning = __webpack_require__(7);
	  var ReactPropTypesSecret = __webpack_require__(8);
	  var loggedTypeFailures = {};
	}
	
	/**
	 * Assert that the values match with the type specs.
	 * Error messages are memorized and will only be shown once.
	 *
	 * @param {object} typeSpecs Map of name to a ReactPropType
	 * @param {object} values Runtime values that need to be type-checked
	 * @param {string} location e.g. "prop", "context", "child context"
	 * @param {string} componentName Name of the component for error messages.
	 * @param {?Function} getStack Returns the component stack.
	 * @private
	 */
	function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
	  if (process.env.NODE_ENV !== 'production') {
	    for (var typeSpecName in typeSpecs) {
	      if (typeSpecs.hasOwnProperty(typeSpecName)) {
	        var error;
	        // Prop type validation may throw. In case they do, we don't want to
	        // fail the render phase where it didn't fail before. So we log it.
	        // After these have been cleaned up, we'll let them throw.
	        try {
	          // This is intentionally an invariant that gets caught. It's the same
	          // behavior as without this statement except with a better message.
	          invariant(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', componentName || 'React class', location, typeSpecName);
	          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
	        } catch (ex) {
	          error = ex;
	        }
	        warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
	        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
	          // Only monitor this failure once because there tends to be a lot of the
	          // same error.
	          loggedTypeFailures[error.message] = true;
	
	          var stack = getStack ? getStack() : '';
	
	          warning(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
	        }
	      }
	    }
	  }
	}
	
	module.exports = checkPropTypes;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */
	
	'use strict';
	
	var emptyFunction = __webpack_require__(5);
	var invariant = __webpack_require__(6);
	
	module.exports = function() {
	  // Important!
	  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
	  function shim() {
	    invariant(
	      false,
	      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
	      'Use PropTypes.checkPropTypes() to call them. ' +
	      'Read more at http://fb.me/use-check-prop-types'
	    );
	  };
	  shim.isRequired = shim;
	  function getShim() {
	    return shim;
	  };
	  var ReactPropTypes = {
	    array: shim,
	    bool: shim,
	    func: shim,
	    number: shim,
	    object: shim,
	    string: shim,
	    symbol: shim,
	
	    any: shim,
	    arrayOf: getShim,
	    element: shim,
	    instanceOf: getShim,
	    node: shim,
	    objectOf: getShim,
	    oneOf: getShim,
	    oneOfType: getShim,
	    shape: getShim
	  };
	
	  ReactPropTypes.checkPropTypes = emptyFunction;
	  ReactPropTypes.PropTypes = ReactPropTypes;
	
	  return ReactPropTypes;
	};


/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */
	
	'use strict';
	
	var React = __webpack_require__(1);
	var factory = __webpack_require__(12);
	
	// Hack to grab NoopUpdateQueue from isomorphic React
	var ReactNoopUpdateQueue = new React.Component().updater;
	
	module.exports = factory(
	  React.Component,
	  React.isValidElement,
	  ReactNoopUpdateQueue
	);


/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */
	
	'use strict';
	
	var _assign = __webpack_require__(13);
	
	var emptyObject = __webpack_require__(14);
	var _invariant = __webpack_require__(6);
	
	if (process.env.NODE_ENV !== 'production') {
	  var warning = __webpack_require__(7);
	}
	
	var MIXINS_KEY = 'mixins';
	
	// Helper function to allow the creation of anonymous functions which do not
	// have .name set to the name of the variable being assigned to.
	function identity(fn) {
	  return fn;
	}
	
	var ReactPropTypeLocationNames;
	if (process.env.NODE_ENV !== 'production') {
	  ReactPropTypeLocationNames = {
	    prop: 'prop',
	    context: 'context',
	    childContext: 'child context',
	  };
	} else {
	  ReactPropTypeLocationNames = {};
	}
	
	function factory(ReactComponent, isValidElement, ReactNoopUpdateQueue) {
	  /**
	   * Policies that describe methods in `ReactClassInterface`.
	   */
	
	
	  var injectedMixins = [];
	
	  /**
	   * Composite components are higher-level components that compose other composite
	   * or host components.
	   *
	   * To create a new type of `ReactClass`, pass a specification of
	   * your new class to `React.createClass`. The only requirement of your class
	   * specification is that you implement a `render` method.
	   *
	   *   var MyComponent = React.createClass({
	   *     render: function() {
	   *       return <div>Hello World</div>;
	   *     }
	   *   });
	   *
	   * The class specification supports a specific protocol of methods that have
	   * special meaning (e.g. `render`). See `ReactClassInterface` for
	   * more the comprehensive protocol. Any other properties and methods in the
	   * class specification will be available on the prototype.
	   *
	   * @interface ReactClassInterface
	   * @internal
	   */
	  var ReactClassInterface = {
	
	    /**
	     * An array of Mixin objects to include when defining your component.
	     *
	     * @type {array}
	     * @optional
	     */
	    mixins: 'DEFINE_MANY',
	
	    /**
	     * An object containing properties and methods that should be defined on
	     * the component's constructor instead of its prototype (static methods).
	     *
	     * @type {object}
	     * @optional
	     */
	    statics: 'DEFINE_MANY',
	
	    /**
	     * Definition of prop types for this component.
	     *
	     * @type {object}
	     * @optional
	     */
	    propTypes: 'DEFINE_MANY',
	
	    /**
	     * Definition of context types for this component.
	     *
	     * @type {object}
	     * @optional
	     */
	    contextTypes: 'DEFINE_MANY',
	
	    /**
	     * Definition of context types this component sets for its children.
	     *
	     * @type {object}
	     * @optional
	     */
	    childContextTypes: 'DEFINE_MANY',
	
	    // ==== Definition methods ====
	
	    /**
	     * Invoked when the component is mounted. Values in the mapping will be set on
	     * `this.props` if that prop is not specified (i.e. using an `in` check).
	     *
	     * This method is invoked before `getInitialState` and therefore cannot rely
	     * on `this.state` or use `this.setState`.
	     *
	     * @return {object}
	     * @optional
	     */
	    getDefaultProps: 'DEFINE_MANY_MERGED',
	
	    /**
	     * Invoked once before the component is mounted. The return value will be used
	     * as the initial value of `this.state`.
	     *
	     *   getInitialState: function() {
	     *     return {
	     *       isOn: false,
	     *       fooBaz: new BazFoo()
	     *     }
	     *   }
	     *
	     * @return {object}
	     * @optional
	     */
	    getInitialState: 'DEFINE_MANY_MERGED',
	
	    /**
	     * @return {object}
	     * @optional
	     */
	    getChildContext: 'DEFINE_MANY_MERGED',
	
	    /**
	     * Uses props from `this.props` and state from `this.state` to render the
	     * structure of the component.
	     *
	     * No guarantees are made about when or how often this method is invoked, so
	     * it must not have side effects.
	     *
	     *   render: function() {
	     *     var name = this.props.name;
	     *     return <div>Hello, {name}!</div>;
	     *   }
	     *
	     * @return {ReactComponent}
	     * @nosideeffects
	     * @required
	     */
	    render: 'DEFINE_ONCE',
	
	    // ==== Delegate methods ====
	
	    /**
	     * Invoked when the component is initially created and about to be mounted.
	     * This may have side effects, but any external subscriptions or data created
	     * by this method must be cleaned up in `componentWillUnmount`.
	     *
	     * @optional
	     */
	    componentWillMount: 'DEFINE_MANY',
	
	    /**
	     * Invoked when the component has been mounted and has a DOM representation.
	     * However, there is no guarantee that the DOM node is in the document.
	     *
	     * Use this as an opportunity to operate on the DOM when the component has
	     * been mounted (initialized and rendered) for the first time.
	     *
	     * @param {DOMElement} rootNode DOM element representing the component.
	     * @optional
	     */
	    componentDidMount: 'DEFINE_MANY',
	
	    /**
	     * Invoked before the component receives new props.
	     *
	     * Use this as an opportunity to react to a prop transition by updating the
	     * state using `this.setState`. Current props are accessed via `this.props`.
	     *
	     *   componentWillReceiveProps: function(nextProps, nextContext) {
	     *     this.setState({
	     *       likesIncreasing: nextProps.likeCount > this.props.likeCount
	     *     });
	     *   }
	     *
	     * NOTE: There is no equivalent `componentWillReceiveState`. An incoming prop
	     * transition may cause a state change, but the opposite is not true. If you
	     * need it, you are probably looking for `componentWillUpdate`.
	     *
	     * @param {object} nextProps
	     * @optional
	     */
	    componentWillReceiveProps: 'DEFINE_MANY',
	
	    /**
	     * Invoked while deciding if the component should be updated as a result of
	     * receiving new props, state and/or context.
	     *
	     * Use this as an opportunity to `return false` when you're certain that the
	     * transition to the new props/state/context will not require a component
	     * update.
	     *
	     *   shouldComponentUpdate: function(nextProps, nextState, nextContext) {
	     *     return !equal(nextProps, this.props) ||
	     *       !equal(nextState, this.state) ||
	     *       !equal(nextContext, this.context);
	     *   }
	     *
	     * @param {object} nextProps
	     * @param {?object} nextState
	     * @param {?object} nextContext
	     * @return {boolean} True if the component should update.
	     * @optional
	     */
	    shouldComponentUpdate: 'DEFINE_ONCE',
	
	    /**
	     * Invoked when the component is about to update due to a transition from
	     * `this.props`, `this.state` and `this.context` to `nextProps`, `nextState`
	     * and `nextContext`.
	     *
	     * Use this as an opportunity to perform preparation before an update occurs.
	     *
	     * NOTE: You **cannot** use `this.setState()` in this method.
	     *
	     * @param {object} nextProps
	     * @param {?object} nextState
	     * @param {?object} nextContext
	     * @param {ReactReconcileTransaction} transaction
	     * @optional
	     */
	    componentWillUpdate: 'DEFINE_MANY',
	
	    /**
	     * Invoked when the component's DOM representation has been updated.
	     *
	     * Use this as an opportunity to operate on the DOM when the component has
	     * been updated.
	     *
	     * @param {object} prevProps
	     * @param {?object} prevState
	     * @param {?object} prevContext
	     * @param {DOMElement} rootNode DOM element representing the component.
	     * @optional
	     */
	    componentDidUpdate: 'DEFINE_MANY',
	
	    /**
	     * Invoked when the component is about to be removed from its parent and have
	     * its DOM representation destroyed.
	     *
	     * Use this as an opportunity to deallocate any external resources.
	     *
	     * NOTE: There is no `componentDidUnmount` since your component will have been
	     * destroyed by that point.
	     *
	     * @optional
	     */
	    componentWillUnmount: 'DEFINE_MANY',
	
	    // ==== Advanced methods ====
	
	    /**
	     * Updates the component's currently mounted DOM representation.
	     *
	     * By default, this implements React's rendering and reconciliation algorithm.
	     * Sophisticated clients may wish to override this.
	     *
	     * @param {ReactReconcileTransaction} transaction
	     * @internal
	     * @overridable
	     */
	    updateComponent: 'OVERRIDE_BASE'
	
	  };
	
	  /**
	   * Mapping from class specification keys to special processing functions.
	   *
	   * Although these are declared like instance properties in the specification
	   * when defining classes using `React.createClass`, they are actually static
	   * and are accessible on the constructor instead of the prototype. Despite
	   * being static, they must be defined outside of the "statics" key under
	   * which all other static methods are defined.
	   */
	  var RESERVED_SPEC_KEYS = {
	    displayName: function (Constructor, displayName) {
	      Constructor.displayName = displayName;
	    },
	    mixins: function (Constructor, mixins) {
	      if (mixins) {
	        for (var i = 0; i < mixins.length; i++) {
	          mixSpecIntoComponent(Constructor, mixins[i]);
	        }
	      }
	    },
	    childContextTypes: function (Constructor, childContextTypes) {
	      if (process.env.NODE_ENV !== 'production') {
	        validateTypeDef(Constructor, childContextTypes, 'childContext');
	      }
	      Constructor.childContextTypes = _assign({}, Constructor.childContextTypes, childContextTypes);
	    },
	    contextTypes: function (Constructor, contextTypes) {
	      if (process.env.NODE_ENV !== 'production') {
	        validateTypeDef(Constructor, contextTypes, 'context');
	      }
	      Constructor.contextTypes = _assign({}, Constructor.contextTypes, contextTypes);
	    },
	    /**
	     * Special case getDefaultProps which should move into statics but requires
	     * automatic merging.
	     */
	    getDefaultProps: function (Constructor, getDefaultProps) {
	      if (Constructor.getDefaultProps) {
	        Constructor.getDefaultProps = createMergedResultFunction(Constructor.getDefaultProps, getDefaultProps);
	      } else {
	        Constructor.getDefaultProps = getDefaultProps;
	      }
	    },
	    propTypes: function (Constructor, propTypes) {
	      if (process.env.NODE_ENV !== 'production') {
	        validateTypeDef(Constructor, propTypes, 'prop');
	      }
	      Constructor.propTypes = _assign({}, Constructor.propTypes, propTypes);
	    },
	    statics: function (Constructor, statics) {
	      mixStaticSpecIntoComponent(Constructor, statics);
	    },
	    autobind: function () {} };
	
	  function validateTypeDef(Constructor, typeDef, location) {
	    for (var propName in typeDef) {
	      if (typeDef.hasOwnProperty(propName)) {
	        // use a warning instead of an _invariant so components
	        // don't show up in prod but only in __DEV__
	        process.env.NODE_ENV !== 'production' ? warning(typeof typeDef[propName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', Constructor.displayName || 'ReactClass', ReactPropTypeLocationNames[location], propName) : void 0;
	      }
	    }
	  }
	
	  function validateMethodOverride(isAlreadyDefined, name) {
	    var specPolicy = ReactClassInterface.hasOwnProperty(name) ? ReactClassInterface[name] : null;
	
	    // Disallow overriding of base class methods unless explicitly allowed.
	    if (ReactClassMixin.hasOwnProperty(name)) {
	      _invariant(specPolicy === 'OVERRIDE_BASE', 'ReactClassInterface: You are attempting to override ' + '`%s` from your class specification. Ensure that your method names ' + 'do not overlap with React methods.', name);
	    }
	
	    // Disallow defining methods more than once unless explicitly allowed.
	    if (isAlreadyDefined) {
	      _invariant(specPolicy === 'DEFINE_MANY' || specPolicy === 'DEFINE_MANY_MERGED', 'ReactClassInterface: You are attempting to define ' + '`%s` on your component more than once. This conflict may be due ' + 'to a mixin.', name);
	    }
	  }
	
	  /**
	   * Mixin helper which handles policy validation and reserved
	   * specification keys when building React classes.
	   */
	  function mixSpecIntoComponent(Constructor, spec) {
	    if (!spec) {
	      if (process.env.NODE_ENV !== 'production') {
	        var typeofSpec = typeof spec;
	        var isMixinValid = typeofSpec === 'object' && spec !== null;
	
	        process.env.NODE_ENV !== 'production' ? warning(isMixinValid, '%s: You\'re attempting to include a mixin that is either null ' + 'or not an object. Check the mixins included by the component, ' + 'as well as any mixins they include themselves. ' + 'Expected object but got %s.', Constructor.displayName || 'ReactClass', spec === null ? null : typeofSpec) : void 0;
	      }
	
	      return;
	    }
	
	    _invariant(typeof spec !== 'function', 'ReactClass: You\'re attempting to ' + 'use a component class or function as a mixin. Instead, just use a ' + 'regular object.');
	    _invariant(!isValidElement(spec), 'ReactClass: You\'re attempting to ' + 'use a component as a mixin. Instead, just use a regular object.');
	
	    var proto = Constructor.prototype;
	    var autoBindPairs = proto.__reactAutoBindPairs;
	
	    // By handling mixins before any other properties, we ensure the same
	    // chaining order is applied to methods with DEFINE_MANY policy, whether
	    // mixins are listed before or after these methods in the spec.
	    if (spec.hasOwnProperty(MIXINS_KEY)) {
	      RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);
	    }
	
	    for (var name in spec) {
	      if (!spec.hasOwnProperty(name)) {
	        continue;
	      }
	
	      if (name === MIXINS_KEY) {
	        // We have already handled mixins in a special case above.
	        continue;
	      }
	
	      var property = spec[name];
	      var isAlreadyDefined = proto.hasOwnProperty(name);
	      validateMethodOverride(isAlreadyDefined, name);
	
	      if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
	        RESERVED_SPEC_KEYS[name](Constructor, property);
	      } else {
	        // Setup methods on prototype:
	        // The following member methods should not be automatically bound:
	        // 1. Expected ReactClass methods (in the "interface").
	        // 2. Overridden methods (that were mixed in).
	        var isReactClassMethod = ReactClassInterface.hasOwnProperty(name);
	        var isFunction = typeof property === 'function';
	        var shouldAutoBind = isFunction && !isReactClassMethod && !isAlreadyDefined && spec.autobind !== false;
	
	        if (shouldAutoBind) {
	          autoBindPairs.push(name, property);
	          proto[name] = property;
	        } else {
	          if (isAlreadyDefined) {
	            var specPolicy = ReactClassInterface[name];
	
	            // These cases should already be caught by validateMethodOverride.
	            _invariant(isReactClassMethod && (specPolicy === 'DEFINE_MANY_MERGED' || specPolicy === 'DEFINE_MANY'), 'ReactClass: Unexpected spec policy %s for key %s ' + 'when mixing in component specs.', specPolicy, name);
	
	            // For methods which are defined more than once, call the existing
	            // methods before calling the new property, merging if appropriate.
	            if (specPolicy === 'DEFINE_MANY_MERGED') {
	              proto[name] = createMergedResultFunction(proto[name], property);
	            } else if (specPolicy === 'DEFINE_MANY') {
	              proto[name] = createChainedFunction(proto[name], property);
	            }
	          } else {
	            proto[name] = property;
	            if (process.env.NODE_ENV !== 'production') {
	              // Add verbose displayName to the function, which helps when looking
	              // at profiling tools.
	              if (typeof property === 'function' && spec.displayName) {
	                proto[name].displayName = spec.displayName + '_' + name;
	              }
	            }
	          }
	        }
	      }
	    }
	  }
	
	  function mixStaticSpecIntoComponent(Constructor, statics) {
	    if (!statics) {
	      return;
	    }
	    for (var name in statics) {
	      var property = statics[name];
	      if (!statics.hasOwnProperty(name)) {
	        continue;
	      }
	
	      var isReserved = name in RESERVED_SPEC_KEYS;
	      _invariant(!isReserved, 'ReactClass: You are attempting to define a reserved ' + 'property, `%s`, that shouldn\'t be on the "statics" key. Define it ' + 'as an instance property instead; it will still be accessible on the ' + 'constructor.', name);
	
	      var isInherited = name in Constructor;
	      _invariant(!isInherited, 'ReactClass: You are attempting to define ' + '`%s` on your component more than once. This conflict may be ' + 'due to a mixin.', name);
	      Constructor[name] = property;
	    }
	  }
	
	  /**
	   * Merge two objects, but throw if both contain the same key.
	   *
	   * @param {object} one The first object, which is mutated.
	   * @param {object} two The second object
	   * @return {object} one after it has been mutated to contain everything in two.
	   */
	  function mergeIntoWithNoDuplicateKeys(one, two) {
	    _invariant(one && two && typeof one === 'object' && typeof two === 'object', 'mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.');
	
	    for (var key in two) {
	      if (two.hasOwnProperty(key)) {
	        _invariant(one[key] === undefined, 'mergeIntoWithNoDuplicateKeys(): ' + 'Tried to merge two objects with the same key: `%s`. This conflict ' + 'may be due to a mixin; in particular, this may be caused by two ' + 'getInitialState() or getDefaultProps() methods returning objects ' + 'with clashing keys.', key);
	        one[key] = two[key];
	      }
	    }
	    return one;
	  }
	
	  /**
	   * Creates a function that invokes two functions and merges their return values.
	   *
	   * @param {function} one Function to invoke first.
	   * @param {function} two Function to invoke second.
	   * @return {function} Function that invokes the two argument functions.
	   * @private
	   */
	  function createMergedResultFunction(one, two) {
	    return function mergedResult() {
	      var a = one.apply(this, arguments);
	      var b = two.apply(this, arguments);
	      if (a == null) {
	        return b;
	      } else if (b == null) {
	        return a;
	      }
	      var c = {};
	      mergeIntoWithNoDuplicateKeys(c, a);
	      mergeIntoWithNoDuplicateKeys(c, b);
	      return c;
	    };
	  }
	
	  /**
	   * Creates a function that invokes two functions and ignores their return vales.
	   *
	   * @param {function} one Function to invoke first.
	   * @param {function} two Function to invoke second.
	   * @return {function} Function that invokes the two argument functions.
	   * @private
	   */
	  function createChainedFunction(one, two) {
	    return function chainedFunction() {
	      one.apply(this, arguments);
	      two.apply(this, arguments);
	    };
	  }
	
	  /**
	   * Binds a method to the component.
	   *
	   * @param {object} component Component whose method is going to be bound.
	   * @param {function} method Method to be bound.
	   * @return {function} The bound method.
	   */
	  function bindAutoBindMethod(component, method) {
	    var boundMethod = method.bind(component);
	    if (process.env.NODE_ENV !== 'production') {
	      boundMethod.__reactBoundContext = component;
	      boundMethod.__reactBoundMethod = method;
	      boundMethod.__reactBoundArguments = null;
	      var componentName = component.constructor.displayName;
	      var _bind = boundMethod.bind;
	      boundMethod.bind = function (newThis) {
	        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	          args[_key - 1] = arguments[_key];
	        }
	
	        // User is trying to bind() an autobound method; we effectively will
	        // ignore the value of "this" that the user is trying to use, so
	        // let's warn.
	        if (newThis !== component && newThis !== null) {
	          process.env.NODE_ENV !== 'production' ? warning(false, 'bind(): React component methods may only be bound to the ' + 'component instance. See %s', componentName) : void 0;
	        } else if (!args.length) {
	          process.env.NODE_ENV !== 'production' ? warning(false, 'bind(): You are binding a component method to the component. ' + 'React does this for you automatically in a high-performance ' + 'way, so you can safely remove this call. See %s', componentName) : void 0;
	          return boundMethod;
	        }
	        var reboundMethod = _bind.apply(boundMethod, arguments);
	        reboundMethod.__reactBoundContext = component;
	        reboundMethod.__reactBoundMethod = method;
	        reboundMethod.__reactBoundArguments = args;
	        return reboundMethod;
	      };
	    }
	    return boundMethod;
	  }
	
	  /**
	   * Binds all auto-bound methods in a component.
	   *
	   * @param {object} component Component whose method is going to be bound.
	   */
	  function bindAutoBindMethods(component) {
	    var pairs = component.__reactAutoBindPairs;
	    for (var i = 0; i < pairs.length; i += 2) {
	      var autoBindKey = pairs[i];
	      var method = pairs[i + 1];
	      component[autoBindKey] = bindAutoBindMethod(component, method);
	    }
	  }
	
	  var IsMountedMixin = {
	    componentDidMount: function () {
	      this.__isMounted = true;
	    },
	    componentWillUnmount: function () {
	      this.__isMounted = false;
	    }
	  };
	
	  /**
	   * Add more to the ReactClass base class. These are all legacy features and
	   * therefore not already part of the modern ReactComponent.
	   */
	  var ReactClassMixin = {
	
	    /**
	     * TODO: This will be deprecated because state should always keep a consistent
	     * type signature and the only use case for this, is to avoid that.
	     */
	    replaceState: function (newState, callback) {
	      this.updater.enqueueReplaceState(this, newState, callback);
	    },
	
	    /**
	     * Checks whether or not this composite component is mounted.
	     * @return {boolean} True if mounted, false otherwise.
	     * @protected
	     * @final
	     */
	    isMounted: function () {
	      if (process.env.NODE_ENV !== 'production') {
	        process.env.NODE_ENV !== 'production' ? warning(this.__didWarnIsMounted, '%s: isMounted is deprecated. Instead, make sure to clean up ' + 'subscriptions and pending requests in componentWillUnmount to ' + 'prevent memory leaks.', this.constructor && this.constructor.displayName || this.name || 'Component') : void 0;
	        this.__didWarnIsMounted = true;
	      }
	      return !!this.__isMounted;
	    }
	  };
	
	  var ReactClassComponent = function () {};
	  _assign(ReactClassComponent.prototype, ReactComponent.prototype, ReactClassMixin);
	
	  /**
	   * Creates a composite component class given a class specification.
	   * See https://facebook.github.io/react/docs/top-level-api.html#react.createclass
	   *
	   * @param {object} spec Class specification (which must define `render`).
	   * @return {function} Component constructor function.
	   * @public
	   */
	  function createClass(spec) {
	    // To keep our warnings more understandable, we'll use a little hack here to
	    // ensure that Constructor.name !== 'Constructor'. This makes sure we don't
	    // unnecessarily identify a class without displayName as 'Constructor'.
	    var Constructor = identity(function (props, context, updater) {
	      // This constructor gets overridden by mocks. The argument is used
	      // by mocks to assert on what gets mounted.
	
	      if (process.env.NODE_ENV !== 'production') {
	        process.env.NODE_ENV !== 'production' ? warning(this instanceof Constructor, 'Something is calling a React component directly. Use a factory or ' + 'JSX instead. See: https://fb.me/react-legacyfactory') : void 0;
	      }
	
	      // Wire up auto-binding
	      if (this.__reactAutoBindPairs.length) {
	        bindAutoBindMethods(this);
	      }
	
	      this.props = props;
	      this.context = context;
	      this.refs = emptyObject;
	      this.updater = updater || ReactNoopUpdateQueue;
	
	      this.state = null;
	
	      // ReactClasses doesn't have constructors. Instead, they use the
	      // getInitialState and componentWillMount methods for initialization.
	
	      var initialState = this.getInitialState ? this.getInitialState() : null;
	      if (process.env.NODE_ENV !== 'production') {
	        // We allow auto-mocks to proceed as if they're returning null.
	        if (initialState === undefined && this.getInitialState._isMockFunction) {
	          // This is probably bad practice. Consider warning here and
	          // deprecating this convenience.
	          initialState = null;
	        }
	      }
	      _invariant(typeof initialState === 'object' && !Array.isArray(initialState), '%s.getInitialState(): must return an object or null', Constructor.displayName || 'ReactCompositeComponent');
	
	      this.state = initialState;
	    });
	    Constructor.prototype = new ReactClassComponent();
	    Constructor.prototype.constructor = Constructor;
	    Constructor.prototype.__reactAutoBindPairs = [];
	
	    injectedMixins.forEach(mixSpecIntoComponent.bind(null, Constructor));
	
	    mixSpecIntoComponent(Constructor, IsMountedMixin);
	    mixSpecIntoComponent(Constructor, spec);
	
	    // Initialize the defaultProps property after all mixins have been merged.
	    if (Constructor.getDefaultProps) {
	      Constructor.defaultProps = Constructor.getDefaultProps();
	    }
	
	    if (process.env.NODE_ENV !== 'production') {
	      // This is a tag to indicate that the use of these method names is ok,
	      // since it's used with createClass. If it's not, then it's likely a
	      // mistake so we'll warn you to use the static property, property
	      // initializer or constructor respectively.
	      if (Constructor.getDefaultProps) {
	        Constructor.getDefaultProps.isReactClassApproved = {};
	      }
	      if (Constructor.prototype.getInitialState) {
	        Constructor.prototype.getInitialState.isReactClassApproved = {};
	      }
	    }
	
	    _invariant(Constructor.prototype.render, 'createClass(...): Class specification must implement a `render` method.');
	
	    if (process.env.NODE_ENV !== 'production') {
	      process.env.NODE_ENV !== 'production' ? warning(!Constructor.prototype.componentShouldUpdate, '%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', spec.displayName || 'A component') : void 0;
	      process.env.NODE_ENV !== 'production' ? warning(!Constructor.prototype.componentWillRecieveProps, '%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', spec.displayName || 'A component') : void 0;
	    }
	
	    // Reduce time spent doing lookups by setting these on the prototype.
	    for (var methodName in ReactClassInterface) {
	      if (!Constructor.prototype[methodName]) {
	        Constructor.prototype[methodName] = null;
	      }
	    }
	
	    return Constructor;
	  }
	
	  return createClass;
	}
	
	module.exports = factory;
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ },
/* 13 */
/***/ function(module, exports) {

	/*
	object-assign
	(c) Sindre Sorhus
	@license MIT
	*/
	
	'use strict';
	/* eslint-disable no-unused-vars */
	var getOwnPropertySymbols = Object.getOwnPropertySymbols;
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;
	
	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}
	
		return Object(val);
	}
	
	function shouldUseNative() {
		try {
			if (!Object.assign) {
				return false;
			}
	
			// Detect buggy property enumeration order in older V8 versions.
	
			// https://bugs.chromium.org/p/v8/issues/detail?id=4118
			var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
			test1[5] = 'de';
			if (Object.getOwnPropertyNames(test1)[0] === '5') {
				return false;
			}
	
			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test2 = {};
			for (var i = 0; i < 10; i++) {
				test2['_' + String.fromCharCode(i)] = i;
			}
			var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
				return test2[n];
			});
			if (order2.join('') !== '0123456789') {
				return false;
			}
	
			// https://bugs.chromium.org/p/v8/issues/detail?id=3056
			var test3 = {};
			'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
				test3[letter] = letter;
			});
			if (Object.keys(Object.assign({}, test3)).join('') !==
					'abcdefghijklmnopqrst') {
				return false;
			}
	
			return true;
		} catch (err) {
			// We don't expect any of the above to throw, but better to be safe.
			return false;
		}
	}
	
	module.exports = shouldUseNative() ? Object.assign : function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;
	
		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);
	
			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}
	
			if (getOwnPropertySymbols) {
				symbols = getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}
	
		return to;
	};


/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright (c) 2013-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */
	
	'use strict';
	
	var emptyObject = {};
	
	if (process.env.NODE_ENV !== 'production') {
	  Object.freeze(emptyObject);
	}
	
	module.exports = emptyObject;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ },
/* 15 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_15__;

/***/ },
/* 16 */
/***/ function(module, exports) {

	/**
	 * @fileOverview jQuery replacement
	 * @author jasonslyvia
	 */
	'use strict';
	
	exports.__esModule = true;
	exports.on = on;
	exports.off = off;
	exports.isFunction = isFunction;
	exports.isNumeric = isNumeric;
	exports.position = position;
	exports.width = width;
	exports.height = height;
	exports.outerWidthWithMargin = outerWidthWithMargin;
	exports.outerHeightWithMargin = outerHeightWithMargin;
	exports.closest = closest;
	exports.assign = assign;
	exports.get = get;
	exports.findMostOften = findMostOften;
	
	function on(el, eventName, callback) {
	  if (el.addEventListener) {
	    el.addEventListener(eventName, callback, false);
	  } else if (el.attachEvent) {
	    el.attachEvent('on' + eventName, function (e) {
	      callback.call(el, e || window.event);
	    });
	  }
	}
	
	function off(el, eventName, callback) {
	  if (el.removeEventListener) {
	    el.removeEventListener(eventName, callback);
	  } else if (el.detachEvent) {
	    el.detachEvent('on' + eventName, callback);
	  }
	}
	
	function isFunction(func) {
	  return typeof func === 'function';
	}
	
	function isNumeric(num) {
	  return !isNaN(parseFloat(num)) && isFinite(num);
	}
	
	function position(el) {
	  if (!el) {
	    return {
	      left: 0,
	      top: 0
	    };
	  }
	
	  return {
	    left: el.offsetLeft,
	    top: el.offsetTop
	  };
	}
	
	function width(el) {
	  return el.offsetWidth;
	}
	
	function height(el) {
	  return el.offsetHeight;
	}
	
	function outerWidthWithMargin(el) {
	  var _width = el.offsetWidth;
	  var style = el.currentStyle || getComputedStyle(el);
	
	  _width += (parseInt(style.marginLeft, 10) || 0) + (parseInt(style.marginRight, 10) || 0);
	  return _width;
	}
	
	function outerHeightWithMargin(el) {
	  var _height = el.offsetHeight;
	  var style = el.currentStyle || getComputedStyle(el);
	
	  _height += (parseInt(style.marginLeft, 10) || 0) + (parseInt(style.marginRight, 10) || 0);
	  return _height;
	}
	
	function hasClass(elClassName, className) {
	  return (' ' + elClassName + ' ').replace(/[\n\t]/g, ' ').indexOf(' ' + className + ' ') > -1;
	}
	
	function closest(el, className) {
	  className = className.replace(/^[\b\.]/, '');
	
	  var finder = function finder(_x, _x2) {
	    var _again = true;
	
	    _function: while (_again) {
	      var _el = _x,
	          _className = _x2;
	      _again = false;
	
	      var _elClassName = typeof _el.className === 'object' ? _el.className.baseVal : _el.className;
	      if (_elClassName && hasClass(_elClassName, _className)) {
	        return _el;
	      } else if (_el.parentNode === null) {
	        // matches document
	        return null;
	      }
	
	      _x = _el.parentNode;
	      _x2 = _className;
	      _again = true;
	      _elClassName = undefined;
	      continue _function;
	    }
	  };
	
	  return finder(el, className);
	}
	
	function assign(target) {
	  if (target === undefined || target === null) {
	    throw new TypeError('Cannot convert first argument to object');
	  }
	
	  var to = Object(target);
	  for (var i = 1; i < arguments.length; i++) {
	    var nextSource = arguments[i];
	    if (nextSource === undefined || nextSource === null) {
	      continue;
	    }
	
	    var keysArray = Object.keys(Object(nextSource));
	    for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
	      var nextKey = keysArray[nextIndex];
	      var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
	      if (desc !== undefined && desc.enumerable) {
	        to[nextKey] = nextSource[nextKey];
	      }
	    }
	  }
	  return to;
	}
	
	function get(selector) {
	  return document.querySelector(selector);
	}
	
	function findMostOften(arr) {
	  var obj = {};
	  arr.forEach(function (i) {
	    obj[i] = obj[i] ? obj[i] + 1 : 1;
	  });
	
	  return Object.keys(obj).sort(function (a, b) {
	    return obj[b] - obj[a];
	  })[0];
	}

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var _react = __webpack_require__(1);
	
	var _react2 = _interopRequireDefault(_react);
	
	var _propTypes = __webpack_require__(2);
	
	var _propTypes2 = _interopRequireDefault(_propTypes);
	
	var _reactDom = __webpack_require__(15);
	
	var _reactDom2 = _interopRequireDefault(_reactDom);
	
	var _utils = __webpack_require__(16);
	
	function _handleSortableItemReadyToMove(e) {
	  // if sort handle is defined then only handle sort if the target matches the sort handle
	  if (this.props.sortHandle && _utils.closest(e.target || e.srcElement, this.props.sortHandle) === null) {
	    return;
	  }
	
	  var target = _utils.closest(e.target || e.srcElement, '.ui-sortable-item');
	  var evt = {
	    pageX: e.pageX || e.clientX || e.touches[0].pageX,
	    pageY: e.pageY || e.clientY || e.touches[0].pageY,
	    offset: _utils.position(target)
	  };
	
	  if (this.props.onSortableItemReadyToMove) {
	    this.props.onSortableItemReadyToMove(evt, this.props.sortableIndex);
	  }
	}
	
	function handleComponentDidMount() {
	  var node = _reactDom2['default'].findDOMNode(this);
	
	  // Prevent odd behaviour in legacy IE when dragging
	  if (window.attachEvent && !document.body.style['-ms-user-select']) {
	    _utils.on(node, 'selectstart', function (e) {
	      if (e.preventDefault) {
	        e.preventDefault();
	      } else {
	        e.returnValue = false;
	      }
	    });
	  }
	
	  if (_utils.isFunction(this.props.onSortableItemMount)) {
	    this.props.onSortableItemMount(_utils.position(node), _utils.width(node), _utils.height(node), _utils.outerWidthWithMargin(node), _utils.outerHeightWithMargin(node), this.props.sortableIndex);
	  }
	}
	
	function handleComponentDidUpdate() {
	  var node = _reactDom2['default'].findDOMNode(this);
	
	  if (_utils.isFunction(this.props.onSortableItemMount)) {
	    this.props.onSortableItemMount(_utils.position(node), _utils.width(node), _utils.height(node), _utils.outerWidthWithMargin(node), _utils.outerHeightWithMargin(node), this.props.sortableIndex);
	  }
	}
	
	var _defaultProps = {
	  sortableClassName: '',
	  sortableStyle: {},
	  onSortableItemMount: function onSortableItemMount() {},
	  onSortableItemReadyToMove: function onSortableItemReadyToMove() {}
	};
	
	/**
	 * @class A factory for generating either mixin or High Order Component
	 *        depending if there is an argument passed in
	 *
	 * @param {React} Component An optinal argument for creating HOCs, leave it
	 *                blank if you'd like old mixin
	 */
	
	exports['default'] = function (Component) {
	  if (Component) {
	    return (function (_React$Component) {
	      _inherits(SortableItem, _React$Component);
	
	      function SortableItem() {
	        _classCallCheck(this, SortableItem);
	
	        _React$Component.apply(this, arguments);
	      }
	
	      SortableItem.prototype.handleSortableItemReadyToMove = function handleSortableItemReadyToMove(e) {
	        _handleSortableItemReadyToMove.call(this, e);
	      };
	
	      SortableItem.prototype.componentDidMount = function componentDidMount() {
	        handleComponentDidMount.call(this);
	      };
	
	      SortableItem.prototype.componentDidUpdate = function componentDidUpdate() {
	        handleComponentDidUpdate.call(this);
	      };
	
	      SortableItem.prototype.render = function render() {
	        var _props = this.props;
	        var sortableClassName = _props.sortableClassName;
	        var sortableStyle = _props.sortableStyle;
	        var sortableIndex = _props.sortableIndex;
	        var sortHandle = _props.sortHandle;
	        var className = _props.className;
	
	        var rest = _objectWithoutProperties(_props, ['sortableClassName', 'sortableStyle', 'sortableIndex', 'sortHandle', 'className']);
	
	        return _react2['default'].createElement(Component, _extends({}, rest, {
	          sortable: true,
	          className: sortableClassName,
	          style: sortableStyle,
	          sortHandle: sortHandle,
	          onMouseDown: this.handleSortableItemReadyToMove.bind(this),
	          onTouchStart: this.handleSortableItemReadyToMove.bind(this)
	        }));
	      };
	
	      _createClass(SortableItem, null, [{
	        key: 'defaultProps',
	        value: _defaultProps,
	        enumerable: true
	      }, {
	        key: 'propTypes',
	        value: {
	          sortableClassName: _propTypes2['default'].string,
	          sortableStyle: _propTypes2['default'].object,
	          sortableIndex: _propTypes2['default'].number,
	          sortHandle: _propTypes2['default'].string
	        },
	        enumerable: true
	      }]);
	
	      return SortableItem;
	    })(_react2['default'].Component);
	  }
	
	  return {
	    propTypes: {
	      sortableClassName: _propTypes2['default'].string,
	      sortableStyle: _propTypes2['default'].object,
	      sortableIndex: _propTypes2['default'].number,
	      sortHandle: _propTypes2['default'].string
	    },
	
	    getDefaultProps: function getDefaultProps() {
	      return _defaultProps;
	    },
	
	    handleSortableItemReadyToMove: _handleSortableItemReadyToMove,
	
	    componentDidMount: handleComponentDidMount,
	
	    componentDidUpdate: handleComponentDidUpdate,
	
	    renderWithSortable: function renderWithSortable(item) {
	      return _react2['default'].cloneElement(item, {
	        className: this.props.sortableClassName,
	        style: this.props.sortableStyle,
	        sortHandle: this.props.sortHandle,
	        onMouseDown: this.handleSortableItemReadyToMove,
	        onTouchStart: this.handleSortableItemReadyToMove
	      });
	    }
	  };
	};
	
	module.exports = exports['default'];

/***/ }
/******/ ])
});
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay91bml2ZXJzYWxNb2R1bGVEZWZpbml0aW9uIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCA0MTJmMmVlMGJkOTY2OGNiMmYwNiIsIndlYnBhY2s6Ly8vLi9zcmMvaW5kZXguanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIHtcImNvbW1vbmpzXCI6XCJyZWFjdFwiLFwiY29tbW9uanMyXCI6XCJyZWFjdFwiLFwiYW1kXCI6XCJSZWFjdFwiLFwicm9vdFwiOlwiUmVhY3RcIn0iLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2luZGV4LmpzIiwid2VicGFjazovLy8uL34vcHJvY2Vzcy9icm93c2VyLmpzIiwid2VicGFjazovLy8uL34vcHJvcC10eXBlcy9mYWN0b3J5V2l0aFR5cGVDaGVja2Vycy5qcyIsIndlYnBhY2s6Ly8vLi9+L2ZianMvbGliL2VtcHR5RnVuY3Rpb24uanMiLCJ3ZWJwYWNrOi8vLy4vfi9mYmpzL2xpYi9pbnZhcmlhbnQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9mYmpzL2xpYi93YXJuaW5nLmpzIiwid2VicGFjazovLy8uL34vcHJvcC10eXBlcy9saWIvUmVhY3RQcm9wVHlwZXNTZWNyZXQuanMiLCJ3ZWJwYWNrOi8vLy4vfi9wcm9wLXR5cGVzL2NoZWNrUHJvcFR5cGVzLmpzIiwid2VicGFjazovLy8uL34vcHJvcC10eXBlcy9mYWN0b3J5V2l0aFRocm93aW5nU2hpbXMuanMiLCJ3ZWJwYWNrOi8vLy4vfi9jcmVhdGUtcmVhY3QtY2xhc3MvaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9jcmVhdGUtcmVhY3QtY2xhc3MvZmFjdG9yeS5qcyIsIndlYnBhY2s6Ly8vLi9+L29iamVjdC1hc3NpZ24vaW5kZXguanMiLCJ3ZWJwYWNrOi8vLy4vfi9mYmpzL2xpYi9lbXB0eU9iamVjdC5qcyIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwge1wiY29tbW9uanNcIjpcInJlYWN0LWRvbVwiLFwiY29tbW9uanMyXCI6XCJyZWFjdC1kb21cIixcImFtZFwiOlwiUmVhY3RET01cIixcInJvb3RcIjpcIlJlYWN0RE9NXCJ9Iiwid2VicGFjazovLy8uL3NyYy91dGlscy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvU29ydGFibGVJdGVtTWl4aW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELE87QUNWQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQSx1QkFBZTtBQUNmO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOzs7QUFHQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tDQzdCa0IsQ0FBTzs7OztzQ0FDSCxDQUFZOzs7OzZDQUNMLEVBQW9COzs7O3FDQUM1QixFQUFXOzs7O2tDQUVLLEVBQVM7OzhDQUNoQixFQUFxQjs7OztBQUduRCxLQUFNLFVBQVUsR0FBRyxDQUFDLENBQUM7QUFDckIsS0FBTSxhQUFhLEdBQUcsU0FBaEIsYUFBYSxDQUFJLEtBQUssRUFBSzs7QUFFL0IsVUFBTyxLQUFLLElBQUksS0FBSyxDQUFDLEtBQUssSUFBSSxrQkFBVyxLQUFLLENBQUMsS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7RUFDbEYsQ0FBQzs7Ozs7QUFLRixLQUFNLFFBQVEsR0FBRyw4QkFBaUI7QUFDaEMsWUFBUyxFQUFFOzs7Ozs7O0FBT1QsV0FBTSxFQUFFLHVCQUFVLElBQUk7QUFDdEIsY0FBUyxFQUFFLHVCQUFVLE1BQU07QUFDM0IsZUFBVSxFQUFFLHVCQUFVLE1BQU07QUFDNUIsZ0JBQVcsRUFBRSx1QkFBVSxJQUFJO0FBQzNCLFlBQU8sRUFBRSx1QkFBVSxJQUFJO0FBQ3ZCLGNBQVMsRUFBRSx1QkFBVSxNQUFNO0FBQzNCLGFBQVEsRUFBRSx1QkFBVSxPQUFPLENBQUMs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QTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxFQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O0FDN0JBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0EsRUFBQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLFVBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTs7O0FBR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7OztBQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx3QkFBdUIsc0JBQXNCO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXFCO0FBQ3JCOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxzQ0FBcUM7O0FBRXJDO0FBQ0E7QUFDQTs7QUFFQSw0QkFBMkI7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsNkJBQTRCLFVBQVU7Ozs7Ozs7QUN2THRDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsMkNBQTBDOztBQUUxQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYSxRQUFRO0FBQ3JCLGVBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFVO0FBQ1YsOEJBQTZCO0FBQzdCLFNBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdDQUErQixLQUFLO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFTO0FBQ1QsNkJBQTRCO0FBQzVCLFFBQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXFCLHNCQUFzQjtBQUMzQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLHNCQUFxQiwyQkFBMkI7QUFDaEQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0Esc0JBQXFCLGdDQUFnQztBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBUztBQUNUO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7Ozs7Ozs7QUM3ZEE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLDhDQUE2QztBQUM3QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxnQzs7Ozs7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLHNEQUFxRDtBQUNyRCxNQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTs7QUFFQSwyQkFBMEI7QUFDMUI7QUFDQTtBQUNBOztBQUVBLDRCOzs7Ozs7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0EseUZBQXdGLGFBQWE7QUFDckc7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxRQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGdCQUFlO0FBQ2Y7O0FBRUE7QUFDQSwrRkFBOEYsZUFBZTtBQUM3RztBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLElBQUc7QUFDSDs7QUFFQSwwQjs7Ozs7OztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBOztBQUVBOzs7Ozs7O0FDYkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFXLE9BQU87QUFDbEIsWUFBVyxPQUFPO0FBQ2xCLFlBQVcsT0FBTztBQUNsQixZQUFXLE9BQU87QUFDbEIsWUFBVyxVQUFVO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUdBQWdHO0FBQ2hHO0FBQ0EsVUFBUztBQUNUO0FBQ0E7QUFDQSxpR0FBZ0c7QUFDaEc7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOzs7Ozs7OztBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7Ozs7Ozs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsRUFBQztBQUNEO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7OztBQUdBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFjO0FBQ2Q7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFD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dUJBQWtCLEVBQUUsd0JBQXdCOztBQUU1Qyx1QkFBa0IsOEJBQUMsSUFBSSxFQUFFO0FBQ3ZCLGNBQU8sbUJBQU0sWUFBWSxDQUFDLElBQUksRUFBRTtBQUM5QixrQkFBUyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCO0FBQ3ZDLGNBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWE7QUFDL0IsbUJBQVUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVU7QUFDakMsb0JBQVcsRUFBRSxJQUFJLENBQUMsNkJBQTZCO0FBQy9DLHFCQUFZLEVBQUUsSUFBSSxDQUFDLDZCQUE2QjtRQUNqRCxDQUFDLENBQUM7TUFDSjtJQUNGLENBQUM7RUFDSCIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiB3ZWJwYWNrVW5pdmVyc2FsTW9kdWxlRGVmaW5pdGlvbihyb290LCBmYWN0b3J5KSB7XG5cdGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0Jylcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkocmVxdWlyZShcInJlYWN0XCIpLCByZXF1aXJlKFwicmVhY3QtZG9tXCIpKTtcblx0ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpXG5cdFx0ZGVmaW5lKFtcIlJlYWN0XCIsIFwiUmVhY3RET01cIl0sIGZhY3RvcnkpO1xuXHRlbHNlIGlmKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jylcblx0XHRleHBvcnRzW1wicmVhY3QtYW55dGhpbmctc29ydGFibGVcIl0gPSBmYWN0b3J5KHJlcXVpcmUoXCJyZWFjdFwiKSwgcmVxdWlyZShcInJlYWN0LWRvbVwiKSk7XG5cdGVsc2Vcblx0XHRyb290W1wicmVhY3QtYW55dGhpbmctc29ydGFibGVcIl0gPSBmYWN0b3J5KHJvb3RbXCJSZWFjdFwiXSwgcm9vdFtcIlJlYWN0RE9NXCJdKTtcbn0pKHRoaXMsIGZ1bmN0aW9uKF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfMV9fLCBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzE1X18pIHtcbnJldHVybiBcblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiB3ZWJwYWNrL3VuaXZlcnNhbE1vZHVsZURlZmluaXRpb25cbiAqKi8iLCIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSlcbiBcdFx0XHRyZXR1cm4gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0uZXhwb3J0cztcblxuIFx0XHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuIFx0XHR2YXIgbW9kdWxlID0gaW5zdGFsbGVkTW9kdWxlc1ttb2R1bGVJZF0gPSB7XG4gXHRcdFx0ZXhwb3J0czoge30sXG4gXHRcdFx0aWQ6IG1vZHVsZUlkLFxuIFx0XHRcdGxvYWRlZDogZmFsc2VcbiBcdFx0fTtcblxuIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbiBcdFx0bW9kdWxlc1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cbiBcdFx0Ly8gRmxhZyB0aGUgbW9kdWxlIGFzIGxvYWRlZFxuIFx0XHRtb2R1bGUubG9hZGVkID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBfX3dlYnBhY2tfcHVibGljX3BhdGhfX1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5wID0gXCJcIjtcblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXygwKTtcblxuXG5cbi8qKiBXRUJQQUNLIEZPT1RFUiAqKlxuICoqIHdlYnBhY2svYm9vdHN0cmFwIDQxMmYyZWUwYmQ5NjY4Y2IyZjA2XG4gKiovIiwiLyoqXHJcbiAqIEBmaWxlIHJlYWN0LWFueXRoaW5nLXNvcnRhYmxlXHJcbiAqIEBhdXRob3IgamFzb25zbHl2aWFcclxuICovXHJcblxyXG4vKiBlc2xpbnQgbmV3LWNhcDowLCBjb25zaXN0ZW50LXJldHVybjogMCwgcmVhY3QvcHJlZmVyLWVzNi1jbGFzczogMCwgcmVhY3Qvc29ydC1jb21wOiAwICovXHJcbi8qKlxyXG4gKiBAZGVwZW5kZW5jeVxyXG4gKi9cclxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcclxuaW1wb3J0IFByb3BUeXBlcyBmcm9tICdwcm9wLXR5cGVzJztcclxuaW1wb3J0IGNyZWF0ZVJlYWN0Q2xhc3MgZnJvbSAnY3JlYXRlLXJlYWN0LWNsYXNzJztcclxuaW1wb3J0IFJlYWN0RE9NIGZyb20gJ3JlYWN0LWRvbSc7XHJcbmltcG9ydCB7IG9uLCBvZmYsIGlzRnVuY3Rpb24sIGlzTnVtZXJpYywgcG9zaXRpb24sIGNsb3Nlc3QsIGdldCxcclxuICAgICAgICBhc3NpZ24sIGZpbmRNb3N0T2Z0ZW4gfSBmcm9tICcuL3V0aWxzJztcclxuaW1wb3J0IFNvcnRhYmxlSXRlbU1peGluIGZyb20gJy4vU29ydGFibGVJdGVtTWl4aW4nO1xyXG5cclxuXHJcbmNvbnN0IFNUQUNLX1NJWkUgPSA2O1xyXG5jb25zdCBnZXRTb3J0VGFyZ2V0ID0gKGNoaWxkKSA9PiB7XHJcbiAgLy8gYG9uU29ydGFibGVJdGVtUmVhZHlUb01vdmVgIG9ubHkgZXhpc3Qgd2hlbiB1c2luZyBtaXhpbnMgb3IgZGVjb3JhdG9yc1xyXG4gIHJldHVybiBjaGlsZCAmJiBjaGlsZC5wcm9wcyAmJiBpc0Z1bmN0aW9uKGNoaWxkLnByb3BzLm9uU29ydGFibGVJdGVtUmVhZHlUb01vdmUpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBjbGFzcyBTb3J0YWJsZVxyXG4gKi9cclxuY29uc3QgU29ydGFibGUgPSBjcmVhdGVSZWFjdENsYXNzKHtcclxuICBwcm9wVHlwZXM6IHtcclxuICAgIC8qKlxyXG4gICAgICogY2FsbGJhY2sgZmlyZXMgYWZ0ZXIgc29ydCBvcGVyYXRpb24gZmluaXNoXHJcbiAgICAgKiBmdW5jdGlvbiAoZGF0YVNldCl7XHJcbiAgICAgKiAgIC8vZGF0YVNldCBzb3J0ZWRcclxuICAgICAqIH1cclxuICAgICAqL1xyXG4gICAgb25Tb3J0OiBQcm9wVHlwZXMuZnVuYyxcclxuICAgIGNsYXNzTmFtZTogUHJvcFR5cGVzLnN0cmluZyxcclxuICAgIHNvcnRIYW5kbGU6IFByb3BUeXBlcy5zdHJpbmcsXHJcbiAgICBjb250YWlubWVudDogUHJvcFR5cGVzLmJvb2wsXHJcbiAgICBkeW5hbWljOiBQcm9wVHlwZXMuYm9vbCxcclxuICAgIGRpcmVjdGlvbjogUHJvcFR5cGVzLnN0cmluZyxcclxuICAgIGNoaWxkcmVuOiBQcm9wVHlwZXMuYXJyYXlPZihQcm9wVHlwZXMubm9kZSlcclxuICB9LFxyXG5cclxuICBzZXRBcnJheXMoY3VycmVudENoaWxkcmVuKSB7XHJcbiAgICBjb25zdCBjaGlsZHJlbiA9IEFycmF5LmlzQXJyYXkoY3VycmVudENoaWxkcmVuKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRDaGlsZHJlbiA6XHJcbiAgICAgICAgICAgICAgICAgICAgIFtjdXJyZW50Q2hpbGRyZW5dO1xyXG5cclxuICAgIGNvbnN0IHNvcnRDaGlsZHJlbiA9IGNoaWxkcmVuLmZpbHRlcihnZXRTb3J0VGFyZ2V0KTtcclxuICAgIHRoaXMuc29ydENoaWxkcmVuID0gc29ydENoaWxkcmVuO1xyXG5cclxuICAgIC8vIGtlZXAgdHJhY2tpbmcgdGhlIGRpbWVuc2lvbiBhbmQgY29vcmRpbmF0ZXMgb2YgYWxsIGNoaWxkcmVuXHJcbiAgICB0aGlzLl9kaW1lbnNpb25BcnIgPSBzb3J0Q2hpbGRyZW4ubWFwKCgpID0+ICh7fSkpO1xyXG5cclxuICAgIC8vIGtlZXAgdHJhY2tpbmcgdGhlIG9yZGVyIG9mIGFsbCBjaGlsZHJlblxyXG4gICAgdGhpcy5fb3JkZXJBcnIgPSBbXTtcclxuICAgIGxldCBpID0gMDtcclxuICAgIHdoaWxlIChpIDwgdGhpcy5fZGltZW5zaW9uQXJyLmxlbmd0aCkge1xyXG4gICAgICB0aGlzLl9vcmRlckFyci5wdXNoKGkrKyk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xyXG4gICAgdGhpcy5zZXRBcnJheXModGhpcy5wcm9wcy5jaGlsZHJlbik7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgaXNEcmFnZ2luZzogZmFsc2UsXHJcbiAgICAgIHBsYWNlSG9sZGVySW5kZXg6IG51bGwsXHJcbiAgICAgIGxlZnQ6IG51bGwsXHJcbiAgICAgIHRvcDogbnVsbFxyXG4gICAgfTtcclxuICB9LFxyXG5cclxuICBjb21wb25lbnREaWRVcGRhdGUoKSB7XHJcbiAgICBjb25zdCBjb250YWluZXIgPSBSZWFjdERPTS5maW5kRE9NTm9kZSh0aGlzKTtcclxuICAgIGNvbnN0IHJlY3QgPSBjb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XHJcblxyXG4gICAgdGhpcy5fdG9wID0gcmVjdC50b3AgKyBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcDtcclxuICAgIHRoaXMuX2xlZnQgPSByZWN0LmxlZnQgKyBkb2N1bWVudC5ib2R5LnNjcm9sbExlZnQ7XHJcbiAgICB0aGlzLl9ib3R0b20gPSB0aGlzLl90b3AgKyByZWN0LmhlaWdodDtcclxuICAgIHRoaXMuX3JpZ2h0ID0gdGhpcy5fbGVmdCArIHJlY3Qud2lkdGg7XHJcbiAgfSxcclxuXHJcbiAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyhuZXh0UHJvcHMpIHtcclxuICAgIGNvbnN0IHsgY2hpbGRyZW4sIGR5bmFtaWMgfSA9IHRoaXMucHJvcHM7XHJcbiAgICBpZiAoZHluYW1pYyAmJiBuZXh0UHJvcHMuY2hpbGRyZW4gIT09IGNoaWxkcmVuKSB7XHJcbiAgICAgIHRoaXMuc2V0QXJyYXlzKG5leHRQcm9wcy5jaGlsZHJlbik7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XHJcbiAgICB0aGlzLnVuYmluZEV2ZW50KCk7XHJcbiAgfSxcclxuXHJcbiAgYmluZEV2ZW50KCkge1xyXG4gICAgLy8gc28gdGhhdCB0aGUgZm9jdXMgd29uJ3QgYmUgbG9zdCBpZiBjdXJzb3IgbW92aW5nIHRvbyBmYXN0XHJcbiAgICB0aGlzLl9fbW91c2VNb3ZlSGFuZGxlciA9IChlKSA9PiB7XHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTaW5jZSBDaHJvbWUgbWF5IHRyaWdnZXIgcmVkdW5kYW50IG1vdXNlbW92ZSBldmVudCBldm5lIGlmXHJcbiAgICAgICAqIHdlIGRpZG4ndCByZWFsbHkgbW92ZSB0aGUgbW91c2UsIHdlIHNob3VsZCBtYWtlIHN1cmUgdGhhdFxyXG4gICAgICAgKiBtb3VzZSBjb29yZGluYXRlcyByZWFsbHkgY2hhbmdlZCB0aGVuIHJlc3BvbmQgdG8gbW91c2Vtb3ZlXHJcbiAgICAgICAqIGV2ZW50XHJcbiAgICAgICAqIEBzZWUgaHR0cHM6Ly9jb2RlLmdvb2dsZS5jb20vcC9jaHJvbWl1bS9pc3N1ZXMvZGV0YWlsP2lkPTMyNzExNFxyXG4gICAgICAgKi9cclxuICAgICAgaWYgKCgoZS5wYWdlWCB8fCBlLmNsaWVudFgpID09PSB0aGlzLl9wcmV2WCAmJiAoZS5wYWdlWSB8fCBlLmNsaWVudFkpID09PSB0aGlzLl9wcmV2WSkgfHxcclxuICAgICAgICAgICh0aGlzLl9wcmV2WCA9PT0gbnVsbCAmJiB0aGlzLl9wcmV2WSA9PT0gbnVsbCkpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHRoaXMuaGFuZGxlTW91c2VNb3ZlLmNhbGwodGhpcywgZSk7XHJcbiAgICB9O1xyXG5cclxuICAgIHRoaXMuX19tb3VzZVVwSGFuZGxlciA9IChlKSA9PiB7XHJcbiAgICAgIHRoaXMuaGFuZGxlTW91c2VVcC5jYWxsKHRoaXMsIGUpO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9fdG91Y2hNb3ZlSGFuZGxlciA9IChlKSA9PiB7XHJcbiAgICAgIC8vIGJsb2NrcyB0aGUgZGVmYXVsdCBzY3JvbGxpbmcgYXMgd2Ugc29ydCBhbiBlbGVtZW50XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgICAgIHRoaXMuaGFuZGxlTW91c2VNb3ZlLmNhbGwodGhpcywge1xyXG4gICAgICAgIHRhcmdldDogZS50YXJnZXQsXHJcbiAgICAgICAgY2xpZW50WDogZS50b3VjaGVzWzBdLmNsaWVudFgsXHJcbiAgICAgICAgY2xpZW50WTogZS50b3VjaGVzWzBdLmNsaWVudFksXHJcbiAgICAgICAgcGFnZVg6IGUudG91Y2hlc1swXS5wYWdlWCxcclxuICAgICAgICBwYWdlWTogZS50b3VjaGVzWzBdLnBhZ2VZXHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICB0aGlzLl9fdG91Y2hFbmRPckNhbmNlbEhhbmRsZXIgPSAoZSkgPT4ge1xyXG4gICAgICB0aGlzLmhhbmRsZU1vdXNlVXAuY2FsbCh0aGlzLCBlKTtcclxuICAgIH07XHJcblxyXG4gICAgb24oZG9jdW1lbnQsICd0b3VjaG1vdmUnLCB0aGlzLl9fdG91Y2hNb3ZlSGFuZGxlcik7XHJcbiAgICBvbihkb2N1bWVudCwgJ3RvdWNoZW5kJywgdGhpcy5fX3RvdWNoRW5kT3JDYW5jZWxIYW5kbGVyKTtcclxuICAgIG9uKGRvY3VtZW50LCAndG91Y2hjYW5jZWwnLCB0aGlzLl9fdG91Y2hFbmRPckNhbmNlbEhhbmRsZXIpO1xyXG4gICAgb24oZG9jdW1lbnQsICdtb3VzZW1vdmUnLCB0aGlzLl9fbW91c2VNb3ZlSGFuZGxlcik7XHJcbiAgICBvbihkb2N1bWVudCwgJ21vdXNldXAnLCB0aGlzLl9fbW91c2VVcEhhbmRsZXIpO1xyXG4gIH0sXHJcblxyXG4gIHVuYmluZEV2ZW50KCkge1xyXG4gICAgb2ZmKGRvY3VtZW50LCAndG91Y2htb3ZlJywgdGhpcy5fX3RvdWNoTW92ZUhhbmRsZXIpO1xyXG4gICAgb2ZmKGRvY3VtZW50LCAndG91Y2hlbmQnLCB0aGlzLl9fdG91Y2hFbmRPckNhbmNlbEhhbmRsZXIpO1xyXG4gICAgb2ZmKGRvY3VtZW50LCAndG91Y2hjYW5jZWwnLCB0aGlzLl9fdG91Y2hFbmRPckNhbmNlbEhhbmRsZXIpO1xyXG4gICAgb2ZmKGRvY3VtZW50LCAnbW91c2Vtb3ZlJywgdGhpcy5fX21vdXNlTW92ZUhhbmRsZXIpO1xyXG4gICAgb2ZmKGRvY3VtZW50LCAnbW91c2V1cCcsIHRoaXMuX19tb3VzZVVwSGFuZGxlcik7XHJcblxyXG4gICAgdGhpcy5fX21vdXNlTW92ZUhhbmRsZXIgPSBudWxsO1xyXG4gICAgdGhpcy5fX21vdXNlVXBIYW5kbGVyID0gbnVsbDtcclxuICAgIHRoaXMuX190b3VjaE1vdmVIYW5kbGVyID0gbnVsbDtcclxuICAgIHRoaXMuX190b3VjaEVuZE9yQ2FuY2VsSGFuZGxlciA9IG51bGw7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogZ2V0dGluZyByZWFkeSBmb3IgZHJhZ2dpbmdcclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGUgICAgIFJlYWN0IGV2ZW50XHJcbiAgICogQHBhcmFtICB7bnVtYm5lcn0gaW5kZXggaW5kZXggb2YgcHJlLWRyYWdnaW5nIGl0ZW1cclxuICAgKi9cclxuICBoYW5kbGVNb3VzZURvd24oZSwgaW5kZXgpIHtcclxuICAgIHRoaXMuX2RyYWdnaW5nSW5kZXggPSBpbmRleDtcclxuICAgIHRoaXMuX3ByZXZYID0gKGUucGFnZVggfHwgZS5jbGllbnRYKTtcclxuICAgIHRoaXMuX3ByZXZZID0gKGUucGFnZVkgfHwgZS5jbGllbnRZKTtcclxuICAgIHRoaXMuX2luaXRPZmZzZXQgPSBlLm9mZnNldDtcclxuICAgIHRoaXMuX2lzUmVhZHlGb3JEcmFnZ2luZyA9IHRydWU7XHJcbiAgICB0aGlzLl9oYXNJbml0RHJhZ2dpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAvLyBzdGFydCBsaXN0ZW5pbmcgbW91c2Vtb3ZlIGFuZCBtb3VzZXVwXHJcbiAgICB0aGlzLmJpbmRFdmVudCgpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIGBhZGRgIGEgZHJhZ2dpbmcgaXRlbSBhbmQgcmUtY2FsY3VsYXRpbmcgcG9zaXRpb24gb2YgcGxhY2Vob2xkZXJcclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGUgICAgIFJlYWN0IGV2ZW50XHJcbiAgICovXHJcbiAgaGFuZGxlTW91c2VNb3ZlKGUpIHtcclxuICAgIHRoaXMuX2lzTW91c2VNb3ZpbmcgPSB0cnVlO1xyXG5cclxuICAgIGlmICghdGhpcy5faXNSZWFkeUZvckRyYWdnaW5nKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXRoaXMuX2hhc0luaXREcmFnZ2luZykge1xyXG4gICAgICB0aGlzLl9kaW1lbnNpb25BcnJbdGhpcy5fZHJhZ2dpbmdJbmRleF0uaXNQbGFjZUhvbGRlciA9IHRydWU7XHJcbiAgICAgIHRoaXMuX2hhc0luaXREcmFnZ2luZyA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMucHJvcHMuY29udGFpbm1lbnQpIHtcclxuICAgICAgY29uc3QgeCA9IGUucGFnZVggfHwgZS5jbGllbnRYO1xyXG4gICAgICBjb25zdCB5ID0gZS5wYWdlWSB8fCBlLmNsaWVudFk7XHJcblxyXG4gICAgICBpZiAoeCA8IHRoaXMuX2xlZnQgfHwgeCA+IHRoaXMuX3JpZ2h0IHx8IHkgPCB0aGlzLl90b3AgfHwgeSA+IHRoaXMuX2JvdHRvbSkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5ld09mZnNldCA9IHRoaXMuY2FsY3VsYXRlTmV3T2Zmc2V0KGUpO1xyXG4gICAgY29uc3QgbmV3SW5kZXggPSB0aGlzLmNhbGN1bGF0ZU5ld0luZGV4KGUpO1xyXG5cclxuICAgIHRoaXMuX2RyYWdnaW5nSW5kZXggPSBuZXdJbmRleDtcclxuXHJcbiAgICB0aGlzLnNldFN0YXRlKHtcclxuICAgICAgaXNEcmFnZ2luZzogdHJ1ZSxcclxuICAgICAgdG9wOiB0aGlzLnByb3BzLmRpcmVjdGlvbiA9PT0gJ2hvcml6b250YWwnID8gdGhpcy5faW5pdE9mZnNldC50b3AgOiBuZXdPZmZzZXQudG9wLFxyXG4gICAgICBsZWZ0OiB0aGlzLnByb3BzLmRpcmVjdGlvbiA9PT0gJ3ZlcnRpY2FsJyA/IHRoaXMuX2luaXRPZmZzZXQubGVmdCA6IG5ld09mZnNldC5sZWZ0LFxyXG4gICAgICBwbGFjZUhvbGRlckluZGV4OiBuZXdJbmRleFxyXG4gICAgfSk7XHJcblxyXG4gICAgdGhpcy5fcHJldlggPSAoZS5wYWdlWCB8fCBlLmNsaWVudFgpO1xyXG4gICAgdGhpcy5fcHJldlkgPSAoZS5wYWdlWSB8fCBlLmNsaWVudFkpO1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIHJlcGxhY2UgcGxhY2Vob2xkZXIgd2l0aCBkcmFnZ2luZyBpdGVtXHJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlICAgICBSZWFjdCBldmVudFxyXG4gICAqL1xyXG4gIGhhbmRsZU1vdXNlVXAoKSB7XHJcbiAgICBjb25zdCBfaGFzTW91c2VNb3ZlZCA9IHRoaXMuX2lzTW91c2VNb3Zpbmc7XHJcbiAgICB0aGlzLnVuYmluZEV2ZW50KCk7XHJcblxyXG4gICAgY29uc3QgZHJhZ2dpbmdJbmRleCA9IHRoaXMuX2RyYWdnaW5nSW5kZXg7XHJcbiAgICAvLyByZXNldCB0ZW1wIGxldHNcclxuICAgIHRoaXMuX2RyYWdnaW5nSW5kZXggPSBudWxsO1xyXG4gICAgdGhpcy5faXNSZWFkeUZvckRyYWdnaW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLl9pc01vdXNlTW92aW5nID0gZmFsc2U7XHJcbiAgICB0aGlzLl9pbml0T2Zmc2V0ID0gbnVsbDtcclxuICAgIHRoaXMuX3ByZXZYID0gbnVsbDtcclxuICAgIHRoaXMuX3ByZXZZID0gbnVsbDtcclxuXHJcbiAgICBpZiAodGhpcy5zdGF0ZS5pc0RyYWdnaW5nKSB7XHJcbiAgICAgIHRoaXMuX2RpbWVuc2lvbkFyclt0aGlzLnN0YXRlLnBsYWNlSG9sZGVySW5kZXhdLmlzUGxhY2VIb2xkZXIgPSBmYWxzZTtcclxuXHJcbiAgICAgIGlmIChfaGFzTW91c2VNb3ZlZCkge1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xyXG4gICAgICAgICAgaXNEcmFnZ2luZzogZmFsc2UsXHJcbiAgICAgICAgICBwbGFjZUhvbGRlckluZGV4OiBudWxsLFxyXG4gICAgICAgICAgbGVmdDogbnVsbCxcclxuICAgICAgICAgIHRvcDogbnVsbFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBzb3J0IGZpbmlzaGVkLCBjYWxsYmFjayBmaXJlc1xyXG4gICAgICBpZiAoaXNGdW5jdGlvbih0aGlzLnByb3BzLm9uU29ydCkpIHtcclxuICAgICAgICBjb25zdCBzb3J0RGF0YSA9IHRoaXMuZ2V0U29ydERhdGEoKTtcclxuICAgICAgICB0aGlzLnByb3BzLm9uU29ydChzb3J0RGF0YSwgc29ydERhdGFbZHJhZ2dpbmdJbmRleF0sIGRyYWdnaW5nSW5kZXgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogd2hlbiBjaGlsZHJlbiBtb3VudGVkLCByZXR1cm4gaXRzIHNpemUoaGFuZGxlZCBieSBTb3J0YWJsZUl0ZW1NaXhpbilcclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IG9mZnNldCB7dG9wOjEsIGxlZnQ6Mn1cclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IHdpZHRoXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBoZWlnaHRcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGZ1bGxXaWR0aCAgKHdpdGggbWFyZ2luKVxyXG4gICAqIEBwYXJhbSAge251bWJlcn0gZnVsbEhlaWdodCAod2l0aCBtYXJnaW4pXHJcbiAgICogQHBhcmFtICB7bnVtYmVyfSBpbmRleFxyXG4gICAqL1xyXG4gIGhhbmRsZUNoaWxkVXBkYXRlKG9mZnNldCwgd2lkdGgsIGhlaWdodCwgZnVsbFdpZHRoLCBmdWxsSGVpZ2h0LCBpbmRleCkge1xyXG4gICAgYXNzaWduKHRoaXMuX2RpbWVuc2lvbkFycltpbmRleF0sIHtcclxuICAgICAgdG9wOiBvZmZzZXQudG9wLFxyXG4gICAgICBsZWZ0OiBvZmZzZXQubGVmdCxcclxuICAgICAgd2lkdGgsXHJcbiAgICAgIGhlaWdodCxcclxuICAgICAgZnVsbFdpZHRoLFxyXG4gICAgICBmdWxsSGVpZ2h0XHJcbiAgICB9KTtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiBnZXQgbmV3IGluZGV4IG9mIGFsbCBpdGVtcyBieSBjdXJzb3IgcG9zaXRpb25cclxuICAgKiBAcGFyYW0ge29iamVjdH0gb2Zmc2V0IHtsZWZ0OiAxMiwgdG9wOiAxMjN9XHJcbiAgICogQHBhcmFtIHtzdHJpbmd9IGRpcmVjdGlvbiBjdXJzb3IgbW92aW5nIGRpcmVjdGlvbiwgdXNlZCB0byBhdmlvZCBibGlua2luZyB3aGVuXHJcbiAgICogICAgICAgICAgICAgICAgIGludGVyY2hhbmdpbmcgcG9zaXRpb24gb2YgZGlmZmVyZW50IHdpZHRoIGVsZW1lbnRzXHJcbiAgICogQHJldHVybiB7bnVtYmVyfVxyXG4gICAqL1xyXG4gIGdldEluZGV4QnlPZmZzZXQob2Zmc2V0LCBkaXJlY3Rpb24pIHtcclxuICAgIGlmICghb2Zmc2V0IHx8ICFpc051bWVyaWMob2Zmc2V0LnRvcCkgfHwgIWlzTnVtZXJpYyhvZmZzZXQubGVmdCkpIHtcclxuICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgX2RpbWVuc2lvbkFyciA9IHRoaXMuX2RpbWVuc2lvbkFycjtcclxuICAgIGNvbnN0IG9mZnNldFggPSBvZmZzZXQubGVmdDtcclxuICAgIGNvbnN0IG9mZnNldFkgPSBvZmZzZXQudG9wO1xyXG4gICAgY29uc3QgcHJldkluZGV4ID0gdGhpcy5zdGF0ZS5wbGFjZUhvbGRlckluZGV4ICE9PSBudWxsID9cclxuICAgICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUucGxhY2VIb2xkZXJJbmRleCA6XHJcbiAgICAgICAgICAgICAgICAgICB0aGlzLl9kcmFnZ2luZ0luZGV4O1xyXG4gICAgbGV0IG5ld0luZGV4O1xyXG5cclxuICAgIF9kaW1lbnNpb25BcnIuZXZlcnkoKGl0ZW0sIGluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IHJlbGF0aXZlTGVmdCA9IG9mZnNldFggLSBpdGVtLmxlZnQ7XHJcbiAgICAgIGNvbnN0IHJlbGF0aXZlVG9wID0gb2Zmc2V0WSAtIGl0ZW0udG9wO1xyXG5cclxuICAgICAgaWYgKHJlbGF0aXZlTGVmdCA8IGl0ZW0uZnVsbFdpZHRoICYmIHJlbGF0aXZlVG9wIDwgaXRlbS5mdWxsSGVpZ2h0KSB7XHJcbiAgICAgICAgaWYgKHJlbGF0aXZlTGVmdCA8IGl0ZW0uZnVsbFdpZHRoIC8gMiAmJiBkaXJlY3Rpb24gPT09ICdsZWZ0Jykge1xyXG4gICAgICAgICAgbmV3SW5kZXggPSBpbmRleDtcclxuICAgICAgICB9IGVsc2UgaWYgKHJlbGF0aXZlTGVmdCA+IGl0ZW0uZnVsbFdpZHRoIC8gMiAmJiBkaXJlY3Rpb24gPT09ICdyaWdodCcpIHtcclxuICAgICAgICAgIG5ld0luZGV4ID0gTWF0aC5taW4oaW5kZXggKyAxLCBfZGltZW5zaW9uQXJyLmxlbmd0aCAtIDEpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocmVsYXRpdmVUb3AgPCBpdGVtLmZ1bGxIZWlnaHQgLyAyICYmIGRpcmVjdGlvbiA9PT0gJ3VwJykge1xyXG4gICAgICAgICAgbmV3SW5kZXggPSBpbmRleDtcclxuICAgICAgICB9IGVsc2UgaWYgKHJlbGF0aXZlVG9wID4gaXRlbS5mdWxsSGVpZ2h0IC8gMiAmJiBkaXJlY3Rpb24gPT09ICdkb3duJykge1xyXG4gICAgICAgICAgbmV3SW5kZXggPSBNYXRoLm1pbihpbmRleCArIDEsIF9kaW1lbnNpb25BcnIubGVuZ3RoIC0gMSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgcmV0dXJuIG5ld0luZGV4ICE9PSB1bmRlZmluZWQgPyBuZXdJbmRleCA6IHByZXZJbmRleDtcclxuICB9LFxyXG5cclxuICAvKipcclxuICAgKiB1bnRpbGl0eSBmdW5jdGlvblxyXG4gICAqIEBwYXJhbSAge2FycmF5fSBhcnJcclxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IHNyY1xyXG4gICAqIEBwYXJhbSAge251bWJlcn0gdG9cclxuICAgKiBAcmV0dXJuIHthcnJheX1cclxuICAgKi9cclxuICBzd2FwQXJyYXlJdGVtUG9zaXRpb24oYXJyLCBzcmMsIHRvKSB7XHJcbiAgICBpZiAoIWFyciB8fCAhaXNOdW1lcmljKHNyYykgfHwgIWlzTnVtZXJpYyh0bykpIHtcclxuICAgICAgcmV0dXJuIGFycjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzcmNFbCA9IGFyci5zcGxpY2Uoc3JjLCAxKVswXTtcclxuICAgIGFyci5zcGxpY2UodG8sIDAsIHNyY0VsKTtcclxuICAgIHJldHVybiBhcnI7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogY2FsY3VsYXRlIG5ldyBvZmZzZXRcclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGUgTW91c2VNb3ZlIGV2ZW50XHJcbiAgICogQHJldHVybiB7b2JqZWN0fSAgIHtsZWZ0OiAxLCB0b3A6IDF9XHJcbiAgICovXHJcbiAgY2FsY3VsYXRlTmV3T2Zmc2V0KGUpIHtcclxuICAgIGNvbnN0IGRlbHRhWCA9IHRoaXMuX3ByZXZYIC0gKGUucGFnZVggfHwgZS5jbGllbnRYKTtcclxuICAgIGNvbnN0IGRlbHRhWSA9IHRoaXMuX3ByZXZZIC0gKGUucGFnZVkgfHwgZS5jbGllbnRZKTtcclxuXHJcbiAgICBjb25zdCBwcmV2TGVmdCA9IHRoaXMuc3RhdGUubGVmdCAhPT0gbnVsbCA/IHRoaXMuc3RhdGUubGVmdCA6IHRoaXMuX2luaXRPZmZzZXQubGVmdDtcclxuICAgIGNvbnN0IHByZXZUb3AgPSB0aGlzLnN0YXRlLnRvcCAhPT0gbnVsbCA/IHRoaXMuc3RhdGUudG9wIDogdGhpcy5faW5pdE9mZnNldC50b3A7XHJcbiAgICBjb25zdCBuZXdMZWZ0ID0gcHJldkxlZnQgLSBkZWx0YVg7XHJcbiAgICBjb25zdCBuZXdUb3AgPSBwcmV2VG9wIC0gZGVsdGFZO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgIGxlZnQ6IG5ld0xlZnQsXHJcbiAgICAgIHRvcDogbmV3VG9wXHJcbiAgICB9O1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIGNhbGN1bGF0ZSBuZXcgaW5kZXggYW5kIGRvIHN3YXBwaW5nXHJcbiAgICogQHBhcmFtICB7b2JqZWN0fSBlIE1vdXNlTW92ZSBldmVudFxyXG4gICAqIEByZXR1cm4ge251bWJlcn1cclxuICAgKi9cclxuICBjYWxjdWxhdGVOZXdJbmRleChlKSB7XHJcbiAgICBjb25zdCBwbGFjZUhvbGRlckluZGV4ID0gdGhpcy5zdGF0ZS5wbGFjZUhvbGRlckluZGV4ICE9PSBudWxsID9cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZS5wbGFjZUhvbGRlckluZGV4IDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZHJhZ2dpbmdJbmRleDtcclxuXHJcbiAgICAvLyBTaW5jZSBgbW91c2Vtb3ZlYCBpcyBsaXN0ZW5lZCBvbiBkb2N1bWVudCwgd2hlbiBjdXJzb3IgbW92ZSB0b28gZmFzdCxcclxuICAgIC8vIGBlLnRhcmdldGAgbWF5IGJlIGBib2R5YCBvciBzb21lIG90aGVyIHN0dWZmIGluc3RlYWQgb2ZcclxuICAgIC8vIGAudWktc29ydGFibGUtaXRlbWBcclxuICAgIGNvbnN0IHRhcmdldCA9IGdldCgnLnVpLXNvcnRhYmxlLWRyYWdnaW5nJykgfHxcclxuICAgICAgICAgICAgICAgICAgIGNsb3Nlc3QoKGUudGFyZ2V0IHx8IGUuc3JjRWxlbWVudCksICcudWktc29ydGFibGUtaXRlbScpO1xyXG4gICAgY29uc3Qgb2Zmc2V0ID0gcG9zaXRpb24odGFyZ2V0KTtcclxuXHJcbiAgICBjb25zdCBjdXJyZW50WCA9IGUucGFnZVggfHwgZS5jbGllbnRYO1xyXG4gICAgY29uc3QgY3VycmVudFkgPSBlLnBhZ2VZIHx8IGUuY2xpZW50WTtcclxuXHJcbiAgICBjb25zdCBkZWx0YVggPSBNYXRoLmFicyh0aGlzLl9wcmV2WCAtIGN1cnJlbnRYKTtcclxuICAgIGNvbnN0IGRlbHRhWSA9IE1hdGguYWJzKHRoaXMuX3ByZXZZIC0gY3VycmVudFkpO1xyXG5cclxuICAgIGxldCBkaXJlY3Rpb247XHJcbiAgICBpZiAoZGVsdGFYID4gZGVsdGFZKSB7XHJcbiAgICAgIC8vIHRlbmQgdG8gbW92ZSBsZWZ0L3JpZ2h0XHJcbiAgICAgIGRpcmVjdGlvbiA9IHRoaXMuX3ByZXZYID4gY3VycmVudFggPyAnbGVmdCcgOiAncmlnaHQnO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gdGVuZCB0byBtb3ZlIHVwL2Rvd25cclxuICAgICAgZGlyZWN0aW9uID0gdGhpcy5fcHJldlkgPiBjdXJyZW50WSA/ICd1cCcgOiAnZG93bic7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbmV3SW5kZXggPSB0aGlzLmdldEluZGV4QnlPZmZzZXQob2Zmc2V0LCB0aGlzLmdldFBvc3NpYmxlRGlyZWN0aW9uKGRpcmVjdGlvbikpO1xyXG4gICAgaWYgKG5ld0luZGV4ICE9PSBwbGFjZUhvbGRlckluZGV4KSB7XHJcbiAgICAgIHRoaXMuX2RpbWVuc2lvbkFyciA9IHRoaXMuc3dhcEFycmF5SXRlbVBvc2l0aW9uKHRoaXMuX2RpbWVuc2lvbkFycixcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGxhY2VIb2xkZXJJbmRleCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3SW5kZXgpO1xyXG4gICAgICB0aGlzLl9vcmRlckFyciA9IHRoaXMuc3dhcEFycmF5SXRlbVBvc2l0aW9uKHRoaXMuX29yZGVyQXJyLCBwbGFjZUhvbGRlckluZGV4LCBuZXdJbmRleCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIG5ld0luZGV4O1xyXG4gIH0sXHJcblxyXG4gIGdldFNvcnREYXRhKCkge1xyXG4gICAgcmV0dXJuIHRoaXMuX29yZGVyQXJyLm1hcCgoaXRlbUluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IGl0ZW0gPSB0aGlzLnNvcnRDaGlsZHJlbltpdGVtSW5kZXhdO1xyXG4gICAgICBpZiAoIWl0ZW0pIHtcclxuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gaXRlbS5wcm9wcy5zb3J0RGF0YTtcclxuICAgIH0pO1xyXG4gIH0sXHJcblxyXG4gIGdldFBvc3NpYmxlRGlyZWN0aW9uKGRpcmVjdGlvbikge1xyXG4gICAgdGhpcy5fc3RhY2sgPSB0aGlzLl9zdGFjayB8fCBbXTtcclxuICAgIHRoaXMuX3N0YWNrLnB1c2goZGlyZWN0aW9uKTtcclxuICAgIGlmICh0aGlzLl9zdGFjay5sZW5ndGggPiBTVEFDS19TSVpFKSB7XHJcbiAgICAgIHRoaXMuX3N0YWNrLnNoaWZ0KCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHRoaXMuX3N0YWNrLmxlbmd0aCA8IFNUQUNLX1NJWkUpIHtcclxuICAgICAgcmV0dXJuIGRpcmVjdGlvbjtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmluZE1vc3RPZnRlbih0aGlzLl9zdGFjayk7XHJcbiAgfSxcclxuXHJcbiAgLyoqXHJcbiAgICogcmVuZGVyIGFsbCBzb3J0YWJsZSBjaGlsZHJlbiB3aGljaCBtaXhpbmVkIHdpdGggU29ydGFibGVJdGVtTWl4aW5cclxuICAgKi9cclxuICByZW5kZXJJdGVtcygpIHtcclxuICAgIGNvbnN0IHsgX2RpbWVuc2lvbkFyciwgX29yZGVyQXJyIH0gPSB0aGlzO1xyXG4gICAgbGV0IGRyYWdnaW5nSXRlbTtcclxuXHJcbiAgICBjb25zdCBpdGVtcyA9IF9vcmRlckFyci5tYXAoKGl0ZW1JbmRleCwgaW5kZXgpID0+IHtcclxuICAgICAgY29uc3QgaXRlbSA9IHRoaXMuc29ydENoaWxkcmVuW2l0ZW1JbmRleF07XHJcbiAgICAgIGlmICghaXRlbSkge1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGluZGV4ID09PSB0aGlzLl9kcmFnZ2luZ0luZGV4ICYmIHRoaXMuc3RhdGUuaXNEcmFnZ2luZykge1xyXG4gICAgICAgIGRyYWdnaW5nSXRlbSA9IHRoaXMucmVuZGVyRHJhZ2dpbmdJdGVtKGl0ZW0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBpc1BsYWNlSG9sZGVyID0gX2RpbWVuc2lvbkFycltpbmRleF0uaXNQbGFjZUhvbGRlcjtcclxuICAgICAgY29uc3QgaXRlbUNsYXNzTmFtZSA9IGB1aS1zb3J0YWJsZS1pdGVtXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHtpc1BsYWNlSG9sZGVyICYmICd1aS1zb3J0YWJsZS1wbGFjZWhvbGRlcid9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHt0aGlzLnN0YXRlLmlzRHJhZ2dpbmcgJiYgaXNQbGFjZUhvbGRlciAmJiAndmlzaWJsZSd9YDtcclxuXHJcbiAgICAgIGNvbnN0IHNvcnRhYmxlUHJvcHMgPSB7XHJcbiAgICAgICAgc29ydGFibGVDbGFzc05hbWU6IGAke2l0ZW0ucHJvcHMuY2xhc3NOYW1lfSAke2l0ZW1DbGFzc05hbWV9YCxcclxuICAgICAgICBzb3J0YWJsZUluZGV4OiBpbmRleCxcclxuICAgICAgICBvblNvcnRhYmxlSXRlbVJlYWR5VG9Nb3ZlOiBpc1BsYWNlSG9sZGVyID8gdW5kZWZpbmVkIDogKGUpID0+IHtcclxuICAgICAgICAgIHRoaXMuaGFuZGxlTW91c2VEb3duLmNhbGwodGhpcywgZSwgaW5kZXgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb25Tb3J0YWJsZUl0ZW1Nb3VudDogdGhpcy5oYW5kbGVDaGlsZFVwZGF0ZSxcclxuICAgICAgICBzb3J0SGFuZGxlOiB0aGlzLnByb3BzLnNvcnRIYW5kbGVcclxuICAgICAgfTtcclxuXHJcbiAgICAgIGlmIChpdGVtLmtleSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgc29ydGFibGVQcm9wcy5rZXkgPSBpbmRleDtcclxuICAgICAgfVxyXG5cclxuICAgICAgcmV0dXJuIFJlYWN0LmNsb25lRWxlbWVudChpdGVtLCBzb3J0YWJsZVByb3BzKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGNoaWxkcmVuID0gQXJyYXkuaXNBcnJheSh0aGlzLnByb3BzLmNoaWxkcmVuKSA/XHJcbiAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuY2hpbGRyZW4gOlxyXG4gICAgICAgICAgICAgICAgICAgICBbdGhpcy5wcm9wcy5jaGlsZHJlbl07XHJcblxyXG4gICAgY29uc3QgcmVzdWx0ID0gY2hpbGRyZW4ubWFwKGNoaWxkID0+IHtcclxuICAgICAgaWYgKGdldFNvcnRUYXJnZXQoY2hpbGQpKSB7XHJcbiAgICAgICAgcmV0dXJuIGl0ZW1zLnNoaWZ0KCk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGNoaWxkO1xyXG4gICAgfSkuY29uY2F0KFtkcmFnZ2luZ0l0ZW1dKTtcclxuXHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH0sXHJcblxyXG4gIC8qKlxyXG4gICAqIHJlbmRlciB0aGUgaXRlbSB0aGF0IGJlaW5nIGRyYWdnZWRcclxuICAgKiBAcGFyYW0gIHtvYmplY3R9IGl0ZW0gYSByZWZlcmVuY2Ugb2YgdGhpcy5wcm9wcy5jaGlsZHJlblxyXG4gICAqL1xyXG4gIHJlbmRlckRyYWdnaW5nSXRlbShpdGVtKSB7XHJcbiAgICBpZiAoIWl0ZW0pIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0eWxlID0ge1xyXG4gICAgICB0b3A6IHRoaXMuc3RhdGUudG9wLFxyXG4gICAgICBsZWZ0OiB0aGlzLnN0YXRlLmxlZnQsXHJcbiAgICAgIHdpZHRoOiB0aGlzLl9kaW1lbnNpb25BcnJbdGhpcy5fZHJhZ2dpbmdJbmRleF0ud2lkdGgsXHJcbiAgICAgIGhlaWdodDogdGhpcy5fZGltZW5zaW9uQXJyW3RoaXMuX2RyYWdnaW5nSW5kZXhdLmhlaWdodFxyXG4gICAgfTtcclxuICAgIHJldHVybiBSZWFjdC5jbG9uZUVsZW1lbnQoaXRlbSwge1xyXG4gICAgICBzb3J0YWJsZUNsYXNzTmFtZTogYCR7aXRlbS5wcm9wcy5jbGFzc05hbWV9IHVpLXNvcnRhYmxlLWl0ZW0gdWktc29ydGFibGUtZHJhZ2dpbmdgLFxyXG4gICAgICBrZXk6ICdfZHJhZ2dpbmcnLFxyXG4gICAgICBzb3J0YWJsZVN0eWxlOiBzdHlsZSxcclxuICAgICAgaXNEcmFnZ2luZzogdHJ1ZSxcclxuICAgICAgc29ydEhhbmRsZTogdGhpcy5wcm9wcy5zb3J0SGFuZGxlXHJcbiAgICB9KTtcclxuICB9LFxyXG5cclxuICByZW5kZXIoKSB7XHJcbiAgICBjb25zdCBjbGFzc05hbWUgPSBgdWktc29ydGFibGUgJHt0aGlzLnByb3BzLmNsYXNzTmFtZSB8fCAnJ31gO1xyXG5cclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxkaXYgY2xhc3NOYW1lPXtjbGFzc05hbWV9PlxyXG4gICAgICAgIHt0aGlzLnJlbmRlckl0ZW1zKCl9XHJcbiAgICAgIDwvZGl2PlxyXG4gICAgKTtcclxuICB9XHJcbn0pO1xyXG5cclxuY29uc3QgU29ydGFibGVDb250YWluZXIgPSAoe1xyXG4gIGNsYXNzTmFtZSwgc3R5bGUsIG9uTW91c2VEb3duLCBvblRvdWNoU3RhcnQsIGNoaWxkcmVuLFxyXG59KSA9PiB7XHJcbiAgaWYgKFJlYWN0LmlzVmFsaWRFbGVtZW50KGNoaWxkcmVuKSkge1xyXG4gICAgcmV0dXJuIFJlYWN0LmNsb25lRWxlbWVudChjaGlsZHJlbiwge1xyXG4gICAgICBjbGFzc05hbWUsIHN0eWxlLCBvbk1vdXNlRG93biwgb25Ub3VjaFN0YXJ0XHJcbiAgICB9KTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2RpdicsIHtcclxuICAgICAgY2xhc3NOYW1lLCBzdHlsZSwgb25Nb3VzZURvd24sIG9uVG91Y2hTdGFydCwgY2hpbGRyZW5cclxuICAgIH0pO1xyXG4gIH1cclxufTtcclxuXHJcblNvcnRhYmxlLlNvcnRhYmxlSXRlbU1peGluID0gU29ydGFibGVJdGVtTWl4aW4oKTtcclxuU29ydGFibGUuc29ydGFibGUgPSBTb3J0YWJsZUl0ZW1NaXhpbjtcclxuU29ydGFibGUuU29ydGFibGVDb250YWluZXIgPSBTb3J0YWJsZUl0ZW1NaXhpbihTb3J0YWJsZUNvbnRhaW5lcik7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBTb3J0YWJsZTtcclxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvaW5kZXguanNcbiAqKi8iLCJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfMV9fO1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogZXh0ZXJuYWwge1wiY29tbW9uanNcIjpcInJlYWN0XCIsXCJjb21tb25qczJcIjpcInJlYWN0XCIsXCJhbWRcIjpcIlJlYWN0XCIsXCJyb290XCI6XCJSZWFjdFwifVxuICoqIG1vZHVsZSBpZCA9IDFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTMtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICovXG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIHZhciBSRUFDVF9FTEVNRU5UX1RZUEUgPSAodHlwZW9mIFN5bWJvbCA9PT0gJ2Z1bmN0aW9uJyAmJlxuICAgIFN5bWJvbC5mb3IgJiZcbiAgICBTeW1ib2wuZm9yKCdyZWFjdC5lbGVtZW50JykpIHx8XG4gICAgMHhlYWM3O1xuXG4gIHZhciBpc1ZhbGlkRWxlbWVudCA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICAgIHJldHVybiB0eXBlb2Ygb2JqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgb2JqZWN0ICE9PSBudWxsICYmXG4gICAgICBvYmplY3QuJCR0eXBlb2YgPT09IFJFQUNUX0VMRU1FTlRfVFlQRTtcbiAgfTtcblxuICAvLyBCeSBleHBsaWNpdGx5IHVzaW5nIGBwcm9wLXR5cGVzYCB5b3UgYXJlIG9wdGluZyBpbnRvIG5ldyBkZXZlbG9wbWVudCBiZWhhdmlvci5cbiAgLy8gaHR0cDovL2ZiLm1lL3Byb3AtdHlwZXMtaW4tcHJvZFxuICB2YXIgdGhyb3dPbkRpcmVjdEFjY2VzcyA9IHRydWU7XG4gIG1vZHVsZS5leHBvcnRzID0gcmVxdWlyZSgnLi9mYWN0b3J5V2l0aFR5cGVDaGVja2VycycpKGlzVmFsaWRFbGVtZW50LCB0aHJvd09uRGlyZWN0QWNjZXNzKTtcbn0gZWxzZSB7XG4gIC8vIEJ5IGV4cGxpY2l0bHkgdXNpbmcgYHByb3AtdHlwZXNgIHlvdSBhcmUgb3B0aW5nIGludG8gbmV3IHByb2R1Y3Rpb24gYmVoYXZpb3IuXG4gIC8vIGh0dHA6Ly9mYi5tZS9wcm9wLXR5cGVzLWluLXByb2RcbiAgbW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2ZhY3RvcnlXaXRoVGhyb3dpbmdTaGltcycpKCk7XG59XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9wcm9wLXR5cGVzL2luZGV4LmpzXG4gKiogbW9kdWxlIGlkID0gMlxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3Byb2Nlc3MvYnJvd3Nlci5qc1xuICoqIG1vZHVsZSBpZCA9IDNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTMtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICovXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIGVtcHR5RnVuY3Rpb24gPSByZXF1aXJlKCdmYmpzL2xpYi9lbXB0eUZ1bmN0aW9uJyk7XG52YXIgaW52YXJpYW50ID0gcmVxdWlyZSgnZmJqcy9saWIvaW52YXJpYW50Jyk7XG52YXIgd2FybmluZyA9IHJlcXVpcmUoJ2ZianMvbGliL3dhcm5pbmcnKTtcblxudmFyIFJlYWN0UHJvcFR5cGVzU2VjcmV0ID0gcmVxdWlyZSgnLi9saWIvUmVhY3RQcm9wVHlwZXNTZWNyZXQnKTtcbnZhciBjaGVja1Byb3BUeXBlcyA9IHJlcXVpcmUoJy4vY2hlY2tQcm9wVHlwZXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihpc1ZhbGlkRWxlbWVudCwgdGhyb3dPbkRpcmVjdEFjY2Vzcykge1xuICAvKiBnbG9iYWwgU3ltYm9sICovXG4gIHZhciBJVEVSQVRPUl9TWU1CT0wgPSB0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIFN5bWJvbC5pdGVyYXRvcjtcbiAgdmFyIEZBVVhfSVRFUkFUT1JfU1lNQk9MID0gJ0BAaXRlcmF0b3InOyAvLyBCZWZvcmUgU3ltYm9sIHNwZWMuXG5cbiAgLyoqXG4gICAqIFJldHVybnMgdGhlIGl0ZXJhdG9yIG1ldGhvZCBmdW5jdGlvbiBjb250YWluZWQgb24gdGhlIGl0ZXJhYmxlIG9iamVjdC5cbiAgICpcbiAgICogQmUgc3VyZSB0byBpbnZva2UgdGhlIGZ1bmN0aW9uIHdpdGggdGhlIGl0ZXJhYmxlIGFzIGNvbnRleHQ6XG4gICAqXG4gICAqICAgICB2YXIgaXRlcmF0b3JGbiA9IGdldEl0ZXJhdG9yRm4obXlJdGVyYWJsZSk7XG4gICAqICAgICBpZiAoaXRlcmF0b3JGbikge1xuICAgKiAgICAgICB2YXIgaXRlcmF0b3IgPSBpdGVyYXRvckZuLmNhbGwobXlJdGVyYWJsZSk7XG4gICAqICAgICAgIC4uLlxuICAgKiAgICAgfVxuICAgKlxuICAgKiBAcGFyYW0gez9vYmplY3R9IG1heWJlSXRlcmFibGVcbiAgICogQHJldHVybiB7P2Z1bmN0aW9ufVxuICAgKi9cbiAgZnVuY3Rpb24gZ2V0SXRlcmF0b3JGbihtYXliZUl0ZXJhYmxlKSB7XG4gICAgdmFyIGl0ZXJhdG9yRm4gPSBtYXliZUl0ZXJhYmxlICYmIChJVEVSQVRPUl9TWU1CT0wgJiYgbWF5YmVJdGVyYWJsZVtJVEVSQVRPUl9TWU1CT0xdIHx8IG1heWJlSXRlcmFibGVbRkFVWF9JVEVSQVRPUl9TWU1CT0xdKTtcbiAgICBpZiAodHlwZW9mIGl0ZXJhdG9yRm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBpdGVyYXRvckZuO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBDb2xsZWN0aW9uIG9mIG1ldGhvZHMgdGhhdCBhbGxvdyBkZWNsYXJhdGlvbiBhbmQgdmFsaWRhdGlvbiBvZiBwcm9wcyB0aGF0IGFyZVxuICAgKiBzdXBwbGllZCB0byBSZWFjdCBjb21wb25lbnRzLiBFeGFtcGxlIHVzYWdlOlxuICAgKlxuICAgKiAgIHZhciBQcm9wcyA9IHJlcXVpcmUoJ1JlYWN0UHJvcFR5cGVzJyk7XG4gICAqICAgdmFyIE15QXJ0aWNsZSA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcbiAgICogICAgIHByb3BUeXBlczoge1xuICAgKiAgICAgICAvLyBBbiBvcHRpb25hbCBzdHJpbmcgcHJvcCBuYW1lZCBcImRlc2NyaXB0aW9uXCIuXG4gICAqICAgICAgIGRlc2NyaXB0aW9uOiBQcm9wcy5zdHJpbmcsXG4gICAqXG4gICAqICAgICAgIC8vIEEgcmVxdWlyZWQgZW51bSBwcm9wIG5hbWVkIFwiY2F0ZWdvcnlcIi5cbiAgICogICAgICAgY2F0ZWdvcnk6IFByb3BzLm9uZU9mKFsnTmV3cycsJ1Bob3RvcyddKS5pc1JlcXVpcmVkLFxuICAgKlxuICAgKiAgICAgICAvLyBBIHByb3AgbmFtZWQgXCJkaWFsb2dcIiB0aGF0IHJlcXVpcmVzIGFuIGluc3RhbmNlIG9mIERpYWxvZy5cbiAgICogICAgICAgZGlhbG9nOiBQcm9wcy5pbnN0YW5jZU9mKERpYWxvZykuaXNSZXF1aXJlZFxuICAgKiAgICAgfSxcbiAgICogICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7IC4uLiB9XG4gICAqICAgfSk7XG4gICAqXG4gICAqIEEgbW9yZSBmb3JtYWwgc3BlY2lmaWNhdGlvbiBvZiBob3cgdGhlc2UgbWV0aG9kcyBhcmUgdXNlZDpcbiAgICpcbiAgICogICB0eXBlIDo9IGFycmF5fGJvb2x8ZnVuY3xvYmplY3R8bnVtYmVyfHN0cmluZ3xvbmVPZihbLi4uXSl8aW5zdGFuY2VPZiguLi4pXG4gICAqICAgZGVjbCA6PSBSZWFjdFByb3BUeXBlcy57dHlwZX0oLmlzUmVxdWlyZWQpP1xuICAgKlxuICAgKiBFYWNoIGFuZCBldmVyeSBkZWNsYXJhdGlvbiBwcm9kdWNlcyBhIGZ1bmN0aW9uIHdpdGggdGhlIHNhbWUgc2lnbmF0dXJlLiBUaGlzXG4gICAqIGFsbG93cyB0aGUgY3JlYXRpb24gb2YgY3VzdG9tIHZhbGlkYXRpb24gZnVuY3Rpb25zLiBGb3IgZXhhbXBsZTpcbiAgICpcbiAgICogIHZhciBNeUxpbmsgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gICAqICAgIHByb3BUeXBlczoge1xuICAgKiAgICAgIC8vIEFuIG9wdGlvbmFsIHN0cmluZyBvciBVUkkgcHJvcCBuYW1lZCBcImhyZWZcIi5cbiAgICogICAgICBocmVmOiBmdW5jdGlvbihwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUpIHtcbiAgICogICAgICAgIHZhciBwcm9wVmFsdWUgPSBwcm9wc1twcm9wTmFtZV07XG4gICAqICAgICAgICBpZiAocHJvcFZhbHVlICE9IG51bGwgJiYgdHlwZW9mIHByb3BWYWx1ZSAhPT0gJ3N0cmluZycgJiZcbiAgICogICAgICAgICAgICAhKHByb3BWYWx1ZSBpbnN0YW5jZW9mIFVSSSkpIHtcbiAgICogICAgICAgICAgcmV0dXJuIG5ldyBFcnJvcihcbiAgICogICAgICAgICAgICAnRXhwZWN0ZWQgYSBzdHJpbmcgb3IgYW4gVVJJIGZvciAnICsgcHJvcE5hbWUgKyAnIGluICcgK1xuICAgKiAgICAgICAgICAgIGNvbXBvbmVudE5hbWVcbiAgICogICAgICAgICAgKTtcbiAgICogICAgICAgIH1cbiAgICogICAgICB9XG4gICAqICAgIH0sXG4gICAqICAgIHJlbmRlcjogZnVuY3Rpb24oKSB7Li4ufVxuICAgKiAgfSk7XG4gICAqXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cblxuICB2YXIgQU5PTllNT1VTID0gJzw8YW5vbnltb3VzPj4nO1xuXG4gIC8vIEltcG9ydGFudCFcbiAgLy8gS2VlcCB0aGlzIGxpc3QgaW4gc3luYyB3aXRoIHByb2R1Y3Rpb24gdmVyc2lvbiBpbiBgLi9mYWN0b3J5V2l0aFRocm93aW5nU2hpbXMuanNgLlxuICB2YXIgUmVhY3RQcm9wVHlwZXMgPSB7XG4gICAgYXJyYXk6IGNyZWF0ZVByaW1pdGl2ZVR5cGVDaGVja2VyKCdhcnJheScpLFxuICAgIGJvb2w6IGNyZWF0ZVByaW1pdGl2ZVR5cGVDaGVja2VyKCdib29sZWFuJyksXG4gICAgZnVuYzogY3JlYXRlUHJpbWl0aXZlVHlwZUNoZWNrZXIoJ2Z1bmN0aW9uJyksXG4gICAgbnVtYmVyOiBjcmVhdGVQcmltaXRpdmVUeXBlQ2hlY2tlcignbnVtYmVyJyksXG4gICAgb2JqZWN0OiBjcmVhdGVQcmltaXRpdmVUeXBlQ2hlY2tlcignb2JqZWN0JyksXG4gICAgc3RyaW5nOiBjcmVhdGVQcmltaXRpdmVUeXBlQ2hlY2tlcignc3RyaW5nJyksXG4gICAgc3ltYm9sOiBjcmVhdGVQcmltaXRpdmVUeXBlQ2hlY2tlcignc3ltYm9sJyksXG5cbiAgICBhbnk6IGNyZWF0ZUFueVR5cGVDaGVja2VyKCksXG4gICAgYXJyYXlPZjogY3JlYXRlQXJyYXlPZlR5cGVDaGVja2VyLFxuICAgIGVsZW1lbnQ6IGNyZWF0ZUVsZW1lbnRUeXBlQ2hlY2tlcigpLFxuICAgIGluc3RhbmNlT2Y6IGNyZWF0ZUluc3RhbmNlVHlwZUNoZWNrZXIsXG4gICAgbm9kZTogY3JlYXRlTm9kZUNoZWNrZXIoKSxcbiAgICBvYmplY3RPZjogY3JlYXRlT2JqZWN0T2ZUeXBlQ2hlY2tlcixcbiAgICBvbmVPZjogY3JlYXRlRW51bVR5cGVDaGVja2VyLFxuICAgIG9uZU9mVHlwZTogY3JlYXRlVW5pb25UeXBlQ2hlY2tlcixcbiAgICBzaGFwZTogY3JlYXRlU2hhcGVUeXBlQ2hlY2tlclxuICB9O1xuXG4gIC8qKlxuICAgKiBpbmxpbmVkIE9iamVjdC5pcyBwb2x5ZmlsbCB0byBhdm9pZCByZXF1aXJpbmcgY29uc3VtZXJzIHNoaXAgdGhlaXIgb3duXG4gICAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9pc1xuICAgKi9cbiAgLyplc2xpbnQtZGlzYWJsZSBuby1zZWxmLWNvbXBhcmUqL1xuICBmdW5jdGlvbiBpcyh4LCB5KSB7XG4gICAgLy8gU2FtZVZhbHVlIGFsZ29yaXRobVxuICAgIGlmICh4ID09PSB5KSB7XG4gICAgICAvLyBTdGVwcyAxLTUsIDctMTBcbiAgICAgIC8vIFN0ZXBzIDYuYi02LmU6ICswICE9IC0wXG4gICAgICByZXR1cm4geCAhPT0gMCB8fCAxIC8geCA9PT0gMSAvIHk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFN0ZXAgNi5hOiBOYU4gPT0gTmFOXG4gICAgICByZXR1cm4geCAhPT0geCAmJiB5ICE9PSB5O1xuICAgIH1cbiAgfVxuICAvKmVzbGludC1lbmFibGUgbm8tc2VsZi1jb21wYXJlKi9cblxuICAvKipcbiAgICogV2UgdXNlIGFuIEVycm9yLWxpa2Ugb2JqZWN0IGZvciBiYWNrd2FyZCBjb21wYXRpYmlsaXR5IGFzIHBlb3BsZSBtYXkgY2FsbFxuICAgKiBQcm9wVHlwZXMgZGlyZWN0bHkgYW5kIGluc3BlY3QgdGhlaXIgb3V0cHV0LiBIb3dldmVyLCB3ZSBkb24ndCB1c2UgcmVhbFxuICAgKiBFcnJvcnMgYW55bW9yZS4gV2UgZG9uJ3QgaW5zcGVjdCB0aGVpciBzdGFjayBhbnl3YXksIGFuZCBjcmVhdGluZyB0aGVtXG4gICAqIGlzIHByb2hpYml0aXZlbHkgZXhwZW5zaXZlIGlmIHRoZXkgYXJlIGNyZWF0ZWQgdG9vIG9mdGVuLCBzdWNoIGFzIHdoYXRcbiAgICogaGFwcGVucyBpbiBvbmVPZlR5cGUoKSBmb3IgYW55IHR5cGUgYmVmb3JlIHRoZSBvbmUgdGhhdCBtYXRjaGVkLlxuICAgKi9cbiAgZnVuY3Rpb24gUHJvcFR5cGVFcnJvcihtZXNzYWdlKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB0aGlzLnN0YWNrID0gJyc7XG4gIH1cbiAgLy8gTWFrZSBgaW5zdGFuY2VvZiBFcnJvcmAgc3RpbGwgd29yayBmb3IgcmV0dXJuZWQgZXJyb3JzLlxuICBQcm9wVHlwZUVycm9yLnByb3RvdHlwZSA9IEVycm9yLnByb3RvdHlwZTtcblxuICBmdW5jdGlvbiBjcmVhdGVDaGFpbmFibGVUeXBlQ2hlY2tlcih2YWxpZGF0ZSkge1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICB2YXIgbWFudWFsUHJvcFR5cGVDYWxsQ2FjaGUgPSB7fTtcbiAgICAgIHZhciBtYW51YWxQcm9wVHlwZVdhcm5pbmdDb3VudCA9IDA7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNoZWNrVHlwZShpc1JlcXVpcmVkLCBwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUsIHNlY3JldCkge1xuICAgICAgY29tcG9uZW50TmFtZSA9IGNvbXBvbmVudE5hbWUgfHwgQU5PTllNT1VTO1xuICAgICAgcHJvcEZ1bGxOYW1lID0gcHJvcEZ1bGxOYW1lIHx8IHByb3BOYW1lO1xuXG4gICAgICBpZiAoc2VjcmV0ICE9PSBSZWFjdFByb3BUeXBlc1NlY3JldCkge1xuICAgICAgICBpZiAodGhyb3dPbkRpcmVjdEFjY2Vzcykge1xuICAgICAgICAgIC8vIE5ldyBiZWhhdmlvciBvbmx5IGZvciB1c2VycyBvZiBgcHJvcC10eXBlc2AgcGFja2FnZVxuICAgICAgICAgIGludmFyaWFudChcbiAgICAgICAgICAgIGZhbHNlLFxuICAgICAgICAgICAgJ0NhbGxpbmcgUHJvcFR5cGVzIHZhbGlkYXRvcnMgZGlyZWN0bHkgaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgYHByb3AtdHlwZXNgIHBhY2thZ2UuICcgK1xuICAgICAgICAgICAgJ1VzZSBgUHJvcFR5cGVzLmNoZWNrUHJvcFR5cGVzKClgIHRvIGNhbGwgdGhlbS4gJyArXG4gICAgICAgICAgICAnUmVhZCBtb3JlIGF0IGh0dHA6Ly9mYi5tZS91c2UtY2hlY2stcHJvcC10eXBlcydcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgLy8gT2xkIGJlaGF2aW9yIGZvciBwZW9wbGUgdXNpbmcgUmVhY3QuUHJvcFR5cGVzXG4gICAgICAgICAgdmFyIGNhY2hlS2V5ID0gY29tcG9uZW50TmFtZSArICc6JyArIHByb3BOYW1lO1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICFtYW51YWxQcm9wVHlwZUNhbGxDYWNoZVtjYWNoZUtleV0gJiZcbiAgICAgICAgICAgIC8vIEF2b2lkIHNwYW1taW5nIHRoZSBjb25zb2xlIGJlY2F1c2UgdGhleSBhcmUgb2Z0ZW4gbm90IGFjdGlvbmFibGUgZXhjZXB0IGZvciBsaWIgYXV0aG9yc1xuICAgICAgICAgICAgbWFudWFsUHJvcFR5cGVXYXJuaW5nQ291bnQgPCAzXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB3YXJuaW5nKFxuICAgICAgICAgICAgICBmYWxzZSxcbiAgICAgICAgICAgICAgJ1lvdSBhcmUgbWFudWFsbHkgY2FsbGluZyBhIFJlYWN0LlByb3BUeXBlcyB2YWxpZGF0aW9uICcgK1xuICAgICAgICAgICAgICAnZnVuY3Rpb24gZm9yIHRoZSBgJXNgIHByb3Agb24gYCVzYC4gVGhpcyBpcyBkZXByZWNhdGVkICcgK1xuICAgICAgICAgICAgICAnYW5kIHdpbGwgdGhyb3cgaW4gdGhlIHN0YW5kYWxvbmUgYHByb3AtdHlwZXNgIHBhY2thZ2UuICcgK1xuICAgICAgICAgICAgICAnWW91IG1heSBiZSBzZWVpbmcgdGhpcyB3YXJuaW5nIGR1ZSB0byBhIHRoaXJkLXBhcnR5IFByb3BUeXBlcyAnICtcbiAgICAgICAgICAgICAgJ2xpYnJhcnkuIFNlZSBodHRwczovL2ZiLm1lL3JlYWN0LXdhcm5pbmctZG9udC1jYWxsLXByb3B0eXBlcyAnICsgJ2ZvciBkZXRhaWxzLicsXG4gICAgICAgICAgICAgIHByb3BGdWxsTmFtZSxcbiAgICAgICAgICAgICAgY29tcG9uZW50TmFtZVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIG1hbnVhbFByb3BUeXBlQ2FsbENhY2hlW2NhY2hlS2V5XSA9IHRydWU7XG4gICAgICAgICAgICBtYW51YWxQcm9wVHlwZVdhcm5pbmdDb3VudCsrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHByb3BzW3Byb3BOYW1lXSA9PSBudWxsKSB7XG4gICAgICAgIGlmIChpc1JlcXVpcmVkKSB7XG4gICAgICAgICAgaWYgKHByb3BzW3Byb3BOYW1lXSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9wVHlwZUVycm9yKCdUaGUgJyArIGxvY2F0aW9uICsgJyBgJyArIHByb3BGdWxsTmFtZSArICdgIGlzIG1hcmtlZCBhcyByZXF1aXJlZCAnICsgKCdpbiBgJyArIGNvbXBvbmVudE5hbWUgKyAnYCwgYnV0IGl0cyB2YWx1ZSBpcyBgbnVsbGAuJykpO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gbmV3IFByb3BUeXBlRXJyb3IoJ1RoZSAnICsgbG9jYXRpb24gKyAnIGAnICsgcHJvcEZ1bGxOYW1lICsgJ2AgaXMgbWFya2VkIGFzIHJlcXVpcmVkIGluICcgKyAoJ2AnICsgY29tcG9uZW50TmFtZSArICdgLCBidXQgaXRzIHZhbHVlIGlzIGB1bmRlZmluZWRgLicpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB2YWxpZGF0ZShwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhciBjaGFpbmVkQ2hlY2tUeXBlID0gY2hlY2tUeXBlLmJpbmQobnVsbCwgZmFsc2UpO1xuICAgIGNoYWluZWRDaGVja1R5cGUuaXNSZXF1aXJlZCA9IGNoZWNrVHlwZS5iaW5kKG51bGwsIHRydWUpO1xuXG4gICAgcmV0dXJuIGNoYWluZWRDaGVja1R5cGU7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVQcmltaXRpdmVUeXBlQ2hlY2tlcihleHBlY3RlZFR5cGUpIHtcbiAgICBmdW5jdGlvbiB2YWxpZGF0ZShwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUsIHNlY3JldCkge1xuICAgICAgdmFyIHByb3BWYWx1ZSA9IHByb3BzW3Byb3BOYW1lXTtcbiAgICAgIHZhciBwcm9wVHlwZSA9IGdldFByb3BUeXBlKHByb3BWYWx1ZSk7XG4gICAgICBpZiAocHJvcFR5cGUgIT09IGV4cGVjdGVkVHlwZSkge1xuICAgICAgICAvLyBgcHJvcFZhbHVlYCBiZWluZyBpbnN0YW5jZSBvZiwgc2F5LCBkYXRlL3JlZ2V4cCwgcGFzcyB0aGUgJ29iamVjdCdcbiAgICAgICAgLy8gY2hlY2ssIGJ1dCB3ZSBjYW4gb2ZmZXIgYSBtb3JlIHByZWNpc2UgZXJyb3IgbWVzc2FnZSBoZXJlIHJhdGhlciB0aGFuXG4gICAgICAgIC8vICdvZiB0eXBlIGBvYmplY3RgJy5cbiAgICAgICAgdmFyIHByZWNpc2VUeXBlID0gZ2V0UHJlY2lzZVR5cGUocHJvcFZhbHVlKTtcblxuICAgICAgICByZXR1cm4gbmV3IFByb3BUeXBlRXJyb3IoJ0ludmFsaWQgJyArIGxvY2F0aW9uICsgJyBgJyArIHByb3BGdWxsTmFtZSArICdgIG9mIHR5cGUgJyArICgnYCcgKyBwcmVjaXNlVHlwZSArICdgIHN1cHBsaWVkIHRvIGAnICsgY29tcG9uZW50TmFtZSArICdgLCBleHBlY3RlZCAnKSArICgnYCcgKyBleHBlY3RlZFR5cGUgKyAnYC4nKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUNoYWluYWJsZVR5cGVDaGVja2VyKHZhbGlkYXRlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUFueVR5cGVDaGVja2VyKCkge1xuICAgIHJldHVybiBjcmVhdGVDaGFpbmFibGVUeXBlQ2hlY2tlcihlbXB0eUZ1bmN0aW9uLnRoYXRSZXR1cm5zTnVsbCk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVBcnJheU9mVHlwZUNoZWNrZXIodHlwZUNoZWNrZXIpIHtcbiAgICBmdW5jdGlvbiB2YWxpZGF0ZShwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUpIHtcbiAgICAgIGlmICh0eXBlb2YgdHlwZUNoZWNrZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wVHlwZUVycm9yKCdQcm9wZXJ0eSBgJyArIHByb3BGdWxsTmFtZSArICdgIG9mIGNvbXBvbmVudCBgJyArIGNvbXBvbmVudE5hbWUgKyAnYCBoYXMgaW52YWxpZCBQcm9wVHlwZSBub3RhdGlvbiBpbnNpZGUgYXJyYXlPZi4nKTtcbiAgICAgIH1cbiAgICAgIHZhciBwcm9wVmFsdWUgPSBwcm9wc1twcm9wTmFtZV07XG4gICAgICBpZiAoIUFycmF5LmlzQXJyYXkocHJvcFZhbHVlKSkge1xuICAgICAgICB2YXIgcHJvcFR5cGUgPSBnZXRQcm9wVHlwZShwcm9wVmFsdWUpO1xuICAgICAgICByZXR1cm4gbmV3IFByb3BUeXBlRXJyb3IoJ0ludmFsaWQgJyArIGxvY2F0aW9uICsgJyBgJyArIHByb3BGdWxsTmFtZSArICdgIG9mIHR5cGUgJyArICgnYCcgKyBwcm9wVHlwZSArICdgIHN1cHBsaWVkIHRvIGAnICsgY29tcG9uZW50TmFtZSArICdgLCBleHBlY3RlZCBhbiBhcnJheS4nKSk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHByb3BWYWx1ZS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZXJyb3IgPSB0eXBlQ2hlY2tlcihwcm9wVmFsdWUsIGksIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUgKyAnWycgKyBpICsgJ10nLCBSZWFjdFByb3BUeXBlc1NlY3JldCk7XG4gICAgICAgIGlmIChlcnJvciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgICAgcmV0dXJuIGVycm9yO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUNoYWluYWJsZVR5cGVDaGVja2VyKHZhbGlkYXRlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnRUeXBlQ2hlY2tlcigpIHtcbiAgICBmdW5jdGlvbiB2YWxpZGF0ZShwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUpIHtcbiAgICAgIHZhciBwcm9wVmFsdWUgPSBwcm9wc1twcm9wTmFtZV07XG4gICAgICBpZiAoIWlzVmFsaWRFbGVtZW50KHByb3BWYWx1ZSkpIHtcbiAgICAgICAgdmFyIHByb3BUeXBlID0gZ2V0UHJvcFR5cGUocHJvcFZhbHVlKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9wVHlwZUVycm9yKCdJbnZhbGlkICcgKyBsb2NhdGlvbiArICcgYCcgKyBwcm9wRnVsbE5hbWUgKyAnYCBvZiB0eXBlICcgKyAoJ2AnICsgcHJvcFR5cGUgKyAnYCBzdXBwbGllZCB0byBgJyArIGNvbXBvbmVudE5hbWUgKyAnYCwgZXhwZWN0ZWQgYSBzaW5nbGUgUmVhY3RFbGVtZW50LicpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlQ2hhaW5hYmxlVHlwZUNoZWNrZXIodmFsaWRhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlSW5zdGFuY2VUeXBlQ2hlY2tlcihleHBlY3RlZENsYXNzKSB7XG4gICAgZnVuY3Rpb24gdmFsaWRhdGUocHJvcHMsIHByb3BOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgcHJvcEZ1bGxOYW1lKSB7XG4gICAgICBpZiAoIShwcm9wc1twcm9wTmFtZV0gaW5zdGFuY2VvZiBleHBlY3RlZENsYXNzKSkge1xuICAgICAgICB2YXIgZXhwZWN0ZWRDbGFzc05hbWUgPSBleHBlY3RlZENsYXNzLm5hbWUgfHwgQU5PTllNT1VTO1xuICAgICAgICB2YXIgYWN0dWFsQ2xhc3NOYW1lID0gZ2V0Q2xhc3NOYW1lKHByb3BzW3Byb3BOYW1lXSk7XG4gICAgICAgIHJldHVybiBuZXcgUHJvcFR5cGVFcnJvcignSW52YWxpZCAnICsgbG9jYXRpb24gKyAnIGAnICsgcHJvcEZ1bGxOYW1lICsgJ2Agb2YgdHlwZSAnICsgKCdgJyArIGFjdHVhbENsYXNzTmFtZSArICdgIHN1cHBsaWVkIHRvIGAnICsgY29tcG9uZW50TmFtZSArICdgLCBleHBlY3RlZCAnKSArICgnaW5zdGFuY2Ugb2YgYCcgKyBleHBlY3RlZENsYXNzTmFtZSArICdgLicpKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlQ2hhaW5hYmxlVHlwZUNoZWNrZXIodmFsaWRhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlRW51bVR5cGVDaGVja2VyKGV4cGVjdGVkVmFsdWVzKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGV4cGVjdGVkVmFsdWVzKSkge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyA/IHdhcm5pbmcoZmFsc2UsICdJbnZhbGlkIGFyZ3VtZW50IHN1cHBsaWVkIHRvIG9uZU9mLCBleHBlY3RlZCBhbiBpbnN0YW5jZSBvZiBhcnJheS4nKSA6IHZvaWQgMDtcbiAgICAgIHJldHVybiBlbXB0eUZ1bmN0aW9uLnRoYXRSZXR1cm5zTnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2YWxpZGF0ZShwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUpIHtcbiAgICAgIHZhciBwcm9wVmFsdWUgPSBwcm9wc1twcm9wTmFtZV07XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGV4cGVjdGVkVmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpcyhwcm9wVmFsdWUsIGV4cGVjdGVkVmFsdWVzW2ldKSkge1xuICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciB2YWx1ZXNTdHJpbmcgPSBKU09OLnN0cmluZ2lmeShleHBlY3RlZFZhbHVlcyk7XG4gICAgICByZXR1cm4gbmV3IFByb3BUeXBlRXJyb3IoJ0ludmFsaWQgJyArIGxvY2F0aW9uICsgJyBgJyArIHByb3BGdWxsTmFtZSArICdgIG9mIHZhbHVlIGAnICsgcHJvcFZhbHVlICsgJ2AgJyArICgnc3VwcGxpZWQgdG8gYCcgKyBjb21wb25lbnROYW1lICsgJ2AsIGV4cGVjdGVkIG9uZSBvZiAnICsgdmFsdWVzU3RyaW5nICsgJy4nKSk7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVDaGFpbmFibGVUeXBlQ2hlY2tlcih2YWxpZGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVPYmplY3RPZlR5cGVDaGVja2VyKHR5cGVDaGVja2VyKSB7XG4gICAgZnVuY3Rpb24gdmFsaWRhdGUocHJvcHMsIHByb3BOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgcHJvcEZ1bGxOYW1lKSB7XG4gICAgICBpZiAodHlwZW9mIHR5cGVDaGVja2VyICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvcFR5cGVFcnJvcignUHJvcGVydHkgYCcgKyBwcm9wRnVsbE5hbWUgKyAnYCBvZiBjb21wb25lbnQgYCcgKyBjb21wb25lbnROYW1lICsgJ2AgaGFzIGludmFsaWQgUHJvcFR5cGUgbm90YXRpb24gaW5zaWRlIG9iamVjdE9mLicpO1xuICAgICAgfVxuICAgICAgdmFyIHByb3BWYWx1ZSA9IHByb3BzW3Byb3BOYW1lXTtcbiAgICAgIHZhciBwcm9wVHlwZSA9IGdldFByb3BUeXBlKHByb3BWYWx1ZSk7XG4gICAgICBpZiAocHJvcFR5cGUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvcFR5cGVFcnJvcignSW52YWxpZCAnICsgbG9jYXRpb24gKyAnIGAnICsgcHJvcEZ1bGxOYW1lICsgJ2Agb2YgdHlwZSAnICsgKCdgJyArIHByb3BUeXBlICsgJ2Agc3VwcGxpZWQgdG8gYCcgKyBjb21wb25lbnROYW1lICsgJ2AsIGV4cGVjdGVkIGFuIG9iamVjdC4nKSk7XG4gICAgICB9XG4gICAgICBmb3IgKHZhciBrZXkgaW4gcHJvcFZhbHVlKSB7XG4gICAgICAgIGlmIChwcm9wVmFsdWUuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIHZhciBlcnJvciA9IHR5cGVDaGVja2VyKHByb3BWYWx1ZSwga2V5LCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgcHJvcEZ1bGxOYW1lICsgJy4nICsga2V5LCBSZWFjdFByb3BUeXBlc1NlY3JldCk7XG4gICAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICByZXR1cm4gY3JlYXRlQ2hhaW5hYmxlVHlwZUNoZWNrZXIodmFsaWRhdGUpO1xuICB9XG5cbiAgZnVuY3Rpb24gY3JlYXRlVW5pb25UeXBlQ2hlY2tlcihhcnJheU9mVHlwZUNoZWNrZXJzKSB7XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGFycmF5T2ZUeXBlQ2hlY2tlcnMpKSB7XG4gICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nID8gd2FybmluZyhmYWxzZSwgJ0ludmFsaWQgYXJndW1lbnQgc3VwcGxpZWQgdG8gb25lT2ZUeXBlLCBleHBlY3RlZCBhbiBpbnN0YW5jZSBvZiBhcnJheS4nKSA6IHZvaWQgMDtcbiAgICAgIHJldHVybiBlbXB0eUZ1bmN0aW9uLnRoYXRSZXR1cm5zTnVsbDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiB2YWxpZGF0ZShwcm9wcywgcHJvcE5hbWUsIGNvbXBvbmVudE5hbWUsIGxvY2F0aW9uLCBwcm9wRnVsbE5hbWUpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyYXlPZlR5cGVDaGVja2Vycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY2hlY2tlciA9IGFycmF5T2ZUeXBlQ2hlY2tlcnNbaV07XG4gICAgICAgIGlmIChjaGVja2VyKHByb3BzLCBwcm9wTmFtZSwgY29tcG9uZW50TmFtZSwgbG9jYXRpb24sIHByb3BGdWxsTmFtZSwgUmVhY3RQcm9wVHlwZXNTZWNyZXQpID09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gbmV3IFByb3BUeXBlRXJyb3IoJ0ludmFsaWQgJyArIGxvY2F0aW9uICsgJyBgJyArIHByb3BGdWxsTmFtZSArICdgIHN1cHBsaWVkIHRvICcgKyAoJ2AnICsgY29tcG9uZW50TmFtZSArICdgLicpKTtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUNoYWluYWJsZVR5cGVDaGVja2VyKHZhbGlkYXRlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZU5vZGVDaGVja2VyKCkge1xuICAgIGZ1bmN0aW9uIHZhbGlkYXRlKHByb3BzLCBwcm9wTmFtZSwgY29tcG9uZW50TmFtZSwgbG9jYXRpb24sIHByb3BGdWxsTmFtZSkge1xuICAgICAgaWYgKCFpc05vZGUocHJvcHNbcHJvcE5hbWVdKSkge1xuICAgICAgICByZXR1cm4gbmV3IFByb3BUeXBlRXJyb3IoJ0ludmFsaWQgJyArIGxvY2F0aW9uICsgJyBgJyArIHByb3BGdWxsTmFtZSArICdgIHN1cHBsaWVkIHRvICcgKyAoJ2AnICsgY29tcG9uZW50TmFtZSArICdgLCBleHBlY3RlZCBhIFJlYWN0Tm9kZS4nKSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgcmV0dXJuIGNyZWF0ZUNoYWluYWJsZVR5cGVDaGVja2VyKHZhbGlkYXRlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZVNoYXBlVHlwZUNoZWNrZXIoc2hhcGVUeXBlcykge1xuICAgIGZ1bmN0aW9uIHZhbGlkYXRlKHByb3BzLCBwcm9wTmFtZSwgY29tcG9uZW50TmFtZSwgbG9jYXRpb24sIHByb3BGdWxsTmFtZSkge1xuICAgICAgdmFyIHByb3BWYWx1ZSA9IHByb3BzW3Byb3BOYW1lXTtcbiAgICAgIHZhciBwcm9wVHlwZSA9IGdldFByb3BUeXBlKHByb3BWYWx1ZSk7XG4gICAgICBpZiAocHJvcFR5cGUgIT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvcFR5cGVFcnJvcignSW52YWxpZCAnICsgbG9jYXRpb24gKyAnIGAnICsgcHJvcEZ1bGxOYW1lICsgJ2Agb2YgdHlwZSBgJyArIHByb3BUeXBlICsgJ2AgJyArICgnc3VwcGxpZWQgdG8gYCcgKyBjb21wb25lbnROYW1lICsgJ2AsIGV4cGVjdGVkIGBvYmplY3RgLicpKTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGtleSBpbiBzaGFwZVR5cGVzKSB7XG4gICAgICAgIHZhciBjaGVja2VyID0gc2hhcGVUeXBlc1trZXldO1xuICAgICAgICBpZiAoIWNoZWNrZXIpIHtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZXJyb3IgPSBjaGVja2VyKHByb3BWYWx1ZSwga2V5LCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgcHJvcEZ1bGxOYW1lICsgJy4nICsga2V5LCBSZWFjdFByb3BUeXBlc1NlY3JldCk7XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgIHJldHVybiBlcnJvcjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBjcmVhdGVDaGFpbmFibGVUeXBlQ2hlY2tlcih2YWxpZGF0ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBpc05vZGUocHJvcFZhbHVlKSB7XG4gICAgc3dpdGNoICh0eXBlb2YgcHJvcFZhbHVlKSB7XG4gICAgICBjYXNlICdudW1iZXInOlxuICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgIGNhc2UgJ3VuZGVmaW5lZCc6XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgIHJldHVybiAhcHJvcFZhbHVlO1xuICAgICAgY2FzZSAnb2JqZWN0JzpcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocHJvcFZhbHVlKSkge1xuICAgICAgICAgIHJldHVybiBwcm9wVmFsdWUuZXZlcnkoaXNOb2RlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJvcFZhbHVlID09PSBudWxsIHx8IGlzVmFsaWRFbGVtZW50KHByb3BWYWx1ZSkpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpdGVyYXRvckZuID0gZ2V0SXRlcmF0b3JGbihwcm9wVmFsdWUpO1xuICAgICAgICBpZiAoaXRlcmF0b3JGbikge1xuICAgICAgICAgIHZhciBpdGVyYXRvciA9IGl0ZXJhdG9yRm4uY2FsbChwcm9wVmFsdWUpO1xuICAgICAgICAgIHZhciBzdGVwO1xuICAgICAgICAgIGlmIChpdGVyYXRvckZuICE9PSBwcm9wVmFsdWUuZW50cmllcykge1xuICAgICAgICAgICAgd2hpbGUgKCEoc3RlcCA9IGl0ZXJhdG9yLm5leHQoKSkuZG9uZSkge1xuICAgICAgICAgICAgICBpZiAoIWlzTm9kZShzdGVwLnZhbHVlKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJdGVyYXRvciB3aWxsIHByb3ZpZGUgZW50cnkgW2ssdl0gdHVwbGVzIHJhdGhlciB0aGFuIHZhbHVlcy5cbiAgICAgICAgICAgIHdoaWxlICghKHN0ZXAgPSBpdGVyYXRvci5uZXh0KCkpLmRvbmUpIHtcbiAgICAgICAgICAgICAgdmFyIGVudHJ5ID0gc3RlcC52YWx1ZTtcbiAgICAgICAgICAgICAgaWYgKGVudHJ5KSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpc05vZGUoZW50cnlbMV0pKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGlzU3ltYm9sKHByb3BUeXBlLCBwcm9wVmFsdWUpIHtcbiAgICAvLyBOYXRpdmUgU3ltYm9sLlxuICAgIGlmIChwcm9wVHlwZSA9PT0gJ3N5bWJvbCcpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIDE5LjQuMy41IFN5bWJvbC5wcm90b3R5cGVbQEB0b1N0cmluZ1RhZ10gPT09ICdTeW1ib2wnXG4gICAgaWYgKHByb3BWYWx1ZVsnQEB0b1N0cmluZ1RhZyddID09PSAnU3ltYm9sJykge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gRmFsbGJhY2sgZm9yIG5vbi1zcGVjIGNvbXBsaWFudCBTeW1ib2xzIHdoaWNoIGFyZSBwb2x5ZmlsbGVkLlxuICAgIGlmICh0eXBlb2YgU3ltYm9sID09PSAnZnVuY3Rpb24nICYmIHByb3BWYWx1ZSBpbnN0YW5jZW9mIFN5bWJvbCkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgLy8gRXF1aXZhbGVudCBvZiBgdHlwZW9mYCBidXQgd2l0aCBzcGVjaWFsIGhhbmRsaW5nIGZvciBhcnJheSBhbmQgcmVnZXhwLlxuICBmdW5jdGlvbiBnZXRQcm9wVHlwZShwcm9wVmFsdWUpIHtcbiAgICB2YXIgcHJvcFR5cGUgPSB0eXBlb2YgcHJvcFZhbHVlO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHByb3BWYWx1ZSkpIHtcbiAgICAgIHJldHVybiAnYXJyYXknO1xuICAgIH1cbiAgICBpZiAocHJvcFZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSB7XG4gICAgICAvLyBPbGQgd2Via2l0cyAoYXQgbGVhc3QgdW50aWwgQW5kcm9pZCA0LjApIHJldHVybiAnZnVuY3Rpb24nIHJhdGhlciB0aGFuXG4gICAgICAvLyAnb2JqZWN0JyBmb3IgdHlwZW9mIGEgUmVnRXhwLiBXZSdsbCBub3JtYWxpemUgdGhpcyBoZXJlIHNvIHRoYXQgL2JsYS9cbiAgICAgIC8vIHBhc3NlcyBQcm9wVHlwZXMub2JqZWN0LlxuICAgICAgcmV0dXJuICdvYmplY3QnO1xuICAgIH1cbiAgICBpZiAoaXNTeW1ib2wocHJvcFR5cGUsIHByb3BWYWx1ZSkpIHtcbiAgICAgIHJldHVybiAnc3ltYm9sJztcbiAgICB9XG4gICAgcmV0dXJuIHByb3BUeXBlO1xuICB9XG5cbiAgLy8gVGhpcyBoYW5kbGVzIG1vcmUgdHlwZXMgdGhhbiBgZ2V0UHJvcFR5cGVgLiBPbmx5IHVzZWQgZm9yIGVycm9yIG1lc3NhZ2VzLlxuICAvLyBTZWUgYGNyZWF0ZVByaW1pdGl2ZVR5cGVDaGVja2VyYC5cbiAgZnVuY3Rpb24gZ2V0UHJlY2lzZVR5cGUocHJvcFZhbHVlKSB7XG4gICAgdmFyIHByb3BUeXBlID0gZ2V0UHJvcFR5cGUocHJvcFZhbHVlKTtcbiAgICBpZiAocHJvcFR5cGUgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAocHJvcFZhbHVlIGluc3RhbmNlb2YgRGF0ZSkge1xuICAgICAgICByZXR1cm4gJ2RhdGUnO1xuICAgICAgfSBlbHNlIGlmIChwcm9wVmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApIHtcbiAgICAgICAgcmV0dXJuICdyZWdleHAnO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcHJvcFR5cGU7XG4gIH1cblxuICAvLyBSZXR1cm5zIGNsYXNzIG5hbWUgb2YgdGhlIG9iamVjdCwgaWYgYW55LlxuICBmdW5jdGlvbiBnZXRDbGFzc05hbWUocHJvcFZhbHVlKSB7XG4gICAgaWYgKCFwcm9wVmFsdWUuY29uc3RydWN0b3IgfHwgIXByb3BWYWx1ZS5jb25zdHJ1Y3Rvci5uYW1lKSB7XG4gICAgICByZXR1cm4gQU5PTllNT1VTO1xuICAgIH1cbiAgICByZXR1cm4gcHJvcFZhbHVlLmNvbnN0cnVjdG9yLm5hbWU7XG4gIH1cblxuICBSZWFjdFByb3BUeXBlcy5jaGVja1Byb3BUeXBlcyA9IGNoZWNrUHJvcFR5cGVzO1xuICBSZWFjdFByb3BUeXBlcy5Qcm9wVHlwZXMgPSBSZWFjdFByb3BUeXBlcztcblxuICByZXR1cm4gUmVhY3RQcm9wVHlwZXM7XG59O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vcHJvcC10eXBlcy9mYWN0b3J5V2l0aFR5cGVDaGVja2Vycy5qc1xuICoqIG1vZHVsZSBpZCA9IDRcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIlwidXNlIHN0cmljdFwiO1xuXG4vKipcbiAqIENvcHlyaWdodCAoYykgMjAxMy1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogXG4gKi9cblxuZnVuY3Rpb24gbWFrZUVtcHR5RnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGFyZztcbiAgfTtcbn1cblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGFjY2VwdHMgYW5kIGRpc2NhcmRzIGlucHV0czsgaXQgaGFzIG5vIHNpZGUgZWZmZWN0cy4gVGhpcyBpc1xuICogcHJpbWFyaWx5IHVzZWZ1bCBpZGlvbWF0aWNhbGx5IGZvciBvdmVycmlkYWJsZSBmdW5jdGlvbiBlbmRwb2ludHMgd2hpY2hcbiAqIGFsd2F5cyBuZWVkIHRvIGJlIGNhbGxhYmxlLCBzaW5jZSBKUyBsYWNrcyBhIG51bGwtY2FsbCBpZGlvbSBhbGEgQ29jb2EuXG4gKi9cbnZhciBlbXB0eUZ1bmN0aW9uID0gZnVuY3Rpb24gZW1wdHlGdW5jdGlvbigpIHt9O1xuXG5lbXB0eUZ1bmN0aW9uLnRoYXRSZXR1cm5zID0gbWFrZUVtcHR5RnVuY3Rpb247XG5lbXB0eUZ1bmN0aW9uLnRoYXRSZXR1cm5zRmFsc2UgPSBtYWtlRW1wdHlGdW5jdGlvbihmYWxzZSk7XG5lbXB0eUZ1bmN0aW9uLnRoYXRSZXR1cm5zVHJ1ZSA9IG1ha2VFbXB0eUZ1bmN0aW9uKHRydWUpO1xuZW1wdHlGdW5jdGlvbi50aGF0UmV0dXJuc051bGwgPSBtYWtlRW1wdHlGdW5jdGlvbihudWxsKTtcbmVtcHR5RnVuY3Rpb24udGhhdFJldHVybnNUaGlzID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gdGhpcztcbn07XG5lbXB0eUZ1bmN0aW9uLnRoYXRSZXR1cm5zQXJndW1lbnQgPSBmdW5jdGlvbiAoYXJnKSB7XG4gIHJldHVybiBhcmc7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGVtcHR5RnVuY3Rpb247XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vZmJqcy9saWIvZW1wdHlGdW5jdGlvbi5qc1xuICoqIG1vZHVsZSBpZCA9IDVcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIFVzZSBpbnZhcmlhbnQoKSB0byBhc3NlcnQgc3RhdGUgd2hpY2ggeW91ciBwcm9ncmFtIGFzc3VtZXMgdG8gYmUgdHJ1ZS5cbiAqXG4gKiBQcm92aWRlIHNwcmludGYtc3R5bGUgZm9ybWF0IChvbmx5ICVzIGlzIHN1cHBvcnRlZCkgYW5kIGFyZ3VtZW50c1xuICogdG8gcHJvdmlkZSBpbmZvcm1hdGlvbiBhYm91dCB3aGF0IGJyb2tlIGFuZCB3aGF0IHlvdSB3ZXJlXG4gKiBleHBlY3RpbmcuXG4gKlxuICogVGhlIGludmFyaWFudCBtZXNzYWdlIHdpbGwgYmUgc3RyaXBwZWQgaW4gcHJvZHVjdGlvbiwgYnV0IHRoZSBpbnZhcmlhbnRcbiAqIHdpbGwgcmVtYWluIHRvIGVuc3VyZSBsb2dpYyBkb2VzIG5vdCBkaWZmZXIgaW4gcHJvZHVjdGlvbi5cbiAqL1xuXG52YXIgdmFsaWRhdGVGb3JtYXQgPSBmdW5jdGlvbiB2YWxpZGF0ZUZvcm1hdChmb3JtYXQpIHt9O1xuXG5pZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICB2YWxpZGF0ZUZvcm1hdCA9IGZ1bmN0aW9uIHZhbGlkYXRlRm9ybWF0KGZvcm1hdCkge1xuICAgIGlmIChmb3JtYXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhcmlhbnQgcmVxdWlyZXMgYW4gZXJyb3IgbWVzc2FnZSBhcmd1bWVudCcpO1xuICAgIH1cbiAgfTtcbn1cblxuZnVuY3Rpb24gaW52YXJpYW50KGNvbmRpdGlvbiwgZm9ybWF0LCBhLCBiLCBjLCBkLCBlLCBmKSB7XG4gIHZhbGlkYXRlRm9ybWF0KGZvcm1hdCk7XG5cbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcignTWluaWZpZWQgZXhjZXB0aW9uIG9jY3VycmVkOyB1c2UgdGhlIG5vbi1taW5pZmllZCBkZXYgZW52aXJvbm1lbnQgJyArICdmb3IgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZSBhbmQgYWRkaXRpb25hbCBoZWxwZnVsIHdhcm5pbmdzLicpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYXJncyA9IFthLCBiLCBjLCBkLCBlLCBmXTtcbiAgICAgIHZhciBhcmdJbmRleCA9IDA7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihmb3JtYXQucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gYXJnc1thcmdJbmRleCsrXTtcbiAgICAgIH0pKTtcbiAgICAgIGVycm9yLm5hbWUgPSAnSW52YXJpYW50IFZpb2xhdGlvbic7XG4gICAgfVxuXG4gICAgZXJyb3IuZnJhbWVzVG9Qb3AgPSAxOyAvLyB3ZSBkb24ndCBjYXJlIGFib3V0IGludmFyaWFudCdzIG93biBmcmFtZVxuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW52YXJpYW50O1xuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2ZianMvbGliL2ludmFyaWFudC5qc1xuICoqIG1vZHVsZSBpZCA9IDZcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTQtMjAxNSwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBlbXB0eUZ1bmN0aW9uID0gcmVxdWlyZSgnLi9lbXB0eUZ1bmN0aW9uJyk7XG5cbi8qKlxuICogU2ltaWxhciB0byBpbnZhcmlhbnQgYnV0IG9ubHkgbG9ncyBhIHdhcm5pbmcgaWYgdGhlIGNvbmRpdGlvbiBpcyBub3QgbWV0LlxuICogVGhpcyBjYW4gYmUgdXNlZCB0byBsb2cgaXNzdWVzIGluIGRldmVsb3BtZW50IGVudmlyb25tZW50cyBpbiBjcml0aWNhbFxuICogcGF0aHMuIFJlbW92aW5nIHRoZSBsb2dnaW5nIGNvZGUgZm9yIHByb2R1Y3Rpb24gZW52aXJvbm1lbnRzIHdpbGwga2VlcCB0aGVcbiAqIHNhbWUgbG9naWMgYW5kIGZvbGxvdyB0aGUgc2FtZSBjb2RlIHBhdGhzLlxuICovXG5cbnZhciB3YXJuaW5nID0gZW1wdHlGdW5jdGlvbjtcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcHJpbnRXYXJuaW5nID0gZnVuY3Rpb24gcHJpbnRXYXJuaW5nKGZvcm1hdCkge1xuICAgICAgZm9yICh2YXIgX2xlbiA9IGFyZ3VtZW50cy5sZW5ndGgsIGFyZ3MgPSBBcnJheShfbGVuID4gMSA/IF9sZW4gLSAxIDogMCksIF9rZXkgPSAxOyBfa2V5IDwgX2xlbjsgX2tleSsrKSB7XG4gICAgICAgIGFyZ3NbX2tleSAtIDFdID0gYXJndW1lbnRzW19rZXldO1xuICAgICAgfVxuXG4gICAgICB2YXIgYXJnSW5kZXggPSAwO1xuICAgICAgdmFyIG1lc3NhZ2UgPSAnV2FybmluZzogJyArIGZvcm1hdC5yZXBsYWNlKC8lcy9nLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBhcmdzW2FyZ0luZGV4KytdO1xuICAgICAgfSk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IobWVzc2FnZSk7XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICAvLyAtLS0gV2VsY29tZSB0byBkZWJ1Z2dpbmcgUmVhY3QgLS0tXG4gICAgICAgIC8vIFRoaXMgZXJyb3Igd2FzIHRocm93biBhcyBhIGNvbnZlbmllbmNlIHNvIHRoYXQgeW91IGNhbiB1c2UgdGhpcyBzdGFja1xuICAgICAgICAvLyB0byBmaW5kIHRoZSBjYWxsc2l0ZSB0aGF0IGNhdXNlZCB0aGlzIHdhcm5pbmcgdG8gZmlyZS5cbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgICAgfSBjYXRjaCAoeCkge31cbiAgICB9O1xuXG4gICAgd2FybmluZyA9IGZ1bmN0aW9uIHdhcm5pbmcoY29uZGl0aW9uLCBmb3JtYXQpIHtcbiAgICAgIGlmIChmb3JtYXQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2B3YXJuaW5nKGNvbmRpdGlvbiwgZm9ybWF0LCAuLi5hcmdzKWAgcmVxdWlyZXMgYSB3YXJuaW5nICcgKyAnbWVzc2FnZSBhcmd1bWVudCcpO1xuICAgICAgfVxuXG4gICAgICBpZiAoZm9ybWF0LmluZGV4T2YoJ0ZhaWxlZCBDb21wb3NpdGUgcHJvcFR5cGU6ICcpID09PSAwKSB7XG4gICAgICAgIHJldHVybjsgLy8gSWdub3JlIENvbXBvc2l0ZUNvbXBvbmVudCBwcm9wdHlwZSBjaGVjay5cbiAgICAgIH1cblxuICAgICAgaWYgKCFjb25kaXRpb24pIHtcbiAgICAgICAgZm9yICh2YXIgX2xlbjIgPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gQXJyYXkoX2xlbjIgPiAyID8gX2xlbjIgLSAyIDogMCksIF9rZXkyID0gMjsgX2tleTIgPCBfbGVuMjsgX2tleTIrKykge1xuICAgICAgICAgIGFyZ3NbX2tleTIgLSAyXSA9IGFyZ3VtZW50c1tfa2V5Ml07XG4gICAgICAgIH1cblxuICAgICAgICBwcmludFdhcm5pbmcuYXBwbHkodW5kZWZpbmVkLCBbZm9ybWF0XS5jb25jYXQoYXJncykpO1xuICAgICAgfVxuICAgIH07XG4gIH0pKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gd2FybmluZztcblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9mYmpzL2xpYi93YXJuaW5nLmpzXG4gKiogbW9kdWxlIGlkID0gN1xuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxMy1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3RQcm9wVHlwZXNTZWNyZXQgPSAnU0VDUkVUX0RPX05PVF9QQVNTX1RISVNfT1JfWU9VX1dJTExfQkVfRklSRUQnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0UHJvcFR5cGVzU2VjcmV0O1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vcHJvcC10eXBlcy9saWIvUmVhY3RQcm9wVHlwZXNTZWNyZXQuanNcbiAqKiBtb2R1bGUgaWQgPSA4XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbmlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gIHZhciBpbnZhcmlhbnQgPSByZXF1aXJlKCdmYmpzL2xpYi9pbnZhcmlhbnQnKTtcbiAgdmFyIHdhcm5pbmcgPSByZXF1aXJlKCdmYmpzL2xpYi93YXJuaW5nJyk7XG4gIHZhciBSZWFjdFByb3BUeXBlc1NlY3JldCA9IHJlcXVpcmUoJy4vbGliL1JlYWN0UHJvcFR5cGVzU2VjcmV0Jyk7XG4gIHZhciBsb2dnZWRUeXBlRmFpbHVyZXMgPSB7fTtcbn1cblxuLyoqXG4gKiBBc3NlcnQgdGhhdCB0aGUgdmFsdWVzIG1hdGNoIHdpdGggdGhlIHR5cGUgc3BlY3MuXG4gKiBFcnJvciBtZXNzYWdlcyBhcmUgbWVtb3JpemVkIGFuZCB3aWxsIG9ubHkgYmUgc2hvd24gb25jZS5cbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gdHlwZVNwZWNzIE1hcCBvZiBuYW1lIHRvIGEgUmVhY3RQcm9wVHlwZVxuICogQHBhcmFtIHtvYmplY3R9IHZhbHVlcyBSdW50aW1lIHZhbHVlcyB0aGF0IG5lZWQgdG8gYmUgdHlwZS1jaGVja2VkXG4gKiBAcGFyYW0ge3N0cmluZ30gbG9jYXRpb24gZS5nLiBcInByb3BcIiwgXCJjb250ZXh0XCIsIFwiY2hpbGQgY29udGV4dFwiXG4gKiBAcGFyYW0ge3N0cmluZ30gY29tcG9uZW50TmFtZSBOYW1lIG9mIHRoZSBjb21wb25lbnQgZm9yIGVycm9yIG1lc3NhZ2VzLlxuICogQHBhcmFtIHs/RnVuY3Rpb259IGdldFN0YWNrIFJldHVybnMgdGhlIGNvbXBvbmVudCBzdGFjay5cbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGNoZWNrUHJvcFR5cGVzKHR5cGVTcGVjcywgdmFsdWVzLCBsb2NhdGlvbiwgY29tcG9uZW50TmFtZSwgZ2V0U3RhY2spIHtcbiAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgICBmb3IgKHZhciB0eXBlU3BlY05hbWUgaW4gdHlwZVNwZWNzKSB7XG4gICAgICBpZiAodHlwZVNwZWNzLmhhc093blByb3BlcnR5KHR5cGVTcGVjTmFtZSkpIHtcbiAgICAgICAgdmFyIGVycm9yO1xuICAgICAgICAvLyBQcm9wIHR5cGUgdmFsaWRhdGlvbiBtYXkgdGhyb3cuIEluIGNhc2UgdGhleSBkbywgd2UgZG9uJ3Qgd2FudCB0b1xuICAgICAgICAvLyBmYWlsIHRoZSByZW5kZXIgcGhhc2Ugd2hlcmUgaXQgZGlkbid0IGZhaWwgYmVmb3JlLiBTbyB3ZSBsb2cgaXQuXG4gICAgICAgIC8vIEFmdGVyIHRoZXNlIGhhdmUgYmVlbiBjbGVhbmVkIHVwLCB3ZSdsbCBsZXQgdGhlbSB0aHJvdy5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyBUaGlzIGlzIGludGVudGlvbmFsbHkgYW4gaW52YXJpYW50IHRoYXQgZ2V0cyBjYXVnaHQuIEl0J3MgdGhlIHNhbWVcbiAgICAgICAgICAvLyBiZWhhdmlvciBhcyB3aXRob3V0IHRoaXMgc3RhdGVtZW50IGV4Y2VwdCB3aXRoIGEgYmV0dGVyIG1lc3NhZ2UuXG4gICAgICAgICAgaW52YXJpYW50KHR5cGVvZiB0eXBlU3BlY3NbdHlwZVNwZWNOYW1lXSA9PT0gJ2Z1bmN0aW9uJywgJyVzOiAlcyB0eXBlIGAlc2AgaXMgaW52YWxpZDsgaXQgbXVzdCBiZSBhIGZ1bmN0aW9uLCB1c3VhbGx5IGZyb20gJyArICdSZWFjdC5Qcm9wVHlwZXMuJywgY29tcG9uZW50TmFtZSB8fCAnUmVhY3QgY2xhc3MnLCBsb2NhdGlvbiwgdHlwZVNwZWNOYW1lKTtcbiAgICAgICAgICBlcnJvciA9IHR5cGVTcGVjc1t0eXBlU3BlY05hbWVdKHZhbHVlcywgdHlwZVNwZWNOYW1lLCBjb21wb25lbnROYW1lLCBsb2NhdGlvbiwgbnVsbCwgUmVhY3RQcm9wVHlwZXNTZWNyZXQpO1xuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgIGVycm9yID0gZXg7XG4gICAgICAgIH1cbiAgICAgICAgd2FybmluZyghZXJyb3IgfHwgZXJyb3IgaW5zdGFuY2VvZiBFcnJvciwgJyVzOiB0eXBlIHNwZWNpZmljYXRpb24gb2YgJXMgYCVzYCBpcyBpbnZhbGlkOyB0aGUgdHlwZSBjaGVja2VyICcgKyAnZnVuY3Rpb24gbXVzdCByZXR1cm4gYG51bGxgIG9yIGFuIGBFcnJvcmAgYnV0IHJldHVybmVkIGEgJXMuICcgKyAnWW91IG1heSBoYXZlIGZvcmdvdHRlbiB0byBwYXNzIGFuIGFyZ3VtZW50IHRvIHRoZSB0eXBlIGNoZWNrZXIgJyArICdjcmVhdG9yIChhcnJheU9mLCBpbnN0YW5jZU9mLCBvYmplY3RPZiwgb25lT2YsIG9uZU9mVHlwZSwgYW5kICcgKyAnc2hhcGUgYWxsIHJlcXVpcmUgYW4gYXJndW1lbnQpLicsIGNvbXBvbmVudE5hbWUgfHwgJ1JlYWN0IGNsYXNzJywgbG9jYXRpb24sIHR5cGVTcGVjTmFtZSwgdHlwZW9mIGVycm9yKTtcbiAgICAgICAgaWYgKGVycm9yIGluc3RhbmNlb2YgRXJyb3IgJiYgIShlcnJvci5tZXNzYWdlIGluIGxvZ2dlZFR5cGVGYWlsdXJlcykpIHtcbiAgICAgICAgICAvLyBPbmx5IG1vbml0b3IgdGhpcyBmYWlsdXJlIG9uY2UgYmVjYXVzZSB0aGVyZSB0ZW5kcyB0byBiZSBhIGxvdCBvZiB0aGVcbiAgICAgICAgICAvLyBzYW1lIGVycm9yLlxuICAgICAgICAgIGxvZ2dlZFR5cGVGYWlsdXJlc1tlcnJvci5tZXNzYWdlXSA9IHRydWU7XG5cbiAgICAgICAgICB2YXIgc3RhY2sgPSBnZXRTdGFjayA/IGdldFN0YWNrKCkgOiAnJztcblxuICAgICAgICAgIHdhcm5pbmcoZmFsc2UsICdGYWlsZWQgJXMgdHlwZTogJXMlcycsIGxvY2F0aW9uLCBlcnJvci5tZXNzYWdlLCBzdGFjayAhPSBudWxsID8gc3RhY2sgOiAnJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjaGVja1Byb3BUeXBlcztcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L3Byb3AtdHlwZXMvY2hlY2tQcm9wVHlwZXMuanNcbiAqKiBtb2R1bGUgaWQgPSA5XG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBlbXB0eUZ1bmN0aW9uID0gcmVxdWlyZSgnZmJqcy9saWIvZW1wdHlGdW5jdGlvbicpO1xudmFyIGludmFyaWFudCA9IHJlcXVpcmUoJ2ZianMvbGliL2ludmFyaWFudCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAvLyBJbXBvcnRhbnQhXG4gIC8vIEtlZXAgdGhpcyBsaXN0IGluIHN5bmMgd2l0aCBwcm9kdWN0aW9uIHZlcnNpb24gaW4gYC4vZmFjdG9yeVdpdGhUeXBlQ2hlY2tlcnMuanNgLlxuICBmdW5jdGlvbiBzaGltKCkge1xuICAgIGludmFyaWFudChcbiAgICAgIGZhbHNlLFxuICAgICAgJ0NhbGxpbmcgUHJvcFR5cGVzIHZhbGlkYXRvcnMgZGlyZWN0bHkgaXMgbm90IHN1cHBvcnRlZCBieSB0aGUgYHByb3AtdHlwZXNgIHBhY2thZ2UuICcgK1xuICAgICAgJ1VzZSBQcm9wVHlwZXMuY2hlY2tQcm9wVHlwZXMoKSB0byBjYWxsIHRoZW0uICcgK1xuICAgICAgJ1JlYWQgbW9yZSBhdCBodHRwOi8vZmIubWUvdXNlLWNoZWNrLXByb3AtdHlwZXMnXG4gICAgKTtcbiAgfTtcbiAgc2hpbS5pc1JlcXVpcmVkID0gc2hpbTtcbiAgZnVuY3Rpb24gZ2V0U2hpbSgpIHtcbiAgICByZXR1cm4gc2hpbTtcbiAgfTtcbiAgdmFyIFJlYWN0UHJvcFR5cGVzID0ge1xuICAgIGFycmF5OiBzaGltLFxuICAgIGJvb2w6IHNoaW0sXG4gICAgZnVuYzogc2hpbSxcbiAgICBudW1iZXI6IHNoaW0sXG4gICAgb2JqZWN0OiBzaGltLFxuICAgIHN0cmluZzogc2hpbSxcbiAgICBzeW1ib2w6IHNoaW0sXG5cbiAgICBhbnk6IHNoaW0sXG4gICAgYXJyYXlPZjogZ2V0U2hpbSxcbiAgICBlbGVtZW50OiBzaGltLFxuICAgIGluc3RhbmNlT2Y6IGdldFNoaW0sXG4gICAgbm9kZTogc2hpbSxcbiAgICBvYmplY3RPZjogZ2V0U2hpbSxcbiAgICBvbmVPZjogZ2V0U2hpbSxcbiAgICBvbmVPZlR5cGU6IGdldFNoaW0sXG4gICAgc2hhcGU6IGdldFNoaW1cbiAgfTtcblxuICBSZWFjdFByb3BUeXBlcy5jaGVja1Byb3BUeXBlcyA9IGVtcHR5RnVuY3Rpb247XG4gIFJlYWN0UHJvcFR5cGVzLlByb3BUeXBlcyA9IFJlYWN0UHJvcFR5cGVzO1xuXG4gIHJldHVybiBSZWFjdFByb3BUeXBlcztcbn07XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9wcm9wLXR5cGVzL2ZhY3RvcnlXaXRoVGhyb3dpbmdTaGltcy5qc1xuICoqIG1vZHVsZSBpZCA9IDEwXG4gKiogbW9kdWxlIGNodW5rcyA9IDBcbiAqKi8iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIGZhY3RvcnkgPSByZXF1aXJlKCcuL2ZhY3RvcnknKTtcblxuLy8gSGFjayB0byBncmFiIE5vb3BVcGRhdGVRdWV1ZSBmcm9tIGlzb21vcnBoaWMgUmVhY3RcbnZhciBSZWFjdE5vb3BVcGRhdGVRdWV1ZSA9IG5ldyBSZWFjdC5Db21wb25lbnQoKS51cGRhdGVyO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gIFJlYWN0LkNvbXBvbmVudCxcbiAgUmVhY3QuaXNWYWxpZEVsZW1lbnQsXG4gIFJlYWN0Tm9vcFVwZGF0ZVF1ZXVlXG4pO1xuXG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vY3JlYXRlLXJlYWN0LWNsYXNzL2luZGV4LmpzXG4gKiogbW9kdWxlIGlkID0gMTFcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQ29weXJpZ2h0IDIwMTMtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqL1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfYXNzaWduID0gcmVxdWlyZSgnb2JqZWN0LWFzc2lnbicpO1xuXG52YXIgZW1wdHlPYmplY3QgPSByZXF1aXJlKCdmYmpzL2xpYi9lbXB0eU9iamVjdCcpO1xudmFyIF9pbnZhcmlhbnQgPSByZXF1aXJlKCdmYmpzL2xpYi9pbnZhcmlhbnQnKTtcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgdmFyIHdhcm5pbmcgPSByZXF1aXJlKCdmYmpzL2xpYi93YXJuaW5nJyk7XG59XG5cbnZhciBNSVhJTlNfS0VZID0gJ21peGlucyc7XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0byBhbGxvdyB0aGUgY3JlYXRpb24gb2YgYW5vbnltb3VzIGZ1bmN0aW9ucyB3aGljaCBkbyBub3Rcbi8vIGhhdmUgLm5hbWUgc2V0IHRvIHRoZSBuYW1lIG9mIHRoZSB2YXJpYWJsZSBiZWluZyBhc3NpZ25lZCB0by5cbmZ1bmN0aW9uIGlkZW50aXR5KGZuKSB7XG4gIHJldHVybiBmbjtcbn1cblxudmFyIFJlYWN0UHJvcFR5cGVMb2NhdGlvbk5hbWVzO1xuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgUmVhY3RQcm9wVHlwZUxvY2F0aW9uTmFtZXMgPSB7XG4gICAgcHJvcDogJ3Byb3AnLFxuICAgIGNvbnRleHQ6ICdjb250ZXh0JyxcbiAgICBjaGlsZENvbnRleHQ6ICdjaGlsZCBjb250ZXh0JyxcbiAgfTtcbn0gZWxzZSB7XG4gIFJlYWN0UHJvcFR5cGVMb2NhdGlvbk5hbWVzID0ge307XG59XG5cbmZ1bmN0aW9uIGZhY3RvcnkoUmVhY3RDb21wb25lbnQsIGlzVmFsaWRFbGVtZW50LCBSZWFjdE5vb3BVcGRhdGVRdWV1ZSkge1xuICAvKipcbiAgICogUG9saWNpZXMgdGhhdCBkZXNjcmliZSBtZXRob2RzIGluIGBSZWFjdENsYXNzSW50ZXJmYWNlYC5cbiAgICovXG5cblxuICB2YXIgaW5qZWN0ZWRNaXhpbnMgPSBbXTtcblxuICAvKipcbiAgICogQ29tcG9zaXRlIGNvbXBvbmVudHMgYXJlIGhpZ2hlci1sZXZlbCBjb21wb25lbnRzIHRoYXQgY29tcG9zZSBvdGhlciBjb21wb3NpdGVcbiAgICogb3IgaG9zdCBjb21wb25lbnRzLlxuICAgKlxuICAgKiBUbyBjcmVhdGUgYSBuZXcgdHlwZSBvZiBgUmVhY3RDbGFzc2AsIHBhc3MgYSBzcGVjaWZpY2F0aW9uIG9mXG4gICAqIHlvdXIgbmV3IGNsYXNzIHRvIGBSZWFjdC5jcmVhdGVDbGFzc2AuIFRoZSBvbmx5IHJlcXVpcmVtZW50IG9mIHlvdXIgY2xhc3NcbiAgICogc3BlY2lmaWNhdGlvbiBpcyB0aGF0IHlvdSBpbXBsZW1lbnQgYSBgcmVuZGVyYCBtZXRob2QuXG4gICAqXG4gICAqICAgdmFyIE15Q29tcG9uZW50ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICAgKiAgICAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICogICAgICAgcmV0dXJuIDxkaXY+SGVsbG8gV29ybGQ8L2Rpdj47XG4gICAqICAgICB9XG4gICAqICAgfSk7XG4gICAqXG4gICAqIFRoZSBjbGFzcyBzcGVjaWZpY2F0aW9uIHN1cHBvcnRzIGEgc3BlY2lmaWMgcHJvdG9jb2wgb2YgbWV0aG9kcyB0aGF0IGhhdmVcbiAgICogc3BlY2lhbCBtZWFuaW5nIChlLmcuIGByZW5kZXJgKS4gU2VlIGBSZWFjdENsYXNzSW50ZXJmYWNlYCBmb3JcbiAgICogbW9yZSB0aGUgY29tcHJlaGVuc2l2ZSBwcm90b2NvbC4gQW55IG90aGVyIHByb3BlcnRpZXMgYW5kIG1ldGhvZHMgaW4gdGhlXG4gICAqIGNsYXNzIHNwZWNpZmljYXRpb24gd2lsbCBiZSBhdmFpbGFibGUgb24gdGhlIHByb3RvdHlwZS5cbiAgICpcbiAgICogQGludGVyZmFjZSBSZWFjdENsYXNzSW50ZXJmYWNlXG4gICAqIEBpbnRlcm5hbFxuICAgKi9cbiAgdmFyIFJlYWN0Q2xhc3NJbnRlcmZhY2UgPSB7XG5cbiAgICAvKipcbiAgICAgKiBBbiBhcnJheSBvZiBNaXhpbiBvYmplY3RzIHRvIGluY2x1ZGUgd2hlbiBkZWZpbmluZyB5b3VyIGNvbXBvbmVudC5cbiAgICAgKlxuICAgICAqIEB0eXBlIHthcnJheX1cbiAgICAgKiBAb3B0aW9uYWxcbiAgICAgKi9cbiAgICBtaXhpbnM6ICdERUZJTkVfTUFOWScsXG5cbiAgICAvKipcbiAgICAgKiBBbiBvYmplY3QgY29udGFpbmluZyBwcm9wZXJ0aWVzIGFuZCBtZXRob2RzIHRoYXQgc2hvdWxkIGJlIGRlZmluZWQgb25cbiAgICAgKiB0aGUgY29tcG9uZW50J3MgY29uc3RydWN0b3IgaW5zdGVhZCBvZiBpdHMgcHJvdG90eXBlIChzdGF0aWMgbWV0aG9kcykuXG4gICAgICpcbiAgICAgKiBAdHlwZSB7b2JqZWN0fVxuICAgICAqIEBvcHRpb25hbFxuICAgICAqL1xuICAgIHN0YXRpY3M6ICdERUZJTkVfTUFOWScsXG5cbiAgICAvKipcbiAgICAgKiBEZWZpbml0aW9uIG9mIHByb3AgdHlwZXMgZm9yIHRoaXMgY29tcG9uZW50LlxuICAgICAqXG4gICAgICogQHR5cGUge29iamVjdH1cbiAgICAgKiBAb3B0aW9uYWxcbiAgICAgKi9cbiAgICBwcm9wVHlwZXM6ICdERUZJTkVfTUFOWScsXG5cbiAgICAvKipcbiAgICAgKiBEZWZpbml0aW9uIG9mIGNvbnRleHQgdHlwZXMgZm9yIHRoaXMgY29tcG9uZW50LlxuICAgICAqXG4gICAgICogQHR5cGUge29iamVjdH1cbiAgICAgKiBAb3B0aW9uYWxcbiAgICAgKi9cbiAgICBjb250ZXh0VHlwZXM6ICdERUZJTkVfTUFOWScsXG5cbiAgICAvKipcbiAgICAgKiBEZWZpbml0aW9uIG9mIGNvbnRleHQgdHlwZXMgdGhpcyBjb21wb25lbnQgc2V0cyBmb3IgaXRzIGNoaWxkcmVuLlxuICAgICAqXG4gICAgICogQHR5cGUge29iamVjdH1cbiAgICAgKiBAb3B0aW9uYWxcbiAgICAgKi9cbiAgICBjaGlsZENvbnRleHRUeXBlczogJ0RFRklORV9NQU5ZJyxcblxuICAgIC8vID09PT0gRGVmaW5pdGlvbiBtZXRob2RzID09PT1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgd2hlbiB0aGUgY29tcG9uZW50IGlzIG1vdW50ZWQuIFZhbHVlcyBpbiB0aGUgbWFwcGluZyB3aWxsIGJlIHNldCBvblxuICAgICAqIGB0aGlzLnByb3BzYCBpZiB0aGF0IHByb3AgaXMgbm90IHNwZWNpZmllZCAoaS5lLiB1c2luZyBhbiBgaW5gIGNoZWNrKS5cbiAgICAgKlxuICAgICAqIFRoaXMgbWV0aG9kIGlzIGludm9rZWQgYmVmb3JlIGBnZXRJbml0aWFsU3RhdGVgIGFuZCB0aGVyZWZvcmUgY2Fubm90IHJlbHlcbiAgICAgKiBvbiBgdGhpcy5zdGF0ZWAgb3IgdXNlIGB0aGlzLnNldFN0YXRlYC5cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge29iamVjdH1cbiAgICAgKiBAb3B0aW9uYWxcbiAgICAgKi9cbiAgICBnZXREZWZhdWx0UHJvcHM6ICdERUZJTkVfTUFOWV9NRVJHRUQnLFxuXG4gICAgLyoqXG4gICAgICogSW52b2tlZCBvbmNlIGJlZm9yZSB0aGUgY29tcG9uZW50IGlzIG1vdW50ZWQuIFRoZSByZXR1cm4gdmFsdWUgd2lsbCBiZSB1c2VkXG4gICAgICogYXMgdGhlIGluaXRpYWwgdmFsdWUgb2YgYHRoaXMuc3RhdGVgLlxuICAgICAqXG4gICAgICogICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAqICAgICByZXR1cm4ge1xuICAgICAqICAgICAgIGlzT246IGZhbHNlLFxuICAgICAqICAgICAgIGZvb0JhejogbmV3IEJhekZvbygpXG4gICAgICogICAgIH1cbiAgICAgKiAgIH1cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge29iamVjdH1cbiAgICAgKiBAb3B0aW9uYWxcbiAgICAgKi9cbiAgICBnZXRJbml0aWFsU3RhdGU6ICdERUZJTkVfTUFOWV9NRVJHRUQnLFxuXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7b2JqZWN0fVxuICAgICAqIEBvcHRpb25hbFxuICAgICAqL1xuICAgIGdldENoaWxkQ29udGV4dDogJ0RFRklORV9NQU5ZX01FUkdFRCcsXG5cbiAgICAvKipcbiAgICAgKiBVc2VzIHByb3BzIGZyb20gYHRoaXMucHJvcHNgIGFuZCBzdGF0ZSBmcm9tIGB0aGlzLnN0YXRlYCB0byByZW5kZXIgdGhlXG4gICAgICogc3RydWN0dXJlIG9mIHRoZSBjb21wb25lbnQuXG4gICAgICpcbiAgICAgKiBObyBndWFyYW50ZWVzIGFyZSBtYWRlIGFib3V0IHdoZW4gb3IgaG93IG9mdGVuIHRoaXMgbWV0aG9kIGlzIGludm9rZWQsIHNvXG4gICAgICogaXQgbXVzdCBub3QgaGF2ZSBzaWRlIGVmZmVjdHMuXG4gICAgICpcbiAgICAgKiAgIHJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICogICAgIHZhciBuYW1lID0gdGhpcy5wcm9wcy5uYW1lO1xuICAgICAqICAgICByZXR1cm4gPGRpdj5IZWxsbywge25hbWV9ITwvZGl2PjtcbiAgICAgKiAgIH1cbiAgICAgKlxuICAgICAqIEByZXR1cm4ge1JlYWN0Q29tcG9uZW50fVxuICAgICAqIEBub3NpZGVlZmZlY3RzXG4gICAgICogQHJlcXVpcmVkXG4gICAgICovXG4gICAgcmVuZGVyOiAnREVGSU5FX09OQ0UnLFxuXG4gICAgLy8gPT09PSBEZWxlZ2F0ZSBtZXRob2RzID09PT1cblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgd2hlbiB0aGUgY29tcG9uZW50IGlzIGluaXRpYWxseSBjcmVhdGVkIGFuZCBhYm91dCB0byBiZSBtb3VudGVkLlxuICAgICAqIFRoaXMgbWF5IGhhdmUgc2lkZSBlZmZlY3RzLCBidXQgYW55IGV4dGVybmFsIHN1YnNjcmlwdGlvbnMgb3IgZGF0YSBjcmVhdGVkXG4gICAgICogYnkgdGhpcyBtZXRob2QgbXVzdCBiZSBjbGVhbmVkIHVwIGluIGBjb21wb25lbnRXaWxsVW5tb3VudGAuXG4gICAgICpcbiAgICAgKiBAb3B0aW9uYWxcbiAgICAgKi9cbiAgICBjb21wb25lbnRXaWxsTW91bnQ6ICdERUZJTkVfTUFOWScsXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIHdoZW4gdGhlIGNvbXBvbmVudCBoYXMgYmVlbiBtb3VudGVkIGFuZCBoYXMgYSBET00gcmVwcmVzZW50YXRpb24uXG4gICAgICogSG93ZXZlciwgdGhlcmUgaXMgbm8gZ3VhcmFudGVlIHRoYXQgdGhlIERPTSBub2RlIGlzIGluIHRoZSBkb2N1bWVudC5cbiAgICAgKlxuICAgICAqIFVzZSB0aGlzIGFzIGFuIG9wcG9ydHVuaXR5IHRvIG9wZXJhdGUgb24gdGhlIERPTSB3aGVuIHRoZSBjb21wb25lbnQgaGFzXG4gICAgICogYmVlbiBtb3VudGVkIChpbml0aWFsaXplZCBhbmQgcmVuZGVyZWQpIGZvciB0aGUgZmlyc3QgdGltZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7RE9NRWxlbWVudH0gcm9vdE5vZGUgRE9NIGVsZW1lbnQgcmVwcmVzZW50aW5nIHRoZSBjb21wb25lbnQuXG4gICAgICogQG9wdGlvbmFsXG4gICAgICovXG4gICAgY29tcG9uZW50RGlkTW91bnQ6ICdERUZJTkVfTUFOWScsXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIGJlZm9yZSB0aGUgY29tcG9uZW50IHJlY2VpdmVzIG5ldyBwcm9wcy5cbiAgICAgKlxuICAgICAqIFVzZSB0aGlzIGFzIGFuIG9wcG9ydHVuaXR5IHRvIHJlYWN0IHRvIGEgcHJvcCB0cmFuc2l0aW9uIGJ5IHVwZGF0aW5nIHRoZVxuICAgICAqIHN0YXRlIHVzaW5nIGB0aGlzLnNldFN0YXRlYC4gQ3VycmVudCBwcm9wcyBhcmUgYWNjZXNzZWQgdmlhIGB0aGlzLnByb3BzYC5cbiAgICAgKlxuICAgICAqICAgY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wczogZnVuY3Rpb24obmV4dFByb3BzLCBuZXh0Q29udGV4dCkge1xuICAgICAqICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgKiAgICAgICBsaWtlc0luY3JlYXNpbmc6IG5leHRQcm9wcy5saWtlQ291bnQgPiB0aGlzLnByb3BzLmxpa2VDb3VudFxuICAgICAqICAgICB9KTtcbiAgICAgKiAgIH1cbiAgICAgKlxuICAgICAqIE5PVEU6IFRoZXJlIGlzIG5vIGVxdWl2YWxlbnQgYGNvbXBvbmVudFdpbGxSZWNlaXZlU3RhdGVgLiBBbiBpbmNvbWluZyBwcm9wXG4gICAgICogdHJhbnNpdGlvbiBtYXkgY2F1c2UgYSBzdGF0ZSBjaGFuZ2UsIGJ1dCB0aGUgb3Bwb3NpdGUgaXMgbm90IHRydWUuIElmIHlvdVxuICAgICAqIG5lZWQgaXQsIHlvdSBhcmUgcHJvYmFibHkgbG9va2luZyBmb3IgYGNvbXBvbmVudFdpbGxVcGRhdGVgLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IG5leHRQcm9wc1xuICAgICAqIEBvcHRpb25hbFxuICAgICAqL1xuICAgIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6ICdERUZJTkVfTUFOWScsXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIHdoaWxlIGRlY2lkaW5nIGlmIHRoZSBjb21wb25lbnQgc2hvdWxkIGJlIHVwZGF0ZWQgYXMgYSByZXN1bHQgb2ZcbiAgICAgKiByZWNlaXZpbmcgbmV3IHByb3BzLCBzdGF0ZSBhbmQvb3IgY29udGV4dC5cbiAgICAgKlxuICAgICAqIFVzZSB0aGlzIGFzIGFuIG9wcG9ydHVuaXR5IHRvIGByZXR1cm4gZmFsc2VgIHdoZW4geW91J3JlIGNlcnRhaW4gdGhhdCB0aGVcbiAgICAgKiB0cmFuc2l0aW9uIHRvIHRoZSBuZXcgcHJvcHMvc3RhdGUvY29udGV4dCB3aWxsIG5vdCByZXF1aXJlIGEgY29tcG9uZW50XG4gICAgICogdXBkYXRlLlxuICAgICAqXG4gICAgICogICBzaG91bGRDb21wb25lbnRVcGRhdGU6IGZ1bmN0aW9uKG5leHRQcm9wcywgbmV4dFN0YXRlLCBuZXh0Q29udGV4dCkge1xuICAgICAqICAgICByZXR1cm4gIWVxdWFsKG5leHRQcm9wcywgdGhpcy5wcm9wcykgfHxcbiAgICAgKiAgICAgICAhZXF1YWwobmV4dFN0YXRlLCB0aGlzLnN0YXRlKSB8fFxuICAgICAqICAgICAgICFlcXVhbChuZXh0Q29udGV4dCwgdGhpcy5jb250ZXh0KTtcbiAgICAgKiAgIH1cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBuZXh0UHJvcHNcbiAgICAgKiBAcGFyYW0gez9vYmplY3R9IG5leHRTdGF0ZVxuICAgICAqIEBwYXJhbSB7P29iamVjdH0gbmV4dENvbnRleHRcbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIHRoZSBjb21wb25lbnQgc2hvdWxkIHVwZGF0ZS5cbiAgICAgKiBAb3B0aW9uYWxcbiAgICAgKi9cbiAgICBzaG91bGRDb21wb25lbnRVcGRhdGU6ICdERUZJTkVfT05DRScsXG5cbiAgICAvKipcbiAgICAgKiBJbnZva2VkIHdoZW4gdGhlIGNvbXBvbmVudCBpcyBhYm91dCB0byB1cGRhdGUgZHVlIHRvIGEgdHJhbnNpdGlvbiBmcm9tXG4gICAgICogYHRoaXMucHJvcHNgLCBgdGhpcy5zdGF0ZWAgYW5kIGB0aGlzLmNvbnRleHRgIHRvIGBuZXh0UHJvcHNgLCBgbmV4dFN0YXRlYFxuICAgICAqIGFuZCBgbmV4dENvbnRleHRgLlxuICAgICAqXG4gICAgICogVXNlIHRoaXMgYXMgYW4gb3Bwb3J0dW5pdHkgdG8gcGVyZm9ybSBwcmVwYXJhdGlvbiBiZWZvcmUgYW4gdXBkYXRlIG9jY3Vycy5cbiAgICAgKlxuICAgICAqIE5PVEU6IFlvdSAqKmNhbm5vdCoqIHVzZSBgdGhpcy5zZXRTdGF0ZSgpYCBpbiB0aGlzIG1ldGhvZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBuZXh0UHJvcHNcbiAgICAgKiBAcGFyYW0gez9vYmplY3R9IG5leHRTdGF0ZVxuICAgICAqIEBwYXJhbSB7P29iamVjdH0gbmV4dENvbnRleHRcbiAgICAgKiBAcGFyYW0ge1JlYWN0UmVjb25jaWxlVHJhbnNhY3Rpb259IHRyYW5zYWN0aW9uXG4gICAgICogQG9wdGlvbmFsXG4gICAgICovXG4gICAgY29tcG9uZW50V2lsbFVwZGF0ZTogJ0RFRklORV9NQU5ZJyxcblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgd2hlbiB0aGUgY29tcG9uZW50J3MgRE9NIHJlcHJlc2VudGF0aW9uIGhhcyBiZWVuIHVwZGF0ZWQuXG4gICAgICpcbiAgICAgKiBVc2UgdGhpcyBhcyBhbiBvcHBvcnR1bml0eSB0byBvcGVyYXRlIG9uIHRoZSBET00gd2hlbiB0aGUgY29tcG9uZW50IGhhc1xuICAgICAqIGJlZW4gdXBkYXRlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwcmV2UHJvcHNcbiAgICAgKiBAcGFyYW0gez9vYmplY3R9IHByZXZTdGF0ZVxuICAgICAqIEBwYXJhbSB7P29iamVjdH0gcHJldkNvbnRleHRcbiAgICAgKiBAcGFyYW0ge0RPTUVsZW1lbnR9IHJvb3ROb2RlIERPTSBlbGVtZW50IHJlcHJlc2VudGluZyB0aGUgY29tcG9uZW50LlxuICAgICAqIEBvcHRpb25hbFxuICAgICAqL1xuICAgIGNvbXBvbmVudERpZFVwZGF0ZTogJ0RFRklORV9NQU5ZJyxcblxuICAgIC8qKlxuICAgICAqIEludm9rZWQgd2hlbiB0aGUgY29tcG9uZW50IGlzIGFib3V0IHRvIGJlIHJlbW92ZWQgZnJvbSBpdHMgcGFyZW50IGFuZCBoYXZlXG4gICAgICogaXRzIERPTSByZXByZXNlbnRhdGlvbiBkZXN0cm95ZWQuXG4gICAgICpcbiAgICAgKiBVc2UgdGhpcyBhcyBhbiBvcHBvcnR1bml0eSB0byBkZWFsbG9jYXRlIGFueSBleHRlcm5hbCByZXNvdXJjZXMuXG4gICAgICpcbiAgICAgKiBOT1RFOiBUaGVyZSBpcyBubyBgY29tcG9uZW50RGlkVW5tb3VudGAgc2luY2UgeW91ciBjb21wb25lbnQgd2lsbCBoYXZlIGJlZW5cbiAgICAgKiBkZXN0cm95ZWQgYnkgdGhhdCBwb2ludC5cbiAgICAgKlxuICAgICAqIEBvcHRpb25hbFxuICAgICAqL1xuICAgIGNvbXBvbmVudFdpbGxVbm1vdW50OiAnREVGSU5FX01BTlknLFxuXG4gICAgLy8gPT09PSBBZHZhbmNlZCBtZXRob2RzID09PT1cblxuICAgIC8qKlxuICAgICAqIFVwZGF0ZXMgdGhlIGNvbXBvbmVudCdzIGN1cnJlbnRseSBtb3VudGVkIERPTSByZXByZXNlbnRhdGlvbi5cbiAgICAgKlxuICAgICAqIEJ5IGRlZmF1bHQsIHRoaXMgaW1wbGVtZW50cyBSZWFjdCdzIHJlbmRlcmluZyBhbmQgcmVjb25jaWxpYXRpb24gYWxnb3JpdGhtLlxuICAgICAqIFNvcGhpc3RpY2F0ZWQgY2xpZW50cyBtYXkgd2lzaCB0byBvdmVycmlkZSB0aGlzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtSZWFjdFJlY29uY2lsZVRyYW5zYWN0aW9ufSB0cmFuc2FjdGlvblxuICAgICAqIEBpbnRlcm5hbFxuICAgICAqIEBvdmVycmlkYWJsZVxuICAgICAqL1xuICAgIHVwZGF0ZUNvbXBvbmVudDogJ09WRVJSSURFX0JBU0UnXG5cbiAgfTtcblxuICAvKipcbiAgICogTWFwcGluZyBmcm9tIGNsYXNzIHNwZWNpZmljYXRpb24ga2V5cyB0byBzcGVjaWFsIHByb2Nlc3NpbmcgZnVuY3Rpb25zLlxuICAgKlxuICAgKiBBbHRob3VnaCB0aGVzZSBhcmUgZGVjbGFyZWQgbGlrZSBpbnN0YW5jZSBwcm9wZXJ0aWVzIGluIHRoZSBzcGVjaWZpY2F0aW9uXG4gICAqIHdoZW4gZGVmaW5pbmcgY2xhc3NlcyB1c2luZyBgUmVhY3QuY3JlYXRlQ2xhc3NgLCB0aGV5IGFyZSBhY3R1YWxseSBzdGF0aWNcbiAgICogYW5kIGFyZSBhY2Nlc3NpYmxlIG9uIHRoZSBjb25zdHJ1Y3RvciBpbnN0ZWFkIG9mIHRoZSBwcm90b3R5cGUuIERlc3BpdGVcbiAgICogYmVpbmcgc3RhdGljLCB0aGV5IG11c3QgYmUgZGVmaW5lZCBvdXRzaWRlIG9mIHRoZSBcInN0YXRpY3NcIiBrZXkgdW5kZXJcbiAgICogd2hpY2ggYWxsIG90aGVyIHN0YXRpYyBtZXRob2RzIGFyZSBkZWZpbmVkLlxuICAgKi9cbiAgdmFyIFJFU0VSVkVEX1NQRUNfS0VZUyA9IHtcbiAgICBkaXNwbGF5TmFtZTogZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBkaXNwbGF5TmFtZSkge1xuICAgICAgQ29uc3RydWN0b3IuZGlzcGxheU5hbWUgPSBkaXNwbGF5TmFtZTtcbiAgICB9LFxuICAgIG1peGluczogZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBtaXhpbnMpIHtcbiAgICAgIGlmIChtaXhpbnMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBtaXhpbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBtaXhTcGVjSW50b0NvbXBvbmVudChDb25zdHJ1Y3RvciwgbWl4aW5zW2ldKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG4gICAgY2hpbGRDb250ZXh0VHlwZXM6IGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgY2hpbGRDb250ZXh0VHlwZXMpIHtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIHZhbGlkYXRlVHlwZURlZihDb25zdHJ1Y3RvciwgY2hpbGRDb250ZXh0VHlwZXMsICdjaGlsZENvbnRleHQnKTtcbiAgICAgIH1cbiAgICAgIENvbnN0cnVjdG9yLmNoaWxkQ29udGV4dFR5cGVzID0gX2Fzc2lnbih7fSwgQ29uc3RydWN0b3IuY2hpbGRDb250ZXh0VHlwZXMsIGNoaWxkQ29udGV4dFR5cGVzKTtcbiAgICB9LFxuICAgIGNvbnRleHRUeXBlczogZnVuY3Rpb24gKENvbnN0cnVjdG9yLCBjb250ZXh0VHlwZXMpIHtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIHZhbGlkYXRlVHlwZURlZihDb25zdHJ1Y3RvciwgY29udGV4dFR5cGVzLCAnY29udGV4dCcpO1xuICAgICAgfVxuICAgICAgQ29uc3RydWN0b3IuY29udGV4dFR5cGVzID0gX2Fzc2lnbih7fSwgQ29uc3RydWN0b3IuY29udGV4dFR5cGVzLCBjb250ZXh0VHlwZXMpO1xuICAgIH0sXG4gICAgLyoqXG4gICAgICogU3BlY2lhbCBjYXNlIGdldERlZmF1bHRQcm9wcyB3aGljaCBzaG91bGQgbW92ZSBpbnRvIHN0YXRpY3MgYnV0IHJlcXVpcmVzXG4gICAgICogYXV0b21hdGljIG1lcmdpbmcuXG4gICAgICovXG4gICAgZ2V0RGVmYXVsdFByb3BzOiBmdW5jdGlvbiAoQ29uc3RydWN0b3IsIGdldERlZmF1bHRQcm9wcykge1xuICAgICAgaWYgKENvbnN0cnVjdG9yLmdldERlZmF1bHRQcm9wcykge1xuICAgICAgICBDb25zdHJ1Y3Rvci5nZXREZWZhdWx0UHJvcHMgPSBjcmVhdGVNZXJnZWRSZXN1bHRGdW5jdGlvbihDb25zdHJ1Y3Rvci5nZXREZWZhdWx0UHJvcHMsIGdldERlZmF1bHRQcm9wcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBDb25zdHJ1Y3Rvci5nZXREZWZhdWx0UHJvcHMgPSBnZXREZWZhdWx0UHJvcHM7XG4gICAgICB9XG4gICAgfSxcbiAgICBwcm9wVHlwZXM6IGZ1bmN0aW9uIChDb25zdHJ1Y3RvciwgcHJvcFR5cGVzKSB7XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICB2YWxpZGF0ZVR5cGVEZWYoQ29uc3RydWN0b3IsIHByb3BUeXBlcywgJ3Byb3AnKTtcbiAgICAgIH1cbiAgICAgIENvbnN0cnVjdG9yLnByb3BUeXBlcyA9IF9hc3NpZ24oe30sIENvbnN0cnVjdG9yLnByb3BUeXBlcywgcHJvcFR5cGVzKTtcbiAgICB9LFxuICAgIHN0YXRpY3M6IGZ1bmN0aW9uIChDb25zdHJ1Y3Rvciwgc3RhdGljcykge1xuICAgICAgbWl4U3RhdGljU3BlY0ludG9Db21wb25lbnQoQ29uc3RydWN0b3IsIHN0YXRpY3MpO1xuICAgIH0sXG4gICAgYXV0b2JpbmQ6IGZ1bmN0aW9uICgpIHt9IH07XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVUeXBlRGVmKENvbnN0cnVjdG9yLCB0eXBlRGVmLCBsb2NhdGlvbikge1xuICAgIGZvciAodmFyIHByb3BOYW1lIGluIHR5cGVEZWYpIHtcbiAgICAgIGlmICh0eXBlRGVmLmhhc093blByb3BlcnR5KHByb3BOYW1lKSkge1xuICAgICAgICAvLyB1c2UgYSB3YXJuaW5nIGluc3RlYWQgb2YgYW4gX2ludmFyaWFudCBzbyBjb21wb25lbnRzXG4gICAgICAgIC8vIGRvbid0IHNob3cgdXAgaW4gcHJvZCBidXQgb25seSBpbiBfX0RFVl9fXG4gICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgPyB3YXJuaW5nKHR5cGVvZiB0eXBlRGVmW3Byb3BOYW1lXSA9PT0gJ2Z1bmN0aW9uJywgJyVzOiAlcyB0eXBlIGAlc2AgaXMgaW52YWxpZDsgaXQgbXVzdCBiZSBhIGZ1bmN0aW9uLCB1c3VhbGx5IGZyb20gJyArICdSZWFjdC5Qcm9wVHlwZXMuJywgQ29uc3RydWN0b3IuZGlzcGxheU5hbWUgfHwgJ1JlYWN0Q2xhc3MnLCBSZWFjdFByb3BUeXBlTG9jYXRpb25OYW1lc1tsb2NhdGlvbl0sIHByb3BOYW1lKSA6IHZvaWQgMDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZU1ldGhvZE92ZXJyaWRlKGlzQWxyZWFkeURlZmluZWQsIG5hbWUpIHtcbiAgICB2YXIgc3BlY1BvbGljeSA9IFJlYWN0Q2xhc3NJbnRlcmZhY2UuaGFzT3duUHJvcGVydHkobmFtZSkgPyBSZWFjdENsYXNzSW50ZXJmYWNlW25hbWVdIDogbnVsbDtcblxuICAgIC8vIERpc2FsbG93IG92ZXJyaWRpbmcgb2YgYmFzZSBjbGFzcyBtZXRob2RzIHVubGVzcyBleHBsaWNpdGx5IGFsbG93ZWQuXG4gICAgaWYgKFJlYWN0Q2xhc3NNaXhpbi5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgX2ludmFyaWFudChzcGVjUG9saWN5ID09PSAnT1ZFUlJJREVfQkFTRScsICdSZWFjdENsYXNzSW50ZXJmYWNlOiBZb3UgYXJlIGF0dGVtcHRpbmcgdG8gb3ZlcnJpZGUgJyArICdgJXNgIGZyb20geW91ciBjbGFzcyBzcGVjaWZpY2F0aW9uLiBFbnN1cmUgdGhhdCB5b3VyIG1ldGhvZCBuYW1lcyAnICsgJ2RvIG5vdCBvdmVybGFwIHdpdGggUmVhY3QgbWV0aG9kcy4nLCBuYW1lKTtcbiAgICB9XG5cbiAgICAvLyBEaXNhbGxvdyBkZWZpbmluZyBtZXRob2RzIG1vcmUgdGhhbiBvbmNlIHVubGVzcyBleHBsaWNpdGx5IGFsbG93ZWQuXG4gICAgaWYgKGlzQWxyZWFkeURlZmluZWQpIHtcbiAgICAgIF9pbnZhcmlhbnQoc3BlY1BvbGljeSA9PT0gJ0RFRklORV9NQU5ZJyB8fCBzcGVjUG9saWN5ID09PSAnREVGSU5FX01BTllfTUVSR0VEJywgJ1JlYWN0Q2xhc3NJbnRlcmZhY2U6IFlvdSBhcmUgYXR0ZW1wdGluZyB0byBkZWZpbmUgJyArICdgJXNgIG9uIHlvdXIgY29tcG9uZW50IG1vcmUgdGhhbiBvbmNlLiBUaGlzIGNvbmZsaWN0IG1heSBiZSBkdWUgJyArICd0byBhIG1peGluLicsIG5hbWUpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBNaXhpbiBoZWxwZXIgd2hpY2ggaGFuZGxlcyBwb2xpY3kgdmFsaWRhdGlvbiBhbmQgcmVzZXJ2ZWRcbiAgICogc3BlY2lmaWNhdGlvbiBrZXlzIHdoZW4gYnVpbGRpbmcgUmVhY3QgY2xhc3Nlcy5cbiAgICovXG4gIGZ1bmN0aW9uIG1peFNwZWNJbnRvQ29tcG9uZW50KENvbnN0cnVjdG9yLCBzcGVjKSB7XG4gICAgaWYgKCFzcGVjKSB7XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICB2YXIgdHlwZW9mU3BlYyA9IHR5cGVvZiBzcGVjO1xuICAgICAgICB2YXIgaXNNaXhpblZhbGlkID0gdHlwZW9mU3BlYyA9PT0gJ29iamVjdCcgJiYgc3BlYyAhPT0gbnVsbDtcblxuICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nID8gd2FybmluZyhpc01peGluVmFsaWQsICclczogWW91XFwncmUgYXR0ZW1wdGluZyB0byBpbmNsdWRlIGEgbWl4aW4gdGhhdCBpcyBlaXRoZXIgbnVsbCAnICsgJ29yIG5vdCBhbiBvYmplY3QuIENoZWNrIHRoZSBtaXhpbnMgaW5jbHVkZWQgYnkgdGhlIGNvbXBvbmVudCwgJyArICdhcyB3ZWxsIGFzIGFueSBtaXhpbnMgdGhleSBpbmNsdWRlIHRoZW1zZWx2ZXMuICcgKyAnRXhwZWN0ZWQgb2JqZWN0IGJ1dCBnb3QgJXMuJywgQ29uc3RydWN0b3IuZGlzcGxheU5hbWUgfHwgJ1JlYWN0Q2xhc3MnLCBzcGVjID09PSBudWxsID8gbnVsbCA6IHR5cGVvZlNwZWMpIDogdm9pZCAwO1xuICAgICAgfVxuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgX2ludmFyaWFudCh0eXBlb2Ygc3BlYyAhPT0gJ2Z1bmN0aW9uJywgJ1JlYWN0Q2xhc3M6IFlvdVxcJ3JlIGF0dGVtcHRpbmcgdG8gJyArICd1c2UgYSBjb21wb25lbnQgY2xhc3Mgb3IgZnVuY3Rpb24gYXMgYSBtaXhpbi4gSW5zdGVhZCwganVzdCB1c2UgYSAnICsgJ3JlZ3VsYXIgb2JqZWN0LicpO1xuICAgIF9pbnZhcmlhbnQoIWlzVmFsaWRFbGVtZW50KHNwZWMpLCAnUmVhY3RDbGFzczogWW91XFwncmUgYXR0ZW1wdGluZyB0byAnICsgJ3VzZSBhIGNvbXBvbmVudCBhcyBhIG1peGluLiBJbnN0ZWFkLCBqdXN0IHVzZSBhIHJlZ3VsYXIgb2JqZWN0LicpO1xuXG4gICAgdmFyIHByb3RvID0gQ29uc3RydWN0b3IucHJvdG90eXBlO1xuICAgIHZhciBhdXRvQmluZFBhaXJzID0gcHJvdG8uX19yZWFjdEF1dG9CaW5kUGFpcnM7XG5cbiAgICAvLyBCeSBoYW5kbGluZyBtaXhpbnMgYmVmb3JlIGFueSBvdGhlciBwcm9wZXJ0aWVzLCB3ZSBlbnN1cmUgdGhlIHNhbWVcbiAgICAvLyBjaGFpbmluZyBvcmRlciBpcyBhcHBsaWVkIHRvIG1ldGhvZHMgd2l0aCBERUZJTkVfTUFOWSBwb2xpY3ksIHdoZXRoZXJcbiAgICAvLyBtaXhpbnMgYXJlIGxpc3RlZCBiZWZvcmUgb3IgYWZ0ZXIgdGhlc2UgbWV0aG9kcyBpbiB0aGUgc3BlYy5cbiAgICBpZiAoc3BlYy5oYXNPd25Qcm9wZXJ0eShNSVhJTlNfS0VZKSkge1xuICAgICAgUkVTRVJWRURfU1BFQ19LRVlTLm1peGlucyhDb25zdHJ1Y3Rvciwgc3BlYy5taXhpbnMpO1xuICAgIH1cblxuICAgIGZvciAodmFyIG5hbWUgaW4gc3BlYykge1xuICAgICAgaWYgKCFzcGVjLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAobmFtZSA9PT0gTUlYSU5TX0tFWSkge1xuICAgICAgICAvLyBXZSBoYXZlIGFscmVhZHkgaGFuZGxlZCBtaXhpbnMgaW4gYSBzcGVjaWFsIGNhc2UgYWJvdmUuXG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICB2YXIgcHJvcGVydHkgPSBzcGVjW25hbWVdO1xuICAgICAgdmFyIGlzQWxyZWFkeURlZmluZWQgPSBwcm90by5oYXNPd25Qcm9wZXJ0eShuYW1lKTtcbiAgICAgIHZhbGlkYXRlTWV0aG9kT3ZlcnJpZGUoaXNBbHJlYWR5RGVmaW5lZCwgbmFtZSk7XG5cbiAgICAgIGlmIChSRVNFUlZFRF9TUEVDX0tFWVMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgUkVTRVJWRURfU1BFQ19LRVlTW25hbWVdKENvbnN0cnVjdG9yLCBwcm9wZXJ0eSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBTZXR1cCBtZXRob2RzIG9uIHByb3RvdHlwZTpcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyBtZW1iZXIgbWV0aG9kcyBzaG91bGQgbm90IGJlIGF1dG9tYXRpY2FsbHkgYm91bmQ6XG4gICAgICAgIC8vIDEuIEV4cGVjdGVkIFJlYWN0Q2xhc3MgbWV0aG9kcyAoaW4gdGhlIFwiaW50ZXJmYWNlXCIpLlxuICAgICAgICAvLyAyLiBPdmVycmlkZGVuIG1ldGhvZHMgKHRoYXQgd2VyZSBtaXhlZCBpbikuXG4gICAgICAgIHZhciBpc1JlYWN0Q2xhc3NNZXRob2QgPSBSZWFjdENsYXNzSW50ZXJmYWNlLmhhc093blByb3BlcnR5KG5hbWUpO1xuICAgICAgICB2YXIgaXNGdW5jdGlvbiA9IHR5cGVvZiBwcm9wZXJ0eSA9PT0gJ2Z1bmN0aW9uJztcbiAgICAgICAgdmFyIHNob3VsZEF1dG9CaW5kID0gaXNGdW5jdGlvbiAmJiAhaXNSZWFjdENsYXNzTWV0aG9kICYmICFpc0FscmVhZHlEZWZpbmVkICYmIHNwZWMuYXV0b2JpbmQgIT09IGZhbHNlO1xuXG4gICAgICAgIGlmIChzaG91bGRBdXRvQmluZCkge1xuICAgICAgICAgIGF1dG9CaW5kUGFpcnMucHVzaChuYW1lLCBwcm9wZXJ0eSk7XG4gICAgICAgICAgcHJvdG9bbmFtZV0gPSBwcm9wZXJ0eTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoaXNBbHJlYWR5RGVmaW5lZCkge1xuICAgICAgICAgICAgdmFyIHNwZWNQb2xpY3kgPSBSZWFjdENsYXNzSW50ZXJmYWNlW25hbWVdO1xuXG4gICAgICAgICAgICAvLyBUaGVzZSBjYXNlcyBzaG91bGQgYWxyZWFkeSBiZSBjYXVnaHQgYnkgdmFsaWRhdGVNZXRob2RPdmVycmlkZS5cbiAgICAgICAgICAgIF9pbnZhcmlhbnQoaXNSZWFjdENsYXNzTWV0aG9kICYmIChzcGVjUG9saWN5ID09PSAnREVGSU5FX01BTllfTUVSR0VEJyB8fCBzcGVjUG9saWN5ID09PSAnREVGSU5FX01BTlknKSwgJ1JlYWN0Q2xhc3M6IFVuZXhwZWN0ZWQgc3BlYyBwb2xpY3kgJXMgZm9yIGtleSAlcyAnICsgJ3doZW4gbWl4aW5nIGluIGNvbXBvbmVudCBzcGVjcy4nLCBzcGVjUG9saWN5LCBuYW1lKTtcblxuICAgICAgICAgICAgLy8gRm9yIG1ldGhvZHMgd2hpY2ggYXJlIGRlZmluZWQgbW9yZSB0aGFuIG9uY2UsIGNhbGwgdGhlIGV4aXN0aW5nXG4gICAgICAgICAgICAvLyBtZXRob2RzIGJlZm9yZSBjYWxsaW5nIHRoZSBuZXcgcHJvcGVydHksIG1lcmdpbmcgaWYgYXBwcm9wcmlhdGUuXG4gICAgICAgICAgICBpZiAoc3BlY1BvbGljeSA9PT0gJ0RFRklORV9NQU5ZX01FUkdFRCcpIHtcbiAgICAgICAgICAgICAgcHJvdG9bbmFtZV0gPSBjcmVhdGVNZXJnZWRSZXN1bHRGdW5jdGlvbihwcm90b1tuYW1lXSwgcHJvcGVydHkpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzcGVjUG9saWN5ID09PSAnREVGSU5FX01BTlknKSB7XG4gICAgICAgICAgICAgIHByb3RvW25hbWVdID0gY3JlYXRlQ2hhaW5lZEZ1bmN0aW9uKHByb3RvW25hbWVdLCBwcm9wZXJ0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb3RvW25hbWVdID0gcHJvcGVydHk7XG4gICAgICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICAgICAgICAvLyBBZGQgdmVyYm9zZSBkaXNwbGF5TmFtZSB0byB0aGUgZnVuY3Rpb24sIHdoaWNoIGhlbHBzIHdoZW4gbG9va2luZ1xuICAgICAgICAgICAgICAvLyBhdCBwcm9maWxpbmcgdG9vbHMuXG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgcHJvcGVydHkgPT09ICdmdW5jdGlvbicgJiYgc3BlYy5kaXNwbGF5TmFtZSkge1xuICAgICAgICAgICAgICAgIHByb3RvW25hbWVdLmRpc3BsYXlOYW1lID0gc3BlYy5kaXNwbGF5TmFtZSArICdfJyArIG5hbWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtaXhTdGF0aWNTcGVjSW50b0NvbXBvbmVudChDb25zdHJ1Y3Rvciwgc3RhdGljcykge1xuICAgIGlmICghc3RhdGljcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBmb3IgKHZhciBuYW1lIGluIHN0YXRpY3MpIHtcbiAgICAgIHZhciBwcm9wZXJ0eSA9IHN0YXRpY3NbbmFtZV07XG4gICAgICBpZiAoIXN0YXRpY3MuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIHZhciBpc1Jlc2VydmVkID0gbmFtZSBpbiBSRVNFUlZFRF9TUEVDX0tFWVM7XG4gICAgICBfaW52YXJpYW50KCFpc1Jlc2VydmVkLCAnUmVhY3RDbGFzczogWW91IGFyZSBhdHRlbXB0aW5nIHRvIGRlZmluZSBhIHJlc2VydmVkICcgKyAncHJvcGVydHksIGAlc2AsIHRoYXQgc2hvdWxkblxcJ3QgYmUgb24gdGhlIFwic3RhdGljc1wiIGtleS4gRGVmaW5lIGl0ICcgKyAnYXMgYW4gaW5zdGFuY2UgcHJvcGVydHkgaW5zdGVhZDsgaXQgd2lsbCBzdGlsbCBiZSBhY2Nlc3NpYmxlIG9uIHRoZSAnICsgJ2NvbnN0cnVjdG9yLicsIG5hbWUpO1xuXG4gICAgICB2YXIgaXNJbmhlcml0ZWQgPSBuYW1lIGluIENvbnN0cnVjdG9yO1xuICAgICAgX2ludmFyaWFudCghaXNJbmhlcml0ZWQsICdSZWFjdENsYXNzOiBZb3UgYXJlIGF0dGVtcHRpbmcgdG8gZGVmaW5lICcgKyAnYCVzYCBvbiB5b3VyIGNvbXBvbmVudCBtb3JlIHRoYW4gb25jZS4gVGhpcyBjb25mbGljdCBtYXkgYmUgJyArICdkdWUgdG8gYSBtaXhpbi4nLCBuYW1lKTtcbiAgICAgIENvbnN0cnVjdG9yW25hbWVdID0gcHJvcGVydHk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIE1lcmdlIHR3byBvYmplY3RzLCBidXQgdGhyb3cgaWYgYm90aCBjb250YWluIHRoZSBzYW1lIGtleS5cbiAgICpcbiAgICogQHBhcmFtIHtvYmplY3R9IG9uZSBUaGUgZmlyc3Qgb2JqZWN0LCB3aGljaCBpcyBtdXRhdGVkLlxuICAgKiBAcGFyYW0ge29iamVjdH0gdHdvIFRoZSBzZWNvbmQgb2JqZWN0XG4gICAqIEByZXR1cm4ge29iamVjdH0gb25lIGFmdGVyIGl0IGhhcyBiZWVuIG11dGF0ZWQgdG8gY29udGFpbiBldmVyeXRoaW5nIGluIHR3by5cbiAgICovXG4gIGZ1bmN0aW9uIG1lcmdlSW50b1dpdGhOb0R1cGxpY2F0ZUtleXMob25lLCB0d28pIHtcbiAgICBfaW52YXJpYW50KG9uZSAmJiB0d28gJiYgdHlwZW9mIG9uZSA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIHR3byA9PT0gJ29iamVjdCcsICdtZXJnZUludG9XaXRoTm9EdXBsaWNhdGVLZXlzKCk6IENhbm5vdCBtZXJnZSBub24tb2JqZWN0cy4nKTtcblxuICAgIGZvciAodmFyIGtleSBpbiB0d28pIHtcbiAgICAgIGlmICh0d28uaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICBfaW52YXJpYW50KG9uZVtrZXldID09PSB1bmRlZmluZWQsICdtZXJnZUludG9XaXRoTm9EdXBsaWNhdGVLZXlzKCk6ICcgKyAnVHJpZWQgdG8gbWVyZ2UgdHdvIG9iamVjdHMgd2l0aCB0aGUgc2FtZSBrZXk6IGAlc2AuIFRoaXMgY29uZmxpY3QgJyArICdtYXkgYmUgZHVlIHRvIGEgbWl4aW47IGluIHBhcnRpY3VsYXIsIHRoaXMgbWF5IGJlIGNhdXNlZCBieSB0d28gJyArICdnZXRJbml0aWFsU3RhdGUoKSBvciBnZXREZWZhdWx0UHJvcHMoKSBtZXRob2RzIHJldHVybmluZyBvYmplY3RzICcgKyAnd2l0aCBjbGFzaGluZyBrZXlzLicsIGtleSk7XG4gICAgICAgIG9uZVtrZXldID0gdHdvW2tleV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvbmU7XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyB0d28gZnVuY3Rpb25zIGFuZCBtZXJnZXMgdGhlaXIgcmV0dXJuIHZhbHVlcy5cbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb25lIEZ1bmN0aW9uIHRvIGludm9rZSBmaXJzdC5cbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gdHdvIEZ1bmN0aW9uIHRvIGludm9rZSBzZWNvbmQuXG4gICAqIEByZXR1cm4ge2Z1bmN0aW9ufSBGdW5jdGlvbiB0aGF0IGludm9rZXMgdGhlIHR3byBhcmd1bWVudCBmdW5jdGlvbnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVNZXJnZWRSZXN1bHRGdW5jdGlvbihvbmUsIHR3bykge1xuICAgIHJldHVybiBmdW5jdGlvbiBtZXJnZWRSZXN1bHQoKSB7XG4gICAgICB2YXIgYSA9IG9uZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgdmFyIGIgPSB0d28uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIGlmIChhID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIGI7XG4gICAgICB9IGVsc2UgaWYgKGIgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gYTtcbiAgICAgIH1cbiAgICAgIHZhciBjID0ge307XG4gICAgICBtZXJnZUludG9XaXRoTm9EdXBsaWNhdGVLZXlzKGMsIGEpO1xuICAgICAgbWVyZ2VJbnRvV2l0aE5vRHVwbGljYXRlS2V5cyhjLCBiKTtcbiAgICAgIHJldHVybiBjO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ3JlYXRlcyBhIGZ1bmN0aW9uIHRoYXQgaW52b2tlcyB0d28gZnVuY3Rpb25zIGFuZCBpZ25vcmVzIHRoZWlyIHJldHVybiB2YWxlcy5cbiAgICpcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gb25lIEZ1bmN0aW9uIHRvIGludm9rZSBmaXJzdC5cbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gdHdvIEZ1bmN0aW9uIHRvIGludm9rZSBzZWNvbmQuXG4gICAqIEByZXR1cm4ge2Z1bmN0aW9ufSBGdW5jdGlvbiB0aGF0IGludm9rZXMgdGhlIHR3byBhcmd1bWVudCBmdW5jdGlvbnMuXG4gICAqIEBwcml2YXRlXG4gICAqL1xuICBmdW5jdGlvbiBjcmVhdGVDaGFpbmVkRnVuY3Rpb24ob25lLCB0d28pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gY2hhaW5lZEZ1bmN0aW9uKCkge1xuICAgICAgb25lLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB0d28uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEJpbmRzIGEgbWV0aG9kIHRvIHRoZSBjb21wb25lbnQuXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBjb21wb25lbnQgQ29tcG9uZW50IHdob3NlIG1ldGhvZCBpcyBnb2luZyB0byBiZSBib3VuZC5cbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gbWV0aG9kIE1ldGhvZCB0byBiZSBib3VuZC5cbiAgICogQHJldHVybiB7ZnVuY3Rpb259IFRoZSBib3VuZCBtZXRob2QuXG4gICAqL1xuICBmdW5jdGlvbiBiaW5kQXV0b0JpbmRNZXRob2QoY29tcG9uZW50LCBtZXRob2QpIHtcbiAgICB2YXIgYm91bmRNZXRob2QgPSBtZXRob2QuYmluZChjb21wb25lbnQpO1xuICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICBib3VuZE1ldGhvZC5fX3JlYWN0Qm91bmRDb250ZXh0ID0gY29tcG9uZW50O1xuICAgICAgYm91bmRNZXRob2QuX19yZWFjdEJvdW5kTWV0aG9kID0gbWV0aG9kO1xuICAgICAgYm91bmRNZXRob2QuX19yZWFjdEJvdW5kQXJndW1lbnRzID0gbnVsbDtcbiAgICAgIHZhciBjb21wb25lbnROYW1lID0gY29tcG9uZW50LmNvbnN0cnVjdG9yLmRpc3BsYXlOYW1lO1xuICAgICAgdmFyIF9iaW5kID0gYm91bmRNZXRob2QuYmluZDtcbiAgICAgIGJvdW5kTWV0aG9kLmJpbmQgPSBmdW5jdGlvbiAobmV3VGhpcykge1xuICAgICAgICBmb3IgKHZhciBfbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IEFycmF5KF9sZW4gPiAxID8gX2xlbiAtIDEgOiAwKSwgX2tleSA9IDE7IF9rZXkgPCBfbGVuOyBfa2V5KyspIHtcbiAgICAgICAgICBhcmdzW19rZXkgLSAxXSA9IGFyZ3VtZW50c1tfa2V5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZXIgaXMgdHJ5aW5nIHRvIGJpbmQoKSBhbiBhdXRvYm91bmQgbWV0aG9kOyB3ZSBlZmZlY3RpdmVseSB3aWxsXG4gICAgICAgIC8vIGlnbm9yZSB0aGUgdmFsdWUgb2YgXCJ0aGlzXCIgdGhhdCB0aGUgdXNlciBpcyB0cnlpbmcgdG8gdXNlLCBzb1xuICAgICAgICAvLyBsZXQncyB3YXJuLlxuICAgICAgICBpZiAobmV3VGhpcyAhPT0gY29tcG9uZW50ICYmIG5ld1RoaXMgIT09IG51bGwpIHtcbiAgICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nID8gd2FybmluZyhmYWxzZSwgJ2JpbmQoKTogUmVhY3QgY29tcG9uZW50IG1ldGhvZHMgbWF5IG9ubHkgYmUgYm91bmQgdG8gdGhlICcgKyAnY29tcG9uZW50IGluc3RhbmNlLiBTZWUgJXMnLCBjb21wb25lbnROYW1lKSA6IHZvaWQgMDtcbiAgICAgICAgfSBlbHNlIGlmICghYXJncy5sZW5ndGgpIHtcbiAgICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nID8gd2FybmluZyhmYWxzZSwgJ2JpbmQoKTogWW91IGFyZSBiaW5kaW5nIGEgY29tcG9uZW50IG1ldGhvZCB0byB0aGUgY29tcG9uZW50LiAnICsgJ1JlYWN0IGRvZXMgdGhpcyBmb3IgeW91IGF1dG9tYXRpY2FsbHkgaW4gYSBoaWdoLXBlcmZvcm1hbmNlICcgKyAnd2F5LCBzbyB5b3UgY2FuIHNhZmVseSByZW1vdmUgdGhpcyBjYWxsLiBTZWUgJXMnLCBjb21wb25lbnROYW1lKSA6IHZvaWQgMDtcbiAgICAgICAgICByZXR1cm4gYm91bmRNZXRob2Q7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHJlYm91bmRNZXRob2QgPSBfYmluZC5hcHBseShib3VuZE1ldGhvZCwgYXJndW1lbnRzKTtcbiAgICAgICAgcmVib3VuZE1ldGhvZC5fX3JlYWN0Qm91bmRDb250ZXh0ID0gY29tcG9uZW50O1xuICAgICAgICByZWJvdW5kTWV0aG9kLl9fcmVhY3RCb3VuZE1ldGhvZCA9IG1ldGhvZDtcbiAgICAgICAgcmVib3VuZE1ldGhvZC5fX3JlYWN0Qm91bmRBcmd1bWVudHMgPSBhcmdzO1xuICAgICAgICByZXR1cm4gcmVib3VuZE1ldGhvZDtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBib3VuZE1ldGhvZDtcbiAgfVxuXG4gIC8qKlxuICAgKiBCaW5kcyBhbGwgYXV0by1ib3VuZCBtZXRob2RzIGluIGEgY29tcG9uZW50LlxuICAgKlxuICAgKiBAcGFyYW0ge29iamVjdH0gY29tcG9uZW50IENvbXBvbmVudCB3aG9zZSBtZXRob2QgaXMgZ29pbmcgdG8gYmUgYm91bmQuXG4gICAqL1xuICBmdW5jdGlvbiBiaW5kQXV0b0JpbmRNZXRob2RzKGNvbXBvbmVudCkge1xuICAgIHZhciBwYWlycyA9IGNvbXBvbmVudC5fX3JlYWN0QXV0b0JpbmRQYWlycztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhaXJzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgICB2YXIgYXV0b0JpbmRLZXkgPSBwYWlyc1tpXTtcbiAgICAgIHZhciBtZXRob2QgPSBwYWlyc1tpICsgMV07XG4gICAgICBjb21wb25lbnRbYXV0b0JpbmRLZXldID0gYmluZEF1dG9CaW5kTWV0aG9kKGNvbXBvbmVudCwgbWV0aG9kKTtcbiAgICB9XG4gIH1cblxuICB2YXIgSXNNb3VudGVkTWl4aW4gPSB7XG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuX19pc01vdW50ZWQgPSB0cnVlO1xuICAgIH0sXG4gICAgY29tcG9uZW50V2lsbFVubW91bnQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuX19pc01vdW50ZWQgPSBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIEFkZCBtb3JlIHRvIHRoZSBSZWFjdENsYXNzIGJhc2UgY2xhc3MuIFRoZXNlIGFyZSBhbGwgbGVnYWN5IGZlYXR1cmVzIGFuZFxuICAgKiB0aGVyZWZvcmUgbm90IGFscmVhZHkgcGFydCBvZiB0aGUgbW9kZXJuIFJlYWN0Q29tcG9uZW50LlxuICAgKi9cbiAgdmFyIFJlYWN0Q2xhc3NNaXhpbiA9IHtcblxuICAgIC8qKlxuICAgICAqIFRPRE86IFRoaXMgd2lsbCBiZSBkZXByZWNhdGVkIGJlY2F1c2Ugc3RhdGUgc2hvdWxkIGFsd2F5cyBrZWVwIGEgY29uc2lzdGVudFxuICAgICAqIHR5cGUgc2lnbmF0dXJlIGFuZCB0aGUgb25seSB1c2UgY2FzZSBmb3IgdGhpcywgaXMgdG8gYXZvaWQgdGhhdC5cbiAgICAgKi9cbiAgICByZXBsYWNlU3RhdGU6IGZ1bmN0aW9uIChuZXdTdGF0ZSwgY2FsbGJhY2spIHtcbiAgICAgIHRoaXMudXBkYXRlci5lbnF1ZXVlUmVwbGFjZVN0YXRlKHRoaXMsIG5ld1N0YXRlLCBjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrcyB3aGV0aGVyIG9yIG5vdCB0aGlzIGNvbXBvc2l0ZSBjb21wb25lbnQgaXMgbW91bnRlZC5cbiAgICAgKiBAcmV0dXJuIHtib29sZWFufSBUcnVlIGlmIG1vdW50ZWQsIGZhbHNlIG90aGVyd2lzZS5cbiAgICAgKiBAcHJvdGVjdGVkXG4gICAgICogQGZpbmFsXG4gICAgICovXG4gICAgaXNNb3VudGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgICBwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nID8gd2FybmluZyh0aGlzLl9fZGlkV2FybklzTW91bnRlZCwgJyVzOiBpc01vdW50ZWQgaXMgZGVwcmVjYXRlZC4gSW5zdGVhZCwgbWFrZSBzdXJlIHRvIGNsZWFuIHVwICcgKyAnc3Vic2NyaXB0aW9ucyBhbmQgcGVuZGluZyByZXF1ZXN0cyBpbiBjb21wb25lbnRXaWxsVW5tb3VudCB0byAnICsgJ3ByZXZlbnQgbWVtb3J5IGxlYWtzLicsIHRoaXMuY29uc3RydWN0b3IgJiYgdGhpcy5jb25zdHJ1Y3Rvci5kaXNwbGF5TmFtZSB8fCB0aGlzLm5hbWUgfHwgJ0NvbXBvbmVudCcpIDogdm9pZCAwO1xuICAgICAgICB0aGlzLl9fZGlkV2FybklzTW91bnRlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gISF0aGlzLl9faXNNb3VudGVkO1xuICAgIH1cbiAgfTtcblxuICB2YXIgUmVhY3RDbGFzc0NvbXBvbmVudCA9IGZ1bmN0aW9uICgpIHt9O1xuICBfYXNzaWduKFJlYWN0Q2xhc3NDb21wb25lbnQucHJvdG90eXBlLCBSZWFjdENvbXBvbmVudC5wcm90b3R5cGUsIFJlYWN0Q2xhc3NNaXhpbik7XG5cbiAgLyoqXG4gICAqIENyZWF0ZXMgYSBjb21wb3NpdGUgY29tcG9uZW50IGNsYXNzIGdpdmVuIGEgY2xhc3Mgc3BlY2lmaWNhdGlvbi5cbiAgICogU2VlIGh0dHBzOi8vZmFjZWJvb2suZ2l0aHViLmlvL3JlYWN0L2RvY3MvdG9wLWxldmVsLWFwaS5odG1sI3JlYWN0LmNyZWF0ZWNsYXNzXG4gICAqXG4gICAqIEBwYXJhbSB7b2JqZWN0fSBzcGVjIENsYXNzIHNwZWNpZmljYXRpb24gKHdoaWNoIG11c3QgZGVmaW5lIGByZW5kZXJgKS5cbiAgICogQHJldHVybiB7ZnVuY3Rpb259IENvbXBvbmVudCBjb25zdHJ1Y3RvciBmdW5jdGlvbi5cbiAgICogQHB1YmxpY1xuICAgKi9cbiAgZnVuY3Rpb24gY3JlYXRlQ2xhc3Moc3BlYykge1xuICAgIC8vIFRvIGtlZXAgb3VyIHdhcm5pbmdzIG1vcmUgdW5kZXJzdGFuZGFibGUsIHdlJ2xsIHVzZSBhIGxpdHRsZSBoYWNrIGhlcmUgdG9cbiAgICAvLyBlbnN1cmUgdGhhdCBDb25zdHJ1Y3Rvci5uYW1lICE9PSAnQ29uc3RydWN0b3InLiBUaGlzIG1ha2VzIHN1cmUgd2UgZG9uJ3RcbiAgICAvLyB1bm5lY2Vzc2FyaWx5IGlkZW50aWZ5IGEgY2xhc3Mgd2l0aG91dCBkaXNwbGF5TmFtZSBhcyAnQ29uc3RydWN0b3InLlxuICAgIHZhciBDb25zdHJ1Y3RvciA9IGlkZW50aXR5KGZ1bmN0aW9uIChwcm9wcywgY29udGV4dCwgdXBkYXRlcikge1xuICAgICAgLy8gVGhpcyBjb25zdHJ1Y3RvciBnZXRzIG92ZXJyaWRkZW4gYnkgbW9ja3MuIFRoZSBhcmd1bWVudCBpcyB1c2VkXG4gICAgICAvLyBieSBtb2NrcyB0byBhc3NlcnQgb24gd2hhdCBnZXRzIG1vdW50ZWQuXG5cbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicgPyB3YXJuaW5nKHRoaXMgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvciwgJ1NvbWV0aGluZyBpcyBjYWxsaW5nIGEgUmVhY3QgY29tcG9uZW50IGRpcmVjdGx5LiBVc2UgYSBmYWN0b3J5IG9yICcgKyAnSlNYIGluc3RlYWQuIFNlZTogaHR0cHM6Ly9mYi5tZS9yZWFjdC1sZWdhY3lmYWN0b3J5JykgOiB2b2lkIDA7XG4gICAgICB9XG5cbiAgICAgIC8vIFdpcmUgdXAgYXV0by1iaW5kaW5nXG4gICAgICBpZiAodGhpcy5fX3JlYWN0QXV0b0JpbmRQYWlycy5sZW5ndGgpIHtcbiAgICAgICAgYmluZEF1dG9CaW5kTWV0aG9kcyh0aGlzKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5wcm9wcyA9IHByb3BzO1xuICAgICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICAgIHRoaXMucmVmcyA9IGVtcHR5T2JqZWN0O1xuICAgICAgdGhpcy51cGRhdGVyID0gdXBkYXRlciB8fCBSZWFjdE5vb3BVcGRhdGVRdWV1ZTtcblxuICAgICAgdGhpcy5zdGF0ZSA9IG51bGw7XG5cbiAgICAgIC8vIFJlYWN0Q2xhc3NlcyBkb2Vzbid0IGhhdmUgY29uc3RydWN0b3JzLiBJbnN0ZWFkLCB0aGV5IHVzZSB0aGVcbiAgICAgIC8vIGdldEluaXRpYWxTdGF0ZSBhbmQgY29tcG9uZW50V2lsbE1vdW50IG1ldGhvZHMgZm9yIGluaXRpYWxpemF0aW9uLlxuXG4gICAgICB2YXIgaW5pdGlhbFN0YXRlID0gdGhpcy5nZXRJbml0aWFsU3RhdGUgPyB0aGlzLmdldEluaXRpYWxTdGF0ZSgpIDogbnVsbDtcbiAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgIC8vIFdlIGFsbG93IGF1dG8tbW9ja3MgdG8gcHJvY2VlZCBhcyBpZiB0aGV5J3JlIHJldHVybmluZyBudWxsLlxuICAgICAgICBpZiAoaW5pdGlhbFN0YXRlID09PSB1bmRlZmluZWQgJiYgdGhpcy5nZXRJbml0aWFsU3RhdGUuX2lzTW9ja0Z1bmN0aW9uKSB7XG4gICAgICAgICAgLy8gVGhpcyBpcyBwcm9iYWJseSBiYWQgcHJhY3RpY2UuIENvbnNpZGVyIHdhcm5pbmcgaGVyZSBhbmRcbiAgICAgICAgICAvLyBkZXByZWNhdGluZyB0aGlzIGNvbnZlbmllbmNlLlxuICAgICAgICAgIGluaXRpYWxTdGF0ZSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIF9pbnZhcmlhbnQodHlwZW9mIGluaXRpYWxTdGF0ZSA9PT0gJ29iamVjdCcgJiYgIUFycmF5LmlzQXJyYXkoaW5pdGlhbFN0YXRlKSwgJyVzLmdldEluaXRpYWxTdGF0ZSgpOiBtdXN0IHJldHVybiBhbiBvYmplY3Qgb3IgbnVsbCcsIENvbnN0cnVjdG9yLmRpc3BsYXlOYW1lIHx8ICdSZWFjdENvbXBvc2l0ZUNvbXBvbmVudCcpO1xuXG4gICAgICB0aGlzLnN0YXRlID0gaW5pdGlhbFN0YXRlO1xuICAgIH0pO1xuICAgIENvbnN0cnVjdG9yLnByb3RvdHlwZSA9IG5ldyBSZWFjdENsYXNzQ29tcG9uZW50KCk7XG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gQ29uc3RydWN0b3I7XG4gICAgQ29uc3RydWN0b3IucHJvdG90eXBlLl9fcmVhY3RBdXRvQmluZFBhaXJzID0gW107XG5cbiAgICBpbmplY3RlZE1peGlucy5mb3JFYWNoKG1peFNwZWNJbnRvQ29tcG9uZW50LmJpbmQobnVsbCwgQ29uc3RydWN0b3IpKTtcblxuICAgIG1peFNwZWNJbnRvQ29tcG9uZW50KENvbnN0cnVjdG9yLCBJc01vdW50ZWRNaXhpbik7XG4gICAgbWl4U3BlY0ludG9Db21wb25lbnQoQ29uc3RydWN0b3IsIHNwZWMpO1xuXG4gICAgLy8gSW5pdGlhbGl6ZSB0aGUgZGVmYXVsdFByb3BzIHByb3BlcnR5IGFmdGVyIGFsbCBtaXhpbnMgaGF2ZSBiZWVuIG1lcmdlZC5cbiAgICBpZiAoQ29uc3RydWN0b3IuZ2V0RGVmYXVsdFByb3BzKSB7XG4gICAgICBDb25zdHJ1Y3Rvci5kZWZhdWx0UHJvcHMgPSBDb25zdHJ1Y3Rvci5nZXREZWZhdWx0UHJvcHMoKTtcbiAgICB9XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgLy8gVGhpcyBpcyBhIHRhZyB0byBpbmRpY2F0ZSB0aGF0IHRoZSB1c2Ugb2YgdGhlc2UgbWV0aG9kIG5hbWVzIGlzIG9rLFxuICAgICAgLy8gc2luY2UgaXQncyB1c2VkIHdpdGggY3JlYXRlQ2xhc3MuIElmIGl0J3Mgbm90LCB0aGVuIGl0J3MgbGlrZWx5IGFcbiAgICAgIC8vIG1pc3Rha2Ugc28gd2UnbGwgd2FybiB5b3UgdG8gdXNlIHRoZSBzdGF0aWMgcHJvcGVydHksIHByb3BlcnR5XG4gICAgICAvLyBpbml0aWFsaXplciBvciBjb25zdHJ1Y3RvciByZXNwZWN0aXZlbHkuXG4gICAgICBpZiAoQ29uc3RydWN0b3IuZ2V0RGVmYXVsdFByb3BzKSB7XG4gICAgICAgIENvbnN0cnVjdG9yLmdldERlZmF1bHRQcm9wcy5pc1JlYWN0Q2xhc3NBcHByb3ZlZCA9IHt9O1xuICAgICAgfVxuICAgICAgaWYgKENvbnN0cnVjdG9yLnByb3RvdHlwZS5nZXRJbml0aWFsU3RhdGUpIHtcbiAgICAgICAgQ29uc3RydWN0b3IucHJvdG90eXBlLmdldEluaXRpYWxTdGF0ZS5pc1JlYWN0Q2xhc3NBcHByb3ZlZCA9IHt9O1xuICAgICAgfVxuICAgIH1cblxuICAgIF9pbnZhcmlhbnQoQ29uc3RydWN0b3IucHJvdG90eXBlLnJlbmRlciwgJ2NyZWF0ZUNsYXNzKC4uLik6IENsYXNzIHNwZWNpZmljYXRpb24gbXVzdCBpbXBsZW1lbnQgYSBgcmVuZGVyYCBtZXRob2QuJyk7XG5cbiAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyA/IHdhcm5pbmcoIUNvbnN0cnVjdG9yLnByb3RvdHlwZS5jb21wb25lbnRTaG91bGRVcGRhdGUsICclcyBoYXMgYSBtZXRob2QgY2FsbGVkICcgKyAnY29tcG9uZW50U2hvdWxkVXBkYXRlKCkuIERpZCB5b3UgbWVhbiBzaG91bGRDb21wb25lbnRVcGRhdGUoKT8gJyArICdUaGUgbmFtZSBpcyBwaHJhc2VkIGFzIGEgcXVlc3Rpb24gYmVjYXVzZSB0aGUgZnVuY3Rpb24gaXMgJyArICdleHBlY3RlZCB0byByZXR1cm4gYSB2YWx1ZS4nLCBzcGVjLmRpc3BsYXlOYW1lIHx8ICdBIGNvbXBvbmVudCcpIDogdm9pZCAwO1xuICAgICAgcHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJyA/IHdhcm5pbmcoIUNvbnN0cnVjdG9yLnByb3RvdHlwZS5jb21wb25lbnRXaWxsUmVjaWV2ZVByb3BzLCAnJXMgaGFzIGEgbWV0aG9kIGNhbGxlZCAnICsgJ2NvbXBvbmVudFdpbGxSZWNpZXZlUHJvcHMoKS4gRGlkIHlvdSBtZWFuIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHMoKT8nLCBzcGVjLmRpc3BsYXlOYW1lIHx8ICdBIGNvbXBvbmVudCcpIDogdm9pZCAwO1xuICAgIH1cblxuICAgIC8vIFJlZHVjZSB0aW1lIHNwZW50IGRvaW5nIGxvb2t1cHMgYnkgc2V0dGluZyB0aGVzZSBvbiB0aGUgcHJvdG90eXBlLlxuICAgIGZvciAodmFyIG1ldGhvZE5hbWUgaW4gUmVhY3RDbGFzc0ludGVyZmFjZSkge1xuICAgICAgaWYgKCFDb25zdHJ1Y3Rvci5wcm90b3R5cGVbbWV0aG9kTmFtZV0pIHtcbiAgICAgICAgQ29uc3RydWN0b3IucHJvdG90eXBlW21ldGhvZE5hbWVdID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gQ29uc3RydWN0b3I7XG4gIH1cblxuICByZXR1cm4gY3JlYXRlQ2xhc3M7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZmFjdG9yeTtcblxuXG5cbi8qKioqKioqKioqKioqKioqKlxuICoqIFdFQlBBQ0sgRk9PVEVSXG4gKiogLi9+L2NyZWF0ZS1yZWFjdC1jbGFzcy9mYWN0b3J5LmpzXG4gKiogbW9kdWxlIGlkID0gMTJcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qXG5vYmplY3QtYXNzaWduXG4oYykgU2luZHJlIFNvcmh1c1xuQGxpY2Vuc2UgTUlUXG4qL1xuXG4ndXNlIHN0cmljdCc7XG4vKiBlc2xpbnQtZGlzYWJsZSBuby11bnVzZWQtdmFycyAqL1xudmFyIGdldE93blByb3BlcnR5U3ltYm9scyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eVN5bWJvbHM7XG52YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xudmFyIHByb3BJc0VudW1lcmFibGUgPSBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlO1xuXG5mdW5jdGlvbiB0b09iamVjdCh2YWwpIHtcblx0aWYgKHZhbCA9PT0gbnVsbCB8fCB2YWwgPT09IHVuZGVmaW5lZCkge1xuXHRcdHRocm93IG5ldyBUeXBlRXJyb3IoJ09iamVjdC5hc3NpZ24gY2Fubm90IGJlIGNhbGxlZCB3aXRoIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cdH1cblxuXHRyZXR1cm4gT2JqZWN0KHZhbCk7XG59XG5cbmZ1bmN0aW9uIHNob3VsZFVzZU5hdGl2ZSgpIHtcblx0dHJ5IHtcblx0XHRpZiAoIU9iamVjdC5hc3NpZ24pIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBEZXRlY3QgYnVnZ3kgcHJvcGVydHkgZW51bWVyYXRpb24gb3JkZXIgaW4gb2xkZXIgVjggdmVyc2lvbnMuXG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD00MTE4XG5cdFx0dmFyIHRlc3QxID0gbmV3IFN0cmluZygnYWJjJyk7ICAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLW5ldy13cmFwcGVyc1xuXHRcdHRlc3QxWzVdID0gJ2RlJztcblx0XHRpZiAoT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDEpWzBdID09PSAnNScpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBodHRwczovL2J1Z3MuY2hyb21pdW0ub3JnL3AvdjgvaXNzdWVzL2RldGFpbD9pZD0zMDU2XG5cdFx0dmFyIHRlc3QyID0ge307XG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG5cdFx0XHR0ZXN0MlsnXycgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpXSA9IGk7XG5cdFx0fVxuXHRcdHZhciBvcmRlcjIgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh0ZXN0MikubWFwKGZ1bmN0aW9uIChuKSB7XG5cdFx0XHRyZXR1cm4gdGVzdDJbbl07XG5cdFx0fSk7XG5cdFx0aWYgKG9yZGVyMi5qb2luKCcnKSAhPT0gJzAxMjM0NTY3ODknKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuXHRcdHZhciB0ZXN0MyA9IHt9O1xuXHRcdCdhYmNkZWZnaGlqa2xtbm9wcXJzdCcuc3BsaXQoJycpLmZvckVhY2goZnVuY3Rpb24gKGxldHRlcikge1xuXHRcdFx0dGVzdDNbbGV0dGVyXSA9IGxldHRlcjtcblx0XHR9KTtcblx0XHRpZiAoT2JqZWN0LmtleXMoT2JqZWN0LmFzc2lnbih7fSwgdGVzdDMpKS5qb2luKCcnKSAhPT1cblx0XHRcdFx0J2FiY2RlZmdoaWprbG1ub3BxcnN0Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cnVlO1xuXHR9IGNhdGNoIChlcnIpIHtcblx0XHQvLyBXZSBkb24ndCBleHBlY3QgYW55IG9mIHRoZSBhYm92ZSB0byB0aHJvdywgYnV0IGJldHRlciB0byBiZSBzYWZlLlxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHNob3VsZFVzZU5hdGl2ZSgpID8gT2JqZWN0LmFzc2lnbiA6IGZ1bmN0aW9uICh0YXJnZXQsIHNvdXJjZSkge1xuXHR2YXIgZnJvbTtcblx0dmFyIHRvID0gdG9PYmplY3QodGFyZ2V0KTtcblx0dmFyIHN5bWJvbHM7XG5cblx0Zm9yICh2YXIgcyA9IDE7IHMgPCBhcmd1bWVudHMubGVuZ3RoOyBzKyspIHtcblx0XHRmcm9tID0gT2JqZWN0KGFyZ3VtZW50c1tzXSk7XG5cblx0XHRmb3IgKHZhciBrZXkgaW4gZnJvbSkge1xuXHRcdFx0aWYgKGhhc093blByb3BlcnR5LmNhbGwoZnJvbSwga2V5KSkge1xuXHRcdFx0XHR0b1trZXldID0gZnJvbVtrZXldO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChnZXRPd25Qcm9wZXJ0eVN5bWJvbHMpIHtcblx0XHRcdHN5bWJvbHMgPSBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMoZnJvbSk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN5bWJvbHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHByb3BJc0VudW1lcmFibGUuY2FsbChmcm9tLCBzeW1ib2xzW2ldKSkge1xuXHRcdFx0XHRcdHRvW3N5bWJvbHNbaV1dID0gZnJvbVtzeW1ib2xzW2ldXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdHJldHVybiB0bztcbn07XG5cblxuXG4vKioqKioqKioqKioqKioqKipcbiAqKiBXRUJQQUNLIEZPT1RFUlxuICoqIC4vfi9vYmplY3QtYXNzaWduL2luZGV4LmpzXG4gKiogbW9kdWxlIGlkID0gMTNcbiAqKiBtb2R1bGUgY2h1bmtzID0gMFxuICoqLyIsIi8qKlxuICogQ29weXJpZ2h0IChjKSAyMDEzLXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKi9cblxuJ3VzZSBzdHJpY3QnO1xuXG52YXIgZW1wdHlPYmplY3QgPSB7fTtcblxuaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcbiAgT2JqZWN0LmZyZWV6ZShlbXB0eU9iamVjdCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZW1wdHlPYmplY3Q7XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiAuL34vZmJqcy9saWIvZW1wdHlPYmplY3QuanNcbiAqKiBtb2R1bGUgaWQgPSAxNFxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFXzE1X187XG5cblxuLyoqKioqKioqKioqKioqKioqXG4gKiogV0VCUEFDSyBGT09URVJcbiAqKiBleHRlcm5hbCB7XCJjb21tb25qc1wiOlwicmVhY3QtZG9tXCIsXCJjb21tb25qczJcIjpcInJlYWN0LWRvbVwiLFwiYW1kXCI6XCJSZWFjdERPTVwiLFwicm9vdFwiOlwiUmVhY3RET01cIn1cbiAqKiBtb2R1bGUgaWQgPSAxNVxuICoqIG1vZHVsZSBjaHVua3MgPSAwXG4gKiovIiwiLyoqXHJcbiAqIEBmaWxlT3ZlcnZpZXcgalF1ZXJ5IHJlcGxhY2VtZW50XHJcbiAqIEBhdXRob3IgamFzb25zbHl2aWFcclxuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBvbihlbCwgZXZlbnROYW1lLCBjYWxsYmFjaykge1xyXG4gIGlmIChlbC5hZGRFdmVudExpc3RlbmVyKSB7XHJcbiAgICBlbC5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgY2FsbGJhY2ssIGZhbHNlKTtcclxuICB9IGVsc2UgaWYgKGVsLmF0dGFjaEV2ZW50KSB7XHJcbiAgICBlbC5hdHRhY2hFdmVudChgb24ke2V2ZW50TmFtZX1gLCAoZSkgPT4ge1xyXG4gICAgICBjYWxsYmFjay5jYWxsKGVsLCBlIHx8IHdpbmRvdy5ldmVudCk7XHJcbiAgICB9KTtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvZmYoZWwsIGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcclxuICBpZiAoZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcikge1xyXG4gICAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIGNhbGxiYWNrKTtcclxuICB9IGVsc2UgaWYgKGVsLmRldGFjaEV2ZW50KSB7XHJcbiAgICBlbC5kZXRhY2hFdmVudChgb24ke2V2ZW50TmFtZX1gLCBjYWxsYmFjayk7XHJcbiAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNGdW5jdGlvbihmdW5jKSB7XHJcbiAgcmV0dXJuIHR5cGVvZiBmdW5jID09PSAnZnVuY3Rpb24nO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNOdW1lcmljKG51bSkge1xyXG4gIHJldHVybiAhaXNOYU4ocGFyc2VGbG9hdChudW0pKSAmJiBpc0Zpbml0ZShudW0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcG9zaXRpb24oZWwpIHtcclxuICBpZiAoIWVsKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICBsZWZ0OiAwLFxyXG4gICAgICB0b3A6IDBcclxuICAgIH07XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgbGVmdDogZWwub2Zmc2V0TGVmdCxcclxuICAgIHRvcDogZWwub2Zmc2V0VG9wXHJcbiAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHdpZHRoKGVsKSB7XHJcbiAgcmV0dXJuIGVsLm9mZnNldFdpZHRoO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaGVpZ2h0KGVsKSB7XHJcbiAgcmV0dXJuIGVsLm9mZnNldEhlaWdodDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG91dGVyV2lkdGhXaXRoTWFyZ2luKGVsKSB7XHJcbiAgbGV0IF93aWR0aCA9IGVsLm9mZnNldFdpZHRoO1xyXG4gIGNvbnN0IHN0eWxlID0gZWwuY3VycmVudFN0eWxlIHx8IGdldENvbXB1dGVkU3R5bGUoZWwpO1xyXG5cclxuICBfd2lkdGggKz0gKHBhcnNlSW50KHN0eWxlLm1hcmdpbkxlZnQsIDEwKSB8fCAwKSArIChwYXJzZUludChzdHlsZS5tYXJnaW5SaWdodCwgMTApIHx8IDApO1xyXG4gIHJldHVybiBfd2lkdGg7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvdXRlckhlaWdodFdpdGhNYXJnaW4oZWwpIHtcclxuICBsZXQgX2hlaWdodCA9IGVsLm9mZnNldEhlaWdodDtcclxuICBjb25zdCBzdHlsZSA9IGVsLmN1cnJlbnRTdHlsZSB8fCBnZXRDb21wdXRlZFN0eWxlKGVsKTtcclxuXHJcbiAgX2hlaWdodCArPSAocGFyc2VJbnQoc3R5bGUubWFyZ2luTGVmdCwgMTApIHx8IDApICsgKHBhcnNlSW50KHN0eWxlLm1hcmdpblJpZ2h0LCAxMCkgfHwgMCk7XHJcbiAgcmV0dXJuIF9oZWlnaHQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGhhc0NsYXNzKGVsQ2xhc3NOYW1lLCBjbGFzc05hbWUpIHtcclxuICByZXR1cm4gKGAgJHtlbENsYXNzTmFtZX0gYCkucmVwbGFjZSgvW1xcblxcdF0vZywgJyAnKS5pbmRleE9mKGAgJHtjbGFzc05hbWV9IGApID4gLTE7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBjbG9zZXN0KGVsLCBjbGFzc05hbWUpIHtcclxuICBjbGFzc05hbWUgPSBjbGFzc05hbWUucmVwbGFjZSgvXltcXGJcXC5dLywgJycpO1xyXG5cclxuICBjb25zdCBmaW5kZXIgPSAoX2VsLCBfY2xhc3NOYW1lKSA9PiB7XHJcbiAgICBjb25zdCBfZWxDbGFzc05hbWUgPSB0eXBlb2YgX2VsLmNsYXNzTmFtZSA9PT0gJ29iamVjdCcgP1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgX2VsLmNsYXNzTmFtZS5iYXNlVmFsIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgIF9lbC5jbGFzc05hbWU7XHJcbiAgICBpZiAoX2VsQ2xhc3NOYW1lICYmIGhhc0NsYXNzKF9lbENsYXNzTmFtZSwgX2NsYXNzTmFtZSkpIHtcclxuICAgICAgcmV0dXJuIF9lbDtcclxuICAgIH0gZWxzZSBpZiAoX2VsLnBhcmVudE5vZGUgPT09IG51bGwpIHtcclxuICAgICAgLy8gbWF0Y2hlcyBkb2N1bWVudFxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gZmluZGVyKF9lbC5wYXJlbnROb2RlLCBfY2xhc3NOYW1lKTtcclxuICB9O1xyXG5cclxuICByZXR1cm4gZmluZGVyKGVsLCBjbGFzc05hbWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gYXNzaWduKHRhcmdldCkge1xyXG4gIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwpIHtcclxuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IGZpcnN0IGFyZ3VtZW50IHRvIG9iamVjdCcpO1xyXG4gIH1cclxuXHJcbiAgY29uc3QgdG8gPSBPYmplY3QodGFyZ2V0KTtcclxuICBmb3IgKGxldCBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgY29uc3QgbmV4dFNvdXJjZSA9IGFyZ3VtZW50c1tpXTtcclxuICAgIGlmIChuZXh0U291cmNlID09PSB1bmRlZmluZWQgfHwgbmV4dFNvdXJjZSA9PT0gbnVsbCkge1xyXG4gICAgICBjb250aW51ZTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBrZXlzQXJyYXkgPSBPYmplY3Qua2V5cyhPYmplY3QobmV4dFNvdXJjZSkpO1xyXG4gICAgZm9yIChsZXQgbmV4dEluZGV4ID0gMCwgbGVuID0ga2V5c0FycmF5Lmxlbmd0aDsgbmV4dEluZGV4IDwgbGVuOyBuZXh0SW5kZXgrKykge1xyXG4gICAgICBjb25zdCBuZXh0S2V5ID0ga2V5c0FycmF5W25leHRJbmRleF07XHJcbiAgICAgIGNvbnN0IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKG5leHRTb3VyY2UsIG5leHRLZXkpO1xyXG4gICAgICBpZiAoZGVzYyAhPT0gdW5kZWZpbmVkICYmIGRlc2MuZW51bWVyYWJsZSkge1xyXG4gICAgICAgIHRvW25leHRLZXldID0gbmV4dFNvdXJjZVtuZXh0S2V5XTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gdG87XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXQoc2VsZWN0b3IpIHtcclxuICByZXR1cm4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBmaW5kTW9zdE9mdGVuKGFycikge1xyXG4gIGNvbnN0IG9iaiA9IHt9O1xyXG4gIGFyci5mb3JFYWNoKGkgPT4ge1xyXG4gICAgb2JqW2ldID0gb2JqW2ldID8gb2JqW2ldICsgMSA6IDE7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiBPYmplY3Qua2V5cyhvYmopLnNvcnQoKGEsIGIpID0+IChvYmpbYl0gLSBvYmpbYV0pKVswXTtcclxufVxyXG5cblxuXG4vKiogV0VCUEFDSyBGT09URVIgKipcbiAqKiAuL3NyYy91dGlscy5qc1xuICoqLyIsImltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XHJcbmltcG9ydCBQcm9wVHlwZXMgZnJvbSAncHJvcC10eXBlcyc7XHJcbmltcG9ydCBSZWFjdERPTSBmcm9tICdyZWFjdC1kb20nO1xyXG5pbXBvcnQgeyBvbiwgcG9zaXRpb24sIGNsb3Nlc3QsIHdpZHRoLCBoZWlnaHQsIGlzRnVuY3Rpb24sXHJcbiAgICAgICAgb3V0ZXJXaWR0aFdpdGhNYXJnaW4sIG91dGVySGVpZ2h0V2l0aE1hcmdpbiB9IGZyb20gJy4vdXRpbHMnO1xyXG5cclxuZnVuY3Rpb24gaGFuZGxlU29ydGFibGVJdGVtUmVhZHlUb01vdmUoZSkge1xyXG4gIC8vIGlmIHNvcnQgaGFuZGxlIGlzIGRlZmluZWQgdGhlbiBvbmx5IGhhbmRsZSBzb3J0IGlmIHRoZSB0YXJnZXQgbWF0Y2hlcyB0aGUgc29ydCBoYW5kbGVcclxuICBpZiAodGhpcy5wcm9wcy5zb3J0SGFuZGxlICYmIGNsb3Nlc3QoZS50YXJnZXQgfHwgZS5zcmNFbGVtZW50LCB0aGlzLnByb3BzLnNvcnRIYW5kbGUpID09PSBudWxsKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICBjb25zdCB0YXJnZXQgPSBjbG9zZXN0KChlLnRhcmdldCB8fCBlLnNyY0VsZW1lbnQpLCAnLnVpLXNvcnRhYmxlLWl0ZW0nKTtcclxuICBjb25zdCBldnQgPSB7XHJcbiAgICBwYWdlWDogKGUucGFnZVggfHwgZS5jbGllbnRYIHx8IGUudG91Y2hlc1swXS5wYWdlWCksXHJcbiAgICBwYWdlWTogKGUucGFnZVkgfHwgZS5jbGllbnRZIHx8IGUudG91Y2hlc1swXS5wYWdlWSksXHJcbiAgICBvZmZzZXQ6IHBvc2l0aW9uKHRhcmdldClcclxuICB9O1xyXG5cclxuICBpZiAodGhpcy5wcm9wcy5vblNvcnRhYmxlSXRlbVJlYWR5VG9Nb3ZlKSB7XHJcbiAgICB0aGlzLnByb3BzLm9uU29ydGFibGVJdGVtUmVhZHlUb01vdmUoZXZ0LCB0aGlzLnByb3BzLnNvcnRhYmxlSW5kZXgpO1xyXG4gIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaGFuZGxlQ29tcG9uZW50RGlkTW91bnQoKSB7XHJcbiAgY29uc3Qgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xyXG5cclxuICAvLyBQcmV2ZW50IG9kZCBiZWhhdmlvdXIgaW4gbGVnYWN5IElFIHdoZW4gZHJhZ2dpbmdcclxuICBpZiAod2luZG93LmF0dGFjaEV2ZW50ICYmICFkb2N1bWVudC5ib2R5LnN0eWxlWyctbXMtdXNlci1zZWxlY3QnXSkge1xyXG4gICAgb24obm9kZSwgJ3NlbGVjdHN0YXJ0JywgKGUpID0+IHtcclxuICAgICAgaWYgKGUucHJldmVudERlZmF1bHQpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZS5yZXR1cm5WYWx1ZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGlmIChpc0Z1bmN0aW9uKHRoaXMucHJvcHMub25Tb3J0YWJsZUl0ZW1Nb3VudCkpIHtcclxuICAgIHRoaXMucHJvcHMub25Tb3J0YWJsZUl0ZW1Nb3VudChwb3NpdGlvbihub2RlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aChub2RlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWlnaHQobm9kZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJXaWR0aFdpdGhNYXJnaW4obm9kZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0ZXJIZWlnaHRXaXRoTWFyZ2luKG5vZGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucHJvcHMuc29ydGFibGVJbmRleCk7XHJcbiAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBoYW5kbGVDb21wb25lbnREaWRVcGRhdGUoKSB7XHJcbiAgY29uc3Qgbm9kZSA9IFJlYWN0RE9NLmZpbmRET01Ob2RlKHRoaXMpO1xyXG5cclxuICBpZiAoaXNGdW5jdGlvbih0aGlzLnByb3BzLm9uU29ydGFibGVJdGVtTW91bnQpKSB7XHJcbiAgICB0aGlzLnByb3BzLm9uU29ydGFibGVJdGVtTW91bnQocG9zaXRpb24obm9kZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2lkdGgobm9kZSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaGVpZ2h0KG5vZGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGVyV2lkdGhXaXRoTWFyZ2luKG5vZGUpLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dGVySGVpZ2h0V2l0aE1hcmdpbihub2RlKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnByb3BzLnNvcnRhYmxlSW5kZXgpO1xyXG4gIH1cclxufVxyXG5cclxuY29uc3QgX2RlZmF1bHRQcm9wcyA9IHtcclxuICBzb3J0YWJsZUNsYXNzTmFtZTogJycsXHJcbiAgc29ydGFibGVTdHlsZToge30sXHJcbiAgb25Tb3J0YWJsZUl0ZW1Nb3VudDogKCkgPT4ge30sXHJcbiAgb25Tb3J0YWJsZUl0ZW1SZWFkeVRvTW92ZTogKCkgPT4ge31cclxufTtcclxuXHJcbi8qKlxyXG4gKiBAY2xhc3MgQSBmYWN0b3J5IGZvciBnZW5lcmF0aW5nIGVpdGhlciBtaXhpbiBvciBIaWdoIE9yZGVyIENvbXBvbmVudFxyXG4gKiAgICAgICAgZGVwZW5kaW5nIGlmIHRoZXJlIGlzIGFuIGFyZ3VtZW50IHBhc3NlZCBpblxyXG4gKlxyXG4gKiBAcGFyYW0ge1JlYWN0fSBDb21wb25lbnQgQW4gb3B0aW5hbCBhcmd1bWVudCBmb3IgY3JlYXRpbmcgSE9DcywgbGVhdmUgaXRcclxuICogICAgICAgICAgICAgICAgYmxhbmsgaWYgeW91J2QgbGlrZSBvbGQgbWl4aW5cclxuICovXHJcbmV4cG9ydCBkZWZhdWx0IChDb21wb25lbnQpID0+IHtcclxuICBpZiAoQ29tcG9uZW50KSB7XHJcbiAgICByZXR1cm4gY2xhc3MgU29ydGFibGVJdGVtIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcclxuICAgICAgc3RhdGljIGRlZmF1bHRQcm9wcyA9IF9kZWZhdWx0UHJvcHM7XHJcblxyXG4gICAgICBzdGF0aWMgcHJvcFR5cGVzID0ge1xyXG4gICAgICAgIHNvcnRhYmxlQ2xhc3NOYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxyXG4gICAgICAgIHNvcnRhYmxlU3R5bGU6IFByb3BUeXBlcy5vYmplY3QsXHJcbiAgICAgICAgc29ydGFibGVJbmRleDogUHJvcFR5cGVzLm51bWJlcixcclxuICAgICAgICBzb3J0SGFuZGxlOiBQcm9wVHlwZXMuc3RyaW5nXHJcbiAgICAgIH07XHJcblxyXG4gICAgICBoYW5kbGVTb3J0YWJsZUl0ZW1SZWFkeVRvTW92ZShlKSB7XHJcbiAgICAgICAgaGFuZGxlU29ydGFibGVJdGVtUmVhZHlUb01vdmUuY2FsbCh0aGlzLCBlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29tcG9uZW50RGlkTW91bnQoKSB7XHJcbiAgICAgICAgaGFuZGxlQ29tcG9uZW50RGlkTW91bnQuY2FsbCh0aGlzKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29tcG9uZW50RGlkVXBkYXRlKCkge1xyXG4gICAgICAgIGhhbmRsZUNvbXBvbmVudERpZFVwZGF0ZS5jYWxsKHRoaXMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZW5kZXIoKSB7XHJcbiAgICAgICAgY29uc3QgeyBzb3J0YWJsZUNsYXNzTmFtZSwgc29ydGFibGVTdHlsZSwgc29ydGFibGVJbmRleCwgc29ydEhhbmRsZSwgY2xhc3NOYW1lLFxyXG4gICAgICAgICAgLi4ucmVzdCB9ID0gdGhpcy5wcm9wcztcclxuICAgICAgICByZXR1cm4gKFxyXG4gICAgICAgICAgPENvbXBvbmVudCB7Li4ucmVzdH1cclxuICAgICAgICAgICAgc29ydGFibGU9e3RydWV9XHJcbiAgICAgICAgICAgIGNsYXNzTmFtZT17c29ydGFibGVDbGFzc05hbWV9XHJcbiAgICAgICAgICAgIHN0eWxlPXtzb3J0YWJsZVN0eWxlfVxyXG4gICAgICAgICAgICBzb3J0SGFuZGxlPXtzb3J0SGFuZGxlfVxyXG4gICAgICAgICAgICBvbk1vdXNlRG93bj17Ojp0aGlzLmhhbmRsZVNvcnRhYmxlSXRlbVJlYWR5VG9Nb3ZlfVxyXG4gICAgICAgICAgICBvblRvdWNoU3RhcnQ9ezo6dGhpcy5oYW5kbGVTb3J0YWJsZUl0ZW1SZWFkeVRvTW92ZX1cclxuICAgICAgICAgIC8+XHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBwcm9wVHlwZXM6IHtcclxuICAgICAgc29ydGFibGVDbGFzc05hbWU6IFByb3BUeXBlcy5zdHJpbmcsXHJcbiAgICAgIHNvcnRhYmxlU3R5bGU6IFByb3BUeXBlcy5vYmplY3QsXHJcbiAgICAgIHNvcnRhYmxlSW5kZXg6IFByb3BUeXBlcy5udW1iZXIsXHJcbiAgICAgIHNvcnRIYW5kbGU6IFByb3BUeXBlcy5zdHJpbmdcclxuICAgIH0sXHJcblxyXG4gICAgZ2V0RGVmYXVsdFByb3BzKCkge1xyXG4gICAgICByZXR1cm4gX2RlZmF1bHRQcm9wcztcclxuICAgIH0sXHJcblxyXG4gICAgaGFuZGxlU29ydGFibGVJdGVtUmVhZHlUb01vdmUsXHJcblxyXG4gICAgY29tcG9uZW50RGlkTW91bnQ6IGhhbmRsZUNvbXBvbmVudERpZE1vdW50LFxyXG5cclxuICAgIGNvbXBvbmVudERpZFVwZGF0ZTogaGFuZGxlQ29tcG9uZW50RGlkVXBkYXRlLFxyXG5cclxuICAgIHJlbmRlcldpdGhTb3J0YWJsZShpdGVtKSB7XHJcbiAgICAgIHJldHVybiBSZWFjdC5jbG9uZUVsZW1lbnQoaXRlbSwge1xyXG4gICAgICAgIGNsYXNzTmFtZTogdGhpcy5wcm9wcy5zb3J0YWJsZUNsYXNzTmFtZSxcclxuICAgICAgICBzdHlsZTogdGhpcy5wcm9wcy5zb3J0YWJsZVN0eWxlLFxyXG4gICAgICAgIHNvcnRIYW5kbGU6IHRoaXMucHJvcHMuc29ydEhhbmRsZSxcclxuICAgICAgICBvbk1vdXNlRG93bjogdGhpcy5oYW5kbGVTb3J0YWJsZUl0ZW1SZWFkeVRvTW92ZSxcclxuICAgICAgICBvblRvdWNoU3RhcnQ6IHRoaXMuaGFuZGxlU29ydGFibGVJdGVtUmVhZHlUb01vdmVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufTtcclxuXG5cblxuLyoqIFdFQlBBQ0sgRk9PVEVSICoqXG4gKiogLi9zcmMvU29ydGFibGVJdGVtTWl4aW4uanNcbiAqKi8iXSwic291cmNlUm9vdCI6IiJ9