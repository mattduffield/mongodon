'use strict'

module.exports = async function (fastify, opts) {
  console.log('Messaging service started...');

  fastify.get('/:from/:target/:message', 
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            from: {
              description: 'The sender of the message',
              summary: 'The sender',
              type: 'string'
            },
            target: {
              description: 'The target of the message',
              summary: 'The target',
              type: 'string'
            },
            message: {
              description: 'The message contents',
              summary: 'The message',
              type: 'string'
            }
          }
        }
      }
    },
    async (req, reply) => {
      const {from, target, message} = req.params;
      fastify.io.sockets.emit(target, {from, message});
      return {from, target, message};
    }
  );
};

module.exports.autoPrefix = '/rtc';
