import Tortuga from 'tortuga-js';
import { parse, interpret, iterate } from '../lsystems';

const singleTree = {
  productions: {
    A: function Module(params) {
      const s = params[0];
      const sR = Math.round(100 * (s / 1.456)) / 100;
      return `F(${s})[+A(${sR})][-A(${sR})]`;
    },
  },
  axiom: 'A(1)',
};

const rowOfTrees = (() => {
  const rotC = 3;
  const rotP = 0.9;
  const rotQ = rotC - rotP;
  const rotH = (rotP * rotQ) ** 0.5;
  return {
    productions: {
      F: function Module(params) {
        const xh = Math.round(100 * params[0] * rotH) / 100;
        const xp = Math.round(100 * params[0] * rotP) / 100;
        const xq = Math.round(100 * params[0] * rotQ) / 100;
        return `F(${xp})+F(${xh})--F(${xh})+F(${xq})`;
      },
    },
    axiom: '-(90)F(1)',
  };
})();

const renderSystem = (system, target, x, y, length) => {
  const iterations = 5;
  const stack = [];
  const angle = 85;
  const turtle = new Tortuga(target, x, y, length);
  let program = '';

  for (let i = 0; i < iterations; i += 1) {
    program = iterate(parse(program), system);
  }

  turtle.size(2);
  turtle.color('#b756a4');
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
};

const render = () => {
  renderSystem(rowOfTrees, '#tortuga-row-of-trees', -350, -150, 7);
};

export {
  rowOfTrees,
  singleTree,
  render as default,
};
