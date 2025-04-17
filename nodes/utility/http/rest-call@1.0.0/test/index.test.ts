import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('ApiCall', () => {
    let node: Node;

    before(() => {
        node = new Node();
        node.name = "rest-call";


    });

    it('should call an api with json content-type', async () => {
        // mocking fetch api
        mock.method(global, 'fetch', () => {
            return {
                headers: {
                    get: () => {
                        return 'application/json';
                    }
                },
                json: () => {
                    return {
                        data: {
                            "userId": 1,
                            "id": 1,
                            "title": "delectus aut autem",
                        }
                    };
                }
            }
        });
        const ctx: any = {
            response: {
                data: null
            },
            request: {
                body: null
            },
            config: {
                "rest-call": {
                    inputs: {
                        properties: {
                            url: "https://jsonplaceholder.typicode.com/todos/1",
                            method: "GET",
                        }
                    }
                }
            }
        };
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should call an api with text content-type', async () => {
        // mocking fetch api
        mock.method(global, 'fetch', () => {
            return {
                headers: {
                    get: () => {
                        return 'text/plain';
                    }
                },
                text: () => {
                    return "lorem ipsum"
                }
            }
        });
        const ctx: any = {
            response: {
                data: null
            },
            request: {
                body: null
            },
            config: {
                "rest-call": {
                    inputs: {
                        properties: {
                            url: "https://jsonplaceholder.typicode.com/todos/1",
                            method: "GET",
                        }
                    }
                }
            }
        };
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should throw an error if content-type is not supported', async () => {
        // mocking fetch api
        mock.method(global, 'fetch', () => {
            return {
                headers: {
                    get: () => {
                        return 'application/xml';
                    }
                },
                text: () => {
                    return "lorem ipsum"
                }
            }
        });
        const ctx: any = {
            response: {
                data: null
            },
            request: {
                body: null
            },
            config: {
                "rest-call": {
                    inputs: {
                        properties: {
                            url: "https://jsonplaceholder.typicode.com/todos/1",
                            method: "GET",
                        }
                    }
                }
            }
        };
        try {
            await node.run(ctx);
        } catch (e) {
            assert.ok(e);
        }
    });

});