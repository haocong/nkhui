var passport = require('passport');
var Teacher = require('./models/teacher');
var wxconfig = require('./wxconfig');
var WechatStrategy = require('passport-wechat').Strategy;

module.exports = function() {
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use(new WechatStrategy({
      appID: wxconfig.appid,
      name: 'wechat',
      appSecret: wxconfig.secret,
      client: 'wechat',
      callbackURL: wxconfig.callbackURL,
      scope: 'snsapi_userinfo',
      state:'STATE'
    }, function(accessToken, refreshToken, profile, done) {
      Teacher.findOne({ openid: profile.openid }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, profile);
        }
        return done(null, Object.assign(profile, user._doc));
      });
    }
  ));
};
