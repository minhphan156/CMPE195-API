var express = require('express');
var session = require('express-session');
var logger = require('morgan');
var RuntimeVars = require('./services/RuntimeVars');
var cookieParser = require('cookie-parser');
var SequelizeStore = require('connect-session-sequelize')(session.Store);
var sequelize = require('./services/sequelize');
var auth = require('./middlewares/auth');

var indexRouter = require('./routes/index');
var app = express();

// Setup custom timestamp token for logger
logger.token('timestamp', function() { 
  var date = new Date();
  return date.toLocaleString([], {month: '2-digit', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'});
});

// Init store for session
const sessionStore = new SequelizeStore({
  db: sequelize.instance
});

const sessionConfig = {
  secret: 'memcached-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false
};

// Enable Cross-Origin Resource Sharing (CORS)
var cors = function (req, res, next) {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    // OPTIONS requests should immediately respond back to the client with the CORS headers.
    res.status(200).end();
  
  } else {
    // Otherwise, continue to next.
    next();
  }
};

// Setup Express.js middleware
app.use(logger('\x1b[32m:timestamp:\x1b[0m :method :url :status :response-time ms - :res[content-length]'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors);
app.use(cookieParser());
app.use(session(sessionConfig));
app.use(auth)
app.use('/', indexRouter);

module.exports = app;