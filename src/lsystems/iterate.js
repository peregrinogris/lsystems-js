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

const validPath = (path, node) => {
  let valid = true;
  let current = node;
  for (let idx = path.length; idx > 0; idx -= 1) {
    if (!current) {
      valid = false;
      break;
    }
    valid = valid && current.parent.name === path[idx - 1];
    current = current.parent;
  }
  return valid;
};

const validSubtree = (subtree, tree) => {
  // console.log(JSON.stringify(subtree, null, '  '));
  // console.log(JSON.stringify(tree, null, '  '));
  if (subtree && tree) {
    return subtree.type === tree.type &&
           subtree.name === tree.name &&
           subtree.children.reduce((acc, cur, idx) => (
             acc && validSubtree(cur, tree.children[idx])
           ), true);
  }
  return false;
};

const matchProduction = (lsystem, node, tree) => {
  const production = lsystem.productions[node.name].find(
    (current) => {
      let applies = true;
      if (current.al) {
        applies = applies && validPath(current.al, tree);
      }
      if (current.ar) {
        applies = applies &&
                  tree.children &&
                  tree.children.reduce((acc, cur) => (
                    acc || validSubtree(current.ar, cur)
                  ), false);
      }
      return applies;
    },
  );
  return production ? production.successor : null;
};

const iterate = (ast, lsystem, contextSensitive = false) => {
  let nodeList;
  if (contextSensitive) {
    nodeList = (nestAST(ast.body, lsystem.ignores)).nodeList;
  }
  if (!ast.body.length) {
    return lsystem.axiom;
  }
  // Local Helper
  const getKey = ({ name, params }) => (
    `${name}${params.length > 0 ? `[${params.length}]` : ''}`
  );
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

export {
  iterate,
  nestAST,
};
