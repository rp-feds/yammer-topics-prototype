// config/passport.js

// load all the things we need
var YammerStrategy = require('passport-yammer').Strategy;
var YAMMER_CONSUMER_KEY = "AduLptedWhgbgwdGBjhnjw";
var YAMMER_CONSUMER_SECRET = "kCKbpexJtSoBrCwEIVIZbAfxQd6HxxqCLmXSO3kK2k";

// expose this function to our app using module.exports
module.exports = function (passport, port) {

	// =========================================================================
    // PASSPORT SESSION SETUP ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

 	// =========================================================================
    // YAMMER SIGNUP ===========================================================
    // =========================================================================
    passport
        .use(new YammerStrategy({
            clientID: YAMMER_CONSUMER_KEY,
            clientSecret: YAMMER_CONSUMER_SECRET,
            callbackURL: "http://localhost:" + port + "/auth/yammer/callback"
        },
        function(accessToken, refreshToken, profile, done) {
            // asynchronous verification, for effect...
            process.nextTick(function () {

                // To keep the example simple, the user's Yammer profile is returned to
                // represent the logged-in user.  In a typical application, you would want
                // to associate the Yammer account with a user record in your database,
                // and return that user instead.
                return done(null, profile);
            });
        }
    ));

};