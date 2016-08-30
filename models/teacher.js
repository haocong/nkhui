var mongoose = require('mongoose');
var teacherSchema = mongoose.Schema({
  userid: { type: String, required: true },
  realName: { type: String, required: true },
  sex: { type: Number, required: true },
  schoolName: { type: String, required: true },
  studentID: { type: String, required: true, unique: true },
  major: String,
  contactPhone: { type: String, required: true },
  intentLevel: Array,
  intentSubject: Array,
  extentSubject: Array,
  verified: { type: Boolean, default: false },
  verifyProof: String
});

var Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;
