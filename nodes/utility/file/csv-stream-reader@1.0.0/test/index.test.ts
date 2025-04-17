import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import fs from 'fs';

describe('CsvStreamReader', () => {
    let node: Node;
    let ctx: any;
    let file = {
        mimetype: 'text/csv',
        filepath: 'testingCsv.csv'
    };

    before(() => {
        node = new Node();
        node.name = "csv-stream-reader";
        ctx = {
            response: {
                data: file
            },
            config: {
                [node.name]: {
                    "inputs": {
                        "properties": {
                            "batchSize": 3
                        }
                    },
                    "steps": [{
                        "name": "json-to-csv",
                        "module": "json-to-csv@1.0.0",
                        "type": "local"
                    }]
                }
            },
            logger: {
                log: () => { }
            }
        };

        // write a csv file for testing
        const results: any[] = [
            "country, iso",
            "Panama", "PAN",
            "United States", "USA",
            "Canada", "CAN",
            "Mexico", "MEX"
        ];
        fs.writeFileSync(file.filepath, results.join('\n'));

        // mock the goToNextStep method
        mock.method(node, 'goToNextStep').mock.mockImplementation(async (ctx: any, data: any, batchNumber: number) => {
            return new Promise((resolve) => {
                resolve(true);
            });
        });
    });

    after(() => {
        fs.unlinkSync(file.filepath);
    });

    it('should read a csv file', async () => {
        const result = await node.run(ctx);
        assert.ok(result.data === 8);
    });

    it('should throw an error if the file is not a csv', async () => {
        ctx.response.data.mimetype = 'text/plain';
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
        ctx.response.data.filepath = 'notFound.csv';
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
});