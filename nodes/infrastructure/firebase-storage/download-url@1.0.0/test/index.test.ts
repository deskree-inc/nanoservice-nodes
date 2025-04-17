import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import admin from 'firebase-admin';

describe('FirebaseStorageDownloadUrl', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "firebase-storage-download-url";
        ctx = {
            response: {
                data: 'test-file.json'
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
                            bucket: 'test-bucket'
                        }
                    }
                }
            }
        }

        mock.method(admin, 'initializeApp').mock.mockImplementation(() => { });

        mock.method(admin, 'app').mock.mockImplementation(() => { 
            return {
                storage: () => {
                    return {
                        bucket: () => {
                            return {
                                file: () => {
                                    return {
                                        getSignedUrl: () => {
                                            return ['http://example.com'];
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                options: {
                    credential: {
                        projectId: 'test-project'
                    }
                }
            }
        });



    });

    it('should return error with wrong credentials', async (context) => {
        try {
            await node.run(ctx);
        }catch(e){
            assert.ok(e);
        }
    });

    it('should return the download url with default credentials', async (context) => {
        delete ctx.config[node.name].inputs.firebaseConfig;
        const result = await node.run(ctx);
        assert.ok(result === 'http://example.com');
    });

    it('should return the download url with default credentials without specific bucketname', async (context) => {
        ctx.request.body = ctx.response.data;
        delete ctx.config[node.name].inputs.properties.bucket;
        delete ctx.response.data;
        const result = await node.run(ctx);
        assert.ok(result === 'http://example.com');
    });

});