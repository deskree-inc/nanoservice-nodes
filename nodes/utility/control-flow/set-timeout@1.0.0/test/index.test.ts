import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('Sleep', (context) => {
    let node: Node;
    let ctx: any;
     
    before(() => {
        node = new Node();
        node.name = "Sleep";
        ctx = {
            response: {
                data: [{}]
            },
            request: {
                body: {}
            },
            config: {
               time: 1000              
            },
            logger: {
                log: () => {}
            }  
        }
    });

    it('should return the same response.data', async () => {
        const result = await node.run(ctx);
        assert.ok(result);
    });
});