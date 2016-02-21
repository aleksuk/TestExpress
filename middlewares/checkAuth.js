var HttpError = require('../errors/http-error');

module.exports = function(req, res, next) {
  if (!req.session.user) {
    return next(new HttpError(401, 'Session expired'));
  }

  next();
};