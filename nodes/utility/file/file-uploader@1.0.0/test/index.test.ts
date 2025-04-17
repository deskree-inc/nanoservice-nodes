import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import { Formidable } from 'formidable';

describe('FileUploader', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "file-uploader";
        ctx = {
            request: {
                body: null,
                on: () => { }
            },
            config: {
                [node.name]: {
                    inputs: {
                        properties: {
                            uploadDir: 'uploads'
                        }
                    }
                }
            }
        };

        // mock the formidable library parse method
        mock.method(Formidable.prototype, 'parse').mock.mockImplementation(() => {
            return Promise.resolve([{}, {
                file: [{
                    mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    filepath: 'test.xlsx'
                }]
            }]);
        });


    });

    it('should return a json object', async () => {
        const result = await node.run(ctx);
        assert.deepStrictEqual(result, {
            mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            filepath: 'test.xlsx'
        });
    });

    it('should throw error', async () => {
        mock.method(Formidable.prototype, 'parse').mock.mockImplementation(() => {
            throw new Error('test error');
        });

        assert.rejects(node.run(ctx));
    });

    it('should throw error if no config is provided', async () => {
        delete ctx.config[node.name].inputs.properties.uploadDir
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].inputs.properties;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].inputs;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name];
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config;
        await assert.rejects(async () => await node.run(ctx));
    });

});