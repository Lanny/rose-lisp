;(function() {
  var utils = require('./utils');

  var LinkedList = function(value, next) {
    this.value = value || null;
    this.next = next || null;

    this.length = (next || {length: 0}).length + ((value === undefined)?0:1);
  };

  LinkedList.prototype = {
    constructor: LinkedList,
    cons: function(value) {
      return new (this.constructor)(value, this);
    },
    car: function() {
      return this.value;
    },
    cdr: function() {
      return this.next;
    },
    map: function(cb) {
      var newLL = new LinkedList();
      var runningLL = this;

      while (runningLL.length > 0) {
        newLL = newLL.cons(cb(runningLL.car()));
        runningLL = runningLL.cdr();
      }

      return newLL;
    },
    reduce: function(cb, initial) {
      var acc;
      var runner = this;

      if (this.length < 1) {
        return initial;
      } else if (initial !== undefined) {
        acc = initial;
      } else {
        acc = runner.car();
        runner = runner.cdr();
      }

      runner.each(function(x) {
        acc = cb(acc, x);
      });

      return acc;
    },
    reverse: function() {
      var runningLL = this;
      var reversedLL = new LinkedList();

      while (runningLL.length > 0) {
        reversedLL = reversedLL.cons(runningLL.car());
        runningLL = runningLL.cdr();
      } 

      return reversedLL;
    },
    replace: function(find, replace) {
      var runningLL = this;
      var newLL = new LinkedList();
      var found = false;

      while (runningLL.length > 0) {
        var el = runningLL.car();

        if (el === find) {
          newLL = newLL.cons(replace);
          found = true;
        } else {
          newLL = newLL.cons(el);
        }

        runningLL = runningLL.cdr();
      }

      return found ? newLL.reverse() : null;
    },
    toArray: function() {
      var arr = [];

      this.each(function(x) {
        arr.push(x);
      });

      return arr;
    },
    toString: function() {
      if (this.length < 1) {
        return 'nil';
      }

      var s = this.reduce(function(acc, item) {
        return acc + utils.repr(item);
      }, '(');

      return s + ')';
    },
    each: function(callback) {
      if (this.next === null) {
        return;
      } else {
        callback(this.car());
        this.cdr().each(callback);
      }

      return this;
    },
    nth: function(n) {
      var runningLL = this;

      for (var i = 0; i < n; i++) {
        if (runningLL.length < 2) {
          throw "LinkedList index out of bounds.";
        }

        runningLL = runningLL.cdr();
      }

      return runningLL.car();
    },
    _divineEquality: function(left, right) {
      if (left instanceof Object && typeof left.equals === 'function') {
        return left.equals(right);
      }

      if (right instanceof Object && typeof right.equals === 'function') {
        return right.equals(left);
      }

      return left === right;
    },
    _compWithArr: function(that) {
      var head = this;

      if (this.length !== that.length) {
        return false;
      }

      for (var i = 0; i < this.length; i++) {
        if (!this._divineEquality(head.car(), that[i])) {
          return false;
        }

        head = head.cdr();
      }

      return true;
    },
    _compWithLL: function(that) {
      if (this.length === 0 && that.length === 0) {
        return true;
      } else {
        return (
            this.length === that.length &&
            this._divineEquality(this.car(), that.car()) && 
            this.cdr()._compWithLL(that.cdr()));
      }
    },
    equals: function(that) {
      if (that instanceof LinkedList) {
        return this._compWithLL(that);
      } else if (that instanceof Array) {
        return this._compWithArr(that);
      } else {
        return false;
      }
    }
  };

  var AST = function() {
    this._children = new LinkedList();
  };

  AST.prototype = {
    getRoot: function() {
      var runner = this;

      while (runner._ancestor !== null) {
        runner = runner._ancestor;
      }

      return runner;
    },
    toString: function(indent) {
      indent = indent || 0;
      var s = Array(indent * 2 + 1).join(' ') + this._children.car().text + '\n';

      this._children.cdr().each(function(el) {
        if (el instanceof AST) {
          s += el.toString(indent + 1);
        } else if (el instanceof Token) {
          s += Array(indent * 2 + 3).join(' ') + el.text + '\n';
        }else {
          s += Array(indent * 2 + 3).join(' ') + el + '\n';
        }
      });

      return s;
    },
    toArray: function() {
      var arr = [];

      this._children.each(function(x) {
        if (x instanceof AST) {
          arr.push(x.toArray());
        } else {
          arr.push(x);
        }
      });

      return arr;
    },
    flip: function() {
      this._children = this._children.map(function(x) {
        if (x instanceof AST) {
          return x.flip();
        } else {
          return x;
        }
      });

      return this;
    },
    addChild: function(child) {
      this._children = this._children.cons(child);

      return this;
    },
    nthChild: function(n) {
      return this._children.nth(n);
    },
    equals: function(that) {
      if (that instanceof AST) {
        return this._children.equals(that._children);
      } else if (that instanceof LinkedList || that instanceof Array) {
        return this._children.equals(that);
      } else {
        return false;
      }
    }
  };

  var Token = function(text, lineNo, colNo) {
    this.text = text;
    this.lineNo = lineNo;
    this.colNo = colNo;
  };

  Token.prototype = {
    equals: function(that) {
      if (typeof that === 'string') {
        return this.text === that;
      } else if (that instanceof Token) {
        return this.text === that.text;
      } else {
        return false;
      }
    }
  };

  var Symbol = function(text, lineNo, colNo) {
    Token.call(this, text, lineNo, colNo);
    this.lol = "foo";
  };
  Symbol.prototype = new Token();
  Symbol.prototype.constructor = Symbol;

  var Literal = utils.subclass(
    new Token(),
    null,
    {
      value: function() {
        throw 'Raw literals should never have their value() method called';
      },
    });

  var NumberLiteral = function(text, lineNo, colNo) {
    Literal.call(this, text, lineNo, colNo);
    this._value = parseInt(text, 10);
  };
  NumberLiteral.prototype = new Literal();
  NumberLiteral.prototype.constructor = NumberLiteral;
  NumberLiteral.prototype.value = function() {
    return this._value;
  };

  var StringLiteral = utils.subclass(
    new Literal(), 
    function(text, lineNo, colNo) {
      Literal.call(this, text, lineNo, colNo);

      var unwrapped = text.substr(1, this.text.length - 2);

      this._value = this.unescapeString(unwrapped);
    },
    {
      value: function() {
        return this._value;
      },
      _unescapeCodes: {
        'n': '\n',
        'r': '\r',
        't': '\t'
      },
      unescapeString: function(str) {
        var arr = [];
        var idx = 0;
        var c;

        while (idx < str.length) {
          c = str.charAt(idx);

          if (c === "\\") {
            if (c in this._unescapeCodes) {
              arr.push(this._unescapeCodes[c]);
            } else {
              arr.push(c);
            }
          } else {
            arr.push(c);
          }

          idx++;
        }

        return arr.join("");
      }
    });

  var Lexer = function(input, idx, syms) {
    if (typeof input !== 'string') {
      throw "First argument to constructor must be a string.";
    }

    this._input = input;
    this._curIdx = idx || 0;
    this._syms = syms || new LinkedList();
  };

  Lexer.prototype = {
    lex: function() {
      var runningLexer = this;

      while (!runningLexer._done()) {
        runningLexer = runningLexer._nextTok();
      }

      return runningLexer.getSyms();
    },
    getSyms: function() {
      return this._syms.reverse();
    },
    _seperators: /[\s\(\)\[\]]/,
    _done: function() {
      return this._curIdx >= this._input.length;
    },
    _advanceThroughWhitespace: function() {
      var idx = this._curIdx;

      while (idx < this._input.length &&
          this._input[idx].match(/\s/) !== null) {
        idx++;
      }

      // Save a little work for the GC if we don't need to change state.
      if (idx === this._curIdx) {
        return this;
      } else {
        return new Lexer(this._input, idx, this._syms);
      }
    },
    _nextTok: function() {
      var l = this._advanceThroughWhitespace();
      var idx, input;

      if (l._input.charAt(l._curIdx).match(/[\(\)\[\]]/) !== null) {
        var tok = new Token(l._input[l._curIdx]);
        return new Lexer(
            l._input,
            l._curIdx + 1,
            l._syms.cons(tok));
      } else if (l._input.charAt(l._curIdx).match(/[0-9]/) !== null) {
        return l._nextNumber();
      } else if (l._input.charAt(l._curIdx) === '"') {
        return l._nextString();
      } else {
        idx = l._curIdx;
        input = l._input;
        while (idx < input.length &&
            input.charAt(idx).match(this._seperators) === null) {
          idx++;
        }

        var sym = new Symbol(input.substring(l._curIdx, idx));

        return new Lexer(input, idx, l._syms.cons(sym));
      }
    },
    _nextNumber: function() {
      var idx = this._curIdx;
      var input = this._input;

      var curChar = input.charAt(idx);
      while (idx < input.length &&
          curChar.match(this._seperators) === null) {
        if (curChar.match(/[0-9]/) === null) {
          throw 'Malformed atom';
        }

        curChar = input.charAt(++idx);
      }

      var num = new NumberLiteral(input.substring(this._curIdx, idx));

      return new Lexer(input, idx, this._syms.cons(num));
    },
    _inEscapeCode: function(startIdx) {
      var b = false;
      var idx = startIdx + 1;

      while (idx >= 0 && this._input.charAt[idx] === '\\') {
        b = !b;
        idx--;
      }

      return b;
    },
    _nextString: function() {
      var idx = this._curIdx;
      var input = this._input;

      if (this._input.charAt(idx) !== '"') {
        throw "_nextString must be called with _curIdx on a quote mark";
      } 

      idx++;

      var curChar = input.charAt(idx);
      while (idx < input.length) {
        if (curChar === '"' && !this._inEscapeCode(idx)) {
          break;
        }

        curChar = input.charAt(++idx);
      }

      var str = new StringLiteral(input.substring(this._curIdx, idx));

      return new Lexer(input, idx, this._syms.cons(str));
    }
  };

  var lex = function(input) {
    var lexer = new Lexer(input);

    return lexer.lex();
  };

  var Parser = function(syms) {
    this._syms = syms;
  };

  Parser.prototype = {
    parse: function() {
      var tree = this._parseSExp();

      return tree.nthChild(0);
    },
    _parseSExp: function() {
      var branch = new AST();
      var curSym;
      
      while (this._syms.length > 0) {
        curSym = this._syms.car();
        this._syms = this._syms.cdr();

        if (curSym.equals('(')) {
          branch.addChild(this._parseSExp());
        } else if (curSym.equals(')')) {
          return branch;
        } else {
          branch.addChild(curSym);
        }
      }

      return branch;
    }
  };

  var parse = function(input) {
    return new Parser(lex(input))
      .parse()
      .flip();
  };

  module.exports.LinkedList = LinkedList;
  module.exports.AST = AST;
  module.exports.Token = Token;
  module.exports.Symbol = Symbol;
  module.exports.Literal = Literal;
  module.exports.StringLiteral = StringLiteral;

  module.exports.nil = new LinkedList();

  module.exports.Lexer = Lexer;
  module.exports.lex = lex;
  module.exports.Parser = Parser;
  module.exports.parse = parse;

})();
