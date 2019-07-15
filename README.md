# Mongodon
REST API for MongoDB using Fastify as the server. This server utilizes Fastify-MongoDB, Fastify-Swagger, Fastify-Socket, Fastify-Cors. It tries to reduce the amount of ceremony necessary for creating a server that allows your to expose a REST API for MongoDB. It also gives you the ability to communicate realtime over WebSockets. Finally, in order for you to test or share your REST API, we are using Swagger for discovery and testing of the REST APIs.

Instead of creating a Route for every given collection in a database, it defines a generic set of Routes that handles most CRUD requirements.

Inspiration for this design comes from using the mLab REST API.

## Getting Started
To install all of your dependencies:

`npm install`

You will need to provide an `.env` file containing all of your MongoDB connection string information. The following is an example:

```
MONGODB_URL=mongodb://...
MONGODB_NAME=...

VERSION=1.0.0
```

Fastify-MongoDB allows you to have as many database connections as you like. **Mongodon** uses this capability to allow for a single REST API but the ability to query from any of your connections.

You will also need to modify the `mongo.db.js` file under the `app/plugins/` folder if you decided to add multiple connections or rename variable in the `.env` file.

Also, notice that the `.env` file contains a `VERSION` variable. This is used with the default route so that you can verify that you are on the corresponding version you deployed latest. It is just a nice feature to make sure that your deployments are working.

If you want to list all databases that you can connect to, you need to upda the following file: `databases.json`

## Run
In order to run your sever locally, you can execute the following command:

`node server.js`

or 

`npm run start`

This will start a server on localhost PORT 3000. If you want to use the browser to test your APIs simply open the following in your browser:
`http://localhost:3000/documentation/`

You can also use a tool like Postman to test as well.

## Additional thoughts
We are using `fastify-socket.io` with our Route definitions. By using this approach, we are enabling our real-time messaging to support dynamic topics. In the `rtc` folder, you will see that we also have a dedicated route to support chatting.