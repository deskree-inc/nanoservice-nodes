import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('Csv2Json', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "csv2json";
        ctx = {
            request: {
                body: "country, iso\nPanama, PAN\nUnited States, USA"
            }
        };
    });

    it('should return a json object', async () => {
        const result: any = await node.run(ctx);
        assert.ok(typeof result === 'object');
    });

    it('should throw an error if the payload is not a csv string', async () => {
        ctx.request.body = null
        try{
            await node.run(ctx);
        }catch(e){
            assert.ok(e);
        }
    });
});