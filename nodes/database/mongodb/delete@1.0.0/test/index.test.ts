import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import { MongoClient } from 'mongodb';

describe('MongodbDelete', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "mongodb-delete";
        ctx = {
            response: {
                data: [{
                    "color": "red",
                    "_id": "5f9b2b2b9d9d9d9d9d9d9d9d"
                }]
            },
            request: {
                body: {
                    "color": "red",
                    "_id": "5f9b2b2b9d9d9d9d9d9d9d9d"
                }
            },
            config: {
                [node.name]: {
                    "inputs": {
                        "properties": {
                            "mongodbConnectionString": "mongodb://localhost:27017",
                            "database": "${ctx.request.params.database}",
                            "collection": "${ctx.request.params.collection}",
                            "where": [{
                                "age": 50,
                                "_id": "5f9b2b2b9d9d9d9d9d9d9d9d"
                            }]
                        }
                    }
                }
            },
            logger: {
                log: () => { }
            }
        }

        mock.method(MongoClient.prototype, 'connect').mock.mockImplementation(() => {
            return true
        });

        mock.method(MongoClient.prototype, 'db').mock.mockImplementation(() => {
            return {
                collection: () => {
                    return {
                        deleteMany: () => {
                            return {
                                deletedCount: 1
                            }
                        },
                        bulkWrite: () => {
                            return {
                                deletedCount: 1
                            }
                        }
                    }
                }
            }
        });
    });

    it('should return the response of the mongodb delete using config filter', async () => {
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return the response of the mongodb delete using payload filter', async () => {
        delete ctx.response.data;
        delete ctx.config[node.name].inputs.properties.where;
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should throw error when trying to deleteMany', async () => {
        mock.method(MongoClient.prototype, 'db').mock.mockImplementationOnce(() => {
            return {
                collection: () => {
                    return {
                        deleteMany: () => { throw new Error('error') }
                    }
                }
            }
        });
        assert.rejects(async () => await node.run(ctx));
    });


    it('should throw error if no config is provided', async () => {
        delete ctx.config[node.name].inputs.properties.collection;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].inputs.properties.database;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].inputs.properties.mongodbConnectionString
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].inputs.properties;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].inputs;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name];
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config;
        await assert.rejects(async () => await node.run(ctx));
    });

});