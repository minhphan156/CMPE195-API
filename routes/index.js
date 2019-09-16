/**
 * Main route that loads all other routes.
 * @module index
 */

var express = require('express');
var router = express.Router();

// Test endpoint
router.get('/test', function(req, res, next) {
  res.status(200);
  res.json({success: true, message: 'test'});
});

// Load other routes
router.use('/feed', require('./feed'));
router.use('/post', require('./post'));
router.use('/signin', require('./signin'));
router.use('/search', require('./search'));

module.exports = router;
