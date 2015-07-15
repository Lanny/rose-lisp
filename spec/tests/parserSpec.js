var parser = require('../../src/parser.js');

var llEquals = function(expected) {
  return {

    asymmetricMatch: function(actual) {
      if (!(actual instanceof parser.LinkedList)) {
        return false;
      }

      return actual.equals(expected);
    }
  };
};

var astEquals = function(expected) {
  return {
    asymmetricMatch: function(actual) {
      if (!(actual instanceof parser.AST)) {
        return false;
      }

      return actual.equals(expected);

    }
  };
};

describe('parser.LinkedList', function() {
  it('has a length', function() {
    var ll = new parser.LinkedList();
    expect(ll.length).not.toBeUndefined();
  });

  it('has an initilization and empty constructor', function() {
    var emptyLl = new parser.LinkedList();
    var nonEmptyLl = new parser.LinkedList(42);

    expect(emptyLl.length).toBe(0);
    expect(nonEmptyLl.length).toBe(1);
  });

  it('grows in length as expected', function() {
    var ll = new parser.LinkedList()
      .cons(1)
      .cons(2)
      .cons(42);

    expect(ll.length).toBe(3);

    ll = ll.cons(12);
    expect(ll.length).toBe(4);

    expect(ll.car()).toBe(12);
    expect(ll.cdr().car()).toBe(42);
  });

  it('can determine equality with other linked lists', function() {
    var ll1 = new parser.LinkedList().cons(1).cons(2).cons(3);
    var ll2 = new parser.LinkedList().cons(1).cons(2).cons(3);
    var ll3 = new parser.LinkedList().cons(42).cons(2).cons(3);
    var ll4 = new parser.LinkedList().cons(0).cons(1).cons(2).cons(3);

    expect(ll1.equals(ll2)).toBe(true);
    expect(ll1.equals(ll3)).toBe(false);
    expect(ll1.equals(ll4)).toBe(false);
  });

  it('can determine equality with JS arrays', function() {
    var ll = new parser.LinkedList().cons(3).cons(2).cons(1);
    var arr1 = [1, 2, 3];
    var arr2 = [0, 1, 2, 3];
    var arr3 = [];

    expect(ll.equals(arr1)).toBe(true);
    expect(ll.equals(arr2)).toBe(false);
    expect(ll.equals(arr3)).toBe(false);
  });

  it('implements map', function() {
    var ll = new parser.LinkedList().cons(3).cons(2).cons(1);
    var incdLL = ll.map(function(x) {
      return x + 1;
    });

    expect(incdLL.equals([4, 3, 2])).toBe(true);
  });

  it('implements reduce', function() {
    var ll = new parser.LinkedList().cons(1).cons(1).cons(2).cons(3);
    var sum = function(x, y) {
      return x + y;
    };

    expect(ll.reduce(sum)).toBe(7);
    expect(ll.reduce(sum, 5)).toBe(12);
  });

  it('can be reversed', function() {
    var ll = new parser.LinkedList().cons(3).cons(2).cons(1).reverse();

    expect(ll.equals([3, 2, 1])).toBe(true);
  });

  it('can "replace" elements', function() {
    var ll = new parser.LinkedList().cons(1).cons(2).cons(3);
    var newLL = ll.replace(2, 42);

    expect(newLL.equals([3, 42, 1])).toBe(true);
  });

  it('doesn\'t mutate on replace', function() {
    var ll = new parser.LinkedList().cons(1).cons(2).cons(3);
    var newLL = ll.replace(2, 42);

    expect(ll.equals([3, 2, 1])).toBe(true);
  });

  it('can be accessed by index', function() {
    var ll = new parser.LinkedList().cons(1).cons(2).cons(42);

    expect(ll.nth(1)).toBe(2);
    expect(ll.nth(2)).toBe(1);
    expect(ll.nth(0)).toBe(42);
  });

  it('will let us know if we overrun its length', function() {
    var ll = new parser.LinkedList().cons(1).cons(2).cons(42);

    expect(function() {
      ll.nth(3);
    }).toThrow();
  });
});

describe('parser.Symbol', function() {
  var sym;

  beforeAll(function() {
    sym = new parser.Symbol('foo');
  });

  it('is a class with "type" dynamics', function() {
    expect(sym instanceof parser.Symbol).toBe(true);
  });

  it('is a subclass of Token', function() {
    expect(sym instanceof parser.Token).toBe(true);
  });
  
  it('is not a subclass of Literal', function() {
    expect(sym instanceof parser.Literal).toBe(false);
  });
});

