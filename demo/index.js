/**
 * @fileOverview demo of react-anything-sortable
 */
'use strict';

import React from 'react/addons';
import Sortable from '../src/index.js';
import Item from './DemoItem.js';
import ImageItem from './ImageItem.js';

React.render(
  <Sortable onSort={handleSort}>
    <Item className="item-1" sortData="react" key={1}>
      React
    </Item>
    <Item className="item-2" sortData="angular" key={2}>
      Angular
    </Item>
    <Item className="item-3" sortData="backbone" key={3}>
      Backbone
    </Item>
  </Sortable>
, document.getElementById('react'));

function handleSort(data){
  document.getElementById('result').innerText = data.join(' ');
}

React.render(
  <Sortable onSort={handleSort1}>
    <ImageItem src="http://ww4.sinaimg.cn/large/831e9385gw1equsc4s1hbj207y02xmx9.jpg"
               className="img-1" sortData="react" />
    <ImageItem src="http://ww4.sinaimg.cn/large/831e9385gw1equsc3q8lej20fz04waa8.jpg"
               className="img-2" sortData="angular" />
    <ImageItem src="http://ww4.sinaimg.cn/large/831e9385gw1equsc46m7zj20ff02zq3h.jpg"
               className="img-3" sortData="backbone" />
  </Sortable>
, document.getElementById('react1'));

function handleSort1(data){
  document.getElementById('result1').innerText = data.join(' ');
}

