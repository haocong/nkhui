var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var fs = require('fs');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var session = require('express-session');
var flash = require('connect-flash');
var passport = require('passport');
var setUpPassport = require('./setuppassport');
var routes = require('./routes');
var app = express();

var accessLogStream = fs.createWriteStream(path.join(__dirname, 'log','access.log'), {flags: 'a'})

mongoose.connect('mongodb://localhost:27017/nkhui');
setUpPassport();
app.use(express.static(path.join(__dirname, 'static')))
app.set('views', path.resolve(__dirname, 'views'));
app.set('view engine', 'ejs');
// setup the logger
app.use(morgan('combined', {stream: accessLogStream}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'nankai hui',
  resave: false,
  saveUninitialized: true
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(routes);

app.listen(3000, function() {
  console.log('App started.')
});
