import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import knex from "knex";
import { config } from "./config.json";
import { validate } from "jsonschema";

export default class MysqlRest extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        const data = ctx.response.data || ctx.request.body;
        let bd: any;

        try {
            let opts = ctx.config as any;
            opts = opts[this.name];

            bd = knex({
                client: 'mysql2',
                connection: {
                    host: opts.connection.host,
                    user: opts.connection.user,
                    password: opts.connection.password,
                    database: opts.connection.database,
                    port: opts.connection.port
                }
            });

            const query = this.queryObjectGenerator(ctx, bd, opts, data);
            const rows = await query;

            response.data = {
                data: rows
            };
        } catch (e: any) {
            response.error = this.setError(e);
            response.success = false;
        } finally {
            if (bd && bd.destroy) await bd?.destroy();
        }

        return response;
    }

    queryObjectGenerator(ctx: BlueprintContext, bd: any, opts: any, data: any) {
        let query = bd.from(opts.table);
        const qs = ctx.request.query;

        switch (ctx.request.method) {
            case 'GET':
                query = this.query(query, opts, qs);
                break;
            case 'POST':
                query = this.insert(query, opts, data);
                break;
            case 'PUT':
                query = this.update(query, data, qs);
                break;
            case 'PATCH':
                query = this.update(query, data, qs);
                break;
            case 'DELETE':
                query = this.delete(query, qs);
                break;
            default:
                throw new Error("Invalid command type");
        }


        return query;
    }

    query(query: any, opts: any, qs: any) {
        if (qs.fields) query = query.select(qs.fields.split(",") || "*"); delete qs.fields;
        if (qs.limit) query = query.limit(qs.limit || 10); delete qs.limit;
        if (qs.offset) query = query.offset(qs.offset || 0); delete qs.offset;
        if (qs.orderBy) query = query.orderBy(qs.orderBy); delete qs.orderBy;
        if (qs.groupBy) query = query.groupBy(qs.groupBy); delete qs.groupBy;
        query = query.where(qs)
        return query;
    }

    insert(query: any, opts: any, data: any) {
        if (opts.table) query = query.insert(data).into(opts.table);
        return query;
    }

    update(query: any, data: any, qs: any) {
        if (data) query = query.update(data);
        query = query.where(qs);
        return query;
    }

    delete(query: any, qs: any) {
        query = query.where(qs);
        return query.del();
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
