import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import sgMail from "@sendgrid/mail";
import { MailDataRequired } from "@sendgrid/mail";

export default class Sendgrid extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };

        let data = ctx.response.data || ctx.request.body;

        try {
            this.validate(ctx);

            let opts = ctx.config as any;
            opts = opts[this.name];

            const SEND_GRID_API_KEY = opts.inputs.properties.sendGridApiKey;
            const to = opts.inputs.properties.to;
            const subject = opts.inputs.properties.subject;
            const html = opts.inputs.properties.html;
            let options: any = opts.inputs.properties.options || {};

            sgMail.setApiKey(process.env.SENDGRID_API_KEY || SEND_GRID_API_KEY);

            await this.sendDynamicEmail(to, subject, html, options);

            response = data;
        } catch (error: any) {
            let errorMessages = error?.response?.body?.errors?.map((error: any) => error?.message) || "";
            if (errorMessages !== "") errorMessages = " - " + errorMessages.join();
            response.error = this.setError(errorMessages);
            response.success = false;
        }

        return response;
    }

    async sendDynamicEmail(
        to: string | string[],
        subject: string,
        htmlContent: string,
        options?: MailDataRequired
    ): Promise<unknown> {
        try {
            const personalization: any = {
                to: Array.isArray(to) ? to.map((email) => ({ email })) : [{ email: to }],
                subject,
                substitutions: options?.substitutions || {},
            };

            const msg: MailDataRequired = {
                to,
                from: options?.from || "noreply@deskree.com",
                subject,
                html: htmlContent,
                cc: options?.cc || undefined,
                bcc: options?.bcc || undefined,
                replyTo: options?.replyTo || undefined,
                attachments: options?.attachments || undefined,
                templateId: options?.templateId || undefined,
                substitutionWrappers: options?.substitutionWrappers || ["{{", "}}"],
                substitutions: options?.substitutions || {},
                categories: options?.categories || [],
                customArgs: options?.customArgs || {},
                sendAt: options?.sendAt || undefined,
                asm: options?.asm || undefined,
                batchId: options?.batchId || undefined,
                content: options?.content || [],
                headers: options?.headers || {},
                ipPoolName: options?.ipPoolName || undefined,
                mailSettings: options?.mailSettings || {},
                trackingSettings: options?.trackingSettings || {},
                personalizations: options?.personalizations || [personalization],
            };

            const response = await sgMail.send(msg);
            return response;
        } catch (error: any) {
            throw error;
        }
    }

    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];

        if (opts?.inputs?.properties?.to === undefined) throw new Error(`${this.name} requires a valid 'to' key`);
        if (opts.inputs.properties.subject === undefined)
            throw new Error(`${this.name} requires a valid 'subject' key`);
        if (opts.inputs.properties.html === undefined) throw new Error(`${this.name} requires a valid 'html' key`);
    }
}
