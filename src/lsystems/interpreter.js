// Helpers
export const interpret = (ast, visitor) => {
  // eslint-disable-next-line no-use-before-define
  const traverseArray = array => array.map(child => traverseNode(child));
  const traverseNode = (node) => {
    const method = visitor[node.type];
    switch (node.type) {
      case 'Program':
        traverseArray(node.body);
        break;
      case 'Module':
      case 'Rotation':
      case 'Modifier':
        if (method) {
          method(node, traverseArray(node.params));
        }
        break;
      case 'PopState':
      case 'PushState':
        if (method) {
          method(node);
        }
        break;
      case 'NumberLiteral':
        return node.value;
      default:
        throw new TypeError(node.type);
    }
    return undefined;
  };
  traverseNode(ast);
};

export const iterate = (ast, lsystem) => {
  // eslint-disable-next-line no-use-before-define
  const traverseArray = array => array.map(child => traverseNode(child));
  const traverseNode = (node) => {
    let method = null;
    switch (node.type) {
      case 'Program':
        if (!node.body.length) {
          return lsystem.axiom;
        }
        return traverseArray(node.body).join('');
      case 'Module':
        method = lsystem.productions[node.name];
        if (method) {
          return method(traverseArray(node.params));
        }
      case 'Rotation': // eslint-disable-line no-fallthrough
      case 'Modifier':
        // eslint-disable-next-line max-len
        return `${node.name} ${(node.params.length ? `(${traverseArray(node.params)})` : '')}`;
      case 'PopState':
      case 'PushState':
      case 'NumberLiteral':
        return node.value;
      default:
        throw new TypeError(node.type);
    }
  };
  return traverseNode(ast);
};
