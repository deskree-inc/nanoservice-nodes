import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { validate } from "jsonschema";

export default class Jsonschema extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let data = ctx.response.data || ctx.request.body;
        let response: ResponseContext = { success: true, data: data, error: null };

        try {
            if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
            let opts = ctx.config as any;
            opts = opts[this.name];

            if (opts?.inputs?.properties?.schema === undefined)
                throw new Error(`${this.name} requires a valid json-schema template`);
            let schema = opts.inputs.properties.schema;

            const validationResult = validate(data, schema);
            if (validationResult.valid === false) {
                response.success = false;
                response.error = this.setError({
                    message: JSON.stringify(validationResult.errors),
                    code: 500,
                    json: validationResult.errors,
                });
            }
        } catch (err: any) {
            response.error = this.setError(err);
            response.success = false;
        }

        return response;
    }
}
