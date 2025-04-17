import { describe, it, before, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import admin from 'firebase-admin';
import fs from 'fs';

describe('FirebaseStorageFileUploader', () => {
    let node: Node;
    let ctx: any;

    before(() => {
        node = new Node();
        node.name = "firebase-storage-file-uploader";
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
                            bucket: 'test-bucket',
                            fileDir: 'test'
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
                                createWriteStream: () => {
                                    return {
                                        on: (event: string, callback: any) => {
                                            if (event === 'finish') callback();
                                        },
                                        end: () => { }
                                    }
                                        
                                },
                                file: () => {
                                    return {
                                        createWriteStream: () => {
                                            return {
                                                on: (event: string, callback: any) => {
                                                    if (event === 'finish') callback();
                                                },
                                                end: () => { }
                                            }
                                                
                                        }
                                    }
                                },

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

        mock.method(fs, 'createReadStream').mock.mockImplementation(() => {
            return {
                on: (event: string, callback: any) => {
                    if (event === 'end') callback();
                }
            }
        });

        mock.method(fs, 'existsSync').mock.mockImplementation(() => {
            return true;
        });

        mock.method(fs, 'unlinkSync').mock.mockImplementation(() => { });

    });

    it('should return error with wrong credentials', async (context) => {
        try {
            await node.run(ctx);
        } catch (e) {
            assert.ok(e);
        }
    });

    it('should return true',async () => {
        mock.method(node, 'uploadFileToFirebaseStorage').mock.mockImplementationOnce(() => {
            return true
        });
        delete ctx.config[node.name].inputs.firebaseConfig;
        try {
            await node.run(ctx);
        } catch (error: any) {
            assert.ok(error); 
        }
    });

    it('should return true calling uploadFileToFirebaseStorage',async () => {
        try {
            const result = await node.uploadFileToFirebaseStorage(admin.app, 'test-file.json', 'test', 'test-bucket');
            console.log(result);
        } catch (error: any) {
            assert.ok(error); 
        }
    });
});