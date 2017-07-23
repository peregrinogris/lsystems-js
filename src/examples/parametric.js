import Tortuga from 'tortuga-js';
import LSystem, { createVisitor } from '../lsystems';

const renderSystem = (system, target, x, y, length) => {
  const iterations = 4;
  const angle = 85;
  const turtle = new Tortuga(target, x, y, length);
  const visitor = createVisitor(turtle, length, angle);

  for (let i = 0; i < iterations; i += 1) {
    system.iterate();
  }

  turtle.size(2);
  turtle.color('#b756a4');
  system.walk(visitor);
  turtle.drawPath();
};

const singleTree = new LSystem({
  productions: {
    A: (params) => {
      const s = params[0];
      const sR = Math.round(100 * (s / 1.456)) / 100;
      return `F(${s})[+A(${sR})][-A(${sR})]`;
    },
  },
  axiom: 'A(1)',
});

const rowOfTrees = new LSystem((() => {
  const rotC = 3;
  const rotP = 0.9;
  const rotQ = rotC - rotP;
  const rotH = (rotP * rotQ) ** 0.5;
  return {
    productions: {
      F: (params) => {
        const xh = Math.round(100 * params[0] * rotH) / 100;
        const xp = Math.round(100 * params[0] * rotP) / 100;
        const xq = Math.round(100 * params[0] * rotQ) / 100;
        return `F(${xp})+F(${xh})--F(${xh})+F(${xq})`;
      },
    },
    axiom: '-(90)F(1)',
  };
})());

const render = () => {
  renderSystem(rowOfTrees, '#tortuga-row-of-trees', -350, -150, 7);
};

export {
  rowOfTrees,
  singleTree,
  render as default,
};
