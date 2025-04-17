import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import xmljs from 'xml-js';

describe('JsonToXml', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "json-to-xml";
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

    it('should return a xml', async () => {
        const result: any = await node.run(ctx);
        assert.ok(result);
    });

    it('should throw an error if payload is null', async () => {
        ctx.response.data = undefined;
        mock.method(xmljs, 'js2xml').mock.mockImplementation(() => {
            throw new Error('test');
        });
        assert.rejects(node.run(ctx));
    });

});