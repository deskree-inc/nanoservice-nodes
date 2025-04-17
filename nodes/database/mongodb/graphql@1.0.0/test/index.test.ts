import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import mongoose from 'mongoose';

describe('GraphqlMongodb', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "graphql-mongodb";
        ctx = {
            response: {
                data: null
            },
            request: {
                body: {
                    query: `query users {
                        findMany (
                            where: "this.age > 25",
                            filter: { lastName: "Deskree" },
                            limit: 5,
                            skip: 1,
                            sort: { age: "desc"}
                        ){
                            _id,
                            name,
                            age,
                            lastName
                        }
                    }`,
                    variables: {}
                }
            },
            config: {
                [node.name]: {
                    "inputs": {
                        "properties": {
                            "mongodbConnectionString": "mongodb://localhost:27017",
                            "database": "bpTests",
                            "collection": "users",
                            "schema": {
                                "name": "String",
                                "lastName": "String",
                                "age": "Number"
                            }
                        }
                    }
                }
            }
        };

        mock.method(mongoose, 'disconnect').mock.mockImplementation(() => {
            return new Promise((resolve) => {
                resolve(true);
            });
        });
        mock.method(mongoose, 'connect').mock.mockImplementation(async () => {
            return new Promise((resolve) => {
                resolve({
                    connection: {
                        db: () => {
                            return {
                                collection: () => {
                                    return {
                                        find: () => {
                                            return {
                                                toArray: () => {
                                                    return [
                                                        {
                                                            _id: "123",
                                                            name: "John",
                                                            lastName: "Doe",
                                                            age: 25
                                                        }
                                                    ]
                                                },
                                                exec: () => {
                                                    return [
                                                        {
                                                            _id: "123",
                                                            name: "John",
                                                            lastName: "Doe",
                                                            age: 25
                                                        }
                                                    ]
                                                }
                                            }
                                        },
                                        findOne: () => {
                                            return {
                                                exec: () => {
                                                    return {
                                                        _id: "123",
                                                        name: "John",
                                                        lastName: "Doe",
                                                        age: 25
                                                    }
                                                }
                                            }
                                        },
                                        count: () => {
                                            return {
                                                exec: () => {
                                                    return 1;
                                                }
                                            }
                                        },
                                        create: () => {
                                            return {
                                                exec: () => {
                                                    return {
                                                        _id: "123",
                                                        name: "John",
                                                        lastName: "Doe",
                                                        age: 25
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
            });
        });

        mock.method(node, 'mongooseExec').mock.mockImplementation(async (mongooseQuery: any) => {
            return new Promise((resolve) => {
                resolve([
                    {
                        _id: "123",
                        name: "John",
                        lastName: "Doe",
                        age: 25
                    }
                ]);
            });
        });
    });

    it('should return a json object with findMany', async (context) => {
        const result: any = await node.run(ctx);
        assert.ok(result);
    });

    it('should return a json object with findOne', async (context) => {
        ctx.request.body.query =  `query users {
                findOne (
                    where: "this.age > 25",
                    filter: { lastName: "Deskree" }
                ){
                    _id,
                    name,
                    age,
                    lastName
                }
            }`
        const result: any = await node.run(ctx);
        assert.ok(result);
    });


    it('should return a json object with data testing mongooseExec', async () => {
        mock.reset();
        const result = await node.mongooseExec({
            find: () => {
                return {
                    toArray: () => {
                        return [{
                            _id: "123", name: "John", lastName: "Doe", age: 25
                        }]
                    }
                }
            }
        });
        assert.ok(result);
    });

    it('should throw error if no config is provided', async () => {
        delete ctx.config[node.name].inputs.properties.collection;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].inputs.properties.database;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].inputs.properties.mongodbConnectionString;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name];
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config;
        await assert.rejects(async () => await node.run(ctx));
    });

});