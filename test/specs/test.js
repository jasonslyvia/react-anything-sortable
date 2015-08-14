/*eslint no-unused-expressions:0 */
'use strict';

import React from 'react/addons';
import Sortable, {SortableItemMixin} from '../../src/index';
import DemoItem from '../../demo/DemoItem';
import triggerEvent from '../triggerEvent';
import spies from 'chai-spies';
import {moveX, moveY} from '../mouseMove';

chai.use(spies);


//Delay karma test execution
window.__karma__.loaded = () => {};

function injectCSS() {
  var link = document.createElement('link');
  link.href = 'base/demo/style.css';
  link.type = 'text/css';
  link.rel = 'stylesheet';
  document.head.appendChild(link);

  link.onload = () => {
    window.__karma__.start();
  };
}

injectCSS();


const expect = chai.expect;


describe('Sortable', () => {
  describe('Default scenario', () => {
    beforeEach(() => {
      React.render(<Sortable />, document.body);
    });

    afterEach(() => {
      React.unmountComponentAtNode(document.body);
    });

    it('should render properly without any child', () => {
      var node = document.querySelector('.ui-sortable');
      expect(node).to.exist;
    });
  });

  describe('Provide sortable children', () => {
    beforeEach(() => {
      React.render(
        <Sortable>
          <DemoItem sortData="1" />
          <DemoItem sortData="2" />
          <DemoItem sortData="3" />
        </Sortable>
      , document.body);
    });

    afterEach(() => {
      React.unmountComponentAtNode(document.body);
    });

    it('should render 3 children', () => {
      var children = document.querySelectorAll('.ui-sortable-item');
      expect(children.length).to.equal(3);
    });
  });

  describe('Provide sortable child', () => {
    beforeEach(() => {
      React.render(
        <Sortable>
          <DemoItem sortData="1" />
        </Sortable>
      , document.body);
    });

    afterEach(() => {
      React.unmountComponentAtNode(document.body);
    });

    it('should render 1 child', () => {
      var children = document.querySelectorAll('.ui-sortable-item');
      expect(children.length).to.equal(1);
    });
  });

  describe('Provide sortable children with nulls', () => {
    beforeEach(() => {

      React.render(
        <Sortable>
          {
            ['hello1', 'hello2', ''].map(function(name) {
              if (name) {
                return (<DemoItem sortData={name} />);
              }
              else {
                return null;
              }
            })
          }
        </Sortable>
      , document.body);
    });

    afterEach(() => {
      React.unmountComponentAtNode(document.body);
    });

    it('should render 2 children', () => {
      var children = document.querySelectorAll('.ui-sortable-item');
      expect(children.length).to.equal(2);
    });
  });

  describe('Dragging children', () => {
    var component, target;

    beforeEach(() => {
      component = React.render(
        <Sortable className="style-for-test">
          <DemoItem sortData="1" className="item-1">1</DemoItem>
          <DemoItem sortData="2" className="item-2">2</DemoItem>
          <DemoItem sortData="3" className="item-3">3</DemoItem>
        </Sortable>
      , document.body);
    });

    afterEach(() => {
      React.unmountComponentAtNode(document.body);
      component = null;
      target = null;
    });

    it('should add a dragging children', () => {
      target = document.querySelector('.ui-sortable-item');

      triggerEvent(target, 'mousedown', {
        clientX: 11,
        clientY: 11,
        offset: {
          left: 1,
          top: 1
        }
      });

      triggerEvent(target, 'mousemove');

      var children = component.getDOMNode().querySelectorAll('.ui-sortable-item');
      expect(children.length).to.equal(4);
    });


    it('should switch position when dragging from left to right', () => {
      target = document.querySelector('.ui-sortable-item');
      moveX(target, 25, 210);

      var children = component.getDOMNode().querySelectorAll('.ui-sortable-item');
      expect(children[children.length - 1].textContent).to.equal('1');
    });


    it('should switch position when dragging from right to left', () => {
      target = document.querySelector('.item-3');
      moveX(target, 210, 25);

      var children = component.getDOMNode().querySelectorAll('.ui-sortable-item');
      expect(children[0].textContent).to.equal('3');
    });

    it('should remove dragging children when mouseup', () => {
      target = document.querySelector('.ui-sortable-item');

      triggerEvent(target, 'mousedown', {
        clientX: 11,
        clientY: 11,
        offset: {
          left: 1,
          top: 1
        }
      });

      triggerEvent(target, 'mouseup', {
        clientX: 50,
        clientY: 10
      });

      var children = component.getDOMNode().querySelectorAll('.ui-sortable-item');
      expect(children.length).to.equal(3);
    });

    it('should NOT move item if there is no preceding mousedown event', () => {
      target = document.querySelector('.item-1');

      triggerEvent(target, 'mousedown', {
        clientX: 25,
        clientY: 11,
        offset: {
          left: 1,
          top: 1
        }
      });

      triggerEvent(target, 'mouseup', {
        clientX: 25,
        clientY: 11
      });

      triggerEvent(target, 'mousemove', {
        clientX: 26,
        clientY: 11
      });

      triggerEvent(target, 'mousemove', {
        clientX: 300,
        clientY: 20
      });

      target = document.querySelector('.ui-sortable-dragging');
      expect(target).to.not.exist;
    });
  });

  describe('Dragging children verically', () => {
    var component, target;

    beforeEach(() => {
      component = React.render(
        <Sortable className="style-for-test full-width">
          <DemoItem sortData="1" className="item-1">1</DemoItem>
          <DemoItem sortData="2" className="item-2">2</DemoItem>
          <DemoItem sortData="3" className="item-3">3</DemoItem>
        </Sortable>
      , document.body);
    });

    afterEach(() => {
      React.unmountComponentAtNode(document.body);
      component = null;
      target = null;
    });


    it('should switch position when dragging from up to down', () => {
      target = document.querySelector('.ui-sortable-item');

      moveY(target, 25, 180);

      var children = component.getDOMNode().querySelectorAll('.ui-sortable-item');
      expect(children[children.length - 1].textContent).to.equal('1');
    });


    it('should switch position when dragging from down to up', () => {
      target = document.querySelector('.item-3');
      moveY(target, 180, 25);

      var children = component.getDOMNode().querySelectorAll('.ui-sortable-item');
      expect(children[0].textContent).to.equal('3');
    });

  });

  describe('onSort Props', () => {
    var callback;

    beforeEach(() => {
      callback = chai.spy();

      React.render(
        <Sortable onSort={callback}>
          <DemoItem sortData="1" className="item-1">1</DemoItem>
          <DemoItem sortData="2" className="item-2">2</DemoItem>
          <DemoItem sortData="3" className="item-3">3</DemoItem>
        </Sortable>
      , document.body);
    });

    afterEach(() => {
      React.unmountComponentAtNode(document.body);
      callback = null;
    });

    it('should call onSort when a drag\'n\'drop finished', () => {
      var target = document.querySelector('.item-1');
      moveX(target, 25, 210);
      expect(callback).to.have.been.called.with(['2', '3', '1']);
    });

    it('should call onSort when a opposite drag\'n\'drop finished', () => {
      var target = document.querySelector('.item-3');
      moveX(target, 210, 25);
      expect(callback).to.have.been.called.with(['3', '1', '2']);
    });

    it('should call onSort anytime there is a mouseup fired', () => {
      var target = document.querySelector('.item-1');
      moveX(target, 25, 80);
      moveX(target, 80, 180);
      expect(callback).to.have.been.called.twice;
    });
  });
});

