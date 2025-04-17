import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import admin from "firebase-admin";

export default class FirebaseStorageDownloadUrl extends BlueprintNode {

    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        this.contentType = "application/json";
        let firebaseConfig: any;
        let remoteFileName = ctx.response.data || ctx.request.body;

        try {
            let opts = ctx.config as any;
            opts = opts[this.name];
            firebaseConfig = opts?.inputs?.firebaseConfig || ctx._PRIVATE_.get("firebase.config");
            this.initFirebaseAdmin(firebaseConfig);
            const app: any = admin.app(firebaseConfig?.client_email);

            let bucketName = opts?.inputs?.properties?.bucket;
            const projectId: string = app?.options?.credential?.projectId || process.env.PROJECT_ID;
            if (!bucketName) bucketName = `gs://${projectId}.appspot.com`;

            const result = await this.getDownloadBuffer(app, bucketName, remoteFileName);

            response.data = result;

        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }

    initFirebaseAdmin(firebaseConfig: any) {
        try {
            getApp(firebaseConfig?.client_email);
        } catch (e) {
            if (firebaseConfig)
                initializeApp({ credential: cert(firebaseConfig) }, firebaseConfig?.client_email);
            else
                initializeApp({ credential: admin.credential.applicationDefault() });

        }
    }

    async getDownloadBuffer(app: any, bucketName: string, remoteFileName: string): Promise<string | undefined> {
        const storage = app.storage();
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(remoteFileName);
        const exists = await file.exists();
        if (!exists[0]) return;

        const buffer = await file.download();

        return buffer.toString();
    }
}