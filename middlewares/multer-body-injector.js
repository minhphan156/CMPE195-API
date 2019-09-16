/**
 * Middleware that injects upload information into body.
 * 
 * @module multer-body-injector
 * @description This middleware injects information about uploaded file(s) into the
 * request body in order for express-validator to catch empty upload fields.
 */

module.exports = function(req, res, next) {
  if (req.file !== undefined ) {
    // A fieldname in the request body is set with the corresponding fieldname of
    // the file upload's fieldname
    req.body[req.file.fieldname] = req.file.originalname;

  } else if (req.files !== undefined) {
    // Same as above but, applies to more than 1 fieldname and file upload.
    Object.keys(req.files).forEach(value => req.body[value] = true);
  }

  next();
}