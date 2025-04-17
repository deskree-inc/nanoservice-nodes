import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import yaml from 'js-yaml';


export default class JsonToYaml extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        this.contentType = "application/json";
        let data = ctx.response.data || ctx.request.body;

        try {
            const yamlData = yaml.dump(data);
            ctx.response.contentType = "application/yaml";
            response.data = yamlData;
        } catch (err: any) {
             response.error = this.setError({...err, code: 500});
            response.success = false;
        }

        return response;
    }
}