# react-dom-pragma [![Build Status](https://travis-ci.org/sindresorhus/react-dom-pragma.svg?branch=master)](https://travis-ci.org/sindresorhus/react-dom-pragma)

> Prepend the [JSX React DOM pragma](http://facebook.github.io/react/docs/jsx-in-depth.html) to a string if doesn't already contain a pragma


## Install

```sh
$ npm install --save react-dom-pragma
```


## Usage

```js
var reactDomPragma = require('react-dom-pragma');

reactDomPragma('var unicorn = "rainbow";');
//=> '/** @jsx React.DOM */\nvar unicorn = "rainbow";'
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
