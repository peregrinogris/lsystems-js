const nestAST = (ast, ignoreList = []) => {
  const tree = Object.assign({}, ast[0], {
    idx: 0, parent: null, children: [],
  });
  const nodeList = [tree];
  const stack = [];
  let current = tree;
  for (let idx = 1; idx < ast.length; idx += 1) {
    // console.log('  analizying:', ast[idx]);
    if (ast[idx].type === 'PopState') {
      current = stack.pop();
    } else if (ignoreList.indexOf(ast[idx].name) > -1) {
      // console.log('ignoring: ', ast[idx].name);
      // do nothing, just ignore the case
    } else if (ast[idx].type === 'PushState') {
      stack.push(current);
      while (ast[idx + 1].type === 'PushState') {
        stack.push(current);
        idx += 1;
      }
    } else {
      const next = Object.assign({}, ast[idx], { idx });
      if (!current.children) { current.children = []; }
      current.children.push(next);
      // Circular reference, comment out for JSON printout
      next.parent = current;
      nodeList[idx] = next;
      current = next;
    }
  }
  // console.log(JSON.stringify(tree, null, '  '));
  return { tree, nodeList };
};

// Helper
const getKey = ({ name, params }) => (
  `${name}${params.length > 0 ? `[${params.length}]` : ''}`
);

const matchProduction = (lsystem, node, tree) => {
  let conditionParams = [];
  let production = lsystem.productions[getKey(node)].find(
    (current) => {
      let applies = true;
      if (current.ar) {
        // If both contexts, the condition params should
        // also include left context parameters
        if (current.al) {
          applies = applies &&
                    tree.parent &&
                    current.al === getKey(tree.parent);
          if (!applies) {
            // If left context does not match, it doesn't matter if right does
            return false;
          }
          // Update condition parameters, to use while right context matching
          conditionParams = [
            ...tree.parent.params.map(n => n.value),
            ...node.params.map(n => n.value),
          ];
        }
        applies = applies &&
                  tree.children &&
                  tree.children.some((cur) => {
                    if (current.ar === getKey(cur)) {
                      // Check if production is conditional-explicit
                      if (Array.isArray(current.successor)) {
                        // production applies if some of the children validate
                        return current.successor.some((prod) => {
                          conditionParams = [
                            ...conditionParams,
                            ...cur.params.map(n => n.value),
                          ];
                          return prod.condition(...conditionParams);
                        });
                      }
                      // Same node and production is not conditional-explicit
                      return true;
                    }
                    // Not the same node, no match
                    return false;
                  });
      } else if (current.al) {
        // Only left context, no right
        applies = applies && tree.parent && current.al === getKey(tree.parent);
      }
      return applies;
    },
  );
  if (production) {
    production = production.successor ? production.successor : production;
    if (Array.isArray(production)) {
      production = production.find(
        prod => prod.condition(...conditionParams),
      ).production;
    }
    return production;
  }
  return null;
};

const iterate = (ast, lsystem, contextSensitive = false) => {
  let nodeList;
  if (contextSensitive) {
    nodeList = (nestAST(ast.body, lsystem.ignores)).nodeList;
  }
  if (!ast.body.length) {
    return lsystem.axiom;
  }

  return ast.body.map((node, idx) => {
    let production = null;
    switch (node.type) {
      case 'Module':
      case 'Rotation':
        if (lsystem.productions[getKey(node)]) {
          if (!contextSensitive) {
            production = lsystem.productions[getKey(node)];
          } else {
            production = matchProduction(lsystem, node, nodeList[idx]);
          }
          // Check if it's a conditional-explicit production
          if (Array.isArray(production)) {
            const valid = production.find(cur => (
              cur.condition(...node.params.map(n => n.value))
            ));
            production = valid ? valid.production : valid;
          }
          if (production) {
            return production(...node.params.map(n => n.value));
          }
        }
      case 'Modifier': // eslint-disable-line no-fallthrough
        if (node.params.length) {
          return `${node.name}(${node.params.map(n => n.value)})`;
        }
        return node.name;
      case 'PopState':
      case 'PushState':
      case 'NumberLiteral':
        return node.value;
      default:
        throw new TypeError(node.type);
    }
  }).join('');
};
export default iterate;
