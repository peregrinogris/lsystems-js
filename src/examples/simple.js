import Tortuga from 'tortuga-js';
import LSystem, { createVisitor } from '../lsystems';

const renderSystem =
(system, angle, iterations, target, x, y, length, rainbow) => {
  for (let i = 0; i < iterations; i += 1) {
    system.iterate();
  }

  const turtle = new Tortuga(target, x, y, length);
  const visitor = createVisitor(turtle, length, angle);

  if (rainbow) {
    const edges = system.ast.body.reduce(
      (acc, cur) => (cur.type === 'Module' ? acc + 1 : acc),
      0,
    );
    let currentEdge = 2;
    visitor.Module = (node, params) => {
      turtle.rainbow(currentEdge, edges);
      currentEdge += 1;
      // All modules are interpreted as Forward
      turtle.forward(params.length > 0 ? length * params[0] : length);
    };
  }

  system.walk(visitor);
  turtle.drawPath();
};

const tree = new LSystem({
  productions: {
    X: () => 'F-[[X]+X]+F[+FX]-X',
    F: () => 'FF',
  },
  axiom: 'X',
});

const hexGosperCurve = new LSystem({
  productions: {
    A: () => 'A+B++B-A--AA-B+',
    B: () => '-A+BB++B+A--A-B',
  },
  axiom: 'A',
});

const snowflake = new LSystem({
  productions: {
    F: () => 'F-F++F-F',
  },
  axiom: 'F++F++F',
});

const quadKoch = new LSystem({
  productions: {
    F: () => 'F-F+F+FF-F-F+F',
    // F: () => 'FF-F+F-F-FF',
  },
  axiom: 'F-F-F-F',
});

const render = () => {
  renderSystem(tree, 22.5, 3, '#tortuga-tree', -50, -200, 20, false);
  renderSystem(hexGosperCurve, 60, 3, '#tortuga-hex-gosper', 200, 0, 20, true);
  renderSystem(snowflake, 60, 3, '#tortuga-snowflake', 120, -200, 14, true);
  renderSystem(quadKoch, 90, 2, '#tortuga-quad-koch', -100, -100, 15, false);
};
export default render;
