/**
 * Validation handler middleware for use with express-validator.
 * 
 * @module validation-handler
 */

const { validationResult } = require('express-validator/check');

module.exports = function(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    // No validation error occurred so we'll pass the req to the next controller.
    next();

  } else {
    // Validation errors occurred so present the client error messages
    const UNPROCESSABLE_ENTITY = 422;
    res.status(UNPROCESSABLE_ENTITY).json({ errors: errors.array() });  
  }
}