import parse from './parser';
import { interpret, iterate } from './interpreter';
import { iterate as iterateContext, nestAST } from './context';

// Helper
const makeTree = input => nestAST(parse(input).body).tree;

export default class LSystem {
  constructor(system = {}) {
    this.system = system;
    this.setProgram(system.axiom);
    if (Array.isArray(this.system.productions)) {
      this.contextSensitive = true;
      const productions = this.system.productions.reduce((acc, cur) => {
        if (!acc[cur.predecessor]) { acc[cur.predecessor] = []; }
        acc[cur.predecessor].push({
          al: cur.left,
          ar: cur.right ? makeTree(cur.right) : null,
          successor: cur.successor,
        });
        return acc;
      }, {});
      this.system.productions = productions;
    }
  }
  setProgram(program) {
    this.program = program;
    this.ast = parse(this.program);
  }
  iterate() {
    if (this.contextSensitive) {
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
