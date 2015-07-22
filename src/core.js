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
    } else if (expr instanceof parser.LinkedList) {
      // A little wonky but w/e, eval the car first because that's the only way
      // we can tell if it's a special form or not.
      var fn = rEval(expr.car(), env);
      var args = expr.cdr();

      if (fn instanceof primitives.RoseMacro) {
        return fn.macroApply(args, env, module.exports);
      } else if (fn instanceof primitives.SpecialForm) {
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
    } else if (fn instanceof primitives.RoseFunction) {
      var env = fn.env.augment(fn.mapArgs(args));

      return rEval(fn.body, env);
    } else {
      throw 'First form in a sexpr must be a function, instead: ' + fn;
    }
  };

  var evalList = function(list, env) {
    return list.map(function(x) {
      return rEval(x, env);
    })
    .reverse();
  };

  var readEval = function(input, env) {
    if (env === undefined) {
      env = primitives.baseEnv.augment({});
    }
    return rEval(parser.parse(input), env);
  };

  var REPL = function() {
    var readline = require('readline');
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    var env = primitives.baseEnv.augment({});

    var loop = function(input) {
      var result, stringResult;

      try {
        result = readEval(input, env);
        stringResult = utils.repr(result);
      } catch (e) {
        console.log(e);
      }

      rl.write(stringResult);
      rl.write('\n');

      rl.question('🌹 ', loop);
    };

    rl.on('close', function() {
      console.log('\nGrowing strong');
    });

    rl.question('🌹 ', loop);
  };

  var consult = function(filename) {
    var fs = require('fs');
    var program = fs.readFileSync(filename);

    return readEval('(do ' + program + ')'); // lol
  };

  module.exports.REPL = REPL;
  module.exports.rEval = rEval;
  module.exports.rApply = rApply;
  module.exports.evalList = evalList;
  module.exports.readEval = readEval;

  if (require.main === module) {
    if (process.argv.length > 2) {
      consult(process.argv[process.argv.length - 1]);
    } else {
      REPL();
    }
  }
})();
