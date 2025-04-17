import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('IfError', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "if-error";
        ctx = {
            response: {
                data: {
                    name: "Johns"
                }
            },
            request: {
                body: null
            },
            config: {
                [node.name]: {
                    "condition": "data.name === 'John'",
                    "error": "Name can't be John"
                }
            }
        }
    });

    it('should return the response data if condition is false', async () => {
        const result = await node.run(ctx);
        assert.strictEqual(result.name, "Johns");
    });

    it('should throw an error if condition is true', async () => {
        ctx.response.data.name = "John";
        try {
            await node.run(ctx);
        } catch (error: any) {
            assert.strictEqual(error.message, "Name can't be John");
        }
    });

    it('should throw error when no config is provided', async () => {
        delete ctx.config[node.name].error;
        try {
            await node.run(ctx);
        } catch (error: any) {
            assert.ok(error instanceof Error);
        }

        delete ctx.config[node.name].condition;
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