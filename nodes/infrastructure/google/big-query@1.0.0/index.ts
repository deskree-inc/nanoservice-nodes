import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { BigQuery as Bigquery } from "@google-cloud/bigquery";
import { config } from "./config.json";
import { validate } from "jsonschema";

type QueryOptions = {
    table: string;
    type?: "SELECT" | "COUNT";
    where?: Array<{
        attribute: string;
        operator: ">" | "<" | "=" | "<>" | ">=" | "<=" | "!=" | "STARTS_WITH" | "ENDS_WITH" | "CONTAINS_SUBSTR";
        value: string;
    }>;
    limit?: number;
    group?: Array<string>;
    interval?: "minute" | "hour" | "day" | "week" | "month" | "year";
    sorted?: {
        attribute: string;
        order: "ASC" | "DESC";
    };
};

export default class BigQuery extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };

        try {
            this.validate(ctx);
            let opts = ctx.config as any;
            opts = opts[this.name].inputs;

            let bigQueryConfig: any = opts?.bigQueryConfig || ctx._PRIVATE_.get("firebase.config");
            let queryOptions: QueryOptions = opts?.queryOptions;
            let query: string = opts?.query;

            const databaseQuery = query || this.buildQuery(queryOptions);
            const bigQuery = this.initBigQuery(bigQueryConfig);
            const [job] = await bigQuery.createQueryJob({ query: databaseQuery });
            const [rows] = await job.getQueryResults({ maxResults: queryOptions.limit || 1000 });
            response.data = rows;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }

    buildQuery(queryOptions: QueryOptions) {
        const source = queryOptions.table;
        const type = queryOptions.type;

        const standardOperators = [">", "<", "=", "<>", ">=", "<=", "!="];
        const complexOperators = ["STARTS_WITH", "ENDS_WITH", "CONTAINS_SUBSTR"];

        let query: string;

        if (type === "SELECT") {
            query = `SELECT * FROM ${source}`;
        } else {
            query = `SELECT COUNT(*) AS total`;
            if (queryOptions.group && Array.isArray(queryOptions.group)) {
                const group: string[] = queryOptions.group;
                for (const value of group) {
                    query += `, ${value}`;
                }
            }
            if (queryOptions.interval && typeof queryOptions.interval === "string") {
                query += `, DATETIME_TRUNC(timestamp, ${queryOptions.interval}) AS timestamp`;
            }
            query += ` FROM ${source}`;
        }

        if (queryOptions.where && Array.isArray(queryOptions.where)) {
            const where: Array<{ attribute: string; operator: string; value: string }> = queryOptions.where;
            for (const [index, value] of where.entries()) {
                let val: string | number | null = null;
                if (typeof value.value === "string") {
                    val = `"${value.value}"`;
                } else {
                    val = value.value;
                }
                if (index === 0) {
                    query += ` WHERE`;
                } else {
                    query += ` AND`;
                }
                if (standardOperators.includes(value.operator)) {
                    query += ` ${value.attribute} ${value.operator} ${val}`;
                } else if (complexOperators.includes(value.operator)) {
                    query += ` ${value.operator}(${value.attribute}, ${val}) `;
                }
            }
        }

        if (queryOptions.group && Array.isArray(queryOptions.group) && type === "COUNT") {
            const group: string[] = queryOptions.group;
            for (const [index, value] of group.entries()) {
                if (index === 0) {
                    query += ` GROUP BY ${value}`;
                } else {
                    query += `, ${value}`;
                }
            }
        }

        if (queryOptions.interval && typeof queryOptions.interval === "string" && type === "COUNT") {
            if (queryOptions.group && Array.isArray(queryOptions.group) && type === "COUNT") {
                query += `, timestamp`;
            } else {
                query += " GROUP BY timestamp";
            }
        }

        if (queryOptions.sorted && typeof queryOptions.sorted === "object") {
            const sorted = queryOptions.sorted;
            query += ` ORDER BY ${sorted.attribute} ${sorted.order.toUpperCase()}`;
        }

        return query;
    }

    initBigQuery(credentials?: any): Bigquery {
        return new Bigquery({ credentials });
    }

    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];
        if (opts?.inputs?.queryOptions) {
            opts.inputs.queryOptions = this.executeJS(opts.inputs.queryOptions, ctx);
        }
        const { valid, errors } = validate(opts, config);
        const errorMessage: any = errors.map((e: any) => e.stack);
        if (!valid) throw new Error(`${this.name} node config is invalid: ${errorMessage.toString()}`);
    }

    executeJS(item: any, ctx: BlueprintContext) {
        if (item && typeof item === "object") {
            if (Array.isArray(item)) {
                for (let i = 0; i < item.length; i++) {
                    item[i] = this.executeJS(item[i], ctx);
                }
            } else {
                for (let key in item) {
                    if (item.hasOwnProperty(key)) {
                        item[key] = this.executeJS(item[key], ctx);
                        if (typeof item[key] === "string" && item[key].startsWith("js/")) {
                            item[key] = this.runJs(item[key].replace("js/", ""), ctx);
                        }
                    }
                }
            }
        }
        return item;
    }
}
