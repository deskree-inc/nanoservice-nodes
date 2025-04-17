import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import { MongoClient } from 'mongodb';

describe('MongodbQuery', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "mongodb-query";
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
                    inputs: {
                        properties: {
                            "mongodbConnectionString": "mongodb://localhost:27017",
                            "database": "bpTests",
                            "collection": "users",
                            "$where": "this.age === 24",
                            "where": {
                                "_id": "5f9b2b2b9d9d9d9d9d9d9d9d",
                                "age": 24
                            },
                            "projection": [
                                "name"
                            ],
                            "limit": 1,
                            "skip": 1,
                            "sort": {
                                "age": "desc"
                            },
                            "count": false,
                            "aggregate": [
                                {
                                    "$facet": {
                                        "metadata": [
                                            {
                                                "$count": "total"
                                            }
                                        ],
                                        "data": []
                                    }
                                }
                            ]
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
                        find: () => {
                            return {
                                toArray: () => {
                                    return [{
                                        "color": "red",
                                        "_id": "5f9b2b2b9d9d9d9d9d9d9d9d"
                                    }]
                                }
                            }
                        },
                        aggregate: () => {
                            return {
                                toArray: () => {
                                    return [{
                                        "color": "red",
                                        "_id": "5f9b2b2b9d9d9d9d9d9d9d9d"
                                    }]
                                }
                            }
                        },
                        countDocuments: () => {
                            return 1;
                        }
                    }
                }
            }
        });
    });

    it('should return the response of the mongodb query', async () => {
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return the response of the mongodb query count', async () => {
        ctx.config[node.name].inputs.properties.count = true;
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return the response of the mongodb query without aggregate', async () => {
        ctx.config[node.name].inputs.properties.count = false;
        ctx.config[node.name].inputs.properties.aggregate = [];
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return the response of the mongodb query without where', async () => {
        ctx.config[node.name].inputs.properties.$where = null;
        ctx.config[node.name].inputs.properties.where = null;
        const result = await node.run(ctx);
        assert.ok(result);
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