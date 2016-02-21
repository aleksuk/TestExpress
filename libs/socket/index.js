var socket = require('socket.io');
var log = require('../log')(module);
var sessionStore = require('../session-store');
var User = require('../../app/models/user').User;
var cookie = require('cookie');
var HttpError = require('../../errors/http-error');
var async = require('async');
var cookieParser = require('cookie-parser');
var config = require('../../config');

function loadSession(sid, callback) {
  // sessionStore callback is not quite async-style!
  sessionStore.load(sid, function(err, session) {
    if (arguments.length == 0) {
      // no arguments => no session
      return callback(null, null);
    } else {
      return callback(null, session);
    }
  });
}

function loadUser(session, callback) {
  if (!session.user) {
    log.debug('Session %s is anonymous', session.id);
    return callback(null, null);
  }

  log.debug('retrieving user ', session.user);

  User.findById(session.user, function(err, user) {
    if (err) {
      return callback(err);
    }

    if (!user) {
      return callback(null, null);
    }

    log.debug('user findbyId result: ' + user);
    callback(null, user);
  });

}


module.exports = function (server) {
  var io = socket.listen(server);

  io.set('origins', 'localhost:*');
  io.set('logger', log);

  io.use(function (socket, callback) {
    async.waterfall([
      function (callback) {
        // сделать handshakeData.cookies - объектом с cookie
        socket.request.cookies = cookie.parse(socket.request.headers.cookie || '');

        var sidCookie = socket.request.cookies[config.get('session:key')];
        var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));

        loadSession(sid, callback);
      },

      function (session, callback) {
        if (!session) {
          callback(new HttpError(401, 'No session'));
        }

        socket.session = session;
        loadUser(session, callback);
      },

      function (user, callback) {
        if (!user) {
          callback(new HttpError(403, 'Anonymous session may not connect'));
        }

        socket.user = user;
        callback(null);
      }
    ], function(err) {
      if (!err) {
        return callback(null, true);
      }

      if (err instanceof HttpError) {
        return callback(null, false);
      }

      callback(err);
    });
  });

  io.engine.on('session:reload', function(sid) {
    var clients = io.sockets.clients().sockets;
    var ids = Object.keys(clients);

    ids.forEach(function(clientSocketId) {
      var client = clients[clientSocketId];
      if (client.session.id !== sid) {
        return ;
      }

      loadSession(sid, function(err, session) {
        if (err) {
          client.emit('error', 'server error');
          client.disconnect();
          return ;
        }

        if (!session) {
          client.emit('logout');
          client.disconnect();
          return ;
        }

        client.session = session;
      });
    });
  });

  io.sockets.on('connection', function (socket) {
    var username = socket.user.get('username');

    socket.broadcast.emit('join', username);

    socket.on('message', function (text, cb) {
      socket.broadcast.emit('message', username, text);
      cb && cb();
    });

    socket.on('disconnect', function () {
      socket.broadcast.emit('leave', username);
    });
  });

  return io;
};