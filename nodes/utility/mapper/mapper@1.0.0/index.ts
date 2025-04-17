import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isBetween from "dayjs/plugin/isBetween";
import _ from "lodash";
import crypto from "crypto";

export default class Mapper extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        this.contentType = "application/json";
        dayjs.extend(utc);
        dayjs.extend(timezone);
        dayjs.extend(isBetween);

        let data = ctx.response.data || ctx.request.body;

        ctx.func = {
            uuid: uuidv4,
            dayjs: dayjs,
            _: _,
            crypto: crypto
        };
        try {
            this.validate(ctx);
            let opts = ctx.config as any;
            opts = opts[this.name];
            response.data = this.map(opts.inputs.properties.mapper, ctx, data);
        } catch (err: any) {
            response.error = this.setError(err);
            response.success = false;
        }

        return response;
    }

    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];

        if (opts?.inputs?.properties?.mapper === undefined) {
            throw new Error(`${this.name} requires a valid property mapper`);
        }

        if (typeof opts.inputs.properties.mapper !== "string" && typeof opts.inputs.properties.mapper !== "object") {
            throw new Error(`${this.name} requires a valid mapper type string or object`);
        }

        if (typeof opts.inputs.properties.mapper !== "string" && opts.inputs.properties.mapper === "") {
            throw new Error(`${this.name} requires a valid string mapper`);
        }
    }

    // make the map function support nested properties

    map(mapper: any, ctx: BlueprintContext, data: any): any {
        if (typeof mapper === "object") {
            let keys = Object.keys(mapper);
            for (let key of keys) {
                let value = mapper[key];

                if (typeof value === "string" && value.startsWith("js/")) {
                    let fn = value.replace("js/", "");
                    let fnResult = this.runJs(fn, ctx, data, ctx.func, ctx.vars);
                    mapper[key] = fnResult;
                } else if (typeof value === "string") {
                    value = value.replace(/`/g, "'");
                    mapper[key] = this.runJs("`" + value + "`", ctx, data, ctx.func, ctx.vars);
                } else if (typeof value === "object") {
                    mapper[key] = this.map(value, ctx, data);
                }
            }

            return mapper;
        } else {
            if (typeof mapper === "string" && mapper.startsWith("js/")) mapper = mapper.replace("js/", "");
            return this.runJs(mapper, ctx, data, ctx.func);
        }
    }
}
