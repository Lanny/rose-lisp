var core = require('../../src/core.js');
var parser = require('../../src/parser.js');
var nil = parser.nil;

describe('primitives.PlusOperator', function() {
  it('can add two numbers', function() {
    var testString = '(+ 40 2)';

    expect(core.readEval(testString)).toBe(42);
  });

  it('is variadic', function() {
    var testString = '(+ 12 20 1 1)';

    expect(core.readEval(testString)).toBe(34);
  });

  it('can be nested', function() {
    var testString = '(+ (+ 2 2) (+ 2 (+ 1 1)))';

    expect(core.readEval(testString)).toBe(8);
  });

});

describe('primitives.Let', function() {
  it('can bind values to names', function() {
    var testString = '(let (k 40) (+ k 2))';

    expect(core.readEval(testString)).toBe(42);
  });

  it('can bind multiple values to multiple names', function() {
    var testString = '(let (k 3 i 4) (+ k i))';

    expect(core.readEval(testString)).toBe(7);
  });

  it('can contain sexprs in the binds', function() {
    var testString = '(let (k (+ 2 2)) (+ k 1))';

    expect(core.readEval(testString)).toBe(5);
  });

  it('can be nested', function() {
    var testString = '(let (k 3) (let (i 7) (+ k i)))';

    expect(core.readEval(testString)).toBe(10);
  });

  it('doesn\'t need to be nested', function() {
    var testString = '(let (k 3 i (+ k 2)) (+ k i))';

    expect(core.readEval(testString)).toBe(8);
  });

  it('doesn\'t allow lvals to be non-symbols', function() {
    var testString = '(let (21 42) (+ 21 1))';
    var test = function() {
      return core.readEval(testString);
    };

    expect(test).toThrow();
  });

  it('contains an implicit `do`', function() {
    var testString = '(let (k 2) (+ 3 3) (+ k k))';

    expect(core.readEval(testString)).toBe(4);
  });
});

describe('primitives.GreaterThanOperator', function() {
  it('returns true when it should', function() {
    var testString = '(> 2 1)';
    expect(core.readEval(testString)).toBe(true);
  });

  it('returns false when it should', function() {
    var testString1 = '(> 1 2)';
    var testString2 = '(> 2 2)';

    expect(core.readEval(testString1)).toBe(false);
    expect(core.readEval(testString2)).toBe(false);
  });

  it('throws with non-numeric arguments', function() {
    var testString = '(> 1 +)';
    var test = function() {
      return core.readEval(testString);
    };

    expect(test).toThrow();
  });

  it('is variadic', function() {
    var testString1 = '(> 5 4 3 2)';
    var testString2 = '(> 5 4 5 2)';

    expect(core.readEval(testString1)).toBe(true);
    expect(core.readEval(testString2)).toBe(false);
  });
});

describe('primitives.If', function() {
  it('has a one arm form', function() {
    var testString1 = '(if (> 1 2) 21)';
    var testString2 = '(if (> 2 1) 21)';

    expect(core.readEval(testString1).equals(nil)).toBe(true);
    expect(core.readEval(testString2)).toBe(21);
  });

  it('has a two arm form (and is correct)', function() {
    var testString1 = '(if (> 1 2) 21 42)';
    var testString2 = '(if (> 2 1) 21 42)';

    expect(core.readEval(testString1)).toBe(42);
    expect(core.readEval(testString2)).toBe(21);
  });

  it('does not execute the untaken branch', function() {
    var testString1 = '(if (> 1 2) undefined-var 42)';
    var testString2 = '(if (> 2 1) 21 undefined-var)';

    var test1 = function() {
      return core.readEval(testString1);
    };
    var test2 = function() {
      return core.readEval(testString2);
    };

    expect(test1).not.toThrow();
    expect(test2).not.toThrow();
  });
});
