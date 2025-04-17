import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import twilio from "twilio";

export default class TwilioSMS extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };

        try {
            this.validate(ctx);

            let opts = ctx.config as any;
            opts = opts[this.name];
            const { accountSid, authToken, body, to, from, options } = opts.inputs.properties;

            const client = twilio(accountSid, authToken, options);

            response.data = await client.messages.create({ body, to, from });
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }

    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];

        if (opts?.inputs?.properties?.accountSid === undefined)
            throw new Error(`${this.name} requires a valid 'accountSid' key`);
        if (opts.inputs.properties.authToken === undefined)
            throw new Error(`${this.name} requires a valid 'authToken' key`);
        if (opts.inputs.properties.to === undefined) throw new Error(`${this.name} requires a valid 'to' key`);
        if (opts.inputs.properties.from === undefined) throw new Error(`${this.name} requires a valid 'from' key`);
        if (opts.inputs.properties.body === undefined) throw new Error(`${this.name} requires a valid 'body' key`);
    }
}
