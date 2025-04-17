import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('Mapper', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "mapper";
        ctx = {
            response: {
                data: [
                    {
                        "id": 1,
                        "valid": false
                    },
                    {
                        "id": 2,
                        "valid": true
                    }
                ]
            },
            request: {
                body: null
            },
            config: {
                [node.name]: {
                    "inputs": {
                        "properties": {
                            "mapper": "data[data.length-1].valid"
                        }
                    }
                }
            }
        }
    });

    it('should return the filtered array through the response of the previous node', async () => {
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should throw error if no config is provided', async () => {
        delete ctx.config[node.name].inputs.properties.mapper ;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].inputs.properties;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].inputs;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name];
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config;
        await assert.rejects(async () => await node.run(ctx));
    });


});