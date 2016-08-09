(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("react-dom"));
	else if(typeof define === 'function' && define.amd)
		define(["React", "ReactDOM"], factory);
	else if(typeof exports === 'object')
		exports["react-anything-sortable"] = factory(require("react"), require("react-dom"));
	else
		root["react-anything-sortable"] = factory(root["React"], root["ReactDOM"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

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

	var _reactDom = __webpack_require__(2);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _utils = __webpack_require__(3);

	var _SortableItemMixin = __webpack_require__(4);

	var _SortableItemMixin2 = _interopRequireDefault(_SortableItemMixin);

	var STACK_SIZE = 6;
	var getSortTarget = function getSortTarget(child) {
	  // `onSortableItemReadyToMove` only exist when using mixins or decorators
	  return child && child.props && _utils.isFunction(child.props.onSortableItemReadyToMove);
	};

	/**
	 * @class Sortable
	 */
	var Sortable = _react2['default'].createClass({
	  displayName: 'Sortable',

	  propTypes: {
	    /**
	     * callback fires after sort operation finish
	     * function (dataSet){
	     *   //dataSet sorted
	     * }
	     */
	    onSort: _react.PropTypes.func,
	    className: _react.PropTypes.string,
	    sortHandle: _react.PropTypes.string,
	    containment: _react.PropTypes.bool,
	    dynamic: _react.PropTypes.bool,
	    direction: _react.PropTypes.string,
	    children: _react.PropTypes.arrayOf(_react.PropTypes.node)
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

	      if (index === _this3._draggingIndex) {
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
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ },
/* 3 */
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
/* 4 */
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

	var _reactDom = __webpack_require__(2);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	var _utils = __webpack_require__(3);

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
	 *        depending if there is a argument passed in
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
	          sortableClassName: _react.PropTypes.string,
	          sortableStyle: _react.PropTypes.object,
	          sortableIndex: _react.PropTypes.number,
	          sortHandle: _react.PropTypes.string
	        },
	        enumerable: true
	      }]);

	      return SortableItem;
	    })(_react2['default'].Component);
	  }

	  return {
	    propTypes: {
	      sortableClassName: _react.PropTypes.string,
	      sortableStyle: _react.PropTypes.object,
	      sortableIndex: _react.PropTypes.number,
	      sortHandle: _react.PropTypes.string
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