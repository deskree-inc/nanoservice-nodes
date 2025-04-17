import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import fs from 'fs';

describe('FileRemover', () => {
    let node: Node;
    let ctx: any;

    const filePath = 'test.csv';
    before(() => {
        node = new Node();
        node.name = "file-uploader";
        ctx = {
            response: {
                data: null
            },
            request: {
                body: null
            },
            config: {
                [node.name]: {
                    inputs: {
                        properties: {
                            filePath: filePath
                        }
                    }
                }
            }
        };

        const results: any[] = [
            "country, iso",
            "Panama", "PAN",
            "United States", "USA",
            "Canada", "CAN",
            "Mexico", "MEX"
        ];
        fs.writeFileSync(filePath, results.join('\n'));
    });

    it('should return a json object', async () => {
        await node.run(ctx);
        assert.ok(fs.existsSync(filePath) === false);
    });

    it('should throw an error', async () => {
        assert.rejects(node.run(ctx));
    });
});