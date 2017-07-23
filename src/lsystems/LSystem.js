import parse from './parser';
import { interpret, iterate } from './interpreter';
import { iterate as iterateContext, nestAST } from './context';

// Helper
const makeTree = input => nestAST(parse(input).body).tree;

const hasContext = productions => (
  Object.keys(productions).findIndex(
    key => key.indexOf('<') > -1 || key.indexOf('>') > -1,
  ) > -1
);

export default class LSystem {
  constructor(system = {}) {
    this.system = system;
    this.setProgram(system.axiom);
    this.contextSensitive = hasContext(system.productions);
    if (this.contextSensitive) {
      const productions = {};
      Object.keys(this.system.productions).forEach((key) => {
        const [
          , al, predecessor, ar,
        ] = key.match(/([A-Z]+)?<?([A-Z])>?([A-Z[\]]+)?/);
        const production = {
          al,
          predecessor,
          ar: ar ? makeTree(ar) : '',
          successor: this.system.productions[key],
        };
        if (!productions[predecessor]) { productions[predecessor] = []; }
        productions[predecessor].push(production);
      });
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
