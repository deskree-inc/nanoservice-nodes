import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
// @ts-ignore
import { google } from "googleapis";
import { validate } from "jsonschema";
import { config } from "./config.json";

export default class GoogleSheets extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        this.contentType = "application/json";
        const data = ctx.response.data || ctx.request.body;

        try {
            this.validate(ctx);
            let opts = ctx.config as any;
            opts = opts[this.name];
            const key = opts.inputs.serviceAccountKey;
            let { type, action, configuration } = opts.inputs;

            let result: any = { data: "" };
            const jwtClient = new google.auth.JWT(
                key.client_email,
                undefined,
                key.private_key,
                [
                    'https://www.googleapis.com/auth/spreadsheets',
                    "https://www.googleapis.com/auth/drive",
                    "https://www.googleapis.com/auth/drive.file"
                ]
            );
            await jwtClient.authorize();

            const sheets: any = google.sheets({ version: 'v4', auth: jwtClient });
            if (action) {
                if (!configuration?.resource?.values && action === 'append')
                    configuration = { ...configuration, resource: { values: data } }

                result = await sheets.spreadsheets[type][action](configuration);
            } else
                result = await sheets.spreadsheets[type](configuration);

            response.data = result.data;
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
        const { valid, errors } = validate(opts, config);
        const errorMessage: any = errors.map((e: any) => e.stack);
        if (!valid) throw new Error(`${this.name} node config is invalid: ${errorMessage.toString()}`);
    }
}