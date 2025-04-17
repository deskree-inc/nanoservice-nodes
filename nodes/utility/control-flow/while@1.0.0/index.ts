import { BlueprintContext, BlueprintError, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import _ from "lodash";
export default class While extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        let data = ctx.response.data || ctx.request.body;

        try {
            if (ctx.config === undefined) throw new Error("While node requires a config");

            let opts = ctx.config as any;
            opts = opts[this.name];

            if (opts === undefined) throw new Error("While node requires a config");

            if (opts.condition === undefined) throw new Error("While node requires a condition");
            if (!opts || !opts.steps || opts.steps.length === 0) throw new Error("While node requires a list of nodes");

            var condition = this.blueprintMapper(_.cloneDeep(this.originalConfig.condition), ctx);
            while (condition) {
                let context: BlueprintContext = { ...ctx, config: _.cloneDeep(ctx.config) };
                for (let j = 0; j < opts.steps.length; j++) {
                    let start = performance.now();
                    const node: BlueprintNode = opts.steps[j];
                    if (!node.flow) {
                        const result = await this.runStep(context, node);
                        if (result.error) throw result.error.context;
                        context.response = result;
                    } else {
                        let if_steps: any = await node.processFlow(context);
                        let if_context: BlueprintContext = { ...ctx, config: _.cloneDeep(ctx.config) };
                        for (let k = 0; k < if_steps.length; k++) {
                            let if_node = if_steps[k];

                            // @ts-ignore
                            this.blueprintMapper(if_context.config[if_node.name], if_context);
                            if_context.response = await this.runStep(if_context, if_node);

                            if (if_context.response.error) throw if_context.response.error.context;
                        }
                        context.response = if_context.response;
                        context.vars = _.merge(context.vars, if_context.vars);
                        let end = performance.now();
                        ctx.logger.log(
                            `\t (${this.name}) ${j} - Step ${node.name} completed in ${(end - start).toFixed(2)}ms`
                        );
                    }
                }
                ctx.vars = _.merge(ctx.vars, context.vars);
                condition = this.blueprintMapper(_.cloneDeep(this.originalConfig), ctx).condition;
                condition = typeof condition === "string" ? (condition === "false" ? false : condition) : condition;
            }
            response.data = data;
        } catch (err: any) {
            console.log(err);
            if (err instanceof BlueprintError) {
                response.error = err;
            } else {
                response.error = new BlueprintError(err.message);
                response.error.setStack(err.stack);
                response.error.setJson(err?.json);
                response.error.setCode(500);
                response.error.setName(this.name);
                response.success = false;
            }
        }

        return response;
    }

    async runStep(ctx: BlueprintContext, node: BlueprintNode): Promise<any> {
        const response = await node.process(ctx);
        return response;
    }

    proxyData(response: ResponseContext) {
        if (response.error) {
            throw response.error;
        }

        return response.data;
    }
}
