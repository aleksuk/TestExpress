var path = require('path');
var util = require('util');

function AuthError(message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, AuthError);

  this.message = message || 'Error';
}

util.inherits(AuthError, Error);
AuthError.prototype.name = 'AuthError';

module.exports = AuthError;