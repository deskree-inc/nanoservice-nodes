import { BlueprintContext, BlueprintNode, NodeConfigContext, ResponseContext } from "@deskree/blueprint-shared";

export default class GetArray extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        let result = {};
        let opts: NodeConfigContext = ctx.config;
        let inputs = opts[this.name].inputs;

        try {
            result = ctx.response.data[inputs.properties.property];
            response.data = result;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }
}