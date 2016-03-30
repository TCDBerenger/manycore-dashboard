var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

// EJS
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Express
app.use(favicon(__dirname + '/public/assets/favicon.ico'));
app.use(logger('dev'));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// JSON data in requests
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: false })); // true for parsing application/x-www-form-urlencoded

// Public server
app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/libs', express.static(path.join(__dirname, 'public_libs')));
app.use('/xp', express.static(path.join(__dirname, 'public_xp')));

// Server endpoints
app.use('/service/admin', require('./routes/admin'));
app.use('/service/collect', require('./routes/collect'));
app.use('/service/dash', require('./routes/dash'));
app.use('/service/details', require('./routes/details'));
app.use('/service/profiles', require('./routes/profiles'));
app.use('/service/raw', require('./routes/raw'));

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


module.exports = app;