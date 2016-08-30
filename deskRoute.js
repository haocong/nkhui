var express = require('express');
var router = express.Router();

router.use(function(req, res) {
  res.status(404).render('desktop/404');
});

module.exports = router;
