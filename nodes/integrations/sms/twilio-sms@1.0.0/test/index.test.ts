import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import twilio from 'twilio';

describe('TwilioSMS', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "twilio-sms";
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
                        "properties": {
                            "accountSid": "<accountSid>",
                            "authToken": "<authToken>",
                            "from": "<from>",
                            "to": "<to>",
                            "body": "<body>",
                            "options": {
                                "autoRetry": true,
                                "maxRetries": 3
                            }
                        }
                    }
                }
            },
            logger: {
                log: () => { }
            }
        }

        // mock twilio send sms method
        mock.fn(twilio.prototype).mock.mockImplementation(() => {
            return Promise.resolve({
                message: {
                    create: () => {
                        return Promise.resolve({
                            sid: "123"
                        });
                    }
                }
            });
        });
    });

    it('should return the data of the previous node', async () => {
        const result = await node.run(ctx);
        assert.ok(result);
    });


});