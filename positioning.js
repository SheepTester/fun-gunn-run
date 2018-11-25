const NEAR_PLANE = 10;
const VIEW_FACTOR = 500;

const GROUND_Y = 50;

const camera = {x: 0, z: 0, rot: 0};

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
    y: y / z * VIEW_FACTOR,
    scale: 1 / z * VIEW_FACTOR
  };
}
function calculate3D(path, objects) {
  camera.rot += 0.01;

  const sin = Math.sin(camera.rot),
  cos = Math.cos(camera.rot);

  objects = objects.map(obj => {
    const transformation = transform(camera, obj.x, obj.z, sin, cos);
    if (transformation.z >= NEAR_PLANE) {
      const coords = flatify(transformation.x, GROUND_Y, transformation.z);
      coords.type = obj.type;
      coords.distance = transformation.z;
      return coords;
    } else {
      return;
    }
  }).filter(obj => obj).sort((a, b) => b.distance - a.distance);

  return {
    paths: [],
    objects: objects
  };
}
