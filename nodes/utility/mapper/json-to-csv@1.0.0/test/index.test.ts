import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('JsonToCsv', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "json-to-csv";
        ctx = {
            response: {
                data: [
                    { "country": "Panama", "iso": "PAN", "nested": { "test": "test" } },
                    { "country": "United States", "iso": "USA", "nested": { "test": "test" } }
                ]
            },
            request: {
                body: undefined
            }
        };
    });

    it('should return a csv string', async () => {
        const result: any = await node.run(ctx);
        assert.ok(typeof result === 'string');
    });

    it('should return an empty array when empty array is provided', async () => {
        ctx.response.data = [];
        const result: any = await node.run(ctx);
        assert.ok(result.length === 0);
    });

    it('should throw an error if payload is null', async () => {
        ctx.response.data = null
        try {
            await node.run(ctx);
        } catch (error) {
            assert.ok(error)
        }
    });

    it('should throw an error if flattenObject method fails', async () => {
        mock.method(node, 'flattenObject').mock.mockImplementation(() => {
            throw new Error('test');
        });
        assert.rejects(node.run(ctx));
    });
});