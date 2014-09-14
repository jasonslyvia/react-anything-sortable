# has-jsx-pragma [![Build Status](https://travis-ci.org/sindresorhus/has-jsx-pragma.svg?branch=master)](https://travis-ci.org/sindresorhus/has-jsx-pragma)

> Check if a string contains a [JSX pragma](http://facebook.github.io/react/docs/jsx-in-depth.html)


## Install

```sh
$ npm install --save has-jsx-pragma
```


## Usage

```js
var hasJsxPragma = require('has-jsx-pragma');

hasJsxPragma('/** @jsx React.DOM */\n\nvar unicorn = "rainbow";');
//=> true
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
