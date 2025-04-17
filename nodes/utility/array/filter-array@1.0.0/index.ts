import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";

export default class ValidateJsonKey extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        let array = ctx.response.data || ctx.request.body;
        try {
            if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
            let opts = ctx.config as any;
            opts = opts[this.name];

            if (opts?.inputs?.condition === undefined) throw new Error(`${this.name} requires a conditions`);

            if (Array.isArray(array)) {
                array = array.filter((data: any) => {
                    return this.runJs(opts.inputs.condition, ctx, data, ctx.func, ctx.vars);
                });
            }

            response.data = array;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }

}

