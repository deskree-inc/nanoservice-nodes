import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('FilterArray', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "filter-array";
        ctx = {
            response: {
                data: [
                    {
                        "id": 1,
                        "valid": true
                    },
                    {
                        "id": 2,
                        "valid": false
                    }
                ]
            },
            request: {
                body: null
            },
            config: {
                [node.name]: {
                    "inputs": {
                        "condition": "data.valid === true"
                    }
                }
            }
        }
    });

    it('should return the filtered array through the response of the previous node', async () => {
        const result = await node.run(ctx);
        assert.ok(result.length === 1);
    });

    it('should return the filtered array through the request body', async () => {
        ctx.request.body = ctx.response.data;
        delete ctx.response.data;
        const result = await node.run(ctx);
        assert.ok(result.length === 1);
    });

    it('should throw an error if no condition is provided', async () => {
        delete ctx.config[node.name];
        try {
            await node.run(ctx);
        }catch (e: any) {
            assert.ok(e.message === 'filter-array requires a conditions');
        }
    });

    it('should throw an error if no config is provided', async () => {
        delete ctx.config;
        try {
            await node.run(ctx);
        }catch (e: any) {
            assert.ok(e.message === 'filter-array node requires a config');
        }
    });
});