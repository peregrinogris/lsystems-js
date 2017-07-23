import parse from './parser';
import { interpret, iterate } from './interpreter';
import { iterate as iterateContext, nestAST } from './context';

export default class LSystem {
  constructor(system = {}) {
    this.system = system;
    this.setProgram(system.axiom);
  }
  setProgram(program) {
    this.program = program;
    this.ast = parse(this.program);
  }
  iterate() {
    if (this.system.context) {
      this.program = iterateContext(this.ast, this.system);
    } else {
      this.program = iterate(this.ast, this.system);
    }
    this.ast = parse(this.program);
  }
  walk(visitor) {
    interpret(this.ast, visitor);
  }
}

// Helpers

export const makeTree = input => nestAST(parse(input).body).tree;

export const createVisitor = (turtle, length, angle) => {
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
