import { BlueprintContext, BlueprintError, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import _ from "lodash";
export default class For extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        let data = ctx.response.data || ctx.request.body;

        try {
            if (!Array.isArray(data)) {
                throw new Error("For node requires an array as input");
            }

            if (ctx.config === undefined) throw new Error("For node requires a config");

            let opts = ctx.config as any;
            opts = opts[this.name];

            if (opts === undefined) throw new Error("For node requires a config");

            if (!opts || !opts.steps || opts.steps.length === 0) throw new Error("For node requires a list of nodes");

            let responses = [];
            for (let i = 0; i < data.length; i++) {
                let context: BlueprintContext = { ...ctx, config: _.cloneDeep(ctx.config) };
                context.response.data = data[i];
                for (let j = 0; j < opts.steps.length; j++) {
                    let start = performance.now();
                    const node: BlueprintNode = opts.steps[j];
                    // @ts-ignore
                    // this.blueprintMapper(context.config[node.name], ctx);

                    if (!node.flow) {
                        const result: any = await this.runStep(context, node);
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
                    }
                    let end = performance.now();
                    ctx.logger.log(
                        `\t (${this.name}) ${i} - Step ${node.name} completed in ${(end - start).toFixed(2)}ms`
                    );
                }
                ctx.vars = _.merge(ctx.vars, context.vars);
                responses.push(this.proxyData(context.response));
            }
            response.data = responses;
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
        const response: any = await node.process(ctx);
        return response;
    }

    proxyData(response: ResponseContext) {
        if (response.error) {
            throw response.error;
        }

        return response.data;
    }
}
