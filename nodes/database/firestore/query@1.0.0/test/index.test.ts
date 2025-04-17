import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import admin from 'firebase-admin';

describe('FirestoreQuery', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "firestore-query";
        ctx = {
            response: {
                data: {
                    "color": "red"
                }
            },
            request: {
                body: null
            },
            config: {
                [node.name]: {
                    inputs: {
                        firebaseConfig: {
                            client_email: 'client_email',
                            private_key: 'private_key',
                            project_id: 'project_id'
                        },
                        properties: {
                            "reference": "users/${color}/data",
                            "type": "collection",
                            "where": [
                                {
                                    "field": "name",
                                    "operator": "==",
                                    "value": "${color}"
                                }
                            ],
                            "orderBy": [
                                {
                                    "field": "name",
                                    "direction": "desc"
                                }
                            ],
                            "limit": 1,
                            "count": false
                        }
                    }
                }
            },
            logger: {
                log: () => { }
            }
        }
        let query = {
            where: () => { return query },
            orderBy: () => { return query },
            limit: () => { return query },
            doc: () => { return query },
            onSnapshot: () => { return query },
            startAfter: () => { return query },
            count: () => {
                return {
                    get: () => {
                        return {
                            data: () => {
                                return {
                                    count: 1
                                }
                            }
                        }
                    }
                }
            },
            get: () => {
                return new Promise((resolve, reject) => {
                    resolve({
                        size: 1,
                        forEach: (callback: any) => {
                            callback({
                                data: () => {
                                    return {
                                        "name": "John",
                                        "age": 30,
                                        "cars": {
                                            "car1": "Ford",
                                            "car2": "BMW",
                                            "car3": "Fiat"
                                        }
                                    }
                                }
                            })
                        },
                        data: () => {
                            return {
                                "name": "John",
                                "age": 30,
                                "cars": {
                                    "car1": "Ford",
                                    "car2": "BMW",
                                    "car3": "Fiat"
                                }
                            }
                        }
                    })
                })
            }
        }
        mock.method(admin, 'initializeApp').mock.mockImplementation(() => { });
        mock.method(admin, 'app').mock.mockImplementation(() => {
            return {
                delete: () => { },
                firestore: () => {
                    return {
                        settings: () => { },
                        collection: (ref: string) => {
                            return query
                        },
                        collectionGroup: (ref: string) => {
                            return query
                        },
                        doc: (ref: string) => {
                            query.doc = () => { return query }
                            return query
                        }
                    }
                }
            }
        });

    });

    it('should return error with wrong credentials', async () => {
        try {
            await node.run(ctx);
        } catch (e) {
            assert.ok(e);
        }
    });

    it('should return the query response type collection', async () => {
        delete ctx.config[node.name].inputs.firebaseConfig;
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return the query response type collectionGroup', async () => {
        ctx.config[node.name].inputs.properties.type = 'collectionGroup';
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return the query count', async () => {
        ctx.config[node.name].inputs.properties.count = true;
        const result = await node.run(ctx);
        assert.ok(result.count === 1);
    });

    it('should return the query response type document', async () => {
        ctx.config[node.name].inputs.properties.type = 'document';
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should throw error when no config reference is provided', async () => {
        const copyCtx = JSON.parse(JSON.stringify(ctx));
        copyCtx.config[node.name].inputs.properties.reference = undefined;
        copyCtx.request.body = copyCtx.response.data;
        delete copyCtx.response.data;
        try {
            await node.run(copyCtx);
        } catch (error: any) {
            assert.ok(error.message === '(firestore-query) Error: node requires a valid reference key');
        }
    });

    it('should throw error when no config type is provided', async () => {
        const copyCtx = JSON.parse(JSON.stringify(ctx));
        copyCtx.config[node.name].inputs.properties.type = undefined;
        try {
            await node.run(copyCtx);
        } catch (error: any) {
            assert.ok(error.message === '(firestore-query) Error: node requires a valid type');
        }
    });

    it('should throw error when no config is provided', async () => {
        delete ctx.config[node.name].inputs;
        try {
            await node.run(ctx);
        } catch (error: any) {
            assert.ok(error instanceof Error);
        }

        delete ctx.config[node.name];
        try {
            await node.run(ctx);
        } catch (error: any) {
            assert.ok(error instanceof Error);
        }

        delete ctx.config;
        try {
            await node.run(ctx);
        } catch (error: any) {
            assert.ok(error instanceof Error);
        }
    });
});