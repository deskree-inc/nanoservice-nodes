import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import sgMail from '@sendgrid/mail';

describe('Sendgrid', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "sendgrid";
        ctx = {
            response: {
                data: true
            },
            request: {
                body: true
            },
            config: {
                [node.name]: {
                    "inputs": {
                        "type": "object",
                        "properties": {
                            "sendGridApiKey": "SG.<sendGridApiKey>",
                            "to": ["ernesto@deskree.com"],
                            "subject": "Hello, World!",
                            "html": "<h1>Hello, {{-name-}} World!</h1>",
                            "options": {
                                "from": "no-reply@deskree.com",
                                "templateId": "d-30dd024fc5d4445aada12ebf3b6f4abb",
                                "substitutions": {
                                    "-name-": "Ernesto Deskree"
                                }
                            }
                        }
                    }
                }
            },
            logger: {
                log: () => { }
            }
        }

        mock.method(sgMail, 'setApiKey').mock.mockImplementation(() => { });
        mock.method(sgMail, 'send').mock.mockImplementation(() => { });
    });

    it('should return the data of the previous node', async () => {
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return the data of the previous body', async () => {
        delete ctx.response.data;
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should throw error if send email fails', async () => {
        mock.method(sgMail, 'send').mock.mockImplementationOnce(() => {
            throw {
                response: {
                    body: {
                        errors: [
                            {
                                message: "error message"
                            }
                        ]
                    }
                }
            }
        });
        assert.rejects(async () => await node.run(ctx));
    });

    it('should throw error if no config is provided', async () => {
        delete ctx.config[node.name].inputs.properties.html
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].inputs.properties.subject;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].inputs.properties.to;
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