import { BlueprintContext, ResponseContext, BlueprintNode } from "@deskree/blueprint-shared";
import fs from 'fs';
import csv from 'csv-parser';

export default class CsvStreamReader extends BlueprintNode {

    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "multipart/form-data;";
        let response: ResponseContext = { success: true, data: {}, error: null };
        let file = ctx.response.data || ctx.request.body;

        try {
            let opts = ctx.config as any;
            opts = opts[this.name];

            this.validate(ctx);

            if (!file || file.mimetype !== 'text/csv') throw new Error('Only CSV files are allowed.');
            response.data = await this.processCSV(file.filepath, ctx);
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }


    async processCSV(filePath: string, ctx: BlueprintContext): Promise<Number> {
        let opts = ctx.config as any;
        opts = opts[this.name];
        const batchSize = opts?.inputs?.properties?.batchSize || 50000;
        let totalRow = 0;
        let rowCounter = 0;
        let streamBatchCounter = 0;
        let batchArray: any[] = [];

        const stream = fs.createReadStream(filePath).pipe(csv({ separator: ';' }));

        return new Promise(async (resolve, reject) => {
            stream.on("data", async (row: any) => {
                try {
                    rowCounter++;
                    totalRow++;
                    batchArray.push(row);

                    if (rowCounter < batchSize) return;

                    stream.pause();
                    streamBatchCounter++;
                    ctx.response.data = batchArray;
                    await this.runSteps(opts.steps, ctx);
                    batchArray = [];
                    rowCounter = 0;
                    stream.resume();

                } catch (e) {
                    stream.destroy();
                    reject(e);
                }
            });

            stream.on('end', async () => {
                try {
                    if (batchArray.length > 0) {
                        streamBatchCounter++;
                        ctx.response.data = batchArray;
                        await this.runSteps(opts.steps, ctx);
                        batchArray = [];
                    }
                    resolve(totalRow);
                } catch (e) {
                    reject(e);
                }
            });

            stream.on('error', (error: Error) => {
                reject(error);
            });
        })
    }
    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];

        if (!opts || !opts.steps || opts.steps.length === 0) throw new Error(`${this.name} node requires a list of nodes`);
    }
}