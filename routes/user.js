var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.render('user/homepage', { title: 'MovieMaster | HOME' });
});

module.exports = router;
