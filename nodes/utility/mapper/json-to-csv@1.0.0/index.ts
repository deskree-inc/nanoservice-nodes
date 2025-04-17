import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { createObjectCsvStringifier } from "csv-writer";

export default class JsonToCsv extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        this.contentType = "application/json";
        let data = ctx.response.data || ctx.request.body;

        try {
            data = Array.isArray(data) ? data : [data];
            if (data.length === 0) return data;

            const flatData = data.map((item: any) => this.flattenObject(item));
            let objectKeys = Object.keys(flatData[0]);
            const header = objectKeys.map((key) => ({ id: key, title: key }));
            const csvStringifier = createObjectCsvStringifier({ header });
            const headerString = csvStringifier.getHeaderString();
            const csvData = csvStringifier.stringifyRecords(flatData);
            ctx.response.contentType = "text/csv";
            response.data = headerString + csvData;
        } catch (err: any) {
             response.error = this.setError({...err, code: 500});
            response.success = false;
        }

        return response;
    }

    // Recursive function to flatten nested objects
    flattenObject(obj: any, prefix = ''): Record<string, any> {
        const flatObj: Record<string, any> = {};

        for (const key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                const nestedObj = this.flattenObject(obj[key], `${prefix}${key}.`);
                Object.assign(flatObj, nestedObj);
            }
            else {
                flatObj[`${prefix}${key}`] = obj[key];
            }
        }

        return flatObj;
    }
}