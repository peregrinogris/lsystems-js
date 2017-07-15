// http://eli.thegreenplace.net/2013/07/16/hand-written-lexer-in-javascript-compared-to-the-regex-based-ones
// https://github.com/thejameskyle/the-super-tiny-compiler/blob/master/super-tiny-compiler.js
import Lexer from './lexer';

class Parser {

  constructor(_input) {
    this.pos = 0;
    this.tokens = [];
    this.input(_input);
  }

  input(_input) {
    let token = null;
    const lexer = new Lexer();
    lexer.input(_input);
    for (;;) {
      token = lexer.token();
      if (!token) {
        break;
      }
      this.tokens.push(token);
    }
  }

  scanParameters() {
    let token = null;
    const params = [];
    const nextToken = this.tokens[this.pos + 1];

    // Module or Rotation with parameters
    if (
      this.pos < this.tokens.length - 1 &&
      nextToken.type === 'KEYWORD' &&
      nextToken.value === '('
    ) {
      this.pos += 2;
      token = this.tokens[this.pos];
      while (
        (token.type !== 'KEYWORD') ||
        (token.type === 'KEYWORD' && token.value !== ')')
      ) {
        if (token.type === 'KEYWORD' && token.value === ',') {
          this.pos += 1;
        } else {
          params.push(this.walk());
        }
        token = this.tokens[this.pos];
      }
    }

    return params;
  }

  walk() {
    const token = this.tokens[this.pos];
    let node = {};

    // Number
    if (token.type === 'NUMBER') {
      this.pos += 1;
      return {
        type: 'NumberLiteral',
        value: token.value,
      };
    }

    // State
    if (token.type === 'STATE') {
      this.pos += 1;
      return {
        type: token.value === '[' ? 'PushState' : 'PopState',
        value: token.value,
      };
    }

    // Module or Rotation
    if (token.type === 'MODULE' || token.type === 'ROTATION') {
      // eslint-disable-next-line vars-on-top
      node = {
        type: token.type === 'MODULE' ? 'Module' : 'Rotation',
        name: token.value,
        params: this.scanParameters(),
      };

      this.pos += 1;
      return node;
    }

    // Modifier
    if (token.type === 'MODIFIER') {
      // eslint-disable-next-line vars-on-top
      node = {
        type: 'Modifier',
        name: token.value,
        params: this.scanParameters(),
      };

      this.pos += 1;
      return node;
    }

    // Keyword
    if (token.type === 'KEYWORD' && !token.value.match(/[()]/)) {
      // Keywords are not parametric, otherwise they should be modifiers.
      this.pos += 1;
      return {
        type: 'Keyword',
        value: token.value,
      };
    }

    throw Error(`Unexpected token ${token.value} at position ${this.pos}`);
  }

  parse() {
    const ast = {
      type: 'Program',
      body: [],
    };

    while (this.pos < this.tokens.length) {
      ast.body.push(this.walk());
    }

    return ast;
  }
}

const parse = input => ((new Parser(input)).parse());
export default parse;
