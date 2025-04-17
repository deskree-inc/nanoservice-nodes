import { describe, it, before, mock } from "node:test";
import assert from "node:assert";
import Node from "../index";

describe("while", (context) => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "while";
        ctx = {
            response: {
                data: [{}],
            },
            request: {
                body: {},
            },
            config: {
                [node.name]: {
                    condition: "true",
                    steps: [
                        {
                            name: "fix-json-key",
                            module: "fix-json-key",
                            type: "local",
                        },
                        {
                            name: "jsonschema",
                            module: "jsonschema",
                            type: "local",
                        },
                    ],
                },
            },
            logger: {
                log: () => {},
            },
        };

        mock.method(node, "runStep", () => {
            return [true];
        });
    });

    it("should get the step if condition is true", async () => {
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it("should throw error if no config is provided", async () => {
        ctx.config[node.name].steps = [];
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].conditions;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name];
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config;
        await assert.rejects(async () => await node.run(ctx));
    });

    it("should return true method runStep", async () => {
        mock.reset();
        node.run = async () => ({ success: true, data: {}, error: null });
        const result = await node.runStep(ctx, node);
        assert.ok(result.success);
    });
});
