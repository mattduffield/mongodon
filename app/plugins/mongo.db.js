'use strict'

const fp = require('fastify-plugin');

module.exports = fp(async (fastify, opts) => {
  console.log('Registering databases...');
  fastify.register(require('fastify-mongodb'), {useNewUrlParser: true, url: process.env.MONGODB_URL, name: process.env.MONGODB_NAME });
  console.log('  ', process.env.MONGODB_NAME, 'registered...');
  console.log('/pi 002===plugin================fastify mongodb======');
});
