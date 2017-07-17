import Tortuga from 'tortuga-js';
import { parse, interpret } from '../lsystems';
import { iterate, nestAST } from '../lsystems/context';

// Helper
const makeTree = input => nestAST(parse(input).body).tree;

const acropetal = {
  productions: {
    A: [
      {
        al: 'B',
        ar: '',
        successor: () => 'B',
      },
    ],
  },
  axiom: 'B[+A]A[-A]A[+A]A',
  ignores: ['+', '-'],
};

const basipetal = {
  productions: {
    A: [
      {
        al: '',
        ar: makeTree('B'),
        successor: () => 'B',
      },
    ],
  },
  axiom: 'A[+A]A[-A]A[+A]B',
  ignores: ['+', '-'],
};

const renderSystem = (system, target, x, y, length) => {
  const iterations = 4;
  const stack = [];
  const angle = 60;
  const turtle = new Tortuga(target, x, y, length);

  let program = '';
  turtle.size(2);
  turtle.color('#b756a4');
  for (let i = 0; i < iterations; i += 1) {
    program = iterate(parse(program), system);
    interpret(parse(program), {
      PushState: function PushState() {
        stack.push([turtle.position, turtle.direction]);
        turtle.drawPath();
      },
      PopState: function PopState() {
        const state = stack.pop();
        turtle.drawPath();
        turtle.penUp();
        turtle.setXY(state[0][0], state[0][1]);
        turtle.setHeading(state[1]);
        turtle.penDown();
      },
      Module: function Module(node, params) {
        if (node.name === 'A') {
          turtle.color('green');
        } else {
          turtle.color('red');
        }
        // All modules are interpreted as Forward
        turtle.forward(params.length > 0 ? length * params[0] : length);
      },
      Rotation: function Rotation(node, params) {
        if (node.name === '+') {
          turtle.left(params.length ? params[0] : angle);
        } else {
          turtle.right(params.length ? params[0] : angle);
        }
      },
    });
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
