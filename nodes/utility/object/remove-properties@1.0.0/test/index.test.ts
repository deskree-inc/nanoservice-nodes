import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('RemoveProperties', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "remove-properties";
        ctx = {
            response: {
                data: {
                    "id": 1,
                    "valid": true,
                    "name": "John",
                    "age": 20
                }

            },
            request: {
                body: {
                    "id": 1,
                    "valid": true,
                    "name": "John",
                    "age": 20
                }
            },
            config: {
                [node.name]: {
                    "inputs": {
                        "properties": [
                            "name",
                            "age"
                        ]
                    }
                }
            }
        }
    });

    it('should return the object with removed properties', async () => {
        const result = await node.run(ctx);
        assert.deepStrictEqual(result, { "id": 1, "valid": true });
    });

    it('should return the object with removed properties with request body', async () => {
        delete ctx.response.data;
        const result = await node.run(ctx);
        assert.deepStrictEqual(result, { "id": 1, "valid": true });
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