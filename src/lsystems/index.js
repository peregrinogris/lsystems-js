import LSystem from './LSystem';

// Helpers
const createVisitor = (turtle, length, angle) => {
  const stack = [];
  return {
    PushState: () => {
      stack.push([turtle.position, turtle.direction]);
      turtle.drawPath();
    },
    PopState: () => {
      const state = stack.pop();
      turtle.drawPath();
      turtle.penUp();
      turtle.setXY(state[0][0], state[0][1]);
      turtle.setHeading(state[1]);
      turtle.penDown();
    },
    Module: (node, params) => {
      // All modules are interpreted as Forward
      turtle.forward(params.length > 0 ? length * params[0] : length);
    },
    Rotation: (node, params) => {
      if (node.name === '+') {
        turtle.left(params.length ? params[0] : angle);
      } else {
        turtle.right(params.length ? params[0] : angle);
      }
    },
  };
};

const stochasticProduction = distribution => (...args) => {
  // TODO: Validate distribution input
  const rnd = Math.floor(Math.random() * 100);
  let acc = 0;
  for (let i = 0; i < distribution.length; i += 1) {
    if (acc <= rnd && rnd < acc + distribution[i][0]) {
      return distribution[i][1](...args);
    }
    acc += distribution[i][0];
  }
  return '';
};

export {
  LSystem as default,
  createVisitor,
  stochasticProduction,
};
