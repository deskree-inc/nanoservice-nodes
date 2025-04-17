import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import fs from 'fs';

describe('JsonStreamReader', () => {
    let node: Node;
    let ctx: any;
    let file = {
        mimetype: 'application/json',
        filepath: 'testingJson.json'
    };

    before(() => {
        node = new Node();
        node.name = "json-stream-reader";
        ctx = {
            response: {
                data: file
            },
            request: {
                body: file
            },
            config: {
                [node.name]: {
                    "inputs": {
                        "properties": {
                            "batchSize": 3
                        }
                    },
                    "steps": [{
                        "name": "json-to-json",
                        "module": "json-to-json@1.0.0",
                        "type": "local"
                    }]
                }
            },
            logger: {
                log: () => { }
            }
        };

        fs.writeFileSync(file.filepath, JSON.stringify(
            [{ "name": "John", "age": 24 },
            { "name": "Jane", "age": 25 },
            { "name": "Jack", "age": 26 },
            { "name": "Jill", "age": 27 }]
        ));

        mock.method(node, 'goToNextStep').mock.mockImplementation(async (ctx: any, data: any, batchNumber: number) => {
            return new Promise((resolve) => {
                resolve(true);
            });
        });
    });

    after(() => {
        fs.unlinkSync(file.filepath);
    });

    it('should read a json file', async () => {
        const result = await node.run(ctx);
        assert.ok(result.data === 4);
    });

    it('should throw an error if the file is not a json', async () => {
        ctx.response.data.mimetype = 'application/xml';
        try {
            await node.run(ctx);
        } catch (e) {
            assert.ok(e);
        }
    });

    it('should call the goToNextStep method', async () => {
        mock.reset();
        try {
            await node.goToNextStep(ctx, [], 1);
        } catch (e) {
            assert.ok(e);
        }
    });

    it('should throw an error if the file is not found', async () => {
        ctx.response.data.filepath = 'notFound.json';
        try {
            await node.run(ctx);
        } catch (e) {
            assert.ok(e);
        }
    });

    it('should return the go to next step function response', async (context) => {
        mock.restoreAll();
        ctx.config[node.name].steps[0] = {
            ...ctx.config[node.name].steps[0],
            run: (ctx: any, data: any) => {
                return new Promise((resolve) => {
                    resolve(true);
                });
            }

        }
        const result = await node.goToNextStep(ctx, [], 1);
        assert.ok(result);
    });

    it('should throw error when no config is provided', async () => {
        delete ctx.response.data;
        delete ctx.config[node.name].steps;
        assert.rejects(node.run(ctx));

        ctx.config = undefined;
        assert.rejects(node.run(ctx));
    });
});