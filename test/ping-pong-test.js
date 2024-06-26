var assert = require('assert');
var asn1 = require('..');

var Buffer = require('buffer').Buffer;

describe('asn1.js ping/pong', function() {
  function test(name, model, input, expected) {
    it('should support ' + name, function() {
      var M = asn1.define('TestModel', model);

      var encoded = M.encode(input, 'der');
      var decoded = M.decode(encoded, 'der');
      assert.deepEqual(decoded, expected !== undefined ? expected : input);
    });
  }

  describe('primitives', function() {
    test('int', function() {
      this.int();
    }, 0);

    test('enum', function() {
      this.enum({ 0: 'hello', 1: 'world' });
    }, 'world');

    test('octstr', function() {
      this.octstr();
    }, new Buffer('hello'));

    test('gentime', function() {
      this.gentime();
    }, 1385921175000);

    test('utctime', function() {
      this.utctime();
    }, 1385921175000);

    test('null', function() {
      this.null_();
    }, null);

    test('objid', function() {
      this.objid({
        '1 3 6 1 5 5 7 48 1 1': 'id-pkix-ocsp-basic'
      });
    }, 'id-pkix-ocsp-basic');

    test('true', function() {
      this.bool();
    }, true);

    test('false', function() {
      this.bool();
    }, false);

    test('any', function() {
      this.any();
    }, new Buffer('ok any'));

    test('default explicit', function() {
      this.def('v1').explicit(0).int({
        0: 'v1',
        1: 'v2'
      });
    }, undefined, 'v1');

    test('implicit', function() {
      this.implicit(0).int({
        0: 'v1',
        1: 'v2'
      });
    }, 'v2', 'v2');
  });

  describe('composite', function() {
    test('2x int', function() {
      this.seq().obj(
        this.key('hello').int(),
        this.key('world').int()
      );
    }, { hello: 4, world: 2 });

    test('enum', function() {
      this.seq().obj(
        this.key('hello').enum({ 0: 'world', 1: 'devs' })
      );
    }, { hello: 'devs' });

    test('optionals', function() {
      this.seq().obj(
        this.key('hello').enum({ 0: 'world', 1: 'devs' }),
        this.key('how').optional().def('are you').enum({
          0: 'are you',
          1: 'are we?!'
        })
      );
    }, { hello: 'devs', how: 'are we?!' });

    test('optionals #2', function() {
      this.seq().obj(
        this.key('hello').enum({ 0: 'world', 1: 'devs' }),
        this.key('how').optional().def('are you').enum({
          0: 'are you',
          1: 'are we?!'
        })
      );
    }, { hello: 'devs' }, { hello: 'devs', how: 'are you' });

    test('setof', function() {
      var S = asn1.define('S', function() {
        this.seq().obj(
          this.key('a').def('b').int({ 0: 'a', 1: 'b' }),
          this.key('c').def('d').int({ 2: 'c', 3: 'd' })
        );
      });
      this.seqof(S);
    }, [{}, { a: 'a', c: 'c' }], [{ a: 'b', c: 'd' }, { a: 'a', c: 'c' }]);
  });
});
