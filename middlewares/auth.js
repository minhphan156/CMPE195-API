/**
 * Authenticates requests with Okta access tokens.
 * 
 * @module auth
 * @description If an access token is authenticated, a user corresponding to the
 * token is fetched from RDS (or created if the user does not exist yet). The fetched
 * user instance is then stored in the session as `req.session.user`
 */

const RuntimeVars = require('../services/RuntimeVars');
const OktaJwtVerifier = require('@okta/jwt-verifier');
const sequelize = require('../services/sequelize');
const Okta = require('@okta/okta-sdk-nodejs');

// Initialize Okta
const okta = new Okta.Client({
  orgUrl: RuntimeVars.OKTA.ORG_URL,
  token: RuntimeVars.OKTA.TOKEN
});

const oktaJwtVerifier = new OktaJwtVerifier({
  issuer:     RuntimeVars.OKTA.ISSUER,
  clientId:   RuntimeVars.OKTA.CLIENTID
});

/**
 * Promise Wrapper function to req.session.regenerate
 * @function regenerateSessionPromise
 * @param {Request} req 
 * @returns {Promise}
 */
function regenerateSessionPromise(req) {
  return new Promise((resolve, reject) => {
    req.session.regenerate(function(err) {
      if (err) {
        reject(err);
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Auhthenticates a request against an access token.
 * @function this
 * @param req
 * @param res
 * @param next
 */
module.exports = function(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/Bearer (.+)/);

  // Authorization headers must be sent with the request!
  if (!match) {
    return res.status(401).end();
  }

  var accessToken = match[1];

  (async function() {
    // Verify access token
    const jwt = await oktaJwtVerifier.verifyAccessToken(accessToken);    
    
    // User information is stored in the access token
    const email = jwt.claims.email;
    const firstName = jwt.claims.firstName;
    const lastName = jwt.claims.lastName;
    
    if ((req.session.user !== undefined) && (req.session.user.email === email)) {
      // User already exists in the session and is the same user corresponding
      // to the access token. So we are done here.
      return;
    
    } else {
      // Fetch for the corresponding user data from RDS.
      // If user doesn't exist in RDS then we create one.
      // NOTE that here, we are identifying users between
      // Okta and our own User table based on the Okta user's
      // email.

      // model.findOrCreate() returns an array. So we must grab the
      // first (and only) element.
      const user = sequelize.User.findOrCreate({
        where: { email: email },
        defaults: {
          first_name: firstName,
          last_name: lastName,
          is_sso: false,
          position: '',
          avatar: ''
        }
      });

      // Generate a new session to clear all session data that belonged to a
      // previous user (if at all).
      await regenerateSessionPromise(req);

      // Save the user onto the session
      req.session.user = (await user)[0];
    }
  })().then(() => next()).catch(err => next(err));
};