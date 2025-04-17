import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
import { js2xml } from 'xml-js';

export default class JsonToXml extends BlueprintNode {
    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        let response: ResponseContext = { success: true, data: {}, error: null };
        this.contentType = "application/json";
        let data = ctx.response.data || ctx.request.body;

        try {
            const xmlData: any = js2xml(data, { compact: true, spaces: 2 });
            ctx.response.contentType = "application/xml";
            response.data = xmlData;
        } catch (err: any) {
             response.error = this.setError({...err, code: 500});
            response.success = false;
        }

        return response;
    }
}