describe('parser.Literal', function() {
  var lit;

  beforeAll(function() {
    lit = new parser.Literal('42');
  });

  it('is a subclass of Token', function() {
    expect(lit instanceof parser.Token).toBe(true);
  });
});

describe('parser.Token', function() {
  it('has its equality method consulted by child classes', function() {
    var lit = new parser.Literal('42');
    var sym = new parser.Symbol('42');

    expect(lit.equals(sym)).toBe(true);
  });
});

describe('parser.Lexer', function() {
  it('has a constructor', function() {
    expect(typeof parser.Lexer).toBe('function');
  });

  it('can be constructed with a string', function() {
    var validConstruct = function() {
      var lexer = new parser.Lexer('(+ 1 1)');
    };

    var invalidConstruct = function() {
      var lexer = new parser.Lexer(42);
    };

    expect(validConstruct).not.toThrow();
    expect(invalidConstruct).toThrow();
  });

  it('treats all types of whitespace equally', function() {
    var simpleCase = ' foo';
    var repeatCase = '  foo';
    var mixedCase = '   \n\t\t \nfoo';
    var nullCase = 'foo bar';

    var simpleLex = new parser.Lexer(simpleCase)._advanceThroughWhitespace();
    var repeatLex = new parser.Lexer(repeatCase)._advanceThroughWhitespace();
    var mixedLex = new parser.Lexer(mixedCase)._advanceThroughWhitespace();
    var nullLex = new parser.Lexer(nullCase)._advanceThroughWhitespace();

    expect(simpleLex._curIdx).toBe(1);
    expect(repeatLex._curIdx).toBe(2);
    expect(mixedLex._curIdx).toBe(8);
    expect(nullLex._curIdx).toBe(0);
  });

  it('lexes simple cases correctly', function() {
    var test1 = '(+ 1 1)';
    var test2 = '(/ 12 32)';
    var syms1 = parser.lex(test1);
    var syms2 = parser.lex(test2);

    expect(syms1).toEqual(llEquals(['(', '+', '1', '1', ')']));
    expect(syms2).toEqual(llEquals(['(', '/', '12', '32', ')']));
  });

  it('lexes slightly harder cases', function() {
    var test1 = '(let (foo 21)\n\t(+ foo 21))';
    var syms1 = parser.lex(test1);

    expect(syms1).toEqual(llEquals(['(', 'let', '(', 'foo', '21', ')',
      '(', '+', 'foo', '21', ')', ')']));
  });

  it('lexes strings correctly', function() {
    var test = '(let (foo "the quick brown fox") foo)';
    var syms = parser.lex(test);
    var str = new parser.StringLiteral('the quick brown fox');

    expect(syms).toEqual(llEquals(['(', 'let', '(', 'foo', '21', ')', str,
      ')', 'foo', ')']));
  });
});

describe('parser.AST', function() {
  it('is a tree', function() {
    var root = new parser.AST();
    var expected = [
      '+',
      ['+', '1', '1'],
      '40'
    ];

    root.addChild('+')
      .addChild(new parser.AST())
      .addChild('40')
      .nthChild(1)
      .addChild('+')
      .addChild('1')
      .addChild('1');

    root.flip();

    expect(root).toEqual(astEquals(expected));
  });
});

describe('parser.Parser', function() {
  it('parses simple cases correctly', function() {
    var test1 = '(+ 1 1)';
    var test2 = '(/ 12 32)';
    var ast1 = parser.parse(test1);
    var ast2 = parser.parse(test2);
    var expected1 = ['+', '1', '1'];
    var expected2 = ['/', '12', '32'];

    expect(ast1).toEqual(astEquals(expected1));
    expect(ast2).toEqual(astEquals(expected2));

    expect(ast1).not.toEqual(astEquals(expected2));
    expect(ast2).not.toEqual(astEquals(expected1));
  });

  it('parses slightly harder cases', function() {
    var test1 = '(let (foo 21)\n\t(+ foo 21))';
    var syms1 = parser.lex(test1);
    var ast1 = new parser.Parser(syms1).parse().flip();
    var expected1 = [
      'let',
      ['foo', '21'],
      ['+', 'foo', '21']
    ];

    expect(ast1).toEqual(astEquals(expected1));
  });
});
