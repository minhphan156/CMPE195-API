/**
 * GET notebook controller.
 * @module notebook-GET
 */

const AWS = require('aws-sdk');
const sequelize = require('../../services/sequelize');
const RuntimeVars = require('../../services/RuntimeVars');
const { decode } = require('../../lib/ID');

// S3 Config
const config = new AWS.Config({
  accessKeyId:      RuntimeVars.AWS.ID, 
  secretAccessKey:  RuntimeVars.AWS.SECRET, 
  region:           'us-east-2'
});
const s3 = new AWS.S3(config);
const bucket = 'cmpe195project';

function getNotebookLink(req, res, next) {
  const { hashID } = req.params;
  const postID = decode(hashID);
  
  (async () => {
    if (postID === undefined) {
      return null;
    }
    
    const post = await sequelize.Post.findById(postID);
    
    if (post === null) {
      return null;
    }
    
    const downloadLink = s3.getSignedUrlPromise('getObject', {
      Bucket: bucket,
      Key: `${postID}/${post.notebook_filename}`
    });
    
    return { downloadLink: await downloadLink };
  })()
  .then(data => {
    if (data) {
      return res.send(data);

    } else {
      // Notebook does not exist
      return res.status(404).end();
    }
  })
  .catch(err => next(err));
}

module.exports = getNotebookLink;