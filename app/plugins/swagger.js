'use strict'

const fp = require('fastify-plugin')
const swagger = require('fastify-swagger')

module.exports = fp(async (fastify, opts) => {
  const swaggerOptions = Object.assign({}, {
    routePrefix: '/documentation',
    swagger: {
      info: {
        "description": "This is represents the Mongodon server. It is a dynamic server.  You can find out more about     Swagger at [http://swagger.io](http://swagger.io) or on [irc.freenode.net, #swagger](http://swagger.io/irc/).      For this sample, you can use the api key `special-key` to test the authorization     filters.",
        "version": "1.0.0",
        "title": "Mongodon",
        "termsOfService": "http://swagger.io/terms/",
        "contact": {
          "email": "apiteam@swagger.io"
        },
        "license": {
          "name": "Apache 2.0",
          "url": "http://www.apache.org/licenses/LICENSE-2.0.html"
        }
      },
      host_old: "mattduffield.swagger.io",
      host: "fec-server-staging.appspot.com",
      tags: [],
      schemes: [
        "https",
        "http"
      ],
      securityDefinitions: {
        "petstore_auth": {
          "type": "oauth2",
          "authorizationUrl": "http://<your url>.swagger.io/oauth/dialog",
          "flow": "implicit",
          "scopes": {
            "write:<scope>": "modify <scope> in your account",
            "read:<scope>": "read your <scope>"
          }
        },
        "api_key": {
          "type": "apiKey",
          "name": "api_key",
          "in": "header"
        }
      },
      externalDocs: {
        "description": "Find out more about Swagger",
        "url": "http://swagger.io"
      },
      endpoints: {}
    },
    exposeRoute: true
  }, opts.swagger);

  fastify.register(swagger, swaggerOptions);
});
