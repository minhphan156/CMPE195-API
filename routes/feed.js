/**
 * feed route.
 * @module feed
 */

var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.json({ success: true });
});

 module.exports = router;