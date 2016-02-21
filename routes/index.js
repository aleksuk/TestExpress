var express = require('express');
var router = express.Router();

///* GET home page. */
//router.get('/', function(req, res, next) {
//  res.render('index', { title: 'Express' });
//});


router.use('/', require('./main'));
router.use('/users', require('./users'));
router.use('/login', require('./login'));
router.use('/logout', require('./logout'));
router.use('/chat', require('./chat'));

module.exports = router;

