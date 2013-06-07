function Expression(type, inverse) {
  this.type = type;
  this.inverse = inverse;
  // operand can be an async function or an Expression
  this.operands = [];

  this.externalCallback = function () {};

  return this;
}

Expression.prototype.add = function (operands) {
  // @true: wrap sync functions and anything that is not a Expression 
  // instance or an async function
  this.operands = this.operands.concat(operands);
};

Expression.prototype.getCallback = function () {
  if (this.callback) return this.callback;

  var _this = this;

  var count = 0;
  var responded = false;

  var respond = function (res) {
    if (responded) return;
    responded = true;
    if (_this.inverse) res = !res;
    _this.externalCallback(null, res);
  };

  var callbacks = {
    and: function (res) {
      // respond as soon as we get a false value
      if (!res) {
        respond(false);
      }
      else if (count === _this.operands.length - 1) {
        respond(true);
      }
      else {
        count++;
      }
    },
    or: function (res) {
      // respond as soon as we get a true value
      if (res) {
        respond(true);
      }
      else if (count === _this.operands.length - 1) {
        // every operand is false
        respond(false);
      }
      else {
        count++;
      }
    }
  };

  this.callback = function (err, res) {
    res = !!res; // coerce to boolean
    if (responded) return;
    if (err) return respond(err);
    callbacks[_this.type](res);
  };

  return this.callback;
};

Expression.prototype.eval = function (cb) {
  this.externalCallback = cb;

  var _this = this;
  this.operands.forEach(function (operand) {
    // execute functions in parallel
    if (typeof operand === 'function') {
      operand(_this.getCallback());
    }
    else if (operand.eval) {
      operand.eval(_this.getCallback());
    }
    else {
      throw new Error('Invalid operand type: must be function or Expression instance');
    }
  });

  return this;
  // convert functions/expressions for async.each

};

// the first and/or/andNot/orNot
// fn1.and(fn2.or(fn3))

var last_expr;

['and', 'or', 'andNot', 'orNot'].forEach(function (method) {
  var inverse = false;
  var type = method;
  var matches = /^(.*)Not$/.exec(method);

  // andNot => type = and, inverse = true
  if (matches) {
    type = matches[1];
    inverse = true;
  }

  Function.prototype[method] = Expression.prototype[method] = function () {
    var expr = new Expression(type, inverse);

    expr.add(this);

    var args = Array.prototype.slice.call(arguments, 0);
    if (Array.isArray(args[0])) {
      args = args[0];
      //console.log(args);
    }
    expr.add(args);

    //console.log(expr);

    return expr;
  };
});

