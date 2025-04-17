import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { validate } from "jsonschema";
import { config } from "./config.json";
import { Logging } from "@google-cloud/logging";
import { initializeApp, cert, getApp } from "firebase-admin/app";
import admin from "firebase-admin";

export default class GetEntries extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let data = ctx.response.data || ctx.request.body;
        let response: ResponseContext = { success: true, data: data, error: null };

        try {
            // this.validate(ctx);
            let opts = ctx.config as any;
            opts = opts[this.name];
            const firebaseConfig = ctx._PRIVATE_.get("firebase.config");
            this.initFirebaseAdmin(firebaseConfig);

            const logging = new Logging({ projectId: admin.app().options.projectId });

            const [entries] = await logging.getEntries(opts.inputs);

            response.data = entries;
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

    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];
        const { valid, errors } = validate(opts, config);
        const errorMessage: any = errors.map((e: any) => e.stack);
        if (!valid) throw new Error(`${this.name} node config is invalid: ${errorMessage.toString()}`);
    }
}
