import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import os from "os";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import ExcelJS from "exceljs";

export default class XlsxStreamWriter extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        let batch = ctx.response.data || ctx.request.body;

        try {
            const batchID = this.getVar(ctx, "__batchID") || uuidv4();
            const tempDir = os.tmpdir();
            const fileName = `${batchID}.xlsx`;
            const filePath = path.join(tempDir, fileName);

            if (batch.length > 0) {
                let workbook = new ExcelJS.Workbook();
                let worksheet = workbook.addWorksheet("Sheet1");
                worksheet.columns = Object.keys(batch[0]).map((key) => ({ header: key, key: key }));

                if (fs.existsSync(filePath)) {
                    // Read the existing XLSX file into a separate workbook
                    const tempWorkbook = new ExcelJS.Workbook();
                    const buffer: any = await fs.promises.readFile(filePath);
                    await tempWorkbook.xlsx.load(buffer);
                    const tempWorksheet: any = tempWorkbook.getWorksheet("Sheet1");

                    // Copy the data from the existing worksheet to the new worksheet
                    tempWorksheet.eachRow((row: any, rowNumber: any) => {
                        if (rowNumber > 1) {
                            worksheet.addRow(row.values);
                        }
                    });
                }

                // Add data to the worksheet
                for (const row of batch) {
                    worksheet.addRow(row);
                }

                // Stream the updated worksheet to the temporary workbook
                const tempStream = fs.createWriteStream(filePath);
                await workbook.xlsx.write(tempStream);
            }

            response.data = {
                batchLength: batch.length,
                batchID: batchID,
                filePath: filePath,
            };
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }
}
