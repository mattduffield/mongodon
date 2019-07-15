'use strict'
/**
 * This modules provides a REST API over any given MongoDB
 * connection. It is fully dynamic and allows the consumer 
 * to view the full API specification by navigating to the 
 * following URL: localhost:3000/documentation/
 */
module.exports = async function (fastify, opts) {
  console.log('Data service started...');
  function getEntity(database, collection) {
    // const db = fastify.mongo.db(database);
    const entity = fastify.mongo[database].db.collection(collection);
    return entity;
  }
  //
  // getProp
  // Reference: https://gist.github.com/harish2704/d0ee530e6ee75bad6fd30c98e5ad9dab
  // Usage: "pipeline[0].$match.modified_date.$gt"
  //
  function getProp( object, keys, defaultVal ){
    keys = Array.isArray(keys) ? keys : keys.replace(/(\[(\d)\])/g, '.$2').split('.');
    object = object[keys[0]];
    if (object && keys.length> 1) {
      return getProp(object, keys.slice(1), defaultVal);
    }
    return object === undefined ? defaultVal : object;
  }
  //
  // List Databases
  //
  fastify.get('/databases', 
    {
      schema: {
        params: {}
      }
    }, 
    async (req, reply) => {
      const databases = require('../../../databases.json');
      fastify.io.sockets.emit('lobby', databases);
      return databases;
    }
  );
  //
  // List Collections
  //
  fastify.get('/:database/collections', 
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name for listing collections',
              summary: 'The database name',
              type: 'string'
            }
          }
        }
      }
    }, 
    async (req, reply) => {
      const {database} = req.params;
      const result = await fastify.mongo[database].db.listCollections().toArray();
      fastify.io.sockets.emit('lobby', result);
      return result;
      // return {database};
    }
  );
  //
  // Run Command
  //
  fastify.get('/:database/runCommand', 
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            command: {
              description: 'The command to execute as a JSON string',
              summary: 'The command to execute',
              type: 'string'
            },
            replace: {
              description: 'The replace expression as a JSON array',
              summary: 'The replace expression',
              type: 'string'
            }
          },
          required: [
            'command'
          ]
        }
      }
    }, 
    async (req, reply) => {
      const {database} = req.params;
      let {command = false, replace = null} = req.query;
      let query = {};
      if (command) {
        query = JSON.parse(command);
        if (replace) {
          let repl = JSON.parse(replace);
          for (let r of repl) {
            if (r.type === 'date') {
              const currentValue = getProp(query, r.path);
              const parentObj = getProp(query, r.pathParent);
              if (Date.parse(currentValue) !== NaN) {
                parentObj[r.targetProperty] = new Date(currentValue);
              }
            }
          }
        }
      }
      const result = await fastify.mongo[database].db.command(query);
      fastify.io.sockets.emit('lobby', result);
      return result;
      // return {database};
    }
  );
  //
  // Delete (Delete)
  //
  fastify.delete('/:database/:collection/:id', 
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            },
            collection: {
              description: 'The collection name',
              summary: 'The collection name',
              type: 'string'
            },
            id: {
              description: 'The id of the document',
              summary: 'The id',
              type: 'string'
            }
          }
        }
      }
    },
    async (req, reply) => {
      const {database, collection, id} = req.params;
      const entity = getEntity(database, collection);
      const _id = require('mongodb').ObjectId(id);
      const result = await entity.deleteOne({_id});
      fastify.io.sockets.emit('lobby', result);
      if (!result.deletedCount) {
        return reply.code(404).send({status: 'Not found!'});
      }
      return result.deletedCount;
      // return {database, collection, id, _id, result};
    }
  );
  //
  // Delete (Delete Many)
  //
  fastify.delete('/:database/:collection', 
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            },
            collection: {
              description: 'The collection name',
              summary: 'The collection name',
              type: 'string'
            }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            filter: {
              description: 'The filter criteria as a JSON string',
              summary: 'The filter criteria',
              type: 'string'
            }
          },
          required: []
        }
      }
    },
    async (req, reply) => {
      const {database, collection, id} = req.params;
      const {filter} = req.query;
      let query = {};
      if (filter) {
        query = JSON.parse(filter);
        if (query._id) {
          query._id = require('mongodb').ObjectId(query._id);
        }
      }
      const entity = getEntity(database, collection);
      const result = await entity.deleteMany(query);
      fastify.io.sockets.emit('lobby', result);
      if (!result.deletedCount) {
        return reply.code(404).send({status: 'Not found!'});
      }
      return result.deletedCount;
      // return {database, collection};
    }
  );
  //
  // Get (Retreive)
  //
  fastify.get('/:database/:collection',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            },
            collection: {
              description: 'The collection name',
              summary: 'The collection name',
              type: 'string'
            }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            filter: {
              description: 'The filter criteria as a JSON string',
              summary: 'The filter criteria',
              type: 'string'
            },
            orderBy: {
              description: 'The orderBy expression as a JSON string',
              summary: 'The orderBy expression',
              type: 'string'
            },
            limit: {
              description: 'The limit ',
              summary: 'The limit',
              type: 'integer'
            },
            skip: {
              description: 'The ,skip ',
              summary: 'The skip',
              type: 'integer'
            },
            fo: {
              description: 'The find one flag',
              summary: 'Find one',
              type: 'boolean'
            },
            f: {
              description: 'The fields object',
              summary: 'The fields object',
              type: 'string'
            },
            c: {
              description: 'Count the number of documents',
              summary: 'Count',
              type: 'boolean'
            }
          },
          required: []
        }
      }
    },
    async (req, reply) => {
      const {database, collection} = req.params;
      const {filter, orderBy, limit = 0, skip = 0, fo = false, f = null, c = false} = req.query;
      let query = {};
      let sort = {};
      let project = {};
      let findOne = fo;
      if (filter) {
        query = JSON.parse(filter);
        if (query._id) {
          query._id = require('mongodb').ObjectId(query._id);
          findOne = true;
        }
      }
      if (orderBy) {
        sort = JSON.parse(orderBy);
      }
      if (f) {
        console.log(f);
        project = JSON.parse(f);
      }
      const entity = getEntity(database, collection);
      let result;
      if (findOne) {
        if (f) {
          result = await entity.findOne(query, {projection: project});
        } else {
          result = await entity.findOne(query);
        }
      } else {
        if (f) {
          result = await entity.find(query).project(project).sort(sort).skip(+skip).limit(+limit).toArray();
        } else {
          if (c) {
            result = await entity.find(query).count();
          } else {
            result = await entity.find(query).sort(sort).skip(+skip).limit(+limit).toArray();
          }
        }
      }
      fastify.io.sockets.emit('lobby', result);
      return result;
      // return {database, collection};
    }
  );
  //
  // Get By Id (Retreive one)
  //
  fastify.get('/:database/:collection/:id', 
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            },
            collection: {
              description: 'The collection name',
              summary: 'The collection name',
              type: 'string'
            },
            id: {
              description: 'The document id',
              summary: 'The document id',
              type: 'string'
            }
          }
        }
      }
    },
    async (req, reply) => {
      const {database, collection, id} = req.params;
      const entity = getEntity(database, collection);
      // const _id = new ObjectId(id);
      const _id = require('mongodb').ObjectId(id);
      const result = await entity.findOne({_id});
      fastify.io.sockets.emit('lobby', result);
      // return {database, collection, id, _id, result};
      return result;
    }
  );
  //
  // Post (Create)
  //
  fastify.post('/:database/:collection',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            },
            collection: {
              description: 'The collection name',
              summary: 'The collection name',
              type: 'string'
            }
          }
        },
        body: {
          type: 'object'
        }
      }
    },
    async (req, reply) => {
      const {database, collection} = req.params;
      const entity = getEntity(database, collection);
      const obj = JSON.parse(req.body);
      let result;
      if (Array.isArray(obj)) {
        result = await entity.insertMany(obj);
        fastify.io.sockets.emit('lobby', result.insertedIds);
        return result.insertedIds;
      } else {
        result = await entity.insertOne(obj);
        fastify.io.sockets.emit('lobby', result.insertedId);
        return result.insertedId;
      }
      // return {database, collection};
    }
  );
  //
  // Put (Update)
  //
  fastify.put('/:database/:collection',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            },
            collection: {
              description: 'The collection name',
              summary: 'The collection name',
              type: 'string'
            }
          }
        },
        querystring: {
          type: 'object',
          properties: {
            filter: {
              description: 'The filter criteria as a JSON string',
              summary: 'The filter criteria',
              type: 'string'
            }
          },
          required: [
            'filter'
          ]
        },
        body: {
          type: 'object'
        }
      }
    },
    async (req, reply) => {
      const {database, collection} = req.params;
      const {filter} = req.query;
      let query = {};
      if (filter) {
        query = JSON.parse(filter);
      }
      const entity = getEntity(database, collection);
      const obj = JSON.parse(req.body);
      let result;
      if (Array.isArray(obj)) {
        result = await entity.updateMany(query, {$set: obj});
        fastify.io.sockets.emit('lobby', result);
      } else {
        result = await entity.updateOne(query, {$set: obj});
        fastify.io.sockets.emit('lobby', result);
      }
      return result;
      // return {database, collection};
    }
  );
  //
  // Patch (Partial Update)
  //
  fastify.patch('/:database/:collection/:id',
    {
      schema: {
        params: {
          type: 'object',
          properties: {
            database: {
              description: 'The database name',
              summary: 'The database name',
              type: 'string'
            },
            collection: {
              description: 'The collection name',
              summary: 'The collection name',
              type: 'string'
            },
            id: {
              description: 'The id of the document',
              summary: 'The id',
              type: 'string'
            }
          }
        },
        body: {
          type: 'object'
        }
      }
    },
    async (req, reply) => {
      const {database, collection} = req.params;
      const {filter} = req.query;
      let query = {};
      if (filter) {
        query = JSON.parse(filter);
      }
      const entity = getEntity(database, collection);
      const obj = JSON.parse(req.body);
      let result;
      if (Array.isArray(obj)) {
        result = await entity.updateMany(query, {$set: obj});
        fastify.io.sockets.emit('lobby', result);
      } else {
        result = await entity.updateOne(query, {$set: obj});
        fastify.io.sockets.emit('lobby', result);
      }
      return result;
      // return {database, collection};
    }
  );
};

module.exports.autoPrefix = '/api';
