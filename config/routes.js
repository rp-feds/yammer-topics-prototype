module.exports = function (app, passport) {

  app.get('/', function(req, res){
    res.render('index', { user: req.user });
  });

  app.get('/account', ensureAuthenticated, function(req, res){
    res.render('account', { user: req.user });
  });

  app.get('/login', function(req, res){
    res.render('login', { user: req.user });
  });

  // GET /auth/yammer
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  The first step in Yammer authentication will involve
  //   redirecting the user to yammer.com.  After authorization, Yammer
  //   will redirect the user back to this application at /auth/yammer/callback
  app.get('/auth/yammer',
    passport.authenticate('yammer'),
    function(req, res) {
      // The request will be redirected to Yammer for authentication, so this
      // function will not be called.
    });

  // GET /auth/yammer/callback
  //   Use passport.authenticate() as route middleware to authenticate the
  //   request.  If authentication fails, the user will be redirected back to the
  //   login page.  Otherwise, the primary route function function will be called,
  //   which, in this example, will redirect the user to the home page.
  app.get('/auth/yammer/callback', 
    
    passport.authenticate('yammer', { failureRedirect: '/login' }),

    function(req, res) {
      res.redirect('/');
    });

  app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
  });

  // Simple route middleware to ensure user is authenticated.
  //   Use this route middleware on any resource that needs to be protected.  If
  //   the request is authenticated (typically via a persistent login session),
  //   the request will proceed.  Otherwise, the user will be redirected to the
  //   login page.
  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
  }  
};