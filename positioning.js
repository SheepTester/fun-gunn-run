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
function calculate3D(paths, objects) {
  if (keys.left) camera.rot -= 0.05;
  if (keys.right) camera.rot += 0.05;

  const sin = Math.sin(camera.rot),
  cos = Math.cos(camera.rot);

  if (keys.jump) {
    camera.x += sin * 5;
    camera.z += cos * 5;
  }
  if (keys[40]) {
    camera.x -= sin * 5;
    camera.z -= cos * 5;
  }

  paths = paths.map(obj => {
    const points = [[obj.x, obj.z], [obj.x + obj.width, obj.z],
      [obj.x + obj.width, obj.z + obj.height], [obj.x, obj.z + obj.height]]
      .map(([x, z]) => transform(camera, x, z, sin, cos));
    if (points.find(({z}) => z < NEAR_PLANE))
      return;
    else
      return points.map(({x, z}) => flatify(x, GROUND_Y, z));
  }).filter(obj => obj);
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
    paths: paths,
    objects: objects
  };
}
