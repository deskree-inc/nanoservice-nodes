import { CollectionModel } from "../models/collectionModel";
import { BaseModel } from "../models/baseModel";
import { ResError } from "../helpers";
import CollectionController from "./collectionController";
/**
 * This is the controller that returns a storage file
 *
 * @module StorageController
 */

export default class StorageController extends BaseModel {
    private collection;
    private resError;

    constructor(_PRIVATE_?: any) {
        super();
        this.collection = new CollectionModel(_PRIVATE_);
        this.resError = new ResError("collectionController.ts");
    }

    public async getFileFromStorage(req: any) {
        try {
            let fieldName = req.params.fieldName;
            let imagePath = req.params.imagePath.replace("_", "/");
            const data = await this.collection.getFileStorageUrl(fieldName, imagePath);
            if (data) {
                this.logger.log(
                    this.logger.message.info,
                    this.logger.getStatusMessage(200),
                    {
                        file: "collectionController.ts",
                        line: "47",
                        function: "getFileFromStorage",
                    },
                    req,
                    undefined,
                    [{ billable: "billable" }]
                );

                // let link = new URL(data.data[req.params.fieldName]);
                // let images = link.pathname.split("/");
                // let image = images[images.length - 1];

                // res.set({
                //   "deskree-file-url": data.data[req.params.fieldName],
                //   "deskree-file-name": image,
                // });
                return data;
            } else {
                return this.resError.sendErrorResponse(
                    req,
                    404,
                    "getFileFromStorage",
                    "47",
                    true,
                    "Requested object not found"
                );
            }
        } catch (e) {
            console.log("ERROR", e);
            return new CollectionController().catchError(e, req, "getFileFromStorage", "47");
        }
    }
}
