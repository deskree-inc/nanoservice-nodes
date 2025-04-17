import { BlueprintContext, ResponseContext, BlueprintNode } from "@deskree/blueprint-shared";

export default class IfError extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<any> {
        if (ctx.config === undefined) throw new Error("If-error node requires a config");
        let data = ctx.response.data || ctx.request.body;
        let response: ResponseContext = { success: false, data: data, error: null };
        let opts = ctx.config as any;
        opts = opts[this.name];
        this.setVar(ctx, { error: false });
        if (opts === undefined) throw new Error("If-error node requires a config");
        if (opts.condition === undefined || opts.condition === "") throw new Error("If-error node requires condition");
        if (opts.message === undefined || opts.message === "") throw new Error("If-error node requires a message");

        opts.json = this.blueprintMapper(opts.json, ctx);
        let result = this.runJs(opts.condition, ctx, ctx.response.data, {}, ctx.vars);

        if (result) {
            if (Array.isArray(opts.steps) && opts.steps.length > 0) {
                try {
                    await this.runSteps(opts.steps, ctx);
                } catch (error: any) {}
            }

            if (typeof opts.json === "string" && opts.json.startsWith("js/")) {
                let fn = opts.json.replace("js/", "");
                opts.json = this.runJs(fn, ctx, ctx.response.data, {}, ctx.vars);
            }

            if (typeof opts.code === "string" && opts.code.startsWith("js/")) {
                let fn = opts.code.replace("js/", "");
                opts.code = this.runJs(fn, ctx, ctx.response.data, {}, ctx.vars);
            }
            response.error = this.setError(opts.message);

            if (typeof opts.json === "object") {
                response.error.setJson(opts.json);
            }

            if (opts.code !== undefined) {
                response.error.setCode(opts.code);
            }
        }
        return response;
    }
}
