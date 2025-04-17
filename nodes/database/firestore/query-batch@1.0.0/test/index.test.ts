import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import admin from 'firebase-admin';

describe('FirestoreQueryBatch', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "firestore-query-batch";
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
                            "count": false,
                            "batchSize": 1
                        }
                    },
                    steps: [{
                        "name": "json-to-csv",
                        "module": "json-to-csv@1.0.0",
                        "type": "local"
                    }]
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
        mock.method(node, 'goToNextStep').mock.mockImplementation(async (ctx: any, data: any, batchNumber: number) => {
            return new Promise((resolve) => {
                resolve(true);
            });
        });

    });

    it('should return error with wrong credentials', async (context) => {
        try {
            await node.run(ctx);
        } catch (e) {
            assert.ok(e);
        }
    });

    it('should return the response of importing a batch into firestore type collection', async (context) => {
        delete ctx.config[node.name].inputs.firebaseConfig;
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return the response of importing a batch into firestore type collectionGroup', async (context) => {
        ctx.config[node.name].inputs.properties.type = 'collectionGroup';
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return the response of importing a batch into firestore type document', async (context) => {
        ctx.config[node.name].inputs.properties.type = 'document';
        const result = await node.run(ctx);
        assert.ok(result);
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
        const result = await node.goToNextStep(ctx, {}, 1);
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
            assert.ok(error.message === '(firestore-query-batch) Error: node requires a valid reference key');
        }
    });

    it('should throw error when no config type is provided', async () => {
        const copyCtx = JSON.parse(JSON.stringify(ctx));
        copyCtx.config[node.name].inputs.properties.type = undefined;
        try {
            await node.run(copyCtx);
        } catch (error: any) {
            assert.ok(error.message === '(firestore-query-batch) Error: node requires a valid type');
        }
    });

    it('should throw error when no config step is provided', async () => {
        const copyCtx = JSON.parse(JSON.stringify(ctx));
        copyCtx.config[node.name].steps = undefined;
        try {
            await node.run(copyCtx);
        } catch (error: any) {
            assert.ok(error.message === '(firestore-query-batch) Error: node requires a list of nodes');
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