import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import formidable from "formidable";
import * as ExcelJS from "exceljs";
export default class Xlsx2JsonNode extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };
        let file: any;

        try {
            const form = formidable({});
            const request: any = ctx.request;
            const [_fields, files] = await form.parse(request);
            file = files.file;
            file = file[0];

            if (!file || file.mimetype !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
                throw new Error("Only XLSX files are allowed.");
            }
            const workbook = new ExcelJS.Workbook();
            const jsonData: any[] = [];

            await workbook.xlsx.readFile(file.filepath);
            const worksheet: any = workbook.getWorksheet(1);
            const headers: string[] = [];
            worksheet.getRow(1).eachCell((cell: any) => {
                headers.push(cell.value);
            });

            for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
                const row = worksheet.getRow(rowNumber);
                const rowData: any = {};
                row.eachCell((cell: any, colNumber: any) => {
                    rowData[headers[colNumber - 1]] = cell.value;
                });
                jsonData.push(rowData);
            }
            response.data = jsonData;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }
}
