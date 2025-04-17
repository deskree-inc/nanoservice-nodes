import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import admin from "firebase-admin";

export default class FirebaseStorageDownloadUrl extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        this.contentType = "application/json";
        let firebaseConfig: any;
        let signedUrlConfig: any;
        let remoteFileName = ctx.response.data || ctx.request.body;

        try {
            let opts = ctx.config as any;
            opts = opts[this.name];
            firebaseConfig = opts?.inputs?.firebaseConfig || ctx._PRIVATE_.get("firebase.config");
            signedUrlConfig = opts?.inputs?.signedUrlConfig;
            this.initFirebaseAdmin(firebaseConfig);
            const app: any = admin.app(firebaseConfig?.client_email);

            let bucketName = opts?.inputs?.properties?.bucket;
            const projectId: string = app?.options?.credential?.projectId || process.env.PROJECT_ID;
            if (!bucketName) bucketName = `gs://${projectId}.appspot.com`;

            const result = await this.getDownloadUrl(app, bucketName, remoteFileName, signedUrlConfig);

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
            if (firebaseConfig) initializeApp({ credential: cert(firebaseConfig) }, firebaseConfig?.client_email);
            else initializeApp({ credential: admin.credential.applicationDefault() });
        }
    }

    async getDownloadUrl(app: any, bucketName: string, remoteFileName: string, signedUrlConfig: any) {
        const storage = app.storage();
        // get storage default bucket name
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(remoteFileName);
        let config = signedUrlConfig || {
            action: "read",
            expires: Date.now() + 1000 * 60 * 60 * 24,
        };

        if (typeof config.expires === "string") config.expires = parseInt(config.expires)
        const [url] = await file.getSignedUrl(config);
        return url;
    }
}
