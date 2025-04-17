import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export default class S3StorageDownloadUrl extends BlueprintNode {
    s3Client: S3Client;

    constructor() {
        super();
        this.s3Client = new S3Client({});
    }

    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        this.contentType = "application/json";
        let awsConfig: any;
        let signedUrlConfig: any;
        let remoteFileName: string;

        try {
            let opts = ctx.config as any;
            opts = opts[this.name];
            awsConfig = opts?.inputs?.awsConfig;
            signedUrlConfig = opts?.inputs?.signedUrlConfig;

            remoteFileName = opts?.inputs?.properties?.remoteFileName;

            if (typeof remoteFileName !== 'string' || !remoteFileName.trim()) {
                throw new Error('The remote file name must be a non-empty string.');
            }

            this.initAWS(awsConfig);

            let bucketName = opts?.inputs?.properties?.bucket;

            if (!bucketName) throw new Error("Bucket name is required");

            const result = await this.getDownloadUrl(bucketName, remoteFileName, signedUrlConfig);

            response.data = result;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }

    initAWS(awsConfig: any) {
        this.s3Client = new S3Client({
            region: awsConfig.region,
            credentials: {
                accessKeyId: awsConfig.accessKeyId,
                secretAccessKey: awsConfig.secretAccessKey,
                sessionToken: awsConfig.sessionToken
            },
        });
    }

    async getDownloadUrl(bucketName: string, remoteFileName: string, signedUrlConfig: any) {
        let expiresIn = signedUrlConfig?.Expires || 60 * 60 * 24; // Default to 1 day in seconds

        if (typeof expiresIn === "string") {
            expiresIn = parseInt(expiresIn, 10);
        }

        // Prepare the GetObjectCommand input
        let commandParams: any = {
            Bucket: bucketName,
            Key: remoteFileName,
        };

        // Include additional parameters from signedUrlConfig
        const allowedParams = [
            'ResponseContentType',
            'ResponseContentLanguage',
            'ResponseExpires',
            'ResponseCacheControl',
            'ResponseContentDisposition',
            'ResponseContentEncoding'
        ];

        if (signedUrlConfig) {
            for (const param of allowedParams) {
                if (signedUrlConfig[param]) {
                    commandParams[param] = signedUrlConfig[param];
                }
            }
        }

        const command = new GetObjectCommand(commandParams);

        const url = await getSignedUrl(this.s3Client, command, { expiresIn });

        return {
            url
        };
    }
}
