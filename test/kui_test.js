(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  module('jQuery#kui', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });

  test('is chainable', function() {
    expect(1);
    // Not a bad test to run on collection methods.
    strictEqual(this.elems.kui(), this.elems, 'should be chainable');
  });

  test('is kui', function() {
    expect(1);
    strictEqual(this.elems.kui().text(), 'kui0kui1kui2', 'should be kui');
  });

  module('jQuery.kui');

  test('is kui', function() {
    expect(2);
    strictEqual($.kui(), 'kui.', 'should be kui');
    strictEqual($.kui({punctuation: '!'}), 'kui!', 'should be thoroughly kui');
  });

  /*
  module(':kui selector', {
    // This will run before each test in this module.
    setup: function() {
      this.elems = $('#qunit-fixture').children();
    }
  });

  test('is kui', function() {
    expect(1);
    // Use deepEqual & .get() when comparing jQuery objects.
    deepEqual(this.elems.filter(':kui').get(), this.elems.last().get(), 'knows kui when it sees it');
  });
  */

}(jQuery));
