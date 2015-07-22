var core = require('../../src/core.js');
var parser = require('../../src/parser.js');
var nil = parser.nil;

describe('primitives.Environment', function() {
  it('has the js/ namespace', function() {
    var testString = '(js/parseInt "23")';
    var result = core.readEval(testString);

    expect(typeof result).toBe('number');
    expect(result).toBe(23);
  });
});

describe('primitives.JSRequire', function() {
  it('allows us to import javascript modules', function() {
    var testString = '(do (js-require "os") os/EOL)';

    expect(typeof core.readEval(testString)).toBe('string');
  });

  it('allows us to alias modules', function() {
  });
});

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

  it('gives precedence to inner binds', function() {
    var testString = '(let (k 2) (let (k  42) k))';

    expect(core.readEval(testString)).toBe(42);
  });

  it('doesn\'t leak binds', function() {
    var testString = '(let (k 42) (let (k 41) k) k)';

    expect(core.readEval(testString)).toBe(42);
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

describe('primitives.Lambda', function() {
  it('allows us to define anonymous functions', function() {
    var testString = '(let (f (λ (a b c) (+ a (+ b c)))) ' +
       '(+ (f 1 2 3) (f 0 1 1)))';

    expect(core.readEval(testString)).toBe(8);
  });

  it('forms a closure', function() {
    var testString = '((let (x 42) (let (f (λ () x)) f)))';
    
    expect(core.readEval(testString)).toBe(42);
  });
});

describe('primitives.Def', function() {
  it('can bind names in the current env', function() {
    var testString = '(do (def x 40) (+ x 2))';
    expect(core.readEval(testString)).toBe(42);
  });

  it('can rebind names', function() {
    var testString = '(do (def x 40) (def x 5) (+ x 2))';
    expect(core.readEval(testString)).toBe(7);
  });

  it('is not contained by scope', function() {
    var testString = '(do (let (x 42) (def x 29)) x)';

    expect(core.readEval(testString)).toBe(29);
  });

  it('is trumped by let binds', function() {
    var testString = '(do (def x 42) (let (x 21) x))';

    expect(core.readEval(testString)).toBe(21);
  });
});

describe('primitives.Quote', function() {
  it('does not evaluate its contents', function() {
    var testString = '(quote 42)';

    expect(core.readEval(testString) instanceof parser.Literal).toBe(true);
  });

  it('works with lists too', function() {
    var testString = '(quote (1 2 3))';
    var result = core.readEval(testString);

    expect(result instanceof parser.LinkedList).toBe(true);
    expect(result.length).toBe(3);
    expect(result.equals(['1', '2', '3'])).toBe(true);
  });
});

/*
describe('primitives.Macro', function() {
  it('is a macro, lol', function() {
    var testString = '(do (def defλ (macro (name binds body) (list ' +
      '(quote def) name (list (quote λ) binds body)))) (macroexpand (quote'
    var testString = '(let (m (macro (name binds
  })
})
*/
