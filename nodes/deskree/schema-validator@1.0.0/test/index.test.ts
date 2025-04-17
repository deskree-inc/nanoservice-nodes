import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('DeskreeSchemaValidator', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "deskree-schema-validator";
        ctx = {
            response: {
                data: {
                    "name": "John",
                    "age": 30,
                    "float": 1.2,
                    "boolean": true,
                    "array<string>": ["a", "b", "c"],
                    "array<float>": [1.2, 2.3, 3.4],
                    "array<boolean>": [true, false, true],
                    "storage": "storage",
                    "map": {
                        "key": "value"
                    }
                }
            },
            request: {
                method: 'POST',
                body: {
                    "name": "John",
                    "age": 30,
                    "float": 1.2,
                    "boolean": true,
                    "array<string>": ["a", "b", "c"],
                    "array<float>": [1.2, 2.3, 3.4],
                    "array<boolean>": [true, false, true],
                    "storage": "storage",
                    "map": {
                        "key": "value"
                    }
                }
            },
            config: {
                [node.name]: {
                    "inputs": {
                        "properties": {
                            "variables": {
                                "zodSchema": "collectionConfig"
                            }
                        }
                    }
                }
            },
            vars: {
                "collectionConfig": [{
                    "name": "users",
                    "model": {
                        "name": "string?",
                        "age": "integer?",
                        "float": "float?",
                        "boolean": "boolean?",
                        "array<string>": "array<string>?",
                        "array<float>": "array<float>?",
                        "array<boolean>": "array<boolean>?",
                        "storage": "storage?",
                        "map": "map?"
                    },
                }]
            },
            logger: {
                log: () => { }
            }
        }
     });

    it('should return true if validation is correct from response.data', async () => {
        const result = await node.run(ctx);
        assert.deepStrictEqual(result, ctx.response.data);
    });

    it('should return true if validation is correct from req.body', async () => {
        delete ctx.response.data;
        const result = await node.run(ctx);
        assert.deepStrictEqual(result, ctx.request.body);
    });

    it('should return true if validation is correct from req.body with patch method', async () => {
        ctx.request.method = 'PATCH';
        const result = await node.run(ctx);
        assert.deepStrictEqual(result, ctx.request.body);
    });

    it('should throw error if the payload contains author with patch method', async () => {
        ctx.vars.collectionConfig[0].model.author = "string?";
        ctx.request.body = {
            "author": "deskree@deskree.com"
        }
        assert.rejects(async () => { await node.run(ctx) });
    });


    it('should throw error when no config is provided', async () => {
        delete ctx.config[node.name];
        assert.rejects(async () => { await node.run(ctx) });
    });
});