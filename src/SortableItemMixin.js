import React from 'react';
import ReactDOM from 'react-dom';
import {on, position, closest, width, height, isFunction,
        outerWidthWithMargin, outerHeightWithMargin} from './utils';

/**
 * @class A factory for generating either mixin or High Order Component
 *        depending if there is a argument passed in
 *
 * @param {React} Component An optinal argument for creating HOCs, leave it
 *                blank if you'd like old mixin
 */
export default (Component) => {
  if (Component) {
    return class SortableItem extends React.Component {
      render() {
        return (
          <Component {...this.props} />
        );
      }
    }
  }

  return {
    renderWithSortable(item) {
      return React.cloneElement(item, this.props);
    }
  }
};
