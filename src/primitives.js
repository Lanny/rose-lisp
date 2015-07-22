;(function() {
  var parser = require('./parser');
  var utils = require('./utils');
  var nil = parser.nil;

  var fromJS = function(value) {
    // Wrap data from JS in our own structures (i.e. the JSFunction wrapper)
    if (typeof value === 'function') {
      return new JSFunction(value);
    } else {
      return value;
    }
  };
  
  var toJS = function(value) {
    if (value instanceof Object && typeof value.toJS === 'function') {
      return value.toJS();
    } else {
      return value;
    }
  };

  var Environment = function() {
    parser.LinkedList.apply(this, arguments);

    this.namespaces = {};
  };

  Environment.prototype = new parser.LinkedList();

  Environment.prototype.constructor = Environment;
  Environment.prototype.lookup = function(symbol) {
    var parts = symbol.text.split('/');
    var name, namespaceName;
    if (parts.length > 1) {
      name = parts[parts.length - 1];
      namespaceName = parts.slice(0, -1).join('/');
    } else {
      name = symbol.text;
      namespaceName = null;
    }

    // If there's a namespace qualifier do some magic to resolve that
    if (namespaceName === 'js') {
      // Shutup jshint, you don't know me!
      var value = eval(name); // jshint ignore:line
      return fromJS(value);
    } else if (namespaceName !== null) {
      var namespace = this.lastCell().namespaces[namespaceName];

      if (namespace instanceof Environment) {
        // if it's a rose namespace, we follow the usual lookup process
        // and be sure to re-forge it into a symbol
        return namespace.lookup(new parser.Symbol(name));
      } else {
        // but in the case of a javascript module access, we don't enforce the
        // scope rules so we just return the property
        return fromJS(namespace[name]);
      }
    }

    if (name in this.value) {
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

  var RoseFunction = function(binds, body, env) {
    this.binds = binds;
    this.body = body;
    this.env = env;
  };

  RoseFunction.constructor = RoseFunction;
  RoseFunction.prototype = {
    mapArgs: function(args) {
      var binds = {};

      var lRunner = this.binds; // lvals
      var rRunner = args;       // rvals

      while (lRunner.length > 0 && rRunner.length > 0) {
        binds[lRunner.car().text] = rRunner.car();

        lRunner = lRunner.cdr();
        rRunner = rRunner.cdr();
      }

      return binds;
    },
    toJS: function() {
      // Returns a JS native function that, when called, executes the wrapped
      // RoseFunction.
      var core = require('./core');
      var self = this;

      return function() {
        var args = nil;

        for (var i = arguments.length - 1; i--; i >= 0) {
          args = args.cons(arguments[i]);
        }

        var env = self.env.augment(self.mapArgs(args));

        return rEval(self.body, env);
      };
    }
  };

  var RoseMacro = utils.subclass(
    new RoseFunction(),
    function(binds, body, env) {
      this.binds = binds;
      this.body = body;
      this.env = env;
    },
    {
      macroExpand: function(args, env, core) {
        var macroEnv = this.env.augment(this.mapArgs(args));
        var newForm = core.rEval(this.body, macroEnv);

        return newForm;
      },
      macroApply: function(args, env, core) {
        var newForm = this.macroExpand(args, env, core);

        return core.rEval(newForm, env);
      }
    });

  var PrimitiveFunction = utils.subclass({}, null, {});

  // Wraps a native javascript function so we can call it like a regular
  // rose function/primitive function
  var JSFunction = utils.subclass(
    new PrimitiveFunction(),
    function(baseFunction, boundThis) {
      this.baseFunction = baseFunction;

      // 2 arg form is like calling baseFunction.bind(boundThis), I'm not sure
      // if we'll ever actually find this useful but w/e
      this.boundThis = boundThis || null;
    },
    {
      primitiveApply: function(args) {
        var effectiveThis = (this.boundThis === null) ? this : this.boundThis;
        var nativeArgs = args.map(toJS).reverse().toArray();

        return this.baseFunction.apply(effectiveThis, nativeArgs);
      },
      construct: function(args) {
        var obj = {};
        this.baseFunction.apply(obj, args);
        return obj;
      },
      toJS: function() {
        return this.baseFunction;
      }
    });

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

  var New = makePrimitiveFunction(function(args) {
    var constructor = args.car();
    var argsArr = args.cdr().toArray();

    // Constructors, being functions, would be wrapped on lookup
    constructor.construct(argsArr);

    return obj;
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
    if (!(args.car() instanceof parser.LinkedList)) {
      throw 'First expr in let must be a sexpr';
    }
    var runner = args.car();

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
        return core.rEval(fArm, env);
      } else {
        return nil;
      }
    }
  });

  var Lambda = makeSpecialForm(function(args, env, core) {
    if (args.length !== 2) {
      throw 'Lambda forms must have exactly one binds and one body';
    }

    var binds = args.car();
    var body = args.cdr().car();

    binds.each(function(x) {
      if (!(x instanceof parser.Symbol)) {
        throw 'Function bind names must be symbols';
      }
    });

    return new RoseFunction(binds, body, env);
  });

  var List = makeSpecialForm(function(args, env, core) {
    return core.evalList(args, env);
  });

  var Macro = makeSpecialForm(function(args, env, core) {
    if (args.length !== 2) {
      throw 'Macro forms must have exactly one binds and one body';
    }

    var binds = args.car();
    var body = args.cdr().car();

    binds.each(function(x) {
      if (!(x instanceof parser.Symbol)) {
        throw 'Macro bind names must be symbols';
      }
    });

    return new RoseMacro(binds, body, env);
  });

  var MacroExpand = makeSpecialForm(function(args, env, core) {
    var form = core.rEval(args.car(), env);
    var macro = core.rEval(form.car(), env);
    var macroArgs = form.cdr();

    return macro.macroExpand(macroArgs, env, core);
  });

  var Def = makeSpecialForm(function(args, env, core) {
    if (args.length !== 2) {
      throw 'Def takes exactly one identifier and one expression';
    }

    var identifier = args.car();
    var expr = args.cdr().car();

    if (!(identifier instanceof parser.Symbol)) {
      throw 'Identifier must be a symbol';
    }

    var value = core.rEval(expr, env);
    var runner = env;

    while (runner.length > 2) {
      runner = runner.cdr();
    }

    runner.bind(identifier.text, value);

    return value;
  });

  var JSRequire = makeSpecialForm(function(args, env, core) {
    var moduleName = core.rEval(args.car(), env);
    
    if (typeof moduleName !== 'string') {
      throw 'First argument to js-require must always be a string';
    }

    var jsmodule = require(moduleName);
    env.lastCell().namespaces[moduleName] = jsmodule;
  });

  var Consult = makeSpecialForm(function(args, env, core) {
    var fs = require('fs');
    var modulename = core.rEval(args.car(), env);
    var filename = modulename + '.rose';
    var program = fs.readFileSync(filename);

    var ns = exports.baseEnv.augment({});
    core.readEval('(do ' + program + ')', ns);

    env.lastCell().namespaces[modulename] = ns;
  });

  var Quote = makeSpecialForm(function(args, env, core) {
    if (args.length > 1) {
      throw 'quote takes exactly one argument';
    }

    return args.car();
  });

  exports.RoseFunction = RoseFunction;
  exports.RoseMacro = RoseMacro;
  exports.PrimitiveFunction = PrimitiveFunction;
  exports.SpecialForm = SpecialForm;
  exports.baseEnv = new Environment().augment({
    'do': new Do(),
    'let': new Let(),
    'if': new If(),
    'λ': new Lambda(),
    'def': new Def(),
    'js-require': new JSRequire(),
    'consult': new Consult(),
    'new': new New(),
    'list': new List(),
    'macro': new Macro(),
    'macroexpand': new MacroExpand(),
    'quote': new Quote(),
    '>': new GreaterThanOperator(),
    '+': new PlusOperator(),
    'print': new Print(),
    'nil': nil
  });
})();
