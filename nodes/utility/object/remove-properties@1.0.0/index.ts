import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
export default class RemoveProperties extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let data = ctx.response.data || ctx.request.body;
        let response: ResponseContext = { success: true, data: {}, error: null };

        try {
            if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
            let opts = ctx.config as any;
            opts = opts[this.name];

            if (opts?.inputs?.properties === undefined)
                throw new Error(`${this.name} requires an array of properties to delete`);

            for (const prop of opts.inputs.properties) {
                delete data[prop];
            }
            response.data = data;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }
        return response;
    }
}
