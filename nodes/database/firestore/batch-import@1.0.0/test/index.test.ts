import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import admin from 'firebase-admin';

describe('FirebaseBatchImport', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "firebase-batch-import";
        ctx = {
            response: {
                data: [{
                    city: 'city',
                    name: 'name'
                }]
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
                            "reference": "users/${#uid}/user/${name}",
                            "type": "set"
                        }
                    }
                }
            }
        }

        mock.method(admin, 'initializeApp').mock.mockImplementation(() => { });

        mock.method(admin, 'app').mock.mockImplementation(() => {
            return {
                firestore: () => {
                    return {
                        settings: () => { },
                        bulkWriter: () => {
                            return {
                                set: () => {
                                    return {
                                        then: () => { }
                                    }
                                },
                                close: async () => {
                                    return Promise.resolve(true);
                                }
                            }
                        },
                        doc: () => {
                            return {
                                set: () => {
                                    return {
                                        then: () => { }
                                    }
                                }
                            }
                        },
                        collection: (ref: string) => {
                            return {
                                doc: () => { return { id: "uid" } }
                            }
                        }
                    }
                }
            }
        });

    });

    it('should return error with wrong credentials', async (context) => {
        try {
            await node.run(ctx);
        } catch (e) {
            assert.ok(e);
        }
    });

    it('should return the response of importing a batch into firestore', async (context) => {
        delete ctx.config[node.name].inputs.firebaseConfig;
        const result = await node.run(ctx);
        assert.ok(result);
    });

    it('should return an error', async (context) => {
        mock.reset();
        ctx.request.body = ctx.response.data;
        delete ctx.response.data;
        try {
            mock.method(admin, 'app').mock.mockImplementation(() => {
                return {
                    firestore: () => {
                        return {
                            settings: () => { },
                            bulkWriter: () => {
                                return {
                                    set: () => {
                                        return {
                                            then: () => { }
                                        }
                                    }
                                }
                            },
                            doc: () => {
                                return {
                                    set: () => {
                                        return {
                                            then: () => { }
                                        }
                                    }
                                }
                            },
                            collection: (ref: string) => {
                                return {
                                    doc: () => { return { id: "uid" } }
                                }
                            }
                        }
                    }
                }
            });
            await node.run(ctx);
        } catch (error: any) {
            assert.ok(error);
        }
    });

    it('should throw error if no config is provided', async () => {
        delete ctx.config[node.name].inputs.properties.type;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name].inputs.properties.reference;
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config[node.name];
        await assert.rejects(async () => await node.run(ctx));

        delete ctx.config;
        await assert.rejects(async () => await node.run(ctx));
    });

});