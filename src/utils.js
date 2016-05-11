/**
 * @fileOverview jQuery replacement
 * @author jasonslyvia
 */
export function on(el, eventName, callback) {
  if (el.addEventListener) {
    el.addEventListener(eventName, callback, false);
  } else if (el.attachEvent) {
    el.attachEvent(`on${eventName}`, (e) => {
      callback.call(el, e || window.event);
    });
  }
}

export function off(el, eventName, callback) {
  if (el.removeEventListener) {
    el.removeEventListener(eventName, callback);
  } else if (el.detachEvent) {
    el.detachEvent(`on${eventName}`, callback);
  }
}

export function isFunction(func) {
  return typeof func === 'function';
}

export function isNumeric(num) {
  return !isNaN(parseFloat(num)) && isFinite(num);
}

export function position(el) {
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

export function width(el) {
  return el.offsetWidth;
}

export function height(el) {
  return el.offsetHeight;
}

export function outerWidthWithMargin(el) {
  let _width = el.offsetWidth;
  const style = el.currentStyle || getComputedStyle(el);

  _width += (parseInt(style.marginLeft, 10) || 0) + (parseInt(style.marginRight, 10) || 0);
  return _width;
}

export function outerHeightWithMargin(el) {
  let _height = el.offsetHeight;
  const style = el.currentStyle || getComputedStyle(el);

  _height += (parseInt(style.marginLeft, 10) || 0) + (parseInt(style.marginRight, 10) || 0);
  return _height;
}

function hasClass(elClassName, className) {
  return (` ${elClassName} `).replace(/[\n\t]/g, ' ').indexOf(` ${className} `) > -1;
}

export function closest(el, className) {
  className = className.replace(/^[\b\.]/, '');

  const finder = (_el, _className) => {
    const _elClassName = typeof _el.className === 'object' ?
                         _el.className.baseVal :
                         _el.className;
    if (_elClassName && hasClass(_elClassName, _className)) {
      return _el;
    } else if (_el.parentNode === null) {
      // matches document
      return null;
    }

    return finder(_el.parentNode, _className);
  };

  return finder(el, className);
}

export function assign(target) {
  if (target === undefined || target === null) {
    throw new TypeError('Cannot convert first argument to object');
  }

  const to = Object(target);
  for (let i = 1; i < arguments.length; i++) {
    const nextSource = arguments[i];
    if (nextSource === undefined || nextSource === null) {
      continue;
    }

    const keysArray = Object.keys(Object(nextSource));
    for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
      const nextKey = keysArray[nextIndex];
      const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
      if (desc !== undefined && desc.enumerable) {
        to[nextKey] = nextSource[nextKey];
      }
    }
  }
  return to;
}

export function get(selector) {
  return document.querySelector(selector);
}

export function findMostOften(arr) {
  const obj = {};
  arr.forEach(i => {
    obj[i] = obj[i] ? obj[i] + 1 : 1;
  });

  return Object.keys(obj).sort((a, b) => (obj[b] - obj[a]))[0];
}
