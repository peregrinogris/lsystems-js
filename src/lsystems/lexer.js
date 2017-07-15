const isDigit = c => c.match(/[0-9.]/);

class Lexer {
  constructor() {
    this.pos = 0;
    this.buf = null;
    this.buflen = 0;
  }

  input(buf) {
    this.pos = 0;
    this.buf = buf;
    this.buflen = buf.length;
  }

  parseNumber() {
    let partial = '';
    let c = this.buf[this.pos];
    while (this.pos < this.buflen && c.match(/[0-9.-]/)) {
      partial += c;
      this.pos += 1;
      c = this.buf[this.pos];
    }
    return Math.round(100 * parseFloat(partial, 10)) / 100;
  }

  token() {
    let c = '';
    if (this.pos >= this.buflen) {
      return null;
    }

    c = this.buf[this.pos];

    // Whitespace
    while (c.match(/[ \n\r]/)) {
      this.pos += 1;
      c = this.buf[this.pos];
    }

    // Negative numbers are numbers too!
    if (
      isDigit(c) || (c === '-' && isDigit(this.buf[this.pos + 1]))
    ) {
      return {
        pos: this.pos,
        type: 'NUMBER',
        value: this.parseNumber(),
      };
    }
    if (c.match(/[a-zA-Z]/)) {
      this.pos += 1;
      return {
        pos: this.pos - 1,
        type: 'MODULE',
        value: c,
      };
    }
    if (c.match(/[!]/)) {
      this.pos += 1;
      return {
        pos: this.pos - 1,
        type: 'MODIFIER',
        value: c,
      };
    }
    if (c.match(/[+-]/)) {
      this.pos += 1;
      return {
        pos: this.pos - 1,
        type: 'ROTATION',
        value: c,
      };
    }
    if (c.match(/[[\]]/)) {
      this.pos += 1;
      return {
        pos: this.pos - 1,
        type: 'STATE',
        value: c,
      };
    }
    this.pos += 1;
    return {
      pos: this.pos - 1,
      type: 'KEYWORD',
      value: c,
    };
  }
}
export default Lexer;
