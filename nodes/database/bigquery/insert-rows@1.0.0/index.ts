import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { BigQuery } from "@google-cloud/bigquery";
import { validate } from "jsonschema";
import { config } from "./config.json";
import { v4 } from "uuid";

export default class InsertRows extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };

        try {
            this.validate(ctx);
            let opts = ctx.config as any;
            opts = opts[this.name].inputs;
            const bgCredentials = opts?.properties.bigqueryConfig || ctx._PRIVATE_.get("firebase.config");

            const datasetId = opts.properties.datasetId;
            const datasetOptions = opts.properties.datasetOptions;
            const tableId = opts.properties.tableId;
            const tableOptions = opts.properties.tableOptions;
            const rows = opts.properties.rows;
            const rowsOptions = opts.properties.rowsOptions;
            const uniqueColumns = opts.properties.uniqueColumns;

            const bg = this.initBigQuery(bgCredentials);
            await this.createDataset(bg, datasetId, datasetOptions);
            await this.createTable(bg, datasetId, tableId, tableOptions);

            if (uniqueColumns && uniqueColumns.length > 0) {
                await this.checkAndInsertRows(bg, datasetId, tableId, tableOptions, rows, rowsOptions, uniqueColumns);
            } else {
                await this.insertRows(bg, datasetId, tableId, rows, rowsOptions, tableOptions);
            }

            response.data = rows;
        } catch (error: any) {
            console.error('Error in run method:', error);
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }

    async createDataset(bg: BigQuery, datasetId: string, datasetOptions: any) {
        try {
            await bg.createDataset(datasetId, datasetOptions);
        } catch (e: any) {
            if (e.code !== 409) {
                throw new Error(e);
            }
        }
    }

    async createTable(bg: BigQuery, datasetId: string, tableId: string, tableOptions: any) {
        try {
            const dataset = bg.dataset(datasetId);
            await dataset.createTable(tableId, tableOptions);
        } catch (e: any) {
            if (e.code !== 409) {
                throw new Error(e);
            }
        }
    }

    async insertRows(
        bg: BigQuery,
        datasetId: string,
        tableId: string,
        rows: any,
        rowsOptions: any,
        tableOptions: any
    ) {
        try {
            await bg.dataset(datasetId).table(tableId).insert(rows, rowsOptions);
        } catch (e: any) {
            if (e.code === 404) {
                console.warn(`Table ${tableId} not found. Creating table and retrying insert.`);
                try {
                    await this.createTable(bg, datasetId, tableId, tableOptions);
                    await bg.dataset(datasetId).table(tableId).insert(rows, rowsOptions);
                } catch (retryError: any) {
                    console.error('Error after creating table and retrying insert:', retryError);
                    throw retryError;
                }
            } else if (e.name === 'PartialFailureError') {
                console.error('Partial failure error: ', JSON.stringify(e.errors, null, 2));
                throw e;
            } else {
                console.error('Insert rows error: ', e);
                throw e;
            }
        }
    }

    async checkAndInsertRows(
        bg: BigQuery,
        datasetId: string,
        tableId: string,
        tableOptions: any,
        rows: any[],
        rowsOptions: any,
        uniqueColumns: string[]
    ) {
        const tempTableId = `temp_${tableId}_${v4()}`;
        const tempTable = bg.dataset(datasetId).table(tempTableId);

        try {
            await tempTable.create({ schema: tableOptions.schema });
            await tempTable.insert(rows, rowsOptions);

            const joinCondition = uniqueColumns.map((col: any) => `a.${col} = b.${col}`).join(" AND ");
            const whereCondition = uniqueColumns.map((col: any) => `b.${col} IS NULL`).join(" OR ");

            const query = `
                INSERT INTO \`${datasetId}.${tableId}\`
                SELECT a.* FROM \`${datasetId}.${tempTableId}\` a
                LEFT JOIN \`${datasetId}.${tableId}\` b
                ON ${joinCondition}
                WHERE ${whereCondition}
            `;

            await bg.createQueryJob({ query });
        } catch (e: any) {
            if (e.code !== 409) {
                throw new Error(e);
            }
        } finally {
            await tempTable.delete();
        }
    }

    initBigQuery(credentials?: any): BigQuery {
        return new BigQuery({ credentials });
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
