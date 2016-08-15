var express = require('express');
var passport = require('passport');
var Teacher = require('./models/teacher');
var wxconfig = require('./wxconfig');
var router = express.Router();

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('info', 'You must be logged in to see this page.')
    res.redirect('/auth/wechat');
  }
}

function ensureApplicable(req, res, next) {
  if (req.isAuthenticated() && !req.user._id) {
    next();
  } else {
    req.flash('info', '您已经完善资料');
    res.redirect('/');
  }
}

function toArray(input) {
  return typeof input == 'string' ? new Array(input) : input;
}

router.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.errors = req.flash('error');
  res.locals.infos = req.flash('info');
  next();
});

router.get('/auth/wechat', passport.authenticate('wechat', { failureRedirect: '/auth/fail' }),
  function(req, res) {
    res.redirect('/' + (req.query.redirect_to || ''));
  });

router.get('/auth/fail', function(req, res) {
  res.render('authfail');
});

router.get('/', ensureAuthenticated, function(req, res) {
  res.render('home');
});

router.get('/apply/teacher', ensureApplicable, function(req, res) {
  res.render('applyteacher');
});

router.post('/apply/teacher', function(req, res, next) {
  var openid = req.user.openid;
  Teacher.findOne({ openid: openid }, function(err, user) {
    if (err) { return next(err); }
    if (user) {
      req.flash('error', '您已经注册');
      return res.redirect('/')
    }
    var newTeacher = new Teacher({
      realName: req.body.realname,
      openid: req.user.openid,
      sex: parseInt(req.body.sex),
      schoolName: req.body.schoolname,
      studentID: req.body.studentid,
      contactPhone: req.body.contactphone,
      email: req.body.email,
      major: req.body.major,
      intentLevel: toArray(req.body.intentlevel),
      intentSubject: toArray(req.body.intentsubject),
      extentSubject: toArray(req.body.extentsubject)
    });
    newTeacher.save(function(err) {
      if (err) { return next(err); }
      next();
    });
  });
}, passport.authenticate('wechat', {
  failureRedirect: '/apply/failure',
  callbackURL: wxconfig.callbackURL + '?redirect_to=apply/success',
  failureFlash: true
}));

router.get('/apply/student', ensureAuthenticated, function(req, res) {
  res.render('applystudent');
});

router.get('/apply/success', ensureAuthenticated, function(req, res) {
  res.render('applysuccess');
});

router.get('/apply/failure', ensureAuthenticated, function(req, res) {
  res.render('applyfailure');
});

router.get('/resource', ensureAuthenticated, function(req, res) {
  res.render('resource');
});

router.get('/myprofile', function(req, res) {
  res.render('myprofile')
});

// router.post('/printbody', function(req, res) {
//   console.log(req.body);
//   res.end(':p');
// });

router.use(function(req, res) {
  res.status(404).render('404');
});

module.exports = router;
