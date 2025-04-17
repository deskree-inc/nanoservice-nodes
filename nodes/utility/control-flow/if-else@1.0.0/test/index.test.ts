import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('IfElse', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "if-else";
        ctx = {
            response: {
                data: {
                    "hello_world": "hello world"
                }
            },
            request: {
                body: null
            },
            config: {
                [node.name]: {
                    "conditions": [
                        {
                            "type": "if",
                            "condition": "data !== undefined",
                            "steps": [
                                {
                                    "name": "fix-json-key",
                                    "node": "fix-json-key",
                                    "type": "local"
                                }
                            ]
                        },
                        {
                            "type": "else",
                            "steps": [
                                {
                                    "name": "add-properties",
                                    "node": "add-properties",
                                    "type": "local"
                                }
                            ]
                        }
                    ]
                }
            }
        }
    });

    it('should get the step if condition is true', async () => {
        const result = await node.run(ctx);
        assert.deepStrictEqual(result, [ { name: 'fix-json-key', node: 'fix-json-key', type: 'local' } ]);
    });

    it('should get the step if condition is false', async () => {
        ctx.config[node.name].conditions[0].condition = "data === undefined";
        const result = await node.run(ctx);
        assert.deepStrictEqual(result, [ { name: 'add-properties', node: 'add-properties', type: 'local' } ]);
    });

    it('should throw error if no config is provided', async () => {
        ctx.config[node.name].conditions[1].type = "if";
        await assert.rejects(async () => await node.run(ctx));

        ctx.config[node.name].conditions[0].type = "else";
        await assert.rejects(async () => await node.run(ctx));

        ctx.config[node.name].conditions = [];
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].conditions;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name];
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config;
        await assert.rejects(async () => await node.run(ctx));
    });
});