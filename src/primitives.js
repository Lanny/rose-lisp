;(function() {
  var parser = require('./parser');
  var utils = require('./utils');
  var nil = parser.nil;

  var Environment = function() {
    parser.LinkedList.apply(this, arguments);
  };

  Environment.prototype = new parser.LinkedList();

  Environment.prototype.constructor = Environment;
  Environment.prototype.lookup = function(symbol) {
    if (symbol.text in this.value) {
      return this.value[symbol.text];
    } else if (this.cdr().length > 0) {
      return this.next.lookup(symbol);
    } else {
      throw 'Symbol "' + symbol.text + '" not found';
    }
  };

  Environment.prototype.augment = function(newVars) {
    return this.cons(newVars);
  };

  Environment.prototype.bind = function(key, val) {
    // Binds a value to a name. Note that this method, unlike augment, mutates
    // the environment and should be used in a limited fashion.
    this.value[key] = val;
  };

  var rFunction = function(body, env) {
    this.body = body;
    this.env = env;
  };

  var PrimitiveFunction = function() {
  };
  PrimitiveFunction.prototype = new rFunction();
  PrimitiveFunction.constructor = PrimitiveFunction;

  var makePrimitiveFunction = function(pApply) {
    return utils.subclass(new PrimitiveFunction(), utils.ident,
        { 'primitiveApply': pApply });
  };

  var PlusOperator = makePrimitiveFunction(function(args) {
    return args.reduce(function(x, y) {
      return x + y;
    }, 0);
  });

  var GreaterThanOperator = makePrimitiveFunction(function(args) {
    var satisfied = true;

    args.reduce(function(x, y) {
      if (!utils.isNumber(x) || !utils.isNumber(y)) {
        throw '> can only compare numbers';
      }

      satisfied = satisfied && x > y;
      return y;
    });

    return satisfied;
  });

  var Print = makePrimitiveFunction(function(args) {
    console.log(args.reduce(function(acc, item) {
      return acc + utils.repr(item);
    }, ""));

    return nil;
  });

  var SpecialForm = utils.subclass(new PrimitiveFunction(), utils.ident, {});

  var makeSpecialForm = function(sApply) {
    return utils.subclass(new SpecialForm(), utils.ident,
        { 'specialApply': sApply });
  };

  var Do = makeSpecialForm(function(args, env, core) {
    // lol, reduce abuse
    return args.reduce(function(accum, curForm) {
      return core.rEval(curForm, env);
    }, null);
  });

  var Let = makeSpecialForm(function(args, env, core) {
    if (!(args.car() instanceof parser.AST)) {
      throw 'First expr in let must be a sexpr';
    }
    var runner = args.car()._children;

    if (runner.length % 2 !== 0) {
      throw 'Let must receive an even number of bindings';
    }

    // Since successive binds may require their previous values we can't
    // collect the rvals and augment at the end, but let does create a new
    // scope level so we add a level up front populate is as we eval rvals
    env = env.augment({});

    while (runner.length > 0) {
      var lval = runner.car();
      var rval = runner.cdr().car();
      runner = runner.cdr().cdr();

      if (!(lval instanceof parser.Symbol)) {
        throw 'Bind names must be symbols, instead got: ' + lval;
      }

      env.bind(lval.text, core.rEval(rval, env));
    }

    return new Do().specialApply(args.cdr(), env, core);
  });

  var If = makeSpecialForm(function(args, env, core) {
    if (args.length !== 2 && args.length !== 3) {
      throw 'If only takes either two or three arguments';
    }

    var test = args.car();
    var sArm = args.cdr().car();

    if (core.rEval(test, env)) {
      return core.rEval(sArm, env);
    } else {
      if (args.length === 3) {
        var fArm = args.cdr().cdr().car();
        return core.rEval(fArm);
      } else {
        return nil;
      }
    }
  });

  exports.PrimitiveFunction = PrimitiveFunction;
  exports.SpecialForm = SpecialForm;
  exports.baseEnv = new Environment().augment({
    'do': new Do(),
    'let': new Let(),
    'if': new If(),
    '>': new GreaterThanOperator(),
    '+': new PlusOperator(),
    'print': new Print()
  });
})();
