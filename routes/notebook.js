/**
 * notebook route.
 * @module notebook
 */

const express = require('express');
const router = express.Router();
const getNotebookLink = require('../controllers/notebook/GET');


router.route('/:hashID')
.all((req, res, next) => next())
.get(getNotebookLink);

module.exports = router;