// Helpers
export const interpret = (ast, visitor) => {
  ast.body.forEach((node) => {
    const method = visitor[node.type];
    switch (node.type) {
      case 'Module':
      case 'Rotation':
      case 'Modifier':
        if (method) {
          method(node, node.params.map(n => n.value));
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
};

export const iterate = (ast, lsystem) => {
  if (!ast.body.length) {
    return lsystem.axiom;
  }
  return ast.body.map((node) => {
    let method = null;
    switch (node.type) {
      case 'Module':
      case 'Rotation':
        method = lsystem.productions[node.name];
        if (method) {
          return method(node.params.map(n => n.value));
        }
      case 'Modifier': // eslint-disable-line no-fallthrough
        if (node.params.length) {
          return `${node.name}(${node.params.map(n => n.value).join(',')})`;
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
