import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import _ from "lodash";
export default class TryCatch extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };

        let opts = ctx.config as any;
        opts = opts[this.name];

        try {
            if (ctx.config === undefined) throw new Error("TryCatch node requires a config");

            if (opts === undefined) throw new Error("TryCatch node requires a config");

            if (!opts || !opts.try || !opts.try.steps || opts.try.steps.length === 0)
                throw new Error("try steps node requires a list of nodes");

            if (!opts || !opts.catch || !opts.catch.steps || opts.catch.steps.length === 0)
                throw new Error("catch steps node requires a list of nodes");
            for (let i = 0; i < opts.try.steps.length; i++) {
                const node: BlueprintNode = opts.try.steps[i];
                if (!node.active) continue;
                if (node.stop) break;
                let start = performance.now();

                if (!node.flow) {
                    ctx.response = await this.runStep(ctx, node);
                    if (ctx.response.error) {
                        return await this.catchFlow(ctx, opts.catch.steps);
                    }
                } else {
                    let if_steps: any = await node.processFlow(ctx);
                    let if_context: BlueprintContext = { ...ctx, config: _.cloneDeep(ctx.config) };
                    for (let k = 0; k < if_steps.length; k++) {
                        let if_node = if_steps[k];

                        // @ts-ignore
                        this.blueprintMapper(if_context.config[if_node.name], if_context);
                        if_context.response = await this.runStep(if_context, if_node);
                        if (if_context.response.error) {
                            return await this.catchFlow(if_context, opts.catch.steps);
                        }
                    }
                    ctx.response = if_context.response;
                    ctx.vars = _.merge(ctx.vars, if_context.vars);
                }

                let end = performance.now();
                ctx.logger.log(`\t (${this.name}) ${i} - Step ${node.name} completed in ${(end - start).toFixed(2)}ms`);
            }
            response.data = ctx.response.data;
        } catch (err: any) {
            response.error = this.setError(err);
            response.success = false;

            return await this.catchFlow(ctx, opts.catch.steps);
        }
        return response;
    }

    async runStep(ctx: BlueprintContext, node: BlueprintNode) {
        let config = _.cloneDeep(ctx.config);
        ctx.config = config;
        // @ts-ignore
        this.blueprintMapper(ctx.config[node.name], ctx);
        return node.process(ctx);
    }

    async catchFlow(ctx: BlueprintContext, steps: BlueprintNode[]) {
        const catchError = ctx.response.error;
        for (let i = 0; i < steps.length; i++) {
            const node: BlueprintNode = steps[i];
            if (!node.active) continue;
            if (node.stop) break;
            let start = performance.now();

            ctx.response.error = catchError;
            if (!node.flow) {
                ctx.response = await this.runStep(ctx, node);
                if (ctx.response.error) {
                    return ctx.response;
                }
            } else {
                let if_steps: any = await node.processFlow(ctx);
                let if_context: BlueprintContext = { ...ctx, config: _.cloneDeep(ctx.config) };
                for (let k = 0; k < if_steps.length; k++) {
                    let if_node = if_steps[k];

                    // @ts-ignore
                    this.blueprintMapper(if_context.config[if_node.name], if_context);
                    if_context.response = await this.runStep(if_context, if_node);
                    if (if_context.response.error) {
                        return if_context.response;
                    }
                }
                ctx.response = if_context.response;
                ctx.vars = _.merge(ctx.vars, if_context.vars);
            }

            let end = performance.now();
            ctx.logger.log(`\t (${this.name}) ${i} - Step ${node.name} completed in ${(end - start).toFixed(2)}ms`);
        }
        return ctx.response;
    }
}
