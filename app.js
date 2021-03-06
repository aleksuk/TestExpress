var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejsLocals = require('ejs-locals');
var HttpError = require('./errors/http-error');
var config = require('./config');
var session = require('express-session');
var routes = require('./routes/index');
var users = require('./routes/users');
var mongoose = require('./libs/mongoose');
var log = require('./libs/log')(module);
var sessionStore = require('./libs/session-store');

var app = express();

// view engine setup
app.engine('ejs', ejsLocals);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(require('./middlewares/sendHttpError'));

app.use(cookieParser());

app.use(session({
  secret: config.get('session:secret'),
  key: config.get('session:key'),
  cookie: config.get('session:cookie'),
  store: sessionStore
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use(require('./middlewares/loadUser'));

//app.use(function (req, res, next) {
//  req.session.numberOfVisits = req.session.numberOfVisits + 1 || 1;
//  res.send('visits: ' + req.session.numberOfVisits)
//});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    if (err instanceof HttpError) {
      return res.sendHttpError(err);
    }

    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

log.info('server started');
module.exports = app;
