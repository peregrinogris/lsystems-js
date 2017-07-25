import parse from './parser';
import { iterate, nestAST } from './iterate';

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
      // Transform productions object
      const productions = {};
      Object.keys(this.system.productions).forEach((key) => {
        const [
          , al, predecessor, ar,
        ] = key.match(/([A-Z]+)?<?([^<>])>?([A-Z[\]]+)?/);
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
    this.program = iterate(this.ast, this.system, this.contextSensitive);
    this.ast = parse(this.program);
  }
  walk(visitor) {
    this.ast.body.forEach((node) => {
      const method = visitor[node.type];
      switch (node.type) {
        case 'Module':
        case 'Rotation':
        case 'Modifier':
          if (method) {
            method(node, ...node.params.map(n => n.value));
          }
          break;
        case 'PopState':
        case 'PushState':
          if (method) {
            method(node);
          }
          break;
        default:
          throw new TypeError(node.type);
      }
    });
  }
}
