const NEAR_PLANE = 10;
const VIEW_FACTOR = 500;

let GROUND_Y = 75; // used to be a constant lol
let groundYDest = GROUND_Y;

const camera = {x: 0, z: 0, rot: 0};
let cameraRotDest = 0;

let cameraDist = 200;
let cameraDistDest = cameraDist;

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
function intersect(pt1, pt2) {
  return {x: pt1.x + (NEAR_PLANE - pt1.z) / (pt2.z - pt1.z) * (pt2.x - pt1.x), z: NEAR_PLANE};
}
function getItem(arr, index) {
  const length = arr.length;
  return (index + length) % length;
}
function calculate3D(paths, objects, focusX, focusZ) {
  const sin = Math.sin(camera.rot),
  cos = Math.cos(camera.rot);

  camera.x = focusX - sin * cameraDist;
  camera.z = focusZ - cos * cameraDist;

  paths = paths.map(obj => {
    const points = [[obj.x, obj.z], [obj.x + obj.width, obj.z],
      [obj.x + obj.width, obj.z + obj.height], [obj.x, obj.z + obj.height]]
      .map(([x, z]) => transform(camera, x, z, sin, cos));
    for (let i = 0; i < points.length; i++) {
      const currentPt = points[i];
      if (currentPt.z < NEAR_PLANE) {
        for (let lastPt = currentPt; points.length;) {
          const pt = points[getItem(points, i - 1)];
          if (pt.z < NEAR_PLANE) {
            lastPt = pt;
            points.splice(getItem(points, i - 1), 1);
          } else {
            points.splice(i, 0, intersect(lastPt, pt));
            break;
          }
        }
        points.splice(i + 1, 1);
        for (let lastPt = currentPt; points.length;) {
          const pt = points[getItem(points, i + 1)];
          if (pt.z < NEAR_PLANE) {
            lastPt = pt;
            points.splice(getItem(points, i + 1), 1);
          } else {
            points.splice(getItem(points, i + 1), 0, intersect(lastPt, pt));
            break;
          }
        }
      }
    }
    if (points.length < 3) return;
    return points.map(({x, z}) => flatify(x, GROUND_Y, z));
  }).filter(obj => obj);
  objects = objects.map(obj => {
    const y = obj.y === undefined ? GROUND_Y : obj.y;
    const transformation = transform(camera, obj.x, obj.z, sin, cos);
    if (transformation.z >= NEAR_PLANE) {
      const coords = flatify(transformation.x, y, transformation.z);
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
