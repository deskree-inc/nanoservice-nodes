import { BlueprintContext, BlueprintNode, NodeConfigContext, ResponseContext, BlueprintError } from "@deskree/blueprint-shared";
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

export default class AddProperties extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        dayjs.extend(utc);
        dayjs.extend(timezone);
        
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        let result = ctx.response.data || ctx.request.body;
        ctx.func = {
            uuid: uuidv4,
            dayjs: dayjs
        }

        try {
            if(Array.isArray(result)) throw new Error("AddProperties node can't be used with array");
            if (result) {
                let opts: NodeConfigContext = ctx.config;
                let inputs = opts[this.name].inputs;
                let keys = Object.keys(inputs.properties);

                if(keys.length === 0) {
                    throw new Error("AddProperties node requires a list of properties");
                }

                for (let key of keys) {
                    let value = inputs.properties[key];

                    if(typeof value === "string" && value.startsWith("js/")) {
                        let fn = value.replace("js/", "");
                        let fnResult = this.runJs(fn, ctx, result, ctx.func, ctx.vars);
                        result[key] = fnResult;
                    }
                    else {
                        result[key] = this.runJs("`" + value + "`", ctx, result, ctx.func, ctx.vars);
                    }
                }
            }

            response.data = result;
        }
        catch (err: any) {
            if(err instanceof BlueprintError) {
                response.error = err;
            }
            else {
                response.error = new BlueprintError(err.message);
                response.error.setStack(err.stack);
                response.error.setCode(500);
                response.error.setName(this.name);
                response.success = false;
            }
        }

        return response;
    }
}