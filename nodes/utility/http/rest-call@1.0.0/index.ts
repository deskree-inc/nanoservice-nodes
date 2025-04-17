import { BlueprintContext, BlueprintError, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import _ from "lodash";

export default class ApiCall extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        let data = ctx.response.data || ctx.request.body;

        try {
            this.validate(ctx);
            let opts = _.cloneDeep(ctx.config) as any;
            opts = opts[this.name];

            opts = this.blueprintMapper(opts, ctx, data);

            const method = opts.inputs.properties.method;
            let url = opts.inputs.properties.url;
            let headers = opts.inputs.properties.headers;
            let responseType = opts.inputs.properties.responseType;
            let body = opts.inputs.properties.body;
            let custom_var = opts.inputs.properties.var;
            let async = opts.inputs.properties.async;

            if (!body) body = data;
            if (async) {
                this.asyncRunApiCall(url, method, headers, body, responseType);
                response.data = body;
                return response;
            }

            const result = await this.runApiCall(url, method, headers, body, responseType);
            if (custom_var && result.errors === undefined && result.error === undefined) {
                if (ctx.vars === undefined) ctx.vars = {};
                ctx.vars[custom_var] = result;
            } else {
                response.data = result;
            }
        } catch (error: any) {
            if (error?.data) {
                response.error = new BlueprintError(error.data);
                if (typeof error.data === "object") {
                    response.error.setJson(error.data);
                }
                response.error.setCode(error.code);
            } else {
                response.error = new BlueprintError(error.message);
                response.success = false;
            }
        }
        return response;
    }

    runApiCall = async (url: string, method: string, headers: any, body: any, responseType: string) => {
        let options: any = {
            method,
            headers,
            redirect: "follow",
            responseType,
            body: typeof body === "string" ? body : JSON.stringify(body),
        };

        if (Buffer.isBuffer(body)) {
            options.body = body;
        }

        if (headers && headers["Content-Type"] === "application/x-www-form-urlencoded") {
            options.body = new URLSearchParams(body);
        }

        if (method === "GET") delete options.body;
        let statusCode = 200;
        try {
            let response: Response = await fetch(url, options);
            statusCode = response.status;
            let parsedResponse;
            if (response.headers.get("content-type")?.includes("application/json")) {
                parsedResponse = await response.json();
            } else {
                parsedResponse = await response.text();
            }
            if (!response.ok) throw { data: parsedResponse, code: statusCode };
            return parsedResponse;
        } catch (e: any) {
            throw { data: e?.data || e, code: statusCode };
        }
    };

    asyncRunApiCall = (url: string, method: string, headers: any, body: any, responseType: string) => {
        let options: any = {
            method,
            headers,
            redirect: "follow",
            responseType,
            body: typeof body === "string" ? body : JSON.stringify(body),
        };

        if (headers && headers["Content-Type"] === "application/x-www-form-urlencoded") {
            options.body = new URLSearchParams(body);
        }

        if (method === "GET") delete options.body;
        fetch(url, options);
    };

    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];

        if (opts?.inputs?.properties?.url === undefined) throw new Error(`${this.name} requires a valid url`);
        if (opts?.inputs?.properties?.method === undefined) throw new Error(`${this.name} requires a valid method`);
    }
}
