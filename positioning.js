const NEAR_PLANE = 10;
const VIEW_FACTOR = 500;

const camera = {x: 0, z: -700, rot: 0};

function transform(camera, x, z, sin, cos) {
  const relX = x - camera.x,
  relZ = z - camera.z;
  return {
    x: relX * cos - relZ * sin,
    z: relZ * cos + relX * sin
  };
}
function flatify(x, y, z) {
  return {
    x: x / z * VIEW_FACTOR,
    y: y / z * VIEW_FACTOR
  };
}
function calculate3D(path, objects) {
  camera.rot += 0.1;

  const sin = Math.sin(camera.rot),
  cos = Math.cos(camera.rot);
}
