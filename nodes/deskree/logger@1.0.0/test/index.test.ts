import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('Deskree-logger', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "deskree-logger";
        ctx = {
            request: {
                headers: {
                    "content-type": "application/json",
                    "x-forwarded-for": "1.2.3",
                },
                body: "Hello World"
            },
            response: {
                data: "Hello World"
            },
            config: {
                [node.name]: {
                    "inputs": {
                        "service": "deskree-logger",
                        "projectId": "deskree-project_id",
                        "severity": "DEFAULT",
                        "status": 200,
                        "sourceLocation": {
                            "file": "deskree-file",
                            "line": 200,
                            "function": "deskree-function"
                        },
                        "labels": [
                            {
                                "billable": "billable"
                            }
                        ]
                    }
                }
            }
        };
    });

    it('should return a json object', async () => {
        const result: any = await node.run(ctx);
        assert.ok(result);
    });
});
