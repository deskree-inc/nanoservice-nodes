import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import ExcelJS from 'exceljs';
import { Formidable } from 'formidable';

describe('Xlsx2Json', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "csv2json";
        ctx = {
            response: {
                data: {}
            },
            request: {
                body: {}
            }
        };

        mock.method(Formidable.prototype, 'parse').mock.mockImplementation(() => {
            return Promise.resolve([{}, {
                file: [{
                    mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    filepath: 'test.xlsx'
                }]
            }]);
        });

        mock.method(ExcelJS.Workbook.prototype.xlsx, 'readFile').mock.mockImplementation(() => {
            return Promise.resolve({
                worksheets: [
                    {
                        getRow: (rowNumber: number) => {
                            return {
                                eachCell: (cb: Function) => {
                                    cb({ value: 'name' }, 1);
                                    cb({ value: 'age' }, 2);
                                }
                            }
                        }
                    }
                ]
            });
        });

        mock.method(ExcelJS.Workbook.prototype, 'getWorksheet').mock.mockImplementation(() => {
            return {
                getRow: (rowNumber: number) => {
                    return {
                        eachCell: (cb: Function) => {
                            cb({ value: 'name' }, 1);
                            cb({ value: 'age' }, 2);
                        }
                    }
                },
                rowCount: 2
            }
        });
    });

    it('should return a json object', async (context) => {
        const result: any = await node.run(ctx);
        assert.ok(result.data.length === 1);
    });

    it('should throw an error if the mimetype is incorrect', async () => {
        mock.method(Formidable.prototype, 'parse').mock.mockImplementationOnce(() => {
            return Promise.resolve([{}, {
                file: [{
                    mimetype: 'application/xml',
                    filepath: 'test.xlsx'
                }]
            }]);
        });

        assert.rejects(async () => { await node.run(ctx) });
    });
});