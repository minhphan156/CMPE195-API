/**
 * post route.
 * @module post
 */

var express = require('express');
var router = express.Router();
var postController = require('../controllers/post/POST');
var putController = require('../controllers/post/PUT');
var getController = require('../controllers/post/GET');
var multer = require('multer')();
var validationHandler = require('../middlewares/validation-handler');
var bodyInjector = require('../middlewares/multer-body-injector');
var { check } = require('express-validator/check'); 

router.route('/')
.all(function(req, res, next) {
  next();
})

/**
 * @api         {put} /post
 * @apiName     PublishPost
 * @apiGroup    Post
 * 
 * @apiSuccess  (200)
 * @apiError    (404) {String} error
 * @apiError    (404) {String} error.message
 */
.put(putController.publishPost)

/**
 * @api         {post} /post
 * @apiName     DraftPost
 * @apiGroup    Post
 * 
 * @apiParam    {Number[]}  authors
 * @apiParam    {String}    [datasetLink]
 * @apiParam    {Binary}    notebook
 * @apiParam    {String}    summary
 * @apiParam    {String}    tags
 * @apiParam    {String}    title
 * 
 * @apiSuccess  (200) {String}    html
 * @apiSuccess  (200) {String}    metadata
 * @apiSuccess  (200) {String[]}  metadata.authors
 * @apiSuccess  (200) {String}    metadata.datasetLink
 * @apiSuccess  (200) {String}    metadata.summary
 * @apiSuccess  (200) {String[]}  metadata.tags
 * @apiSuccess  (200) {String}    metadata.title
 * @apiSuccess  (200) {String}    metadata.notebook
 * 
 * @apiError    (422) {Object[]}  errors
 */
.post(multer.single('notebook'), bodyInjector, postController.validate, validationHandler, postController.notebook);


router.route('/:id').all(function(req, res, next) {
  next();
})

/**
 * @api         {get} /post/:id
 * @apiName     GetPost
 * @apiGroup    Post
 * 
 * @apiParam    {String} hashId
 * 
 * @apiSuccess  (200) {String}    html
 * @apiSuccess  (200) {String}    metadata
 * @apiSuccess  (200) {String[]}  metadata.authors
 * @apiSuccess  (200) {String}    metadata.datasetLink
 * @apiSuccess  (200) {String}    metadata.summary
 * @apiSuccess  (200) {String[]}  metadata.tags
 * @apiSuccess  (200) {String}    metadata.title
 * @apiSuccess  (200) {String}    metadata.views
 * @apiSuccess  (200) {Date}      metadata.createdAt
 * @apiSuccess  (200) {Date}      metadata.updatedAt
 * 
 * @apiError    (404)
 */
.get(getController.getPost)

// DELETE  - Remove an induvidual post
//
// Inputs  - post_ID
// Actions - Unknown
// Outputs - Unknown
// Issues  - #39
//
.delete(function(req, res, next) {
  next(new Error('not implemented'));
});

 module.exports = router;