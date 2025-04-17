//@ts-ignore
import formidable from "formidable-serverless-2";
import fs from "fs";

type ProcessFormDataResponse = {
    files: Array<Record<string, any>>;
    body: Record<string, any>;
};

const processFormData = async (req: any): Promise<ProcessFormDataResponse> => {
    const form = new formidable.IncomingForm();

    form.options.keepExtensions = true;

    return await new Promise((resolve, reject) => {
        form.parse(req, function (err: any, _fields: any, files: any) {
            const filesBuffer: Array<Record<string, any>> = [];
            if (err) reject(err);

            if (files && Object.keys(files).length > 0) {
                for (const key of Object.keys(files)) {
                    const file = files[key];
                    const buffer = fs.readFileSync(file.filepath);
                    filesBuffer.push({
                        fieldname: key,
                        originalname: file.originalFilename,
                        buffer,
                    });
                }
            }
            resolve({ files: filesBuffer, body: _fields });
        });
    });
};

export default processFormData;
