import { BlueprintContext, BlueprintNode, NodeConfigContext, ResponseContext } from "@deskree/blueprint-shared";

export default class GetContext extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        let result: any;
        let opts: NodeConfigContext = ctx.config;

        try {
            this.validate(ctx);
            opts = opts[this.name];

            const context = opts.inputs.properties.context;

            result = this.accessNestedProperty(ctx, context);

            response.data = result;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }

    accessNestedProperty(ctx: BlueprintContext, path: string) {
        if (path === 'response') throw new Error(`(${this.name}) response context only is not available, please use the response.data property`);
        if (path === 'request') throw new Error(`(${this.name}) request context only is not available, please use the request.body property`);

        const properties = path.split('.');
        let currentObj: any = ctx;
        for (const property of properties) {
            if (!currentObj || typeof currentObj !== 'object' || !currentObj.hasOwnProperty(property)) {
                return undefined;
            }
            currentObj = currentObj[property];
        }

        return currentObj;
    }


    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];
        if (opts?.inputs?.properties?.context === undefined) throw new Error(`${this.name} node requires a context`);
        // validate if opts.inputs.properties.context string starts with request, response, config or vars and may contain nested properties where the nested properties can be any string
        if (!opts.inputs.properties.context.match(/^(request|response|config|vars|env|error)(\.[a-zA-Z0-9_]+)*$/)) throw new Error(`${this.name} node requires a valid context`);
    }
}