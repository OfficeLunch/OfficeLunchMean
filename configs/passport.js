var JwtStrategy = require('passport-jwt').Strategy;

// load up the user model
var User = require('../models/user');
var config = require('../configs/database'); // get db config file

module.exports = function(passport) {
  var opts = {};
  opts.secretOrKey = config.secret;
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    User.findOne({username: jwt_payload.username}, function(err, user) {
          if (err) {
              return done(err, false);
          }
          if (user.id) {
              done(null, user.id);
          } else {
              done(null, false);
          }
      });
  }));
};
