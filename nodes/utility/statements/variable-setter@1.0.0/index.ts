import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";

export default class VariableSetter extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };

        try {
            let data = ctx.response.data || ctx.request.body;

            let opts = ctx.config as any;
            opts = opts[this.name];

            const variables: any = opts?.inputs?.properties?.variables || opts?.inputs?.variables;
            const node: any = opts?.inputs?.properties?.node || opts?.inputs?.node;
            if (variables && Array.isArray(variables)) {
                variables.forEach((variable: any) => {
                    if (
                        variable.name !== undefined ||
                        (variable.name !== null && variable.value !== undefined) ||
                        variable.value !== null
                    )
                        ctx.vars
                            ? (ctx.vars[variable.name] = variable.value)
                            : (ctx.vars = { [variable.name]: variable.value });
                });
            } else if (typeof variables === "object") {
                const keys = Object.keys(variables);
                keys.forEach((key: any) => {
                    if (!ctx.vars) ctx.vars = {};
                    ctx.vars[key] = variables[key];
                });
            }

            if (node && node?.name) ctx.vars ? (ctx.vars[node.name] = data) : (ctx.vars = { [node.name]: data });
            response.data = data;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }
}
