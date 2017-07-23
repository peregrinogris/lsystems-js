import Tortuga from 'tortuga-js';
import LSystem, { createVisitor } from '../lsystems';

const acropetal = new LSystem({
  productions: [{
    left: 'B',
    predecessor: 'A',
    successor: () => 'B',
  }],
  axiom: 'B[+A]A[-A]A[+A]A',
  ignores: ['+', '-'],
});

const basipetal = new LSystem({
  productions: [{
    predecessor: 'A',
    right: 'B',
    successor: () => 'B',
  }],
  axiom: 'A[+A]A[-A]A[+A]B',
  ignores: ['+', '-'],
});

const renderSystem = (system, target, x, y, length) => {
  const iterations = 4;
  const angle = 60;
  const turtle = new Tortuga(target, x, y, length);
  const visitor = Object.assign(createVisitor(turtle, length, angle), {
    Module: function Module(node, params) {
      if (node.name === 'A') {
        turtle.color('green');
      } else {
        turtle.color('red');
      }
      // All modules are interpreted as Forward
      turtle.forward(params.length > 0 ? length * params[0] : length);
    },
  });

  turtle.size(2);
  turtle.color('#b756a4');
  for (let i = 0; i < iterations; i += 1) {
    system.iterate();
    system.walk(visitor);
    turtle.drawPath();

    // Reset and move to the right
    turtle.setHeading(90);
    turtle.penUp();
    turtle.forward(100);
    turtle.right(90);
    turtle.forward(length * 4);
    turtle.setHeading(0);
    turtle.penDown();
  }
};

const render = () => {
  renderSystem(acropetal, '#tortuga-acropetal', -150, -80, 40);
  renderSystem(basipetal, '#tortuga-basipetal', -150, -80, 40);
};

export {
  acropetal,
  basipetal,
  render as default,
};
