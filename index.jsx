/**
 * @jsx React.DOM
 * @fileOverview demo of react-anything-sortable
 */
var React = require('react');
var Sortable = require('./Sortable.jsx');
var Item = require('./DemoItem.jsx');

React.render(
  <Sortable onSort={handleSort}>
    <Item className="item-1" sortData="chn">
      The People's Republic of China
    </Item>
    <Item className="item-2" sortData="zaf">
      South Africa
    </Item>
    <Item className="item-3" sortData="gbr">
      The United Kingdom Of Great Britain And Northern Ireland
    </Item>
  </Sortable>
, document.getElementById('react'));

function handleSort(data){
  document.getElementById('result').innerText = data.join(' ');
}
