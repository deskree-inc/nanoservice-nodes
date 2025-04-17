import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import admin, { app } from "firebase-admin";
import { TransferManager } from "@google-cloud/storage";
import path from "path";
import fs from "fs";
import { v4 } from "uuid";
import archiver from "archiver";
import { validate } from "jsonschema";
import { config } from "./config.json";
import { tmpdir } from "os";

export default class DownloadFolderUrl extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        let data = ctx.response.data || ctx.request.body;
        let firebaseConfig: any;
        let folderPath: string;
        let destinationPath: string;
        let bucketName: string;
        let filesPath: string | undefined = undefined;
        try {
            let opts = ctx.config as any;
            opts = opts[this.name];
            firebaseConfig = opts?.inputs?.firebaseConfig || ctx._PRIVATE_.get("firebase.config");
            folderPath = opts?.inputs?.properties.folderPath || data.folderPath;
            bucketName = opts?.inputs?.properties?.bucketName;

            if (folderPath.startsWith("/")) folderPath = folderPath.slice(1);
            this.initFirebaseAdmin(firebaseConfig);
            const app = admin.app(firebaseConfig?.client_email);
            const projectId: string = firebaseConfig?.project_id || process.env.PROJECT_ID;
            if (!bucketName) bucketName = `gs://${projectId}.appspot.com`;
            const folderId = v4();
            filesPath = await this.downloadMultipleFiles(app, bucketName, folderPath, folderId);
            const zipPath = await this.createZipArchive(filesPath, folderPath, folderId);
            folderPath = folderPath.endsWith("/") ? folderPath.slice(0, -1) : folderPath;
            destinationPath = opts?.inputs?.properties.destinationPath || `${folderPath}.zip`;
            const zipRemotePath = await this.uploadFileToFirebaseStorage(app, bucketName, zipPath, destinationPath);
            const zipSignedUrl = await this.getDownloadUrl(app, bucketName, zipRemotePath);
            response.data = zipSignedUrl;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        } finally {
            this.removeLocalTempFiles(filesPath);
        }

        return response;
    }

    initFirebaseAdmin(firebaseConfig: any) {
        try {
            getApp(firebaseConfig?.client_email);
        } catch (e) {
            if (firebaseConfig) initializeApp({ credential: cert(firebaseConfig) }, firebaseConfig?.client_email);
            else initializeApp({ credential: admin.credential.applicationDefault() });
        }
    }

    async downloadMultipleFiles(app: app.App, bucketName: string, folderPath: string, folderId: string) {
        let filesPath: string | undefined = undefined;
        try {
            const storage = app.storage();
            const bucket = storage.bucket(bucketName);

            const transferManager = new TransferManager(bucket as any);
            filesPath = path.resolve(tmpdir(), folderId);
            const destinationDirectory = path.join(filesPath, folderPath);
            if (!fs.existsSync(destinationDirectory)) {
                await fs.mkdirSync(destinationDirectory, { recursive: true });
            }

            const destination = `${tmpdir()}/${folderId}`;
            await transferManager.downloadManyFiles(folderPath, {
                passthroughOptions: { destination },
            });
            return filesPath;
        } catch (error: any) {
            throw error;
        }
    }

    async createZipArchive(filesPath: string, folderPath: string, folderId: string): Promise<string> {
        try {
            return await new Promise((resolve, reject) => {
                const zipFilePath = `${filesPath}/${folderId}.zip`;
                const output = fs.createWriteStream(zipFilePath);
                const archive = archiver("zip", { zlib: { level: 9 } });

                output.on("finish", () => {
                    resolve(zipFilePath);
                });

                // Handle archive errors
                archive.on("error", (err) => {
                    reject(err);
                });

                // Pipe archive data to the output file
                archive.pipe(output);
                archive.directory(`${filesPath}/${folderPath}`, false);
                archive.finalize();
            });
        } catch (error: any) {
            throw error;
        }
    }

    async removeLocalTempFiles(filesPath?: string) {
        try {
            if (filesPath) {
                fs.rmSync(filesPath, { recursive: true });
            }
        } catch (error: any) {
            throw error;
        }
    }

    async uploadFileToFirebaseStorage(
        app: app.App,
        bucketName: string,
        localFilePath: string,
        remoteFileName: string
    ): Promise<string> {
        const storage = app.storage();
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(remoteFileName);
        const fileReadStream = fs.createReadStream(localFilePath);
        const writeStream = file.createWriteStream();

        fileReadStream.pipe(writeStream);

        return new Promise((resolve, reject) => {
            writeStream.on("finish", () => {
                resolve(remoteFileName);
            });

            writeStream.on("error", (error: Error) => {
                reject(error);
            });
        });
    }

    async getDownloadUrl(app: any, bucketName: string, remoteFileName: string, signedUrlConfig?: any) {
        const storage = app.storage();
        // get storage default bucket name
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(remoteFileName);
        let config = signedUrlConfig || {
            action: "read",
            expires: Date.now() + 1000 * 60 * 60 * 24,
        };

        if (typeof config.expires === "string") config.expires = parseInt(config.expires);
        const [url] = await file.getSignedUrl(config);
        return url;
    }

    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];
        const { valid, errors } = validate(opts, config);
        const errorMessage: any = errors.map((e: any) => e.stack);
        if (!valid) throw new Error(`${this.name} node config is invalid: ${errorMessage.toString()}`);
    }
}
