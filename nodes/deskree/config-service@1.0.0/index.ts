import { BlueprintContext, BlueprintError, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { validate } from "jsonschema";
import { config } from "./config.json";
import Controller from "./controllers";
import { CollectionService } from '../rest-api@1.0.0/services/collectionService';

export default class RestApi extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        
        let data: any;
        const collectionService: CollectionService = new CollectionService();
        try {
            this.validate(ctx);
            const opts = (ctx.config as any)[this.name];
            const type: string = opts.inputs.controller;
            let request: any = ctx.request;
            collectionService.initFirebaseAdmin(ctx._PRIVATE_.get("firebase.config"));
            const controller: any = new Controller().init(type, collectionService, ctx._PRIVATE_);
            response.data = await controller.initRoutes(request);
        } catch (e: any) {
            const error = {
                code: 500,
                error: {
                    errors: [
                        {
                            code: 500,
                            title: "Internal Server Error",
                            details: e.message,
                        },
                    ],
                },
            };
            response.error = this.setError({ ...e, json: error });
            response.success = false;
        } finally {
            if(collectionService.firebase && !collectionService.firebase.isDeleted_)
                collectionService.firebase.delete()
        }

        if (data?.code && (data?.errors || data?.error)) {
            response.error = new BlueprintError("Internal Server Error");
            response.success = false;
            response.error?.setCode(data.code);
            response.error?.setJson(data.error || data.errors);
        }

        return response;
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
