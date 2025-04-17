import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import { MongoClient } from 'mongodb';

describe('MongodbInsert', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "mongodb-insert";
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
                            "bulkWrite": true
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
                        insertMany: () => {
                            return {
                                insertedCount: 1
                            }
                        },
                        insertOne: () => {
                            return {
                                insertedCount: 1
                            }
                        },
                        bulkWrite: () => {
                            return {
                                insertedCount: 1
                            }
                        }
                    }
                }
            }
        });
    });

    it('should return the response of the mongodb insert', async () => {
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return the response of the mongodb insert using payload and no bulkWrite', async () => {
        delete ctx.config[node.name].inputs.properties.bulkWrite;
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return the response of the mongodb insert using payload', async () => {
        delete ctx.response.data;
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should throw error when trying to insertOne', async () => {
        mock.method(MongoClient.prototype, 'db').mock.mockImplementationOnce(() => {
            return {
                collection: () => {
                    return {
                        insertOne: () => { throw new Error('error') }
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