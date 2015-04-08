`react-anything-sortable` is a ReactJS component that can sort any component passed as `this.props.children`. It is compatible with IE8 and all modern browsers.

It has no external dependencies but `React` itself.

[![Build Status](https://travis-ci.org/jasonslyvia/react-anything-sortable.svg)](https://travis-ci.org/jasonslyvia/react-anything-sortable)
[![npm version](https://badge.fury.io/js/react-anything-sortable.svg)](http://badge.fury.io/js/react-anything-sortable)
[![Bower version](https://badge.fury.io/bo/react-anything-sortable.svg)](http://badge.fury.io/bo/react-anything-sortable)

## Quick Demo

**Sort custom style children**

![react-anything-sortable](http://ww4.sinaimg.cn/large/831e9385gw1equswkpcfag209p02sgn5.gif)

**Sort images**

![react-anything-sortable](http://ww3.sinaimg.cn/mw690/831e9385gw1equstgvfmzg20a50360va.gif)

**Children with custom event handler**
![react-anything-sortable](http://ww4.sinaimg.cn/large/831e9385gw1eqy459cieqg20au02s0t4.gif)

## Installation

```
$ npm install --save react-anything-sortable
// or use bower
$ bower install --save react-anything-sortable
```

## How to use

You can check the straight-forward demo by examining `demo` folder, or here's a brief example.

In `YourComponent.jsx`

````
var React = require('react');
var Sortable = require('react-anything-sortable');
var YourSortableItem = require('./YourItem');

React.renderComponent(
<Sortable onSort={handleSort}>
  <YourItem sortData="1" />
  <YourItem sortData="2" />
</Sortable>
, document.body);
````

and in `YourItem.jsx`

**Notice: There's a breaking change in requring `SortableItemMixin` in version 0.2.0**

````
var React = require('react');
var SortableItemMixin = require('react-anything-sortable').SortableItemMixin;

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

1. Specify your style for `Sortable` and `Sortable Items`, check `demo/style.css`, **it is NOT optional!**
2. Don't forget the `this.renderWithSortable` call in `YourItem.jsx`
3. Specify `sortData` in `YourItem.jsx` so that `Sortable` can return the sorted array
4. Add `onSort` props to `Sortable` to be noticed when a sort operation finished
5. Since we can't track any children modification in `Sortable`, you have to use `key` to force update `Sortable` when adding/removing children.


## Tests

`$ npm run test`


## Contributors

1. [stayradiated](https://github.com/stayradiated)
