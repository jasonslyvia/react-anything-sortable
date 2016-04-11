# react-anything-sortable [![Build Status](https://travis-ci.org/jasonslyvia/react-anything-sortable.svg)](https://travis-ci.org/jasonslyvia/react-anything-sortable) [![npm version](https://badge.fury.io/js/react-anything-sortable.svg)](http://badge.fury.io/js/react-anything-sortable) [![Coverage Status](https://coveralls.io/repos/jasonslyvia/react-anything-sortable/badge.svg?branch=master&service=github)](https://coveralls.io/github/jasonslyvia/react-anything-sortable?branch=master)

## Features

 - Sort any React element you like, images, composite components, etc.
 - No external dependencies but `React` itself
 - Touch event support
 - Thoroughly tested

## Quick Demo

[Live Demo](http://jasonslyvia.github.io/react-anything-sortable/demo/)

**Sort custom style children**

![react-anything-sortable](http://ww4.sinaimg.cn/large/831e9385gw1equswkpcfag209p02sgn5.gif)

**Sort images**

![react-anything-sortable](http://ww3.sinaimg.cn/mw690/831e9385gw1equstgvfmzg20a50360va.gif)

**Children with custom event handler**

![react-anything-sortable](http://ww4.sinaimg.cn/large/831e9385gw1eqy459cieqg20au02s0t4.gif)

## Installation

```
$ npm install --save react-anything-sortable

// UMD build is provided as well, but please do consider use modern module bundlers like webpack or browserify.
```

You have to add necessary styles for sortable working properly, if you're using bundle tools like webpack, just 

```javascript
import 'react-anything-sortable/sortable.css';
```

Or copy this css to your own style base.

## How to use

You can check the straight-forward demo by examining `demo` folder, or here's a brief example.

In `app.js`

````javascript
var ReactDOM = require('react-dom');
var Sortable = require('react-anything-sortable');
var SortableItem = require('./SortableItem');

ReactDOM.render(
<Sortable onSort={handleSort}>
  <SortableItem sortData="1" />
  <SortableItem sortData="2" />
</Sortable>
, document.body);
````

and in `SortableItem.js`

A modern usage would be

```javascript
import React from 'react';
import { sortable } from 'react-anything-sortable';

@sortable
class SortableItem extends React.Component {
  render() {
    return (
      <div {...this.props}>      // <-- make sure destructure props to your own item,
        your item                //     it contains required `className`s and
      </div>                     //     event handlers
    );
  }
};
```

Or if you favor the old fashion way

````javascript
var React = require('react');
var SortableItemMixin = require('react-anything-sortable').SortableItemMixin;

var SortableItem = React.createClass({
  mixins: [SortableItemMixin],

  render: function(){
    return this.renderWithSortable(  // <-- this.renderWithSortable call is essential
      <div>your item</div>
    );
  }
});
````

## Props

### onSort

Type: Function Default: () => {}

Being called with sorted data when a sort operation is finished.

**Arguments**

 1. sortedArray (*Array*) Sorted array consists of `sortData` plucked from each sortable item

### containment

Type: Bool Default: false

Constrain dragging area within sortable container.

### sortData

**Add this props to `SortableItem` rather than `Sortable` !**

Type: Any Default: undefined

Will be returned by `onSort` callback in the form of array.

## Sort Element Props
to further customize the behaviour you can pass in a sort handle class to the element being sorted. If the sort event target doesn't match this class it will not trigger any sorting action. 
This helps on mobile devices when elements may take up an entire row and the user needs space to scroll.
```
...
  <Sortable onSort={ this.handleSort } >
    <SortableItem sortHandleClass="sort-handle" >
  </Sortable>
...
```


## Notice

1. Specify your style for `Sortable` and `Sortable Items`, check `sortable.css`, **it is NOT optional!**
2. Don't forget the `this.renderWithSortable` call in `SortableItem`, or spread props to your component if using decorators.
3. Since we can't track any children modification in `Sortable`, you have to use `key` to force update `Sortable` when adding/removing children. Checkout [dynamic demo](http://jasonslyvia.github.io/react-anything-sortable/demo/#/dynamic) for more details.


## Scripts

```
$ npm run test
$ npm run watch
$ npm run build
$ npm run demo
$ npm run demo:watch
```


## Contributors

1. [stayradiated](https://github.com/stayradiated)
2. [vizath](https://github.com/vizath)
3. [zthomas](https://github.com/zthomas)
