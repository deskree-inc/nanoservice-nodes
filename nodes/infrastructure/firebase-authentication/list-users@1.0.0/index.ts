import { BlueprintContext, ResponseContext, BlueprintNode } from "@deskree/blueprint-shared";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import admin from "firebase-admin";
import { Auth } from "firebase-admin/lib/auth/auth";
import { validate } from "jsonschema";
import { config } from "./config.json";

export default class ListUsers extends BlueprintNode {
    auth!: Auth;

    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        let app: admin.app.App;
        let limit: number;
        let firebaseConfig: any;
        
        try {
            this.validate(ctx);
            let opts = ctx.config as any;
            opts = opts[this.name];
            firebaseConfig = opts?.inputs?.firebaseConfig || ctx._PRIVATE_.get("firebase.config");
            limit = opts?.inputs?.limit;

            this.initFirebaseAdmin(firebaseConfig);
            app = admin.app(firebaseConfig?.client_email);
            this.auth = app.auth();
            await this.listAllUsers(ctx, undefined, limit);
            response.data = true;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        } finally {
            await this.closeFirebaseAdmin(app!);
        }
        return response;
    }

    async listAllUsers(ctx: BlueprintContext, nextPageToken?: string, limit?: number) {
        const { users, pageToken } = await this.auth.listUsers(limit, nextPageToken);
        ctx.response.data = users;
        let opts = ctx.config as any;
        opts = opts[this.name];
        await this.runSteps(opts.step, ctx);
        if (pageToken) {
            await this.listAllUsers(ctx, pageToken, limit);
        }
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
        try {
            if (!app.isDeleted_) await app.delete();
        } catch (e) {
            console.log(e);
        }
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
