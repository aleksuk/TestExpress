var express = require('express');
var router = express.Router();
var User = require('../app/models/user').User;
var HttpError = require('../errors/http-error');
var AuthError = require('../errors/auth-error');
var async = require('async');
var app = require('../app');

router.post('/', function (req, res, next) {
  var sid = req.session.id;
  var io = req.app.get('io');

  req.session.destroy(function (err) {
    io.engine.emit('session:reload', sid)

    if (err) {
      return next(err);
    }

    res.redirect('/');
  });
});

module.exports = router;