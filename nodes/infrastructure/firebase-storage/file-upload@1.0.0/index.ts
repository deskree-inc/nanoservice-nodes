import { BlueprintContext, BlueprintNode,  ResponseContext } from "@deskree/blueprint-shared";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import admin from "firebase-admin";
import fs from 'fs';

export default class FirebaseStorageFileUpload extends BlueprintNode {

    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        this.contentType = "application/json";
        let data = ctx.response.data;
        let firebaseConfig: any;
        let uploadType: 'filepath' | 'arraybuffer' 
        try {
            let opts = ctx.config as any;
            opts = opts[this.name];
            firebaseConfig = opts?.inputs?.firebaseConfig || ctx._PRIVATE_.get("firebase.config");
            uploadType = opts?.inputs?.properties.type || 'filepath';
            this.initFirebaseAdmin(firebaseConfig);
            const app: any = admin.app(firebaseConfig?.client_email);
            
            let bucketName = opts?.inputs?.properties?.bucket;
            const projectId: string = app?.options?.credential?.projectId || process.env.PROJECT_ID;
            if (!bucketName) bucketName = `gs://${projectId}.appspot.com`;

            let fileDir = opts?.inputs?.properties?.fileDir;
            
            switch (uploadType) {
                case 'arraybuffer':
                    response.data = await this.uploadFileToFirebaseStorageArrayBuffer(app, bucketName, data, fileDir);
                    break;
            
                default:
                    let remoteFileName = data.split("\\").pop().split("/").pop();
                    if (fileDir) {
                        if (!fileDir.endsWith('/')) fileDir += '/';
                        remoteFileName = `${fileDir}${remoteFileName}`;
                    }

                    await this.uploadFileToFirebaseStorage(app, bucketName, data, remoteFileName);
                    response.data = remoteFileName;  
            }
            
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }

    initFirebaseAdmin(firebaseConfig: any) { // Initialize Firebase if not already initialized
        try {
            getApp(firebaseConfig?.client_email);
        } catch (e) {
            if (firebaseConfig)
                initializeApp({ credential: cert(firebaseConfig) }, firebaseConfig?.client_email);
            else
                initializeApp({ credential: admin.credential.applicationDefault() });

        }
    }

    async uploadFileToFirebaseStorage(app: any, bucketName: string, localFilePath: string, remoteFileName: string) {
        const storage = app.storage();
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(remoteFileName);
        const fileReadStream = fs.createReadStream(localFilePath);
        const writeStream = file.createWriteStream();

        fileReadStream.pipe(writeStream);

        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => {
                resolve(true);
            });

            writeStream.on('error', (error: Error) => {
                reject(error);
            });
        });
    }

    async uploadFileToFirebaseStorageArrayBuffer(app: any, bucketName: string, bufferData: ArrayBuffer, remoteFileName: string) {
        if(!Buffer.isBuffer(bufferData)) {
            return { error: true, message: 'Data is not a buffer' }
        }
        const storage = app.storage();
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(remoteFileName);
        await file.save(bufferData);
        return { size: Buffer.byteLength(bufferData), name: remoteFileName }
    }
}