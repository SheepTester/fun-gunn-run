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
