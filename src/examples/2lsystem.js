import Tortuga from 'tortuga-js';
import { parse, interpret } from '../lsystems';
import { iterate, nestAST } from '../lsystems/context';

// Helper
const makeTree = input => nestAST(parse(input).body).tree;

class LSystem {
  constructor(system = {}) {
    this.system = system;
    this.setProgram('');
  }
  setProgram(program) {
    this.program = program;
    this.ast = parse(this.program);
  }
  iterate() {
    this.program = iterate(this.ast, this.system);
    this.ast = parse(this.program);
  }
  walk(visitor) {
    interpret(this.ast, visitor);
  }
}

const createVisitor = (turtle, length, angle) => {
  const stack = [];
  return {
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
  };
};

const acropetal = new LSystem({
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
});

const basipetal = new LSystem({
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
