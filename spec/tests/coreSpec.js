var core = require('../../src/core.js');

describe('core.eval', function() {
  it('can be loaded', function() {
    expect(core).not.toBe(undefined);
  });

  it('throws on failed lookups', function() {
    var test = function() {
      core.readEval('(not-an-operator 42)');
    };

    expect(test).toThrow();
  });
});
