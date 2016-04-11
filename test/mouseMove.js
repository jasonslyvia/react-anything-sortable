import triggerEvent from './triggerEvent';

export function moveX(target, src, to, y = 25, noMouseUp = false) {
  const delta = src > to ? -1 : 1;
  triggerEvent(target, 'mousedown', {
    clientX: src,
    clientY: y,
    offset: {
      left: 1,
      top: 1
    }
  });

  triggerEvent(target, 'mousemove', {
    clientX: src + delta,
    clientY: y
  });

  var dragging = document.querySelector('.ui-sortable-dragging');
  if (!dragging) {
    return;
  }

  triggerEvent(dragging, 'mousemove', {
    clientX: to,
    clientY: y
  });

  triggerEvent(dragging, 'mousemove', {
    clientX: to + delta,
    clientY: y
  });

  !noMouseUp && triggerEvent(target, 'mouseup', {
    clientX: to + delta,
    clientY: y
  });
}

export function moveY(target, src, to, x = 25, noMouseUp = false) {
  const delta = src > to ? -1 : 1;

  triggerEvent(target, 'mousedown', {
    clientX: x,
    clientY: src,
    offset: {
      left: 1,
      top: 1
    }
  });

  triggerEvent(target, 'mousemove', {
    clientY: src + (-delta),
    clientX: x
  });

  triggerEvent(target, 'mousemove', {
    clientY: src + (-delta),
    clientX: x
  });

  var dragging = document.querySelector('.ui-sortable-dragging');
  if (!dragging) {
    return;
  }

  triggerEvent(dragging, 'mousemove', {
    clientX: x,
    clientY: to
  });

  triggerEvent(dragging, 'mousemove', {
    clientX: x,
    clientY: to + delta
  });

  !noMouseUp && triggerEvent(target, 'mouseup', {
    clientX: x,
    clientY: to + delta
  });
}
