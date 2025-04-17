import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import axios from 'axios';

describe('Proxy', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "proxy";
        ctx = {
            response: {
                data: null
            },
            request: {
                path: "/api/v1/rest/collections/users/123?additional=test",
                headers: {
                    "content-type": "application/json",
                    "method": "GET",
                    "host": "localhost:3000",
                    "accept": "*/*"
                },
                body: {
                    "id": "123"
                }
            },
            config: {
                [node.name]: {
                    "inputs": {
                        "properties": {
                            "proxy": [
                                {
                                    "host": "https://bp-firestore-stack.api-dev.deskree.com",
                                    "path": "/api/v1/rest/collections/users/:id",
                                    "pathRewrite": "/api/v1/rest/collections/users/${ctx.request.params.id}",
                                    "options": {
                                        "remove": [
                                            "test",
                                            "api"
                                        ],
                                        "replace": {
                                            "users": "users"
                                        },
                                        "query": {
                                            "additional": "test2",
                                            "test": null,
                                            "test2": undefined
                                        },
                                        "appendPath": "test",
                                        "prependPath": "api",
                                        "add": true
                                    }
                                },
                                {
                                    "host": "https://bp-firestore-stack.api-dev.deskree.com",
                                    "path": "/api/v1/rest/collections/*",
                                    "pathRewrite": "/api/v1/rest/collections/users",
                                    "options": {
                                        "add": false,
                                        "query": {
                                            "additional": "test2",
                                        }
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            logger: {
                log: () => { }
            }
        }

        mock.method(axios, 'request').mock.mockImplementation(() => {
            return {
                data: {
                    "id": "123",
                    "name": "test",
                    "age": 50
                },
                headers: {
                    "content-type": "application/json"
                }
            }
        });
    });

    it('should return of the reverse proxy', async () => {
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return of the proxy', async () => {
        ctx.config[node.name].inputs.properties.proxy = ctx.config[node.name].inputs.properties.proxy[0];
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return of the proxy with add option false', async () => {
        ctx.config[node.name].inputs.properties.proxy.options.add = false;
        ctx.config[node.name].inputs.properties.proxy.options.query = {
            "additional2": "test2",
        }
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return of the proxy without pathRewrite', async () => {
        ctx.config[node.name].inputs.properties.proxy.pathRewrite = undefined;
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return an error if no host or path where provided', async () => {
        ctx.config[node.name].inputs.properties.proxy.host = undefined;
        await assert.rejects(async () => await node.run(ctx));

        ctx.config[node.name].inputs.properties.proxy.host = "https://bp-firestore-stack.api-dev.deskree.com";
        ctx.config[node.name].inputs.properties.proxy.path = undefined;
        await assert.rejects(async () => await node.run(ctx));
    });

    it('should throw error if no config is provided', async () => {
        delete ctx.config[node.name].inputs.properties.proxy
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