var express = require('express');
var router = express.Router();
var User = require('../app/models/user').User;
var HttpError = require('../errors/http-error');
var AuthError = require('../errors/auth-error');
var async = require('async');


router.get('/', function (req, res, next) {
  res.render('login');
});

router.post('/', function (req, res, next) {
  var username = req.body.username;
  var password = req.body.password;

  User.authorize(username, password, function (err, user) {
    if (err) {
      if (err instanceof AuthError) {
        return next(new HttpError(403, 'Invalid password'));
      } else {
        return next(err);
      }
    }

    req.session.user = user._id;
    res.send({});
  });

  //async.waterfall([
  //  function (callback) {
  //    User.findOne({ username: username }, callback);
  //  },
  //
  //  function (user, callback) {
  //    if (user) {
  //      if (user.checkPassword(password)) {
  //        callback(null, user);
  //      } else {
  //        next(new HttpError(403, 'Invalid password'));
  //      }
  //    } else {
  //      var user = new User({
  //        username: username,
  //        password: password
  //      });
  //
  //      user.save(function (err, user) {
  //        if (user) {
  //          return next(err);
  //        }
  //
  //        callback(null, user);
  //      });
  //    }
  //  }
  //], function (err, user) {
  //  if (err) {
  //    return next(err);
  //  }
  //
  //  req.session.user = user._id;
  //  res.send({});
  //});
});
//
//exports.post = function(req, res, next) {
//  var username = req.body.username;
//  var password = req.body.password;
//
//  User.authorize(username, password, function(err, user) {
//    if (err) {
//      if (err instanceof AuthError) {
//        return next(new HttpError(403, err.message));
//      } else {
//        return next(err);
//      }
//    }
//
//    req.session.user = user._id;
//    res.send({});
//
//  });
//
//};

module.exports = router;