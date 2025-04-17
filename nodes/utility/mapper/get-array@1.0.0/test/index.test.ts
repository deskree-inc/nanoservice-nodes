import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('GetArray', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "get-array";
        ctx = {
            response: {
                data: {
                    array: [{
                        "hello_world": "hello world"
                    }]
                }
            },
            request: {
                body: null
            },
            config: {
                [node.name]: {
                    inputs: {
                        properties: {
                            property: "array"
                        }
                    }
                }
            }
        }
    });

    it('should get array', async () => {
        const result = await node.run(ctx);
        assert.deepStrictEqual(result, [{ "hello_world": "hello world" }]);
    });

    it('should throw error', async () => {
        ctx.response.data = null;
        try {
            await node.run(ctx);
        } catch (error: any) {
            assert.ok(error instanceof Error);
        }
    });
});