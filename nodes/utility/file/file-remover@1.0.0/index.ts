import { BlueprintContext, BlueprintNode,  ResponseContext } from "@deskree/blueprint-shared";
import fs from 'fs';

export default class FileRemover extends BlueprintNode {

    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        const data: any = ctx.response.data || ctx.request.body;
        let response: ResponseContext = { success: true, data: {}, error: null };
        try {
            let opts = ctx.config as any;
            opts = opts[this.name];

            const filePath = opts?.inputs?.properties?.filePath || data;
            response.data = filePath;
            fs.unlinkSync(filePath);
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }


}