const keys = {
  jump: false,
  left: false,
  right: false
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
  }
});
