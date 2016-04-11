import React from 'react';
import ReactDOM from 'react-dom';
import { on, position, closest, width, height, isFunction,
        outerWidthWithMargin, outerHeightWithMargin } from './utils';

function handleSortableItemReadyToMove(e) {
  // if sort handle is defined then only handle sort if the target matches the sort handle
  if (this.props.sortHandleClass &&
      e.target.className.indexOf(this.props.sortHandleClass) === -1) {
    return;
  }

  const target = closest((e.target || e.srcElement), '.ui-sortable-item');
  const evt = {
    pageX: (e.pageX || e.clientX || e.touches[0].pageX),
    pageY: (e.pageY || e.clientY || e.touches[0].pageY),
    offset: position(target)
  };

  if (this.props.onSortableItemReadyToMove) {
    this.props.onSortableItemReadyToMove(evt, this.props.sortableIndex);
  }
}

function handleComponentDidMount() {
  const node = ReactDOM.findDOMNode(this);

  on(node, 'selectstart', (e) => {
    if (e.preventDefault) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  });

  if (isFunction(this.props.onSortableItemMount)) {
    this.props.onSortableItemMount(position(node),
                                   width(node),
                                   height(node),
                                   outerWidthWithMargin(node),
                                   outerHeightWithMargin(node),
                                   this.props.sortableIndex);
  }
}

function handleComponentDidUpdate() {
  const node = ReactDOM.findDOMNode(this);

  if (isFunction(this.props.onSortableItemMount)) {
    this.props.onSortableItemMount(position(node),
                                   width(node),
                                   height(node),
                                   outerWidthWithMargin(node),
                                   outerHeightWithMargin(node),
                                   this.props.sortableIndex);
  }
}

const _defaultProps = {
  sortableClassName: '',
  sortableStyle: {},
  onSortableItemMount: () => {},
  onSortableItemReadyToMove: () => {}
};

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
      static defaultProps = _defaultProps;

      handleSortableItemReadyToMove(e) {
        handleSortableItemReadyToMove.call(this, e);
      }

      componentDidMount() {
        handleComponentDidMount.call(this);
      }

      componentDidUpdate() {
        handleComponentDidUpdate.call(this);
      }

      render() {
        const { sortableClassName, sortableStyle, sortableIndex, ...rest } = this.props;
        return (
          <Component {...rest} className={sortableClassName}
            style={sortableStyle} key={sortableIndex}
            onMouseDown={::this.handleSortableItemReadyToMove}
            onTouchStart={::this.handleSortableItemReadyToMove}
          />
        );
      }
    };
  }

  return {
    getDefaultProps() {
      return _defaultProps;
    },

    handleSortableItemReadyToMove,

    componentDidMount: handleComponentDidMount,

    componentDidUpdate: handleComponentDidUpdate,

    renderWithSortable(item) {
      return React.cloneElement(item, {
        className: `${this.props.sortableClassName} ${item.props.className}`,
        style: this.props.sortableStyle,
        key: this.props.sortableIndex,
        onMouseDown: this.handleSortableItemReadyToMove,
        onTouchStart: this.handleSortableItemReadyToMove
      });
    }
  };
};
