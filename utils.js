/**
 * @fileOverview jQuery replacement
 * @author jasonslyvia
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.on = on;
exports.off = off;
exports.isFunction = isFunction;
exports.isNumeric = isNumeric;
exports.position = position;
exports.offset = offset;
exports.width = width;
exports.height = height;
exports.outerWidthWithMargin = outerWidthWithMargin;
exports.outerHeightWithMargin = outerHeightWithMargin;
exports.closest = closest;
exports.assign = assign;
exports.get = get;

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

function offset(el) {
  if (!el) {
    return {
      left: 0,
      top: 0
    };
  }

  var rect = el.getBoundingClientRect();
  return {
    top: rect.top + document.body.scrollTop,
    left: rect.left + document.body.scrollLeft
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

  _width += (parseInt(style.marginLeft) || 0) + (parseInt(style.marginRight) || 0);
  return _width;
}

function outerHeightWithMargin(el) {
  var _height = el.offsetHeight;
  var style = el.currentStyle || getComputedStyle(el);

  _height += (parseInt(style.marginLeft) || 0) + (parseInt(style.marginRight) || 0);
  return _height;
}

function closest(el, className) {
  className = className.replace(/^[\b\.]/, '');
  var reg = new RegExp('\\b' + className + '\\b');

  var finder = function finder(_x, _x2) {
    var _again = true;

    _function: while (_again) {
      var _el = _x,
          _className = _x2;
      _again = false;

      if (_el.className && _el.className.match(reg)) {
        return _el;
      }
      // matches document
      else if (_el.parentNode === null) {
          return null;
        } else {
          _x = _el.parentNode;
          _x2 = _className;
          _again = true;
          continue _function;
        }
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
