import { BlueprintContext, BlueprintError, ResponseContext, BlueprintNode } from "@deskree/blueprint-shared";
import fs from "fs";
// @ts-ignore
import JSONStream from "JSONStream";

export default class JsonStreamReader extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        this.contentType = "application/json";
        let file = ctx.response.data || ctx.request.body;

        try {
            this.validate(ctx);

            let opts = ctx.config as any;
            opts = opts[this.name];

            if (!file || file.mimetype !== "application/json") throw new Error("Only JSON files are allowed.");

            response.data = await this.processJSON(file.filepath, ctx);
        } catch (err: any) {
            if (err instanceof BlueprintError) {
                response.error = err;
            } else {
                response.error = new BlueprintError(err.message);
                response.error.setStack(err.stack);
                response.error.setJson(err?.json);
                response.error.setCode(500);
                response.error.setName(this.name);
                response.success = false;
            }
        }

        return response;
    }

    async processJSON(filePath: string, ctx: BlueprintContext): Promise<Number> {
        let opts = ctx.config as any;
        opts = opts[this.name];
        const batchSize = opts?.inputs?.properties?.batchSize || 50000;
        let totalRow = 0;
        let rowCounter = 0;
        let streamBatchCounter = 0;
        let batchArray: any[] = [];

        const fileStream = fs.createReadStream(filePath, { encoding: "utf8" });
        const stream = JSONStream.parse("*");

        fileStream.pipe(stream);

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

            stream.on("end", async () => {
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

            stream.on("error", (error: Error) => {
                reject(error);
            });
        });
    }

    validate(ctx: BlueprintContext) {
        if (ctx.config === undefined) throw new Error(`${this.name} node requires a config`);
        let opts = ctx.config as any;
        opts = opts[this.name];

        if (!opts || !opts.steps || opts.steps.length === 0)
            throw new Error(`${this.name} node requires a list of nodes`);
    }
}
