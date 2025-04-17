import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import fs from 'fs';
import ExcelJS from 'exceljs';

const generateXlsx = async (batch: any, file: any) => {
    let workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet('Sheet1');
    worksheet.columns = Object.keys(batch[0]).map((key) => ({ header: key, key: key }));

    // Add data to the worksheet
    for (const row of batch) {
      worksheet.addRow(row);
    }

    // Stream the updated worksheet to the temporary workbook
    const tempStream = fs.createWriteStream(file.filepath);
    await workbook.xlsx.write(tempStream);
}

describe('XlsxStreamReader', () => {
    let node: Node;
    let ctx: any;
    let file = {
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filepath: 'testingXlsx.xlsx'
    };

    before(async () => {
        node = new Node();
        node.name = "xlsx-stream-reader";
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
                        "name": "xlsx-to-xlsx",
                        "module": "xlsx-to-xlsx@1.0.0",
                        "type": "local"
                    }]
                }
            },
            logger: {
                log: () => { }
            }
        };

        // write a xlsx file using ExcelJS
        const data = [
            { "id": 1, "name": "John Doe", "age": 30, "city": "New York" },
            { "id": 2, "name": "Jane Doe", "age": 25, "city": "Chicago" },
            { "id": 3, "name": "John Smith", "age": 20, "city": "Los Angeles" },
            { "id": 4, "name": "Jane Smith", "age": 15, "city": "Houston" }
        ];
        await generateXlsx(data, file);
          
    
        mock.method(node, 'goToNextStep').mock.mockImplementation(async (ctx: any, data: any, batchNumber: number) => {
            return new Promise((resolve) => {
                resolve(true);
            });
        });
    });

    after(() => {
        fs.unlinkSync(file.filepath);
    });

    it('should read a xlsx file', async () => {
        const result = await node.run(ctx);
        assert.ok(result.data === 4);
    });

    it('should throw an error if the file is not a xlsx', async () => {
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
        ctx.response.data.filepath = 'notFound.xlsx';
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