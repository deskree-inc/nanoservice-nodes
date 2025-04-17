import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import Node from '../index';

describe('GoogleDriveUploadFromUrl', () => {
    let node: Node;
    let ctx: any;
    let originalFetch: typeof fetch;

    before(() => {
        node = new Node();
        node.name = 'google-drive-upload-from-url';
        ctx = {
            response: {
                data: null,
            },
            request: {
                body: null,
            },
            config: {
                [node.name]: {
                    inputs: {
                        googleConfig: {
                            clientId: 'client_id',
                            clientSecret: 'client_secret',
                            refreshToken: 'refresh_token',
                        },
                        publicUrl: 'https://example.com/file.jpg',
                        fileName: 'file.jpg',
                        mimeType: 'image/jpeg',
                        path: '/Folder1/Subfolder2',
                    },
                },
            },
        };

        // Save the original fetch function
        originalFetch = globalThis.fetch;

        // Mock the fetch function
        globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
            const url = typeof input === 'string' ? input : input.toString();

            if (url.includes('https://oauth2.googleapis.com/token')) {
                // Simulate successful token response
                return new Response(
                    JSON.stringify({
                        access_token: 'mock_access_token',
                        expires_in: 3599,
                        token_type: 'Bearer',
                    }),
                    {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                );
            } else if (url.includes('https://www.googleapis.com/upload/drive/v3/files')) {
                // Simulate successful file upload response
                return new Response(
                    JSON.stringify({
                        id: 'mock_file_id',
                        name: ctx.config[node.name].inputs.fileName || 'file.jpg',
                    }),
                    {
                        status: 200,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                );
            } else if (url.includes('https://www.googleapis.com/drive/v3/files')) {
                // Handle folder search and creation
                if (init?.method === 'GET') {
                    // Simulate folder search
                    const q = new URLSearchParams(url.split('?')[1]).get('q') || '';
                    const folderNameMatch = q.match(/name = '([^']+)'/);
                    const folderName = folderNameMatch ? folderNameMatch[1] : '';

                    // Simulate that folder does not exist
                    return new Response(
                        JSON.stringify({
                            files: [],
                        }),
                        {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        },
                    );
                } else if (init?.method === 'POST') {
                    // Simulate folder creation
                    const body = JSON.parse(init.body as string);
                    return new Response(
                        JSON.stringify({
                            id: 'mock_folder_id_' + body.name,
                            name: body.name,
                        }),
                        {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        },
                    );
                } else {
                    // Default response for unhandled methods
                    return new Response(null, {
                        status: 404,
                        statusText: 'Not Found',
                    });
                }
            } else if (url === ctx.config[node.name].inputs.publicUrl) {
                // Simulate file download
                const arrayBuffer = new ArrayBuffer(10); // Simulate a 10-byte file
                return new Response(arrayBuffer, {
                    status: 200,
                    headers: {
                        'Content-Type': ctx.config[node.name].inputs.mimeType || 'application/octet-stream',
                    },
                });
            } else {
                // Default response for unhandled URLs
                return new Response(null, {
                    status: 404,
                    statusText: 'Not Found',
                });
            }
        };
    });

    after(() => {
        // Restore the original fetch function
        globalThis.fetch = originalFetch;
    });

    it('should upload the file to the specified path', async () => {
        // Test uploading to a specific path
        ctx.config[node.name].inputs.path = '/Folder1/Subfolder2';

        const result = await node.run(ctx);

        assert.strictEqual(result.success, true);
        assert.ok(result.data);
        assert.strictEqual(result.data.id, 'mock_file_id');
        assert.strictEqual(result.data.name, 'file.jpg');
    });

    it('should upload the file to the root when path is not specified', async () => {
        // Remove path from configuration
        delete ctx.config[node.name].inputs.path;

        const result = await node.run(ctx);

        assert.strictEqual(result.success, true);
        assert.ok(result.data);
        assert.strictEqual(result.data.id, 'mock_file_id');
        assert.strictEqual(result.data.name, 'file.jpg');
    });

    it('should return error with wrong credentials', async () => {
        // Provide incorrect Google credentials
        ctx.config[node.name].inputs.googleConfig = {
            clientId: 'wrong_client_id',
            clientSecret: 'wrong_client_secret',
            refreshToken: 'wrong_refresh_token',
        };

        // Mock fetch to simulate token error
        globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
            const url = typeof input === 'string' ? input : input.toString();

            if (url.includes('https://oauth2.googleapis.com/token')) {
                // Simulate token error response
                return new Response(
                    JSON.stringify({
                        error: 'invalid_grant',
                        error_description: 'Bad Request',
                    }),
                    {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                );
            } else {
                // Default response
                return new Response(null, {
                    status: 404,
                    statusText: 'Not Found',
                });
            }
        };

        const result = await node.run(ctx);

        assert.strictEqual(result.success, false);
        assert.ok(result.error);
        assert.strictEqual(result.error.message, 'Failed to obtain access token: Bad Request');
    });

    it('should return error when publicUrl is missing', async () => {
        // Remove publicUrl from configuration
        delete ctx.config[node.name].inputs.publicUrl;

        const result = await node.run(ctx);

        assert.strictEqual(result.success, false);
        assert.ok(result.error);
        assert.strictEqual(result.error.message, 'google-drive-upload-from-url requires a publicUrl');
    });

    it('should use default fileName when fileName is not provided', async () => {
        // Remove fileName from configuration
        delete ctx.config[node.name].inputs.fileName;
        ctx.config[node.name].inputs.publicUrl = 'https://example.com/path/to/another-file.txt';

        const result = await node.run(ctx);

        assert.strictEqual(result.success, true);
        assert.ok(result.data);
        assert.strictEqual(result.data.name, 'another-file.txt');
    });

    it('should return error when googleConfig is missing', async () => {
        // Remove googleConfig from configuration
        delete ctx.config[node.name].inputs.googleConfig;

        const result = await node.run(ctx);

        assert.strictEqual(result.success, false);
        assert.ok(result.error);
        assert.strictEqual(result.error.message, 'google-drive-upload-from-url requires googleConfig');
    });
});
