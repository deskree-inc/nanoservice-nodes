import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import ZodValidator from "./ZodValidator";

export default class DeskreeSchemaValidator extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let data = ctx.response.data || ctx.request.body;
        let response: ResponseContext = { success: true, data: data, error: null };
        try {
            const method = ctx.request.method;
            let opts = ctx.config as any;
            opts = opts[this.name];

            const collectionConfig = opts.inputs.properties.variables.zodSchema;
            let config = this.getVar(ctx, collectionConfig);

            if (Array.isArray(config)) config = config[0];
            this.checkModel(config.model, data, config.name, method);
        } catch (error: any) {
            response.success = false;
            response.error = this.setError(error);
            response.error.setJson(JSON.parse(error.message));
        }
        return response;
    }

    checkModel(model: any, body: any, collectionName: string, method: string) {
        const propertyErrors: string[] = [];
        const propertyMissingErrors: string[] = [];
        const typeErrors: string[] = [];
        Object.keys(body).forEach((key) => {
            if (!model[key]) propertyErrors.push(`Invalid property "${key}" in ${collectionName} collection`);
        });

        // remove uid from model to properly check types
        if (model["uid"]) {
            delete model["uid"];
        }

        if (method.toLowerCase() !== "patch") {
            // Check whether the body has all required properties as per model
            Object.keys(model).forEach((key) => {
                if (Object.prototype.hasOwnProperty.call(body, key) || model[key].endsWith("?")) {
                    return true;
                } else {
                    if (key === "body" && method.toLowerCase() === "post") {
                        propertyMissingErrors.push(`POST request body cannot be empty in ${collectionName} collection`);
                    } else {
                        propertyMissingErrors.push(
                            `Required property [${key}] from the '${collectionName}' database table is missing`
                        );
                    }
                }
                return;
            });
        }

        if (method.toLowerCase() === "patch") {
            // Check for empty properties in the body
            if (
                (body && Object.keys(body).length === 0) ||
                (Object.keys(body).length === 1 && Object.prototype.hasOwnProperty.call(body, "author"))
            ) {
                propertyErrors.push(`Invalid body in ${collectionName} collection`);
            }
            // Check whether the endpoint is to update user data
            if (collectionName.toLowerCase() === "users") {
                // Check whether a user is trying to update an email
                if (body.email) propertyErrors.push(`Email property can't be updated in ${collectionName} collection`);
            }
        }

        // ZOD

        let zodValidator = new ZodValidator(model, body);
        let validator = zodValidator.getModel(method);
        try {
            validator.parse(body);
        } catch (err: any) {
            err.errors.forEach((error: any) => {
                typeErrors.push(error.message + ` for property ${error.path[0]}`);
            });
        }

        // END

        if (propertyErrors.length > 0 || propertyMissingErrors.length > 0 || typeErrors.length > 0) {
            throw new Error(
                JSON.stringify({
                    propertyErrors,
                    typeErrors,
                    propertyMissingErrors,
                })
            );
        }

        // if all tests have passed, return true
        return true;
    }
}
