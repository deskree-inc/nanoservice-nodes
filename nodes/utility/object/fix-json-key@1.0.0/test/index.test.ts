import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('FixJsonKey', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "fix-json-key";
        ctx = {
            response: {
                data: {
                    "hello world": "hello world"
                }
            },
            request: {
                body: null
            }
        }
    });

    it('should fix json key', () => {
        const result = node.run(ctx);
        assert.deepStrictEqual(result, { "hello_world": "hello world" });
    });
});