import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { PubSub } from "@google-cloud/pubsub";
import { validate } from "jsonschema";
import { config } from "./config.json";

export default class Pubsub extends BlueprintNode {
    pubsub!: PubSub;
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        let data = ctx.response.data || ctx.request.body;
        try {
            this.validate(ctx);

            let opts = ctx.config as any;
            opts = opts[this.name];

            data = opts.data || data;
            const credentials = opts.pubSubCredentials?.credentials || ctx._PRIVATE_.get("firebase.config");
            const projectId = opts.pubSubCredentials?.projectId || ctx._PRIVATE_.get("gcp.project.id");
            this.pubsub = new PubSub({ projectId, credentials });
            const attributes: Record<string, any> | undefined = opts?.attributes;
            const topic = this.pubsub.topic(opts.topic);
            const stringifyData = typeof data === "object" ? JSON.stringify(data) : data;
            const dataBuffer = Buffer.from(stringifyData, "utf-8");

            await topic.publishMessage({ data: dataBuffer, attributes });
            response.data = data;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        } finally {
            this.pubsub.close();
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
