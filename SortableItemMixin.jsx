/**
 * @jsx React.DOM
 * @file react-anything-sortable mixin
 * @author jasonslyvia
 */
'use strict';

/**
 * @dependency
 */
var React = require('react');
var $ = require('jquery');

/**
 * @class SortableItemMixin
 */
var SortableItemMixin = {
  getDefaultProps: function(){
    return {
      sortableClassName: '',
      sortableStyle: {},
      onSortableItemMount: function(){},
      onSortableItemUnmount: function(){},
      onSortableItemMouseDown: function(){}
    }
  },

  handleSortableItemMouseDown: function(e){
    var self = this;

    var $target = $(e.target).closest('.ui-sortable-item');
    var evt = {
      pageX: e.pageX,
      pageY: e.pageY,
      offset: $target.position()
    };

    self.props.onSortableItemMouseDown(evt, self.props.sortableIndex);
  },

  componentDidMount: function(){
    var $node = $(this.getDOMNode());
    $node.on('selectstart', function(e){return false;});
    this.props.onSortableItemMount($node.position(), $node.outerWidth(true), $node.outerHeight(true), this.props.sortableIndex);
  },

  componentDidUpdate: function(){
    var $node = $(this.getDOMNode());
    this.props.onSortableItemMount($node.position(), $node.outerWidth(true), $node.outerHeight(true), this.props.sortableIndex);
  },

  renderWithSortable: function(item){
    return React.addons.cloneWithProps(item, {
      className: this.props.sortableClassName,
      style: this.props.sortableStyle,
      key: this.props.sortableIndex,
      onMouseDown: this.handleSortableItemMouseDown
    });
  }
};

module.exports = SortableItemMixin;
