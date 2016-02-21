var mongoose = require('mongoose');
var config = require('../../config');

mongoose.set('debug', true);
mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'));

module.exports = mongoose;