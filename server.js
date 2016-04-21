'use strict';

// set up ======================================================================
var express = require('express');
var exphbs  = require('express-handlebars');
var passport = require('passport');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');

// app config
var app = express();
var port = process.env.PORT || 3000;

require('./config/passport.js')(passport, port); // pass passport for configuration

// set default layout
var hbs = exphbs.create({
	defaultLayout: 'main',
	layoutsDir:'src/views/layouts/',
	partialsDir: 'src/views/partials/'
});

// set up our express application
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.engine('handlebars', hbs.engine);
app.set('views', __dirname + '/src/views');
app.set('view engine', 'handlebars');
// app.use(express.session({ secret: 'keyboard cat' }));

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
// required for passport
app.use(session({ secret: 'pianocatisafraud' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./config/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);