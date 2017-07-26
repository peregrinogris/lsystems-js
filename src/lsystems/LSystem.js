import parse from './parser';
import iterate from './iterate';

const hasContext = productions => (
  Object.keys(productions).findIndex(
    key => key.indexOf('<') > -1 || key.indexOf('>') > -1,
  ) > -1
);

const hasParameters = productions => (
  Object.keys(productions).findIndex(
    key => key.indexOf('(') > -1 && key.indexOf(')') > -1,
  ) > -1
);

// Transform F(x,y) -> F[2]
const argsToCount = (key) => {
  // Only transform if there are parameters
  if (key.indexOf('(') === -1) {
    return key;
  }
  // Get the necessary production components
  const [
    , predecessor, args,
  ] = key.match(/(.)\((.+)\)/);

  // Do the rename: F(x,y) -> F[2]
  return `${predecessor}[${args.split(',').length}]`;
};

const transformContextProductions = (systemProductions) => {
  const productions = {};
  Object.keys(systemProductions).forEach((key) => {
    let [
      , al, predecessor, ar,
    ] = key.match(/(.+<)?([^<>]+)(>.+)?/);

    // Fix module names
    al = al ? argsToCount(al.slice(0, -1)) : '';
    ar = ar ? argsToCount(ar.substr(1)) : '';
    predecessor = argsToCount(predecessor);

    const production = {
      al,
      ar,
      successor: systemProductions[key],
    };
    if (!productions[predecessor]) { productions[predecessor] = []; }
    productions[predecessor].push(production);
  });
  return productions;
};

const transformParametricProductions = (systemProductions) => {
  const productions = {};
  Object.keys(systemProductions).forEach((key) => {
    productions[argsToCount(key)] = systemProductions[key];
  });
  return productions;
};

export default class LSystem {
  constructor(system = {}) {
    this.system = system;
    this.setProgram(system.axiom);
    this.contextSensitive = hasContext(system.productions);
    this.parametric = hasParameters(system.productions);
    if (this.contextSensitive) {
      // Transform productions object
      this.system.productions = transformContextProductions(
        this.system.productions,
      );
    } else if (this.parametric) {
      // Transform productions object
      this.system.productions = transformParametricProductions(
        this.system.productions,
      );
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
