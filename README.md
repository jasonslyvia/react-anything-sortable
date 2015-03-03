## Description
`react-anything-sortable` is a ReactJS component that can sort anyother component passed as `this.props.children`. It is compatible with IE8 and all modern browsers.

![react-anything-sortable](https://raw.githubusercontent.com/jasonslyvia/react-anything-sortable/master/demo.gif)

## How to use
You can check the straight-forward demo by examining `index.jsx`, or here's a brief demo.

In `your_component.jsx`
````
var React = require('react');
var Sortable = require('react-anything-sortable');
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
3. specify `sortData` in `YourItem.jsx` so that `Sortable` can return the sorted array
4. add `onSort` props to `Sortable` to be noticed when a sort operation finished
5. since we can't track any children modification in `Sortable`, you have to use `key` to force update `Sortable` when adding/removing children.

## Contributors

1. [stayradiated](https://github.com/stayradiated)
