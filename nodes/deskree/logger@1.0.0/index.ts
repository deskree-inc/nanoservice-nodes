import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { validate } from "jsonschema";
import { config } from "./config.json";
import { Logger } from "./logger";

export default class DeskreeLogger extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let data = ctx.response.data || ctx.request.body;
        let response: ResponseContext = { success: true, data, error: null };

        try {
            this.validate(ctx);
            let opts = ctx.config as any;
            opts = opts[this.name];
            const { service, projectId, severity, status, message, sourceLocation, labels } = opts.inputs;

            const logger: Logger = new Logger(service, projectId);

            const logMessage = status ? logger.getStatusMessage(status) : message || data;
            logger.log(severity, logMessage, sourceLocation, ctx.request, ctx.response, labels);
        } catch (e: any) {
            response.error = this.setError(e);
            response.success = false;
        }

        return response;
    }

    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];
        const { valid, errors } = validate(opts, config);
        const errorMessage: any = errors.map((e: any) => e.stack);
        if (!valid) throw new Error(`${this.name} node config is invalid: ${errorMessage.toString()}`);
    }
}
