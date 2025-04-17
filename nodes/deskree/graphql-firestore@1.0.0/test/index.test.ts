import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('Graphql-firestore', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "graphql-firestore";
        ctx = {
            request: {
                body: "Hello World"
            },
            response: {
                data: "Hello World"
            },
            config: {
                [node.name]: {}
            }
        };
    });

    it('should return a json object', async () => {
        const result: any = await node.run(ctx);
        assert.ok(result);
    });
});
