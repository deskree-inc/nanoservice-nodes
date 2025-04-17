import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import os from "os";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from 'uuid';
import { createObjectCsvWriter } from "csv-writer";

export default class CsvStreamWriter extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        let batch = ctx.response.data || ctx.request.body;

        try {
            const batchID = this.getVar(ctx, "__batchID") || uuidv4();
            const tempDir = os.tmpdir();
            const fileName = `${batchID}.csv`;
            const filePath = path.join(tempDir, fileName);
            const isFirst = !fs.existsSync(filePath);

            if (batch.length > 0) {
                const header = Object.keys(batch[0]).map((key) => ({ id: key, title: key }));
                const csvWriter = createObjectCsvWriter({ path: filePath, header: header, append: !isFirst, fieldDelimiter: ';' });
                await csvWriter.writeRecords(batch);
            }

            response.data = {
                batchLength: batch.length,
                batchID: batchID,
                filePath: filePath
            };
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }
}