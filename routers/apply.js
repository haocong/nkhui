var express = require('express');
var User = require('../models/user');
var Teacher = require('../models/teacher');
var router = express.Router();

var schools = ['南开大学'];

var faculties = ['文学院', '历史学院', '哲学院', '法学院', '周恩来政府管理学院', '外国语学院', '马克思主义学院',
'经济学院', '商学院', '数学学院', '物理学院', '化学学院', '生命科学学院', '计算机与控制工程学院', '电子信息与光学工程学院',
'环境科学与工程学院', '医学院', '软件学院', '汉语言文化学院', '旅游与服务学院', '泰达学院', '泰达生物技术研究院',
'泰达应用物理研究院', '经济与社会发展研究院', '药学院', '金融学院', '材料科学与工程学院', '日本研究院', '金融发展研究院',
'国家经济战略研究院'];

function ensureApplicable(req, res, next) {
  if (req.isAuthenticated() && !req.user.role) {
    next();
  } else {
    req.flash('info', '您不能再申请其它角色');
    res.redirect('..');
  }
}

function toArray(input) {
  return typeof input == 'string' ? new Array(input) : input;
}

router.get('/teacher', ensureApplicable, function(req, res) {
  res.render('mobile/applyteacher', { faculties: faculties });
});

router.post('/teacher', ensureApplicable, function(req, res, next) {
  var userid = req.user._id;
  if (!~schools.indexOf(req.body.schoolname)) {
    req.flash('error', '暂不支持该学校');
    return res.redirect('failure');
  }
  if (!~faculties.indexOf(req.body.major)) {
    req.flash('error', '该专业不存在');
    return res.redirect('failure');
  }
  if (req.user.role) {
    req.flash('error', '不能申请该角色');
    return res.redirect('..');
  }
  req.user.role = 'teacher';
  req.user.save(function(err) {
    if (err) { return next(err); }
    var newTeacher = new Teacher({
      userid: userid,
      realName: req.body.realname,
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
      res.redirect('success');
    });
  });
});

router.get('/failure', function(req, res) {
  res.render('mobile/applyfailure');
});

router.get('/success', function(req, res) {
  res.render('mobile/applysuccess');
});

module.exports = router;
