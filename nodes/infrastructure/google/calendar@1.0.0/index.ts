import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
// @ts-ignore
import { google } from "googleapis";
// https://stackoverflow.com/questions/60760959/google-calendar-api-service-account-error/63715242#63715242
// https://support.google.com/a/answer/2905486 LIMITS
export default class GoogleCalendar extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        this.contentType = "application/json";

        try {
            this.validate(ctx);
            let opts = ctx.config as any;
            opts = opts[this.name];
            const key = opts.inputs.serviceAccountKey;
            const { type, action, from, configuration } = opts.inputs.properties;

            const jwtClient = new google.auth.JWT(
                key.client_email,
                undefined,
                key.private_key,
                ['https://www.googleapis.com/auth/calendar',
                 'https://www.googleapis.com/auth/calendar.events',
                 'https://www.googleapis.com/auth/admin.directory.resource.calendar'
                ],
                from
            );
            await jwtClient.authorize();
            const calendar: any = google.calendar({ version: 'v3', auth: jwtClient });
            const result: any = await calendar[type][action](configuration);

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

        if (opts?.inputs?.serviceAccountKey === undefined ||
            typeof opts.inputs.serviceAccountKey !== "object") throw new Error(`${this.name} requires a valid serviceAccountKey`);
        if (opts?.inputs?.properties === undefined) throw new Error(`${this.name} requires properties`);
        const { type, action } = opts.inputs.properties;
        if (type === undefined) throw new Error(`${this.name} requires a valid 'type' property`);
        if (action === undefined) throw new Error(`${this.name} requires a valid 'action' property`);
        const validTypes = ["acl", "calendarList", "calendars", "channels", "colors", "context", "events", "freebusy", "settings"];
        const validActions = ["delete", "get", "insert", "list", "patch", "update", "watch" ];
        if (!validTypes.includes(type)) throw new Error(`${this.name} ${action} is not a valid action, valids: ${validTypes.join(", ")}`);
        if (!validActions.includes(action)) throw new Error(`${this.name} ${action} is not a valid action, valids: ${validActions.join(", ")}`);
        if (action === "insert" && opts.inputs.properties.from === undefined) throw new Error(`${this.name} requires a valid 'from' email property`);
    }
}