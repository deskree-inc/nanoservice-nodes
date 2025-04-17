import { BlueprintContext, BlueprintNode, ResponseContext } from "@deskree/blueprint-shared";
// @ts-ignore
import formidable from 'formidable-serverless-2';
import fs from 'fs';


export default class FileUploader extends BlueprintNode {

    async run(ctx: BlueprintContext): Promise<ResponseContext> {
        this.contentType = "application/json";
        let response: ResponseContext = { success: true, data: {}, error: null };

        try {
            let opts = ctx.config as any;
            opts = opts[this.name];
            const request: any = ctx.request;
            const uploadDir = opts?.inputs?.properties?.uploadDir;
            const keepName = opts?.inputs?.properties?.keepName;

            const form = new formidable.IncomingForm();

            form.options.maxFiles = 1;
            form.options.keepExtensions = true;
            if (uploadDir) form.options.uploadDir = uploadDir;

            let result: any = null;
            await new Promise((resolve, reject) => {
                form.parse(request, function (err: any, _fields: any, files: any) {
                    if (err) reject(err);
                    result = files.file;
                    if (keepName) {
                        const newFileName = form.options.uploadDir + "/" + result.originalFilename
                        fs.renameSync(result.filepath, newFileName);
                        result.filepath = newFileName;
                        result.newFileName = newFileName;
                    }
                    resolve(files.file);
                });
            })
            response.data = result;
        } catch (error: any) {
            response.error = this.setError(error);
            response.success = false;
        }

        return response;
    }
}