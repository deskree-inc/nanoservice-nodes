import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import admin from "firebase-admin";

export default class FirebaseStorageFileDelete extends BlueprintNode {

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
            if (!remoteFileName || opts?.inputs?.properties?.prefix) remoteFileName = opts.inputs.properties.prefix;

            const result = await this.deleteFile(app, bucketName, remoteFileName);

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

    async deleteFile(app: any, bucketName: string, remoteFileName: string) {
        const storage = app.storage();
        const bucket = storage.bucket(bucketName);
        await bucket.deleteFiles({ prefix: remoteFileName });
        return remoteFileName;
    }
}