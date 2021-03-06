import LSystem from './LSystem';

// Helpers
const createVisitor = (turtle, length, defaultAngle) => {
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
    Module: (node, lengthModifier = 1) => {
      // All modules are interpreted as Forward
      turtle.forward(length * lengthModifier);
    },
    Rotation: (node, angle = defaultAngle) => {
      if (node.name === '+') {
        turtle.left(angle);
      } else {
        turtle.right(angle);
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
