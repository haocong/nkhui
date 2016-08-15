var mongoose = require('mongoose');
var teacherSchema = mongoose.Schema({
  realName: { type: String, required: true },
  openid: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  sex: { type: Number, required: true },
  schoolName: { type: String, required: true },
  studentID: { type: String, required: true, unique: true },
  contactPhone: { type: String, required: true },
  email: String,
  intentLevel: Array,
  intentSubject: Array,
  extentSubject: Array,
  verified: { type: Boolean, default: false },
  verifyProof: String
});

var Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
