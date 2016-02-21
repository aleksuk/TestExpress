var express = require('express');
var router = express.Router();
var User = require('../app/models/user').User;
var HttpError = require('../errors/http-error');
var ObjectID = require('mongodb').ObjectID;

/* GET users listing. */
router.get('/', function(req, res, next) {
  User.find({}, function (err, users) {
    if (err) {
      return next(err);
    }

    res.json(users);
  })
});

router.get('/:id', function(req, res, next) {
  try {
    var id = new ObjectID(req.params.id);
  } catch (e) {
    return next(new HttpError(404));
  }

  User.findById(id, function (err, user) {
    if (err) {
      return next(err);
    }

    res.json(user);
  });
});

module.exports = router;
