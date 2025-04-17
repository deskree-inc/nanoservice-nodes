import { BlueprintContext, BlueprintError, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";

import { processFormData } from "./helpers";
import { RestController } from "./controllers";
import { RestApiType } from "./interfaces";
import { CollectionService } from "./services/collectionService";

export default class RestApi extends BlueprintNode {
    collectionService: CollectionService = new CollectionService();
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };

        try {
            this.validate(ctx);

            const method: string = ctx.request.method;
            const opts = (ctx.config as any)[this.name];
            const type: RestApiType = opts.inputs.type;
            let request: any = ctx.request;

            if (
                request &&
                request.headers &&
                request.headers["content-type"] &&
                request.headers["content-type"].includes("multipart/form-data")
            ) {
                const { files, body } = await processFormData(request);
                request = { ...request, files, body, headers: request.headers };
            }
            this.collectionService.initFirebaseAdmin(ctx._PRIVATE_.get("firebase.config"));
            ctx._PRIVATE_.set("collectionService", this.collectionService);
            response.data = await new RestController().init({
                method,
                request,
                type,
            }, ctx._PRIVATE_);
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
            await this.closeFirebaseAdmin();
        }

        if (response.data.code && (response.data.errors || response.data.error)) {
            response.error = new BlueprintError("Internal Server Error");
            const error = {
                code: response.data.code,
                error: { errors: response.data.errors || response.data.error },
            };
            response.error?.setCode(error.code);
            response.error?.setJson(error.error);
            response.success = false;
        }

        return response;
    }

    async closeFirebaseAdmin() {
        try {
            if (this.collectionService.firebase && !this.collectionService.firebase.isDeleted_) 
                await this.collectionService.firebase.delete()
        } catch (error) {}
    }


    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];
        if (opts?.inputs?.type === undefined || !["collection", "postman", "storage"].includes(opts.inputs.type))
            throw new Error(`${this.name} requires a valid type collection, postman or storage`);
    }
}
