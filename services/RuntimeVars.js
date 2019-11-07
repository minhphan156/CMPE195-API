/**
 * Defines all secret runtime variables.
 * @module RuntimeVars
 */

var yaml = require('js-yaml');
const fs = require('fs');
const manifestLocation = 'build/manifest/manifest.yaml';

// If safeloading fails, it will throw an exception. No need to catch it here,
// since we shouldn't attempt to run the microservice anyway.
try {
  const manifest = yaml.safeLoad(fs.readFileSync(manifestLocation, 'utf8'));
  
  module.exports = Object.freeze({
    AWS: Object.freeze({
      ID:               manifest.aws.id,
      SECRET:           manifest.aws.secret
    }),
    DB: Object.freeze({
      HOST:             manifest.db.host,
      PORT:             manifest.db.port,
      USERNAME:         manifest.db.username,
      PASSWORD:         manifest.db.password
    }),
    API: Object.freeze({
      HOST:             manifest.api.host,
      PORT:             manifest.api.port
    }),
    GATEWAY: Object.freeze({
      HOST:             manifest.gateway.host,
      PORT:             manifest.gateway.port
    }),
    RENDERING_ENGINE: Object.freeze({
      HOST:             manifest.rendering_engine.host,
      PORT:             manifest.rendering_engine.port
    }),
    OKTA: Object.freeze({
      ORG_URL:          manifest.okta.org_url,
      ISSUER:           manifest.okta.issuer,
      CLIENTID:         manifest.okta.clientID,
      TOKEN:            manifest.okta.token
    }),
    OTHER:  Object.freeze({
      DOCKER_GATEWAY:   manifest.other.docker_gateway,
      ENV_NAME:         manifest.other.ENV_NAME
    })
  });
} catch {
  module.exports = Object.freeze({
    AWS: Object.freeze({
      ID:               process.env.AWS_ID,
      SECRET:           process.env.AWS_SECRET
    }),
    DB: Object.freeze({
      HOST:             process.env.DB_HOST,
      PORT:             process.env.DB_PORT,
      USERNAME:         process.env.DB_USERNAME,
      PASSWORD:         process.env.DB_PASSWORD
    }),
    API: Object.freeze({
      HOST:             process.env.API_HOST,
      PORT:             process.env.API_PORT
    }),
    GATEWAY: Object.freeze({
      HOST:             process.env.GATEWAY_HOST,
      PORT:             process.env.GATEWAY_PORT
    }),
    RENDERING_ENGINE: Object.freeze({
      HOST:             process.env.RENDERING_ENGINE_HOST,
      PORT:             process.env.RENDERING_ENGINE_PORT
    }),
    OKTA: Object.freeze({
      ORG_URL:          process.env.OKTA_ORG_URL,
      ISSUER:           process.env.OKTA_ISSUER,
      CLIENTID:         process.env.OKTA_CLIENTID,
      TOKEN:            process.env.OKTA_TOKEN
    }),
    OTHER:  Object.freeze({
      DOCKER_GATEWAY:   process.env.OTHER_DOCKER_GATEWAY,
      ENV_NAME:         process.env.OTHER_ENV_NAME
    })
  });
}