import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('Jsonschema', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "jsonschema";
        ctx = {
            response: {
                data: {
                    "id": 1,
                    "valid": true
                }

            },
            request: {
                body: {
                    "id": "1",
                    "valid": true
                }
            },
            config: {
                [node.name]: {
                    "inputs": {
                        "properties": {
                            "schema": {
                                "properties": {
                                    "id": {
                                        "type": "number"
                                    },
                                    "valid": {
                                        "type": "boolean"
                                    }
                                },
                                "required": [
                                    "id",
                                    "valid"
                                ],
                                "additionalProperties": false
                            }
                        }
                    }
                }
            }
        }
    });

    it('should return the validation of the object from response data', async () => {
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should throw error if object schema is not valid', async () => {
        delete ctx.response.data;
        assert.rejects(async () => await node.run(ctx));
    });

    it('should throw an error if no config is provided', async () => {
        delete ctx.config[node.name].inputs.properties;
        assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].inputs;
        assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name];
        assert.rejects(async () => await node.run(ctx));

        delete ctx.config;
        assert.rejects(async () => await node.run(ctx));
    });
});