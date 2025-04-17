import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import MainController from "./controllers/mainController";
import { Controller } from "./interfaces";
import { CollectionService } from "./services/collectionService";

export default class GraphqlFirestore extends BlueprintNode {
    collectionService: CollectionService = new CollectionService();
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };

        const data = ctx.response.data || ctx.request.body;
        const { query, variables } = data;
        try {
            this.validate(ctx);
            this.collectionService.initFirebaseAdmin(ctx._PRIVATE_.get("firebase.config"));

            const opts = (ctx.config as any)[this.name];
            const type: Controller["type"] = opts.inputs.type;
            ctx._PRIVATE_.set("collectionService", this.collectionService);
            response.data = await new MainController().init({ query, variables, type, request: ctx.request }, ctx._PRIVATE_);
        } catch (err: any) {
            response.error = this.setError(err);
            response.success = false;
        } finally {
            await this.closeFirebaseAdmin();
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
        if (opts?.inputs?.type === undefined || !["collection", "schema"].includes(opts.inputs.type))
            throw new Error(`${this.name} requires a valid type collection or schema`);
    }
}
