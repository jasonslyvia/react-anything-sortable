/**
 * @jsx React.DOM
 */
var React = require('react');
var SortableItemMixin = require('./SortableItemMixin.jsx');

var DemoItem = React.createClass({
  mixins: [SortableItemMixin],
  getDefaultProps: function(){
    return {
      className: 'demo-item'
    }
  },
  render: function(){
    return this.renderWithSortable(
      <div className={this.props.className}>
        {this.props.children}
      </div>
    );
  }
});

module.exports = DemoItem;
