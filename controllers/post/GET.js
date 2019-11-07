/**
 * GET /post controller.
 * 
 * @module post-GET
 */

const RuntimeVars = require('../../services/RuntimeVars');
const AWS = require('aws-sdk');
const sequelize = require('../../services/sequelize');
const Hashids = require('hashids');

/**
 * Gets post data from a given post id
 * @param {Number} postID 
 * @param {Object} user 
 * @returns {Object}
 */
async function getPostData(postID, user) {
  
  // S3 Config
  const config = new AWS.Config({
    accessKeyId:      RuntimeVars.AWS.ID, 
    secretAccessKey:  RuntimeVars.AWS.SECRET, 
    region:           'us-east-2'
  });
  const s3 = new AWS.S3(config);
  const bucket = 'cmpe195project';
  
  // Retrieve postView belonging to the user and post
  var postView = sequelize.PostView.findOne({ where: {
    post_id: postID,
    user_id: user.id
  }});

  // Retrieve post data from RDS
  const post = await sequelize.Post.findOne({ where: { id: postID }});

  // If post doesn't exist, return null data
  if (post === null) {
    return null;
  }

  // Here we need to do this, in order to update the 'last_viewed' column.
  if ((await postView) !== null) {
    const isLiked = (await postView).liked;
    var postViewUpdate = [];
    postViewUpdate[0] = (await postView).update({ liked: !isLiked });
    postViewUpdate[1] = (await postView).update({ liked: isLiked });
  }

  // Retrieve post HTML
  const html = s3.getObject({
    Bucket: bucket,
    Key: `${postID}/html`
  }).promise();
  
  // Retrieve all metadata
  const metadata = post.getMetadatum();
  var tags = new Array();
  
  // Add each tag for response
  const retrievedTags = post.getTags();
  
  for (tag of await retrievedTags) {
    tags.push(tag.get('name'));
  }

  // Increment View count
  const metadataPromise = (await metadata).increment('views', { by: 1 });
  
  // Resolve remaining promises
  await metadataPromise;

  if ((await postView) !== null) {
    await postViewUpdate[0];
    await postViewUpdate[1];
  
  } else {
    // This is for the case if the user has never seen the post yet.
    const tmpUser = await sequelize.User.findByPk(user.id);
    await post.addViewer(tmpUser);
  }

  var data = {
    html:           (await html).Body.toString(),
    metadata: {
      authors:      (await metadata).get().authors,
      datasetLink:  (await metadata).get().datasetLink,
      summary:      (await metadata).get().summary,
      tags:         tags,
      title:        (await metadata).get().title,
      views:        (await metadata).get().views,
      createdAt:    (await metadata).get().created_at,
      updatedAt:    (await metadata).get().updated_at
    }
  };

  return data;
}

/**
 * Gets the post data from a given hashID
 * @function getPost
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns {Object}
 */
exports.getPost = function (req, res, next) {

  // This section should be moved to an external area in the future.
  const salt = 'ThaKnowledgePlat4rm';
  const hashLength = 7;
  const characterSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  var hashids = new Hashids(salt, hashLength, characterSet);

  const hashID = req.params.id;
  const postID = hashids.decode(hashID)[0];

  // Invalid hash id given
  if (postID === undefined)
    return res.status(404).send();

  getPostData(postID, req.session.user).then(data => {
    if (data === null) {
      // Post with given id does not exist
      return res.status(404).send();

    } else {
      return res.send(data);
    }

  }).catch(err => next(err));
}