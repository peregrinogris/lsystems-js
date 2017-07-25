import Tortuga from 'tortuga-js';
import LSystem, { createVisitor } from '../lsystems';

const renderSystemProgression =
(system, target, x, y, length, angle = 60, iterations = 4) => {
  const turtle = new Tortuga(target, x, y, length);
  const visitor = Object.assign(createVisitor(turtle, length, angle), {
    Module: (node, lengthModifier = 1) => {
      if (node.name === 'A') {
        turtle.color('green');
      } else {
        turtle.color('red');
      }
      // All modules are interpreted as Forward
      turtle.forward(length * lengthModifier);
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

const renderSystem = (system, target, x, y, length, angle, iterations) => {
  const turtle = new Tortuga(target, x, y, length);
  const visitor = Object.assign(createVisitor(turtle, length, angle), {
    Module: (node, lengthModifier = 1) => {
      if (node.name === 'F') {
        turtle.forward(length * lengthModifier);
      }
    },
  });

  for (let i = 0; i < iterations; i += 1) {
    system.iterate();
  }

  system.walk(visitor);
  turtle.drawPath();
};

const acropetal = new LSystem({
  productions: {
    'B<A': () => 'B',
  },
  axiom: 'B[+A]A[-A]A[+A]A',
  ignores: ['+', '-'],
});

const basipetal = new LSystem({
  productions: {
    'A>B': () => 'B',
  },
  axiom: 'A[+A]A[-A]A[+A]B',
  ignores: ['+', '-'],
});

const plantLike = new LSystem({
  productions: {
    // A
    // 'A<A>A': () => 'A',
    // 'A<A>B': () => 'B[+FBFB]',
    // 'A<B>A': () => 'B',
    // 'A<B>B': () => 'B',
    // 'B<A>A': () => 'A',
    // 'B<A>B': () => 'BFB',
    // 'B<B>A': () => 'A',
    // 'B<B>B': () => 'A',

    // B
    'A<A>A': () => 'B',
    'A<A>B': () => 'B[-FBFB]',
    'A<B>A': () => 'B',
    'A<B>B': () => 'B',
    'B<A>A': () => 'A',
    'B<A>B': () => 'BFB',
    'B<B>A': () => 'B',
    'B<B>B': () => 'A',

    // E
    // 'A<A>A': () => 'A',
    // 'A<A>B': () => 'B[-FBFB]',
    // 'A<B>A': () => 'B',
    // 'A<B>B': () => 'B',
    // 'B<A>A': () => 'A',
    // 'B<A>B': () => 'BFB',
    // 'B<B>A': () => 'B',
    // 'B<B>B': () => 'A',

    '+': () => '-',
    '-': () => '+',
  },
  axiom: 'FBFBFB',
  ignores: ['+', '-', 'F'],
});

const render = () => {
  renderSystemProgression(acropetal, '#tortuga-acropetal', -150, -80, 40);
  renderSystemProgression(basipetal, '#tortuga-basipetal', -150, -80, 40);
  renderSystem(plantLike, '#tortuga-plant-like', 0, -230, 9, 22.5, 29);
};

export {
  render as default,
};
