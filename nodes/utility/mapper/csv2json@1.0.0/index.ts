import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import csv from "csvtojson";

export default class Csv2JsonNode extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };

        try {
            response.data = (await csv().fromString(ctx.request.body)) as any;
        }
        catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }
}