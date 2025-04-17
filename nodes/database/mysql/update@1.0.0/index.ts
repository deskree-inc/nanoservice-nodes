import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import knex from "knex";
import { config } from "./config.json";
import { validate } from "jsonschema";

export default class MysqlUpdate extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext>{
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        let data = ctx.response.data || ctx.request.body;
        let bd: any;

        try {
            let opts = ctx.config as any;
            opts = opts[this.name];

            bd = knex({
                client: 'mysql2',
                connection: {
                    host : opts.connection.host,
                    user : opts.connection.user,
                    password : opts.connection.password,
                    database : opts.connection.database,
                    port: opts.connection.port
                }
            });

            if(opts.where && typeof opts.where === "object") bd = bd.where(opts.where);
            if(opts.where && typeof opts.where === "string") bd = bd.whereRaw(opts.where);

            await bd.update(data).from(opts.table);
            response.data = data; 
        }catch(e: any){
            response.error = this.setError(e);
            response.success = false;
        } finally {
            if(bd && bd.destroy) await bd?.destroy();
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
