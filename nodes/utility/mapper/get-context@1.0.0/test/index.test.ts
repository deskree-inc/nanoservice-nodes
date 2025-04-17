import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('GetContext', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "get-context";
        ctx = {
            response: {
                data: null
            },
            request: {
                body: {
                    "hello_world": "hello world"
                }
            },
            config: {
                [node.name]: {
                    inputs: {
                        properties: {
                            "context": "request.body"
                        }
                    }
                }
            }
        }
    });

    it('should get array', async () => {
        const result = await node.run(ctx);
        assert.deepStrictEqual(result, { "hello_world": "hello world" });
    });

    it('should throw error if config context is request only', async () => {
        ctx.config[node.name].inputs.properties.context = "request";
        try {
            await node.run(ctx);
        } catch (error: any) {
            assert.ok(error instanceof Error);
        }
    });

    it('should throw error if trying to access a request undefined property', async () => {
        ctx.config[node.name].inputs.properties.context = "request.undefined";
        try {
            await node.run(ctx);
        } catch (error: any) {
            assert.ok(error instanceof Error);
        }
    });

    it('should throw error if config context is response only', async () => {
        ctx.config[node.name].inputs.properties.context = "response";
        try {
            await node.run(ctx);
        } catch (error: any) {
            assert.ok(error instanceof Error);
        }
    });

    it('should throw error if config context is invalid', async () => {
        ctx.config[node.name].inputs.properties.context = "unknown";
        try {
            await node.run(ctx);
        } catch (error: any) {
            assert.ok(error instanceof Error);
        }
    });

    it('should throw error if no config context is provided', async () => {
        delete ctx.config[node.name].inputs.properties;
        try {
            await node.run(ctx);
        } catch (error: any) {
            assert.ok(error instanceof Error);
        }
    });

    it('should throw error if no config is provided', async () => {
        delete ctx.config[node.name].inputs;
        try {
            await node.run(ctx);
        } catch (error: any) {
            assert.ok(error instanceof Error);
        }

        delete ctx.config[node.name];
        try {
            await node.run(ctx);
        } catch (error: any) {
            assert.ok(error instanceof Error);
        }

        delete ctx.config;
        try {
            await node.run(ctx);
        } catch (error: any) {
            assert.ok(error instanceof Error);
        }
    });
});