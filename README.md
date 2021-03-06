# Boolasync

[![Build Status](https://travis-ci.org/olalonde/boolasync.png)](https://travis-ci.org/olalonde/boolasync) [![NPM version](https://badge.fury.io/js/boolasync.png)](http://badge.fury.io/js/boolasync)

Async boolean logic. Introduction: [http://syskall.com/introducing-boolasync-async-boolean-logic-library/](http://syskall.com/introducing-boolasync-async-boolean-logic-library/)

```javascript
require('boolasync')({ monkey: true }); 

// fn1 && fn2 || fn3 && (fn4 || !fn5 && fn6)
fn1.and(fn2).or(fn3).and(fn4.orNot(fn5).and(fn6)).eval(function (err, res) {
  if (err) return console.error(err);
  if (res) {
    console.log('The expression evaluated to true.');
  }
  else {
    console.log('The expression evaluated to false.');
  }
});
```

One advantage bool has over executing all your async functions, waiting
for their return values and doing native boolean operations is that it
lazy evaluates callbacks. Meaning that it won't wait for a function's
return value if it already knows the final result will be false/true. Just like Javascript does.

## Usage

```javascript
// this will monkey patch Function.prototype to expose .and, .or, .andNot and .or Not

var boolasync = require('boolasync')({ monkey: true });

// if you don't want monkey patching

var boolasync = require('boolasync'),
  w = boolasync.wrap;

// now you need to wrap functions with boolasync.wrap before you
// can call the boolean operators on them

fn1 = w(fn1);
fn2 = w(fn2);

fn1.and(fn2.or(fn3));
```

(wannabe) [BNF notation](http://en.wikipedia.org/wiki/Backus%E2%80%93Naur_Form):

```
<expression> ::= "fn." <method> "(" <arguments> ")" <expression> | ""
<arguments> ::= <expression> | "[" <list> "]" | <list>
<list> ::= <expression> | <expression>,<list> 
<method> ::= "and" | "or" | "andNot" | "orNot"
```

or

```javascript
fn.and(fn2).eval(cb)
fn.or(fn2).eval(cb)
fn.andNot(fn2).eval(cb)
fn.orNot(fn2).eval(cb)
```

The signature for `fn` is: `function (callback) {}` where callback's 
signature is `function (err, res)`. Res should be a boolean or it will
be coerced to a boolean.

The signature for `cb` is: `function (err, istrue) {}` where `istrue` is
the result of the expression.

You can nest expressions:

```javascript
// fn && (fn2 || fn3)
fn.and(fn2.or(fn3)).eval()
```

Here is a more concrete example:

```javascript
var is_user = function (cb) {
  process.nextTick(function (cb) {
    cb(null, true);
  });
}
var is_admin = function (cb) {
  process.nextTick(function (cb) {
    cb(null, false);
  });
}
var is_superadmin = function (cb) {
  process.nextTick(function (cb) {
    cb(null, true);
  });
}

// is_user && (is_admin || id_superadmin)
is_user.and(is_admin.or(is_superadmin)).eval(function (err, istrue) {
  if (istrue) {
    console.log('user is authorized');
  }
  else {
    console.log('user is not authorized');
  }
});
```

3 ways to write the same thing:

```javascript
is_user.and(is_admin).and(is_superadmin)

is_user.and([is_admin, is_superadmin])

is_user.and(is_admin, is_superadmin)
```

## Roadmap

- Support this type of syntax:

```
bool("? and ? or (? and ?)", [ fn1, fn2, fn3, fn4 ], cb);
```

- Browser friendly build.

- Wrapper utility for sync functions and non-functions.

Instead of `.eval(cb)`, simply call `(cb)` at the end.

- Version that uses function generators

- Stingify expression object to nice representation. i.e.: (fn1 && fn2 || fn3)

## License

MIT: [http://olalonde.mit-license.org](http://olalonde.mit-license.org)
