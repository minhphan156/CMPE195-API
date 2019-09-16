/**
 * search route.
 * @module search
 */

var express = require('express');
var router = express.Router();
var getController = require('../controllers/search/GET');
var multer = require('multer')();
var validationHandler = require('../middlewares/validation-handler');
var bodyInjector = require('../middlewares/multer-body-injector');
var { check } = require('express-validator/check'); 

router.route('/')
.all(function(req, res, next) {
  next();
})

/**
 * @api         {get} /search
 * @apiName     SearchResults
 * @apiGroup    Search
 * 
 * @apiParam    {String}                                            query
 * @apiParam    {String="newest","oldest","mostViews","leastViews"} sort
 * @apiParam    {String[]}                                          tag
 * @apiParam    {Date}                                              startDate
 * @apiParam    {Date}                                              endDate
 * @apiParam    {String="unviewed","viewed","all"}                  seen
 * 
 * @apiSuccess  (200) {String[]}  finalResults
 * @apiSuccess  (200) {Number}    finalResults.hash_id
 * @apiSuccess  (200) {String}    finalResults.title
 * @apiSuccess  (200) {String}    finalResults.summary
 * @apiSuccess  (200) {Number}    finalResults.views
 * @apiSuccess  (200) {Date}      finalResults.createdAt
 * @apiSuccess  (200) {String[]}  finalResults.tags
 * @apiSuccess  (200) {String}    finalResults.preview_img
 * 
 */
.get(getController.getResults)


 module.exports = router;