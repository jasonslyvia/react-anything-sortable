import spies from 'chai-spies';
import * as utils from '../../src/utils';
chai.use(spies);

describe('utils', () => {
  describe('assign', () => {
    it('should throw when parameter is null or undefined', () => {
      expect(utils.assign.bind(null, null)).to.throw('Cannot convert first argument to object');
      expect(utils.assign.bind(null)).to.throw('Cannot convert first argument to object');
    });

    it('should work when some arguments are null', () => {
      expect(utils.assign({a: 1}, null, {b: 2})).to.deep.equal({a: 1, b: 2});
    });
  });

  describe('closest', () => {
    it('should return null when no match found', () => {
      var div = document.createElement('div');
      div.className = 'parent';
      var child = document.createElement('div');
      div.className = 'child';
      div.appendChild(child);
      document.body.appendChild(div);

      expect(utils.closest(div, '.no-exist')).to.equal(null);
    });
  });

  describe('events', () => {
    const fakeCallBack = chai.spy();

    it('should call attachEvent when addEventListener does not exist', () => {
      document.addEventListener = null;
      var fakeAttachEvent = chai.spy();
      document.attachEvent = fakeAttachEvent;


      utils.on(document, 'click', fakeCallBack);
      expect(fakeAttachEvent).to.be.called.once;
    });


    it('should call detachEvent when removeEventListener does not exist', () => {
      document.removeEventListener = null;
      var fakeDetachEvent = chai.spy();
      document.detachEvent = fakeDetachEvent;

      utils.off(document, 'click', fakeCallBack);
      expect(fakeDetachEvent).to.be.called.once;
    });
  });
});
