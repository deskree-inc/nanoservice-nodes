import { describe, it, beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert';
import Node from '../index';
import AWS from 'aws-sdk';

describe('S3StorageDownloadUrl', () => {
  let node: Node;
  let ctx: any;

  beforeEach(() => {
    node = new Node();
    node.name = "aws-s3-storage-download-url";
    ctx = {
      response: {
        data: 'test-file.txt'
      },
      request: {
        body: null
      },
      config: {
        [node.name]: {
          inputs: {
            awsConfig: {
              accessKeyId: 'testAccessKeyId',
              secretAccessKey: 'testSecretAccessKey',
              region: 'us-west-2'
            },
            properties: {
              bucket: 'test-bucket'
            },
            signedUrlConfig: {
              Expires: 3600
            }
          }
        }
      }
    };

    // Mock AWS.config.update to prevent actual AWS configuration
    mock.method(AWS.config, 'update').mock.mockImplementation(() => { });
  });

  afterEach(() => {
    // Restore all mocks after each test
    mock.restoreAll();
  });

  it('should return error with wrong credentials', async () => {
    // Provide incorrect AWS credentials
    ctx.config[node.name].inputs.awsConfig = {
      accessKeyId: 'wrongAccessKeyId',
      secretAccessKey: 'wrongSecretAccessKey',
      region: 'us-west-2'
    };

    // Mock AWS.S3 to throw an error when incorrect credentials are used
    mock.method(AWS, 'S3').mock.mockImplementation(() => {
      return {
        getSignedUrl: (operation: string, params: any, callback: Function) => {
          const error = new Error('Invalid AWS credentials');
          callback(error, null);
        }
      };
    });

    const result = await node.run(ctx);

    assert.strictEqual(result.success, false);
    assert.ok(result.error);
    assert.strictEqual(result.error.message, 'Invalid AWS credentials');
  });

  it('should return the download URL with valid credentials', async () => {
    // Mock AWS.S3 to return a valid signed URL
    mock.method(AWS, 'S3').mock.mockImplementation(() => {
      return {
        getSignedUrl: (operation: string, params: any) => {
          return 'http://example.com';
        }
      };
    });

    const result = await node.run(ctx);

    assert.strictEqual(result.success, true);
    assert.strictEqual(result.data, 'http://example.com');
  });

  it('should return error when bucket name is missing', async () => {
    // Remove the bucket name from the configuration
    delete ctx.config[node.name].inputs.properties.bucket;

    const result = await node.run(ctx);

    assert.strictEqual(result.success, false);
    assert.ok(result.error);
    assert.strictEqual(result.error.message, 'Bucket name is required');
  });
});
