import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import os from "os";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid';
export default class JsonStreamWriter extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        this.contentType = "application/json";
        let batch = ctx.response.data || ctx.request.body;

        try {
            const batchID = this.getVar(ctx, "__batchID") || uuidv4();
            const progress = this.getVar(ctx, "__batchProgress");
            const tempDir = os.tmpdir();
            const fileName = `${batchID}.json`;
            const filePath = path.join(tempDir, fileName);
            const writableStream = fs.createWriteStream(filePath, { flags: 'a' });

            if (!fs.existsSync(filePath)) writableStream.write("[");

            let isFirst = progress === undefined || progress === "START";
            batch.forEach((row: any) => {
                const jsonString = JSON.stringify(row);
                if (!isFirst) writableStream.write(",\n");
                writableStream.write(jsonString);
                isFirst = false;
            });

            if (progress === undefined || progress === "END") writableStream.write("]");
            writableStream.end();

            const streamFinished = new Promise<void>((resolve, reject) => {
                writableStream.on("finish", () => resolve());
                writableStream.on("error", (err) => reject(err));
            });

            await streamFinished;

            response.data = {
                batchLength: batch.length,
                batchID: batchID,
                filePath: filePath
            };

        } catch (err: any) {
             response.error = this.setError({...err, code: 500});
            response.success = false;
        }

        return response;
    }
}