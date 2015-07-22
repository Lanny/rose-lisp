;(function() {
  module.exports.extend = function() {
    var target = arguments[0];

    for (var i = 1; i < arguments.length; i++) {
      var subject = arguments[i];
      for (var key in subject) {
        target[key] = subject[key];
      }
    }

    return target;
  };

  module.exports.subclass = function(superClass, constructor, methods) {
    var Klass;
   
    if (constructor === null) {
      var oldConstructor = superClass.constructor;
      Klass = function() {
        oldConstructor.apply(this, arguments);
      };
    } else {
      Klass = function() {
        constructor.apply(this, arguments);
      };
    }

    Klass.prototype = superClass;
    Klass.prototype.constructor = Klass;

    for (var meth in methods) {
      Klass.prototype[meth] = methods[meth];
    }

    return Klass;
  };

  module.exports.ident = function(x) {
    return x;
  };

  module.exports.isNumber = function(n) {
    return !isNaN(+n) && isFinite(n);
  };

  module.exports.repr = function(value) {
    if (value.toString !== undefined) {
      return value.toString();
    } else {
      return '' + value;
    }
  };
})();
