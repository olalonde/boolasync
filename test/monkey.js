var assert = require('assert'),
  bool = require('../')({ monkey: true });

var truefn = function (cb) {
  process.nextTick(function () {
    cb(null, true);
  });
};

var falsefn = function (cb) {
  process.nextTick(function () {
    cb(null, false);
  });
};

var assert_true = function (done) {
  return function (err, istrue) {
    assert.ok(istrue);
    done();
  };
};

var assert_false = function (done) {
  return function (err, istrue) {
    assert.ok(!istrue);
    done();
  };
};

describe('bool', function () {
  describe('expressions', function () {
    it('true && true', function (done) {
      truefn.and(truefn).eval(assert_true(done));
    });
    it('true || true', function (done) {
      truefn.or(truefn).eval(assert_true(done));
    });
    it('true || false', function (done) {
      truefn.or(falsefn).eval(assert_true(done));
    });
    it('true && !false', function (done) {
      truefn.andNot(falsefn).eval(assert_true(done));
    });
    it('true || false || true', function (done) {
      truefn.or(falsefn).or(truefn).eval(assert_true(done));
    });
    it('false || true', function (done) {
      falsefn.or(truefn).eval(assert_true(done));
    });
    it('true && true && true', function (done) {
      truefn.and(truefn).and(truefn).eval(assert_true(done));
    });
    it('true || true || true', function (done) {
      truefn.or(truefn).or(truefn).eval(assert_true(done));
    });
    it('true && true || true', function (done) {
      truefn.and(truefn).or(truefn).eval(assert_true(done));
    });
    it('true && (true && true)', function (done) {
      truefn.and(truefn.and(truefn)).eval(assert_true(done));
    });
    it('false || !false', function (done) {
      falsefn.orNot(falsefn).eval(assert_true(done));
    });
    it('false && false', function (done) {
      falsefn.and(falsefn).eval(assert_false(done));
    });
    it('false || false', function (done) {
      falsefn.or(falsefn).eval(assert_false(done));
    });
    it('false || (false && true)', function (done) {
      falsefn.or(falsefn.and(truefn)).eval(assert_false(done));
    });
    it('true && false', function (done) {
      truefn.and(falsefn).eval(assert_false(done));
    });
    it('true && (false || (true && true))', function (done) {
      truefn.and(falsefn.or(truefn.and(truefn))).eval(assert_true(done));
    });
    it('true && (false || (true && false))', function (done) {
      truefn.and(falsefn.or(truefn.and(falsefn))).eval(assert_false(done));
    });
    it('true && (false || (true && !false))', function (done) {
      truefn.and(falsefn.or(truefn.andNot(falsefn))).eval(assert_true(done));
    });
    it('true && (false || (true && true && true)) && true', function (done) {
      truefn.and(falsefn.or(truefn.and(truefn))).and(truefn).eval(assert_true(done));
    });
    it('true && (false || false) && true', function (done) {
      truefn.and(falsefn.or(falsefn)).and(truefn).eval(assert_false(done));
    });
    it('true && (false || true) && true', function (done) {
      truefn.and(falsefn.or(truefn)).and(truefn).eval(assert_true(done));
    });
    it('true && (false || (true && true)) && !false', function (done) {
      truefn.and(falsefn.or(truefn.and(falsefn))).andNot(falsefn).eval(assert_true(done));
    });
    // arguments list
    it('true && (false && true && false) && true', function (done) {
      truefn.and(falsefn, truefn, falsefn).and(truefn).eval(assert_false(done));
    });
    // array
    it('true && (false && true && false) && true', function (done) {
      truefn.and([falsefn, truefn, falsefn]).and(truefn).eval(assert_false(done));
    });
  });

});

