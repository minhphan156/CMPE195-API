/**
 * POST /post controller.
 * 
 * @module post-POST
 */

const { check } = require('express-validator/check');
const axios = require('axios');
const RuntimeVars = require('../../services/RuntimeVars');
const schedule = require('node-schedule');

/**
 * Delegates rendering of the notebook to render engine
 * 
 * @function getNotebookHTML
 * @param {JSON} notebookJSON
 * @returns {String} Rendered notebook html
 */
async function getNotebookHTML(notebookJSON) {
  // Set up URL to access Render Engine Microservice
  const endpoint = 'pynb-to-html';
  var renderingEngineUrl = `http://${RuntimeVars.OTHER.DOCKER_GATEWAY}:${RuntimeVars.RENDERING_ENGINE.PORT}/${endpoint}`;

  // Here maxContentLength is set to infinity, we will control max file sizes through Multer.
  return (await axios.post(renderingEngineUrl, notebookJSON, { maxContentLength: Infinity })).data;
}

/**
 * Notebook upload controller.
 * 
 * @function notebook
 * @param {Request} req
 * @param {Response} res
 * @param {next} next
 */
exports.notebook = function (req, res, next) {

  (async function () {
    // Send the notebook HTML back as the response
    var html = await getNotebookHTML(req.file.buffer.toString());

    var draftPost = {
      metadata: req.body,
      html: html,
      binary: req.file.buffer
    };

    // Split tags into array
    draftPost.metadata.tags = draftPost.metadata.tags.split(',');

    // Save draft post into session
    req.session.draftPost = draftPost;

    res.send({ metadata: draftPost.metadata, html: draftPost.html });

  })().then().catch(err => next(err));
}

// Validation object for express-validator
exports.validate = [
  check('authors').not().isEmpty(),
  check('datasetLink'),
  check('notebook').not().isEmpty(),
  check('summary').not().isEmpty(),
  check('tags').not().isEmpty(),
  check('title').not().isEmpty()
];