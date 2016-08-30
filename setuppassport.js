var passport = require('passport');
var User = require('./models/user');
var wxconfig = require('./wxconfig');
var LocalStrategy = require('passport-local').Strategy;
var WechatStrategy = require('passport-wechat').Strategy;

module.exports = function() {
  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new WechatStrategy({
      appID: wxconfig.appid,
      name: 'wechat',
      appSecret: wxconfig.secret,
      client: 'wechat',
      callbackURL: wxconfig.callbackURL,
      scope: 'snsapi_userinfo',
      state: 'STATE',
      lang: 'zh_CN',
      passReqToCallback: true
    }, function(req, accessToken, refreshToken, profile, done) {
      req.session.wechatInfo = profile;
      User.findOne({ openid: profile.openid }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: '尚未注册' });
        }
        return done(null, user);
      });
    }
  ));

  passport.use('local', new LocalStrategy({
    usernameField: 'email'
  },function(email, password, done) {
    User.findOne({ email: email }, function(err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: '该邮箱尚未注册' });
      }
      user.checkPassword(password, function(err, isMatch) {
        if (err) { return done(err); }
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: '密码错误' });
        }
      });
    });
  }));
};
