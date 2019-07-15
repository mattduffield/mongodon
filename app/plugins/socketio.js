// see server.js
// https://github.com/guivic/fastify-socket.io
'use strict'
const fp = require('fastify-plugin')

module.exports = fp(async (fastify, opts) => {
    fastify.register(require('@guivic/fastify-socket.io'), opts, (error) => console.error(error));
    const io = fastify.io;
    console.log('/pi 001===plugin================fastify io======')//, fastify.io) // Socket.io instance
    fastify.get('/', (request, reply) => {
      console.log('/n002',(fastify.io)); // Socket.io instance
    });
});
