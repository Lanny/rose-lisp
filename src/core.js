;(function() {
  var parser = require('./parser');
  var primitives = require('./primitives');
  var utils = require('./utils');

  var rEval = function(expr, env) {
    if (env === undefined) {
      env = primitives.baseEnv.augment({});
    }

    if (expr instanceof parser.Literal) {
      return expr.value();
    } else if (expr instanceof parser.Symbol) {
      return env.lookup(expr);
    } else if (expr instanceof parser.AST) {
      // A little wonky but w/e, eval the car first because that's the only way
      // we can tell if it's a special form or not.
      var fn = rEval(expr._children.car(), env);
      var args = expr._children.cdr();

      if (fn instanceof primitives.SpecialForm) {
        return fn.specialApply(args, env, module.exports);
      } else {
        return rApply(fn, evalList(args, env));
      }
    } else {
      throw 'Bad output from parser: ' + expr;
    }
  };

  var rApply = function(fn, args) {
    if (fn instanceof primitives.PrimitiveFunction) {
      return fn.primitiveApply(args);
    } else {
      var env = fn.env.augment(args);
      return rEval(fn.body, env);
    }
  };

  var evalList = function(list, env) {
    return list.map(function(x) {
      return rEval(x, env);
    })
    .reverse();
  };

  var REPL = function() {
    var readline = require('readline');
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    var env = primitives.baseEnv.augment({});

    var loop = function(input) {
      var result = readEval(input, env);
      var stringResult = utils.repr(result);

      rl.write(stringResult);
      rl.write('\n');

      rl.question('ƒ ', loop);
    };

    rl.question('ƒ ', loop);
  };

  var readEval = function(input, env) {
    if (env === undefined) {
      env = primitives.baseEnv.augment({});
    }
    return rEval(parser.parse(input), env);
  };

  module.exports.REPL = REPL;
  module.exports.rEval = rEval;
  module.exports.rApply = rApply;
  module.exports.evalList = evalList;
  module.exports.readEval = readEval;

  if (require.main === module) {
    REPL();
  }
})();
