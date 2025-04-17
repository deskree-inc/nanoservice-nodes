import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('VariableSetter', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "variable-setter";
        ctx = {
            response: {
                data: {
                    "id": 1,
                    "valid": true
                }

            },
            request: {
                body: {
                    "id": "1",
                    "valid": true
                }
            },
            config: {
                [node.name]: {
                    "inputs": {
                        "properties": {
                            "variables": [
                                {
                                    "name": "variable_name",
                                    "value": "variable value"
                                }
                            ],
                            "node": {
                                "name": "collectionConfig"
                            }
                        }
                    }
                }
            }
        }
    });

    it('should store the vars in the context even it does not have previous vars', async () => {
        await node.run(ctx);
        assert.ok(ctx.vars.variable_name === "variable value");
    });

    it('should store node data into the vars in the context even it does not have previous vars', async () => {
        delete ctx.vars;
        await node.run(ctx);
        assert.ok(ctx.vars.collectionConfig.id === 1);
    });

    it('should store the request body the vars in the context', async () => {
        delete ctx.response.data;
        await node.run(ctx);
        assert.ok(ctx.vars.collectionConfig.id === "1");
    });

    it('should store the request body the vars in the context even do vars is undefined', async () => {
        delete ctx.vars;
        ctx.config[node.name].inputs.properties.variables = undefined;
        await node.run(ctx);
        assert.ok(ctx.vars.collectionConfig.id === "1");
    });


    it('should not store any value in vars', async () => {
        delete ctx.vars;
        ctx.config[node.name].inputs.properties.node.name = undefined;
        await node.run(ctx);
        assert.ok(ctx.vars === undefined);
    });

    it('should throw an error if no config is provided', async () => {
        delete ctx.config[node.name].inputs;
        try {
            await node.run(ctx);
        } catch (error) {
            assert.ok(error);
        }

        delete ctx.config[node.name];
        try {
            await node.run(ctx);
        } catch (error) {
            assert.ok(error);
        }

        delete ctx.config;
        try {
            await node.run(ctx);
        } catch (error) {
            assert.ok(error);
        }
    });
});