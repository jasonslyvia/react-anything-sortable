import triggerEvent from './triggerEvent';

export function moveX(target, src, to) {
  const delta = src > to ? -1 : 1;
  triggerEvent(target, 'mousedown', {
    clientX: src,
    clientY: 25,
    offset: {
      left: 1,
      top: 1
    }
  });

  triggerEvent(target, 'mousemove', {
    clientX: src + delta,
    clientY: 25
  });

  var dragging = document.querySelector('.ui-sortable-dragging');
  triggerEvent(dragging, 'mousemove', {
    clientX: to,
    clientY: 25
  });

  triggerEvent(dragging, 'mousemove', {
    clientX: to + delta,
    clientY: 25
  });

  // triggerEvent(dragging, 'mousemove', {
  //   clientX: to - delta,
  //   clientY: 25
  // });

  triggerEvent(target, 'mouseup', {
    clientX: to + delta,
    clientY: 25
  });
}

export function moveY(target, src, to) {
  const delta = src > to ? -1 : 1;

  triggerEvent(target, 'mousedown', {
    clientX: 25,
    clientY: src,
    offset: {
      left: 1,
      top: 1
    }
  });

  triggerEvent(target, 'mousemove', {
    clientY: src + (-delta),
    clientX: 25
  });

  var dragging = document.querySelector('.ui-sortable-dragging');
  triggerEvent(dragging, 'mousemove', {
    clientX: 25,
    clientY: to
  });

  triggerEvent(dragging, 'mousemove', {
    clientX: 25,
    clientY: to + delta
  });

  triggerEvent(target, 'mouseup', {
    clientX: 25,
    clientY: to + delta
  });
}
