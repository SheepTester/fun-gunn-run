const keys = {
  jump: false,
  left: false,
  right: false,
  ducking: false
};

document.addEventListener('keydown', e => {
  switch (e.keyCode) {
    case 37:
    case 65:
      keys.left = true;
      break;
    case 38:
    case 87:
    case 32:
      keys.jump = true;
      break;
    case 39:
    case 68:
      keys.right = true;
      break;
    case 40:
    case 83:
      keys.ducking = true;
      break;
    case 27:
      keys.skip = true;
      if (currentBackMenu) currentBackMenu.click();
      break;
    case 49:
      speedyBtn.click();
      break;
    case 50:
      lifeBtn.click();
      break;
    case 51:
      resetBtn.click();
      break;
    case 13:
      if (currentPlayBtn) currentPlayBtn.click();
      break;
    default:
      keys[e.keyCode] = true;
  }
});
document.addEventListener('keyup', e => {
  switch (e.keyCode) {
    case 37:
    case 65:
      keys.left = false;
      break;
    case 38:
    case 87:
    case 32:
      keys.jump = false;
      break;
    case 39:
    case 68:
      keys.right = false;
      break;
    case 40:
    case 83:
      keys.ducking = false;
      break;
    case 27:
      keys.skip = false;
      break;
    default:
      keys[e.keyCode] = false;
  }
});
const CENTRE_RADIUS = 20;
const ranges = {
  right: [-3 * Math.PI / 8, 3 * Math.PI / 8],
  down: [Math.PI / 8, 7 * Math.PI / 8],
  top: [-7 * Math.PI / 8, -Math.PI / 8],
  left: [5 * Math.PI / 8, -5 * Math.PI / 8]
};
const CIRCLE_SIZE = -140;
function initTouch() {
  const touchCircle = document.getElementById('touch-circle');
  let initX, initY;
  document.addEventListener('touchstart', e => {
    if (e.changedTouches[0].identifier === 0) {
      touchCircle.style.display = 'block';
      initX = e.touches[0].clientX;
      initY = e.touches[0].clientY;
      touchCircle.style.transform = `translate(${initX}px, ${initY}px)`;
      touchCircle.style.backgroundPosition = '0 0';
    }
    if (mode === 'game' && e.target.tagName === 'DIV') e.preventDefault();
  }, {passive: false});
  document.addEventListener('touchmove', e => {
    if (e.touches[0]) {
      const diffX = e.touches[0].clientX - initX;
      const diffY = e.touches[0].clientY - initY;
      if (diffX * diffX + diffY * diffY > CENTRE_RADIUS * CENTRE_RADIUS) {
        const angle = Math.atan2(diffY, diffX);
        let position;
        const top = angle > ranges.top[0] && angle < ranges.top[1];
        const down = angle > ranges.down[0] && angle < ranges.down[1];
        const left = angle > ranges.left[0] || angle < ranges.left[1];
        const right = angle > ranges.right[0] && angle < ranges.right[1];
        if (left) {
          position = top ? [1, 1] : down ? [1, 2] : [0, 2];
        } else if (right) {
          position = top ? [1, 4] : down ? [1, 3] : [0, 4];
        } else {
          position = top ? [0, 1] : down ? [0, 3] : [0, 0];
        }
        keys.left = left, keys.jump = top, keys.right = right, keys.ducking = down;
        touchCircle.style.backgroundPosition = `${position[0] * CIRCLE_SIZE}px ${position[1] * CIRCLE_SIZE}px`;
      } else {
        keys.left = keys.jump = keys.right = keys.ducking = false;
        touchCircle.style.backgroundPosition = '0 0';
      }
    }
    if (mode === 'game' && e.target.tagName === 'DIV') e.preventDefault();
  }, {passive: false});
  document.addEventListener('touchend', e => {
    if (e.changedTouches[0].identifier === 0) {
      touchCircle.style.display = 'none';
      keys.left = keys.jump = keys.right = keys.ducking = false;
    }
    if (mode === 'game' && e.target.tagName === 'DIV') e.preventDefault();
  }, {passive: false});
}
