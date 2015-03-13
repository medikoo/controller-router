'use strict';

var validate  = require('./lib/validate')
  , getRouter = require('./lib/get-router');

module.exports = function (routes) { return getRouter(validate(routes)); };
