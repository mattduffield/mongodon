'use strict'

module.exports = async function (fastify, opts) {
  console.log('Default service started...');

  fastify.get('/', 
    async (req, reply) => {
      const version = process.env.VERSION;
      fastify.io.sockets.emit('lobby', {version});
      return {version};
    }
  );
};

module.exports.autoPrefix = '/meta';
