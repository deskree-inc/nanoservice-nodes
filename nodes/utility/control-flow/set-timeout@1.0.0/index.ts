import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { validate } from "jsonschema";
import { config } from "./config.json";

export default class SetTimeout extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        let data = ctx.response.data;

        try {
            this.validate(ctx);
            let opts = ctx.config as any;
            opts = opts[this.name];

            if (opts === undefined) throw new Error("Sleep node requires a config");

            await new Promise((resolve) => setTimeout(resolve, opts.time));

            response.data = data;
        } catch (e: any) {
            response.error = this.setError(e);
            response.success = false;
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
