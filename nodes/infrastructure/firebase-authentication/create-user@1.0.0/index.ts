import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import admin from "firebase-admin";
import { Auth } from "firebase-admin/lib/auth/auth";

export default class FirebaseAuthCreateUser extends BlueprintNode {
    auth!: Auth;

    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        let data: any;
        let app: admin.app.App;
        let firebaseConfig: any;
        try {
            let opts = ctx.config as any;
            opts = opts[this.name];
            firebaseConfig = opts?.inputs?.firebaseConfig || ctx._PRIVATE_.get("firebase.config");
            data = opts?.inputs?.userData || ctx.response.data;

            this.initFirebaseAdmin(firebaseConfig);
            app = admin.app(firebaseConfig?.client_email);
            this.auth = app.auth();
            response.data = await this.auth.createUser(data);
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        } finally {
            await this.closeFirebaseAdmin(app!);
        }

        return response;
    }

    initFirebaseAdmin(firebaseConfig: any) {
        // Initialize Firebase if not already initialized
        try {
            getApp(firebaseConfig?.client_email);
        } catch (e) {
            if (firebaseConfig) initializeApp({ credential: cert(firebaseConfig) }, firebaseConfig?.client_email);
            else initializeApp({ credential: admin.credential.applicationDefault() });
        }
    }

    async closeFirebaseAdmin(app: any) {
        // Close Firebase if initialized
        try {
            if (!app.isDeleted_) await app.delete();
        } catch (e) {}
    }
}
