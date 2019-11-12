/**
 * GET /search controller.
 * 
 * @module search-GET
 */

// Sequelize Models Instance
const sequelize = require('../../services/sequelize');
// Sequelize Library
const Sequelize = require('sequelize');
// HashIDs library
const Hashids = require('hashids');


// Pass in the array of tags from URL params
// Return SQL statement to select post_id's matching ALL of those tags
//
// ***** NOT IMPLEMENTED YET *****
function getTagsExclusive(tagArray) { }


// Pass in the array of tags from URL params
// Return SQL statement to select post_id's matching ANY of those tags
function getTagsInclusive(tagArray) {

  if (tagArray === undefined || tagArray.length == 0) {
    // array empty or does not exist
    return '';
  }

  SQLpart1 = '"Metadata"."post_id" IN (SELECT "PostTag"."post_id" FROM "Tag","PostTag" WHERE "Tag"."name" IN (';
  tagSQLInjection = ''
  SQLpart2 = ') AND "Tag"."id" = "PostTag"."tag_id")';

  if (typeof tagArray === "object") {
    for (var i = 0; i < tagArray.length - 1; i++) {
      tagSQLInjection += ("\'" + tagArray[i] + "\',")
    }
    tagSQLInjection += ("\'" + tagArray[i] + "\'")
  }
  else if (typeof tagArray === "string") {
    tagSQLInjection += ("\'" + tagArray + "\'")
  }

  return SQLpart1 + tagSQLInjection + SQLpart2;
}

// Converts 'sort' URL parameter to Sequelize parameter
function getSort(sort) {

  var sortType = null;

  if (sort === 'mostViews') {
    sortType = ['views', 'DESC'];
  }
  else if (sort === 'leastViews') {
    sortType = ['views'];
  }
  else if (sort === 'oldest') {
    sortType = ['created_at'];
  }
  else {
    sortType = ['created_at', 'DESC'];
  }

  return sortType
}

/**
 * Gets search results of post previews from given query, sort, and filters
 * 
 * @returns {Object}
 */
async function getSearchResults(query, sort, filters) {

  const Op = Sequelize.Op;

  // Backend Sort by Views SQL statement
  // NOT YET IMPLEMENTED
  var seenFilterRawSQL = '';

  // Backend Sort by Tags SQL statement
  // Not exclusive Tag search, inclusive only
  // NOT YET FULLY IMPLEMENTED
  var tagFilterRawSQL = getTagsInclusive(filters.tags);


  /*
  *
  * Retrieve all Metadata objects from RDS along with their respective
  * Post and Tag objects. Apply query, sort, and filters (if they exist)
  * then return a large nested JSON of the result to be cleaned at export.getResults
  * 
  */
  const finalResults = await sequelize.Metadata.findAll({

    attributes: ['title', 'summary', 'views', 'created_at', 'authors', 'preview_image'],
    where: {
      [Op.and]: [
        {
          [Op.or]: [
            { title: { [Op.iLike]: '%' + query + '%' } },
            { summary: { [Op.iLike]: '%' + query + '%' } }
          ]
        },

        Sequelize.literal(tagFilterRawSQL),
      
        // Not Yet Implemented
        Sequelize.literal(seenFilterRawSQL),
        
        {created_at: { [Op.between]: [filters.startDate, filters.endDate]} },
      ] 
    },

    include: [{ 
      
        model: sequelize.Post,
        include: [{

          model: sequelize.Tag,
          attributes: ['name'],

        }]

    }],

    order: [sort],

  });

  return finalResults;
}

/**
 * Gets the search results from given sort and filters settings
 * @function getResults
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns {Object}
 */
exports.getResults = function (req, res, next) {

  // Set default Query, Filter, and Sort values
  var search = '';
  var sort = getSort(req.query.sort);
  var filters = {};
  filters.startDate = new Date(1900, 1, 1);
  filters.endDate = new Date(2031, 1, 1);
  filters.seen = 'all';

  // If there is a search query, replace the blank search with it
  if (req.query.query !== undefined) {
    search = req.query.query;
  }

  // Building a JSON package 'filters' containing various URL-passed filters

  // If any tags for filtering, add to Filter package
  if (req.query.tag !== undefined) {
    filters.tags = req.query.tag;
  }

  // If date range selected AND valid, add to Filter package
  if (req.query.startDate !== undefined && req.query.endDate !== undefined) {
    if (req.query.startDate < req.query.endDate) {
      filters.startDate = req.query.startDate;
      filters.endDate = req.query.endDate;
    }
  }

  // If 'unviewed' or 'viewed' filter selected, replace (seen = 'all') in Filter package
  if (req.query.seen !== undefined) {
    filters.seen = req.query.seen;
  }

  getSearchResults(search, sort, filters).then(resultsToReturn => {

    // Set up our Hash ID instance with custom salt and hashLength
    const salt = 'ThaKnowledgePlat4rm';
    const hashLength = 7;
    const characterSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    var hashids = new Hashids(salt, hashLength, characterSet);

    const defaultImagePath = 'https://cmpe195project.s3.us-east-2.amazonaws.com/__/default_img.png';

    // For every element in SQL query result, store cleaned version to 'finalResults'
    var finalResults = resultsToReturn.map(function (metadataItem) {
      
      // Schema for JSON element in final search results array

      return {
        // Save hash ID version of post_id for Frontend href link
        'hash_id': hashids.encode(metadataItem.Post.id),

        // Post Metadata
        'title': metadataItem.title,
        'summary': metadataItem.summary,
        'views': metadataItem.views,
        'created_at': metadataItem.created_at,

        // Store just the string names of this post's tags
        'tags': metadataItem.Post.Tags.map(tag => tag.name),

        // Image to be previewed on Explore page
        'preview_img': metadataItem.preview_image ? metadataItem.preview_image : defaultImagePath,
        'authors': metadataItem.authors
      }

    });

    // Send successful array of search results
    return res.send(finalResults);

  }).catch(err => {
    next(err)
  });
}