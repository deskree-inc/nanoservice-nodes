import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import yaml from 'js-yaml';

describe('JsonToYaml', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "json-to-yaml";
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

    it('should return a yaml', async () => {
        const result: any = await node.run(ctx);
        assert.ok(result);
    });

    it('should throw an error if payload is null', async () => {
        ctx.response.data = undefined;
        mock.method(yaml, 'dump').mock.mockImplementation(() => {
            throw new Error('test');
        });
        assert.rejects(node.run(ctx));
    });

});