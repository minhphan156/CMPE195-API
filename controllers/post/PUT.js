/**
 * PUT /post controller.
 * 
 * @module post-PUT
 */

const RuntimeVars = require('../../services/RuntimeVars');
const schedule = require('node-schedule');
const AWS = require('aws-sdk');
const sequelize = require('../../services/sequelize');
const Hashids = require('hashids');
const { DateTime } = require('luxon');

// S3 Config
const config = new AWS.Config({
  accessKeyId:      RuntimeVars.AWS.ID, 
  secretAccessKey:  RuntimeVars.AWS.SECRET, 
  region:           'us-east-2'
});
const s3 = new AWS.S3(config);
const bucket = 'cmpe195project';

exports.publishPost = function (req, res, next) {

  // Attempted to publish post without uploading draft first!
  if (req.session.draftPost === undefined) {
    return res.status(404).end();
  }
  
  (async function() {
    var draftPost = req.session.draftPost;
    
    var user = sequelize.User.findOne({ where: { id: req.session.user.id } });
    var post = sequelize.Post.create({ notebook_filename: draftPost.metadata.notebook });
    
    // Add metadata to the post
    const metadata = (await post).createMetadatum({
      title:          draftPost.metadata.title, 
      summary:        draftPost.metadata.summary,
      authors:        draftPost.metadata.authors,
      dataset_link:   draftPost.metadata.dataset_link
    });

    var postID = (await post).id;

    // Set up our Hash ID instance with custom salt and hashLength
    const salt = 'ThaKnowledgePlat4rm';
    const hashLength = 7;
    const characterSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    var hashids = new Hashids(salt, hashLength, characterSet);

    var hashID = hashids.encode(postID);

    // Save the raw notebook and html to S3
    const raw = s3.putObject({
      Body:     Buffer.from(draftPost.binary),
      Bucket:   bucket,
      Key:      `${postID}/raw`
    }).promise();
    
    const html = s3.putObject({
      Body:     draftPost.html.final_html,
      Bucket:   bucket,
      Key:      `${postID}/html`
    }).promise();

    // Iterate through the tags, and find them in the DB; Create them if not found in the DB.
    // Then add the tag to the post
    tags = [];

    for (tag of draftPost.metadata.tags) {
      tags.push(sequelize.Tag.findOrCreate({ where: { name: tag }}));
    }

    for (tag of tags) {
      (await post).addTag((await tag)[0]);
    }
    
    // Set user of the post
    const setUserPromise = (await metadata).setUser(await user);
    
    // Await on remaining promises
    await raw;
    await html;
    await setUserPromise;

    // Delete the draft post from the session
    delete req.session.draftPost;

    const now = DateTime.utc().toISO();

    return {
      html:             draftPost.html.final_html,
      metadata: {
        tags:           draftPost.metadata.tags,
        views:          0,
        createdAt:      now,
        updatedAt:      now,
        title:          draftPost.metadata.title, 
        summary:        draftPost.metadata.summary,
        authors:        draftPost.metadata.authors,
        dataset_link:   draftPost.metadata.dataset_link
      }
    };

  })().then(data => res.send(data)).catch(err => next(err));
}