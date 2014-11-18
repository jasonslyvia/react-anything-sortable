/**
 * @jsx React.DOM
 * since jest render components in Virtual DOM, we can't simulate events that
 * were listened by jQuery, so, guess this is the only test we could write
**/
jest.dontMock('../Sortable.jsx');
jest.dontMock('../DemoItem.jsx');

describe('Sortable', function(){
  var React, Sortable, DemoItem, TestUtils, sortable, $, onSortCallback;
  beforeEach(function(){
    React = require('react/addons');
    Sortable = require('../Sortable.jsx');
    DemoItem = require('../DemoItem.jsx');
    $ = require('jQuery');
    TestUtils = React.addons.TestUtils;

    onSortCallback = jest.genMockFn();
    sortable = TestUtils.renderIntoDocument(
      <Sortable onSort={onSortCallback}>
        <DemoItem sortData="1" className="demo-item target">demo1</DemoItem>
        <DemoItem sortData="2">demo2</DemoItem>
      </Sortable>
    );
  });

  it('should be mounted to DOM without error', function(){
    var children = TestUtils.scryRenderedComponentsWithType(sortable, DemoItem);
    expect(children.length).toBe(2);
  });
});
