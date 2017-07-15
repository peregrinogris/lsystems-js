import Tortuga from 'tortuga-js';

function renderSystem([path, angle], target, x, y, length, rainbow) {
  const turtle = new Tortuga(target, x, y, length);
  const edges = (path.match(/F/g) || []).length;
  const stack = [];
  let currentEdge = 2;
  let state;

  for (let idx = 0; idx < path.length; idx += 1) {
    switch (path[idx]) {
      case 'F':
        turtle.forward(length);
        if (rainbow) {
          turtle.rainbow(currentEdge, edges);
        }
        currentEdge += 1;
        break;
      case '+':
        turtle.left(angle);
        break;
      case '-':
        turtle.right(angle);
        break;
      // State Push
      case '[':
        stack.push([turtle.position, turtle.direction]);
        turtle.drawPath();
        break;
      // State Pop
      case ']':
        state = stack.pop();
        turtle.drawPath();
        turtle.penUp();
        turtle.setXY(...state[0]);
        turtle.setHeading(state[1]);
        turtle.penDown();
        break;
      default:
        break;
    }
  }
  turtle.drawPath();
}

function quadKoch(iterations) {
  let w = 'F-F-F-F';
  const p = [/F/g, 'F-F+F+FF-F-F+F'];
  // var p = [/F/g, 'FF-F+F-F-FF'];
  for (let i = 0; i < iterations; i += 1) {
    w = w.replace(p[0], p[1]);
  }
  return [w, 90];
}

function snowflake(iterations) {
  let w = 'F++F++F';
  const p = [/F/g, 'F-F++F-F'];
  for (let i = 0; i < iterations; i += 1) {
    w = w.replace(p[0], p[1]);
  }
  return [w, 60];
}

function hexGosperCurve(iterations) {
  let w = 'A';
  const pa = [/A/g, 'A+B++B-A--AA-B+'];
  const pb = [/B/g, '-A+BB++B+A--A-B'];

  for (let i = 0; i < iterations; i += 1) {
    w = w.replace(pa[0], 'a');
    w = w.replace(pb[0], 'b');
    w = w.replace(/a/g, pa[1]);
    w = w.replace(/b/g, pb[1]);
  }
  w = w.replace(/[AB]/g, 'F');

  return [w, 60];
}

function tree(iterations) {
  let w = 'X';
  const pa = [/X/g, 'F-[[X]+X]+F[+FX]-X'];
  const pb = [/F/g, 'FF'];

  for (let i = 0; i < iterations; i += 1) {
    w = w.replace(pa[0], 'a');
    w = w.replace(pb[0], 'b');
    w = w.replace(/a/g, pa[1]);
    w = w.replace(/b/g, pb[1]);
  }
  w = w.replace(/[X]/g, 'F');

  return [w, 22.5];
}

const render = () => {
  renderSystem(hexGosperCurve(3), '#tortuga-hex-gosper', 200, 0, 20, true);
  renderSystem(snowflake(3), '#tortuga-snowflake', 120, -200, 14, true);
  renderSystem(quadKoch(2), '#tortuga-quad-koch', -100, -100, 15, false);
  renderSystem(tree(3), '#tortuga-tree', -50, -200, 20, false);
};
export default render;
