//var mongoose = require('mongoose');
//
//// Connection URL
//var url = 'mongodb://localhost:27017/chat';
//// Use connect method to connect to the Server
//MongoClient.connect(url, function(err, db) {
//  assert.equal(null, err);
//  console.log("Connected correctly to server");
//  var collection = db.collection('documents');
//  // Insert some documents
//  collection.remove({}, function (err, affected) {
//    if (err) {
//      throw err;
//    }
//
//    collection.insertMany([
//      {a : 1}, {a : 2}, {a : 3}
//    ], function(err, result) {
//      assert.equal(err, null);
//      assert.equal(3, result.result.n);
//      assert.equal(3, result.ops.length);
//      console.log("Inserted 3 documents into the document collection");
//
//      collection.find({ a: 2 }).toArray(function (err, result) {
//        console.dir(result);
//
//        db.close();
//      });
//    })
//  });
//});
//

var mongoose = require('../libs/mongoose');

var async = require('async');

async.series([
  open,
  dropDatabase,
  requireModels,
  createUsers
], function(err) {
  console.log(arguments);
  mongoose.disconnect();
  process.exit(err ? 255 : 0);
});

function open(callback) {
  mongoose.connection.on('open', callback);
}

function dropDatabase(callback) {
  var db = mongoose.connection.db;
  db.dropDatabase(callback);
}

function requireModels(callback) {
  require('../app/models/user');

  async.each(Object.keys(mongoose.models), function(modelName, callback) {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}

function createUsers(callback) {

  var users = [
    {username: 'Вася', password: 'supervasya'},
    {username: 'Петя', password: '123'},
    {username: 'admin', password: 'thetruehero'}
  ];

  async.each(users, function(userData, callback) {
    var user = new mongoose.models.User(userData);
    user.save(callback);
  }, callback);
}