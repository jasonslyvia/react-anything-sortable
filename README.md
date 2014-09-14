## Description
`react-anything-sortable` is a ReactJS component that can sort anyother component passed as `this.props.children`. It is compatible with IE8 and all modern browsers.

## How to use
You can check the straight-forward demo by examining `index.jsx`, or here's a brief demo.

In `your_component.jsx`
````
var React = require('react');
var Sortable = require('react-anything-sortable/Sortable');
var YourSortableItem = require('./YourItem');

React.renderComponent(
<Sortable>
  <YourItem/>
  <YourItem/>
</Sortable>
, document.body);
````

and in `YourItem.jsx`
````
var React = require('react');
var SortableItemMixin = require('react-anything-sortable/SortableItemMixin');

var YourItem = React.createClass({
  mixins: [SortableItemMixin],
  render: function(){
    return this.renderWithSortable(
      <div>your item</div>
    );
  }
});
````

## Heads-up
1. specify your style for `Sortable` and `Sortable Items`, check `style.css`
2. don't forget the `this.renderWithSortable` call in `YourItem.jsx`
3. enjoy!
