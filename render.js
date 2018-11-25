const path = []; // TEMP
const objects = [];

function paint() {
  const {path, objects} = calculate3D(path, objects);
  c.fillStyle = 'rgba(0,0,0,0.01)';
  c.fillRect(Math.sin(Date.now() / 70) * 50 + 75, Math.sin(Date.now() / 50) * 50 + 75, 100, 100);
}
