var express = require('express');
var passport = require('passport');
var User = require('./models/user');
var Teacher = require('./models/teacher');
var wxconfig = require('./wxconfig');
var qcos = require('./qcos');

var applyRouter = require('./routers/apply');

var router = express.Router();
var qcosm = qcos({
  appid: wxconfig.cosAppid,
  secretid: wxconfig.cosSecretid,
  secretkey: wxconfig.cosSecretkey,
  bucket: wxconfig.cosBucket
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/auth/wechat');
  }
}

router.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.wechatInfo = req.session.wechatInfo;
  res.locals.errors = req.flash('error');
  res.locals.infos = req.flash('info');
  next();
});

router.get('/auth/wechat', passport.authenticate('wechat', {
  failureRedirect: '/signup',
  failureFlash: true
}), function(req, res) {
  res.redirect('/' + (req.query.redirect_to || ''));
});

router.get('/auth/fail', function(req, res) {
  res.render('mobile/authfail');
});

router.get('/', ensureAuthenticated, function(req, res) {
  res.render('mobile/home');
});

router.get('/signup', function(req, res) {
  res.render('mobile/signup');
});

router.post('/signup', function(req, res, next) {
  var email = req.body.email;
  var password = req.body.password;
  var openid = req.body.openid;

  User.findOne({ email: email }, function(err, user) {
    if (err) { return next(err); }
    if (user) {
      req.flash('error', '该邮箱已经注册');
      return res.redirect('/signup');
    }

    var newUser = new User({
      email: email,
      password: password,
      openid: openid
    });
    newUser.save(next);
  });
}, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/signup',
  failureFlash: true
}));

router.use('/apply', applyRouter);

router.get('/resource', ensureAuthenticated, function(req, res) {
  res.render('resource');
});

router.get('/myprofile', ensureAuthenticated, function(req, res) {
  User.findById(req.user._id, function(err, user) {
    if (err) { return next(err); }
    if (user.role === 'teacher') {
      Teacher.findOne({ userid: req.user._id }, function(err, info) {
        if (err) { next(err); }
        if (!info) {
          return res.render('mobile/myprofile', { extraInfo: undefined });
        }
        res.render('mobile/myprofile', { extraInfo: info });
      });
    }
  });
});

router.get('/play', function(req, res) {
  res.render('mobile/playground');
});

router.post('/play', qcosm, function(req, res) {
  res.json(req.body.qcos);
});

router.use(function(req, res) {
  res.status(404).render('mobile/404');
});

module.exports = router;
