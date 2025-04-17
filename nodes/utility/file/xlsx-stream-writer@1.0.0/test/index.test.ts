import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import fs from 'fs';


describe('XlsxStreamWriter', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "xlsx-stream-writer";
        ctx = {
            response: {
                data: [
                    { "country": "Panama", "iso": "PAN" },
                    { "country": "United States", "iso": "USA" }
                ]
            },
            request: {
                body: null
            },
            vars: {
                __batchID: "batchIdTest",
                __batchProgress: "START"
            }
        };
    });

    it('should write a xlsx file', async () => {
        const result: any = await node.run(ctx);
        assert.ok(result.filePath);
    });

    it('should write a xlsx file even if the file already exists', async () => {
        const result: any = await node.run(ctx);
        assert.ok(result.filePath);
        fs.unlinkSync(result.filePath);
    });

    it('should write a xlsx file without a __batchId', async () => {
        delete ctx.vars;
        const result: any = await node.run(ctx);
        assert.ok(result.filePath);
        fs.unlinkSync(result.filePath);
    });

    it('should throw error if data is not an array', async () => {
        delete ctx.response.data;
        assert.rejects(node.run(ctx));
    });
});