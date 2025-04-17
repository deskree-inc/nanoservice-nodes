import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";

export default class FixJsonKey extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        let data = ctx.response.data;
        let keys = Object.keys(data);
        let model: any = {};
        try {            
            for(let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let newKey = key.replace(/\./g, '_').replace(/\s/g, "_").toLowerCase();
                model[newKey] = data[key];
            }
            response.data = model;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }
        
        return response;
    }
